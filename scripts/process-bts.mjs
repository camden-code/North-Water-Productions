import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { unzipSync } from 'fflate'
import decodeHeic from 'heic-decode'
import sharp from 'sharp'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tif', '.tiff', '.avif', '.heic', '.heif'])
const HEIC_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'mif1', 'msf1'])

const USAGE = `Usage: npm run bts -- [zip] [options]

1. If <zip> is given, extracts its images and converts them to color WebP in <out>/original.
2. Generates black & white and color thumbnails for every WebP in <out>/original into
   <out>/thumbnail/bw and <out>/thumbnail/color.
3. Writes a TypeScript lib file listing every photo with its original and thumbnail paths.

Options:
  -o, --out <dir>              Output folder (default: public/bts)
  -l, --lib <file>             Lib file to write (default: src/lib/bts-photos.ts)
      --original-size <px>     Longest edge of originals; smaller images are not upscaled (default: 2400)
      --original-quality <n>   WebP quality of originals 1-100 (default: 82)
  -m, --thumbnail-size <px>    Longest edge of thumbnails (default: 640)
  -q, --thumbnail-quality <n>  WebP quality of thumbnails 1-100 (default: 70)
  -h, --help                   Show this message`

/** @param {string} message */
function fail(message) {
  console.error(`Error: ${message}\n\n${USAGE}`)
  process.exit(1)
}

/**
 * @param {string | undefined} value
 * @param {string} name
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function parseIntOption(value, name, min, max) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    fail(`--${name} must be an integer between ${min} and ${max}`)
  }
  return parsed
}

/** @param {string} name */
function isImageEntry(name) {
  if (name.endsWith('/') || name.startsWith('__MACOSX/')) return false
  const base = path.posix.basename(name)
  if (base.startsWith('.')) return false
  return IMAGE_EXTENSIONS.has(path.extname(base).toLowerCase())
}

/**
 * @param {string} entryName
 * @param {Set<string>} used
 * @returns {string}
 */
function outputName(entryName, used) {
  const stem = path.posix
    .basename(entryName, path.posix.extname(entryName))
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image'

  let name = `${stem}.webp`
  for (let i = 2; used.has(name); i++) name = `${stem}-${i}.webp`
  used.add(name)
  return name
}

/**
 * Phones often save HEIC files with a .jpg extension, so detect by the ftyp box.
 * @param {Uint8Array} data
 */
function isHeic(data) {
  if (data.byteLength < 12) return false
  const ascii = new TextDecoder('ascii')
  return ascii.decode(data.subarray(4, 8)) === 'ftyp' && HEIC_BRANDS.has(ascii.decode(data.subarray(8, 12)))
}

/**
 * sharp's prebuilt binaries can't decode HEVC, so HEIC is decoded to raw pixels first.
 * @param {Uint8Array} data
 * @returns {Promise<sharp.Sharp>}
 */
async function load(data) {
  if (!isHeic(data)) return sharp(data)
  const { width, height, data: pixels } = await decodeHeic({ buffer: data })
  return sharp(pixels, { raw: { width, height, channels: 4 } })
}

/** @param {number} bytes */
function formatSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

/** @param {unknown} error */
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

/** @param {string} file */
function relative(file) {
  return path.relative(process.cwd(), file).replaceAll('\\', '/') || '.'
}

/**
 * @param {string} zipPath
 * @param {string} originalDir
 * @param {{ size: number, quality: number }} options
 * @returns {Promise<number>} number of failed images
 */
async function convertOriginals(zipPath, originalDir, { size, quality }) {
  const zipStats = await stat(zipPath).catch(() => null)
  if (!zipStats?.isFile()) fail(`zip file not found: ${zipPath}`)

  /** @type {Record<string, Uint8Array>} */
  let entries = {}
  try {
    entries = unzipSync(new Uint8Array(await readFile(zipPath)), {
      filter: (file) => isImageEntry(file.name),
    })
  } catch {
    fail(`not a valid zip file: ${zipPath}`)
  }
  const names = Object.keys(entries).sort()
  if (names.length === 0) fail(`no images found in ${zipPath}`)

  await mkdir(originalDir, { recursive: true })

  /** @type {Set<string>} */
  const usedNames = new Set()
  let inputTotal = 0
  let outputTotal = 0
  let failed = 0

  for (const name of names) {
    const input = entries[name]
    const outFile = path.join(originalDir, outputName(name, usedNames))

    try {
      const image = await load(input)
      const info = await image
        .rotate()
        .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .toFile(outFile)

      inputTotal += input.byteLength
      outputTotal += info.size
      console.log(`${name} -> ${path.basename(outFile)} (${formatSize(input.byteLength)} -> ${formatSize(info.size)})`)
    } catch (error) {
      failed++
      console.error(`Failed: ${name}: ${errorMessage(error)}`)
    }
  }

  console.log(
    `\nConverted ${names.length - failed}/${names.length} originals to ${relative(originalDir)} ` +
      `(${formatSize(inputTotal)} -> ${formatSize(outputTotal)})\n`,
  )
  return failed
}

/**
 * @typedef {{ file: string, width: number, height: number, thumbnailWidth: number, thumbnailHeight: number }} Photo
 */

/**
 * Thumbnail folders are fully derived from the originals, so they are rebuilt from scratch.
 * @param {string} originalDir
 * @param {string} thumbnailDir
 * @param {{ size: number, quality: number }} options
 * @returns {Promise<{ photos: Photo[], failed: number }>}
 */
async function generateThumbnails(originalDir, thumbnailDir, { size, quality }) {
  const bwDir = path.join(thumbnailDir, 'bw')
  const colorDir = path.join(thumbnailDir, 'color')
  await rm(thumbnailDir, { recursive: true, force: true })
  await mkdir(bwDir, { recursive: true })
  await mkdir(colorDir, { recursive: true })

  const files = (await readdir(originalDir).catch(() => [])).filter((file) => file.endsWith('.webp')).sort()
  if (files.length === 0) fail(`no originals found in ${relative(originalDir)}; pass a zip file to create them`)

  /** @type {Photo[]} */
  const photos = []
  let outputTotal = 0
  let failed = 0

  for (const file of files) {
    try {
      const original = sharp(path.join(originalDir, file))
      const { width, height } = await original.metadata()
      const resized = original.resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
      const color = await resized.clone().webp({ quality }).toFile(path.join(colorDir, file))
      const bw = await resized.clone().grayscale().webp({ quality }).toFile(path.join(bwDir, file))

      outputTotal += color.size + bw.size
      photos.push({ file, width, height, thumbnailWidth: color.width, thumbnailHeight: color.height })
    } catch (error) {
      failed++
      console.error(`Failed thumbnail: ${file}: ${errorMessage(error)}`)
    }
  }

  console.log(
    `Generated thumbnails for ${photos.length}/${files.length} originals in ${relative(thumbnailDir)} ` +
      `(${formatSize(outputTotal)})`,
  )
  return { photos, failed }
}

/**
 * @param {string} libFile
 * @param {string} outDir
 * @param {Photo[]} photos
 */
async function writeLib(libFile, outDir, photos) {
  const publicDir = path.resolve('public')
  const relativeOut = path.relative(publicDir, outDir).replaceAll('\\', '/')
  if (relativeOut.startsWith('..') || path.isAbsolute(relativeOut)) {
    fail(`--out must be inside ${relative(publicDir)} so the lib file can reference it`)
  }

  const entries = photos
    .map(
      (photo) =>
        `  photo(${JSON.stringify(photo.file)}, ${photo.width}, ${photo.height}, ` +
        `${photo.thumbnailWidth}, ${photo.thumbnailHeight}),`,
    )
    .join('\n')

  const source = `// Generated by scripts/process-bts.mjs; do not edit by hand.

export type BtsImage = {
  src: string
  width: number
  height: number
}

export type BtsPhoto = {
  id: string
  original: BtsImage
  thumbnail: {
    bw: BtsImage
    color: BtsImage
  }
}

const BTS_DIR = \`\${import.meta.env.BASE_URL}${relativeOut ? `${relativeOut}/` : ''}\`

function photo(file: string, width: number, height: number, thumbnailWidth: number, thumbnailHeight: number): BtsPhoto {
  const thumbnailSize = { width: thumbnailWidth, height: thumbnailHeight }
  return {
    id: file.replace(/\\.webp$/, ""),
    original: { src: \`\${BTS_DIR}original/\${file}\`, width, height },
    thumbnail: {
      bw: { src: \`\${BTS_DIR}thumbnail/bw/\${file}\`, ...thumbnailSize },
      color: { src: \`\${BTS_DIR}thumbnail/color/\${file}\`, ...thumbnailSize },
    },
  }
}

export const btsPhotos: BtsPhoto[] = [
${entries}
]
`

  await mkdir(path.dirname(libFile), { recursive: true })
  await writeFile(libFile, source)
  console.log(`Wrote ${photos.length} photos to ${relative(libFile)}`)
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', short: 'o', default: 'public/bts' },
    lib: { type: 'string', short: 'l', default: 'src/lib/bts-photos.ts' },
    'original-size': { type: 'string', default: '2400' },
    'original-quality': { type: 'string', default: '82' },
    'thumbnail-size': { type: 'string', short: 'm', default: '640' },
    'thumbnail-quality': { type: 'string', short: 'q', default: '70' },
    help: { type: 'boolean', short: 'h', default: false },
  },
})

if (values.help) {
  console.log(USAGE)
  process.exit(0)
}

const originalOptions = {
  size: parseIntOption(values['original-size'], 'original-size', 1, 10000),
  quality: parseIntOption(values['original-quality'], 'original-quality', 1, 100),
}
const thumbnailOptions = {
  size: parseIntOption(values['thumbnail-size'], 'thumbnail-size', 1, 10000),
  quality: parseIntOption(values['thumbnail-quality'], 'thumbnail-quality', 1, 100),
}
const outDir = path.resolve(values.out)
const originalDir = path.join(outDir, 'original')
const thumbnailDir = path.join(outDir, 'thumbnail')

const zipPath = positionals[0]
const originalsFailed = zipPath ? await convertOriginals(zipPath, originalDir, originalOptions) : 0
const { photos, failed: thumbnailsFailed } = await generateThumbnails(originalDir, thumbnailDir, thumbnailOptions)
await writeLib(path.resolve(values.lib), outDir, photos)

if (originalsFailed + thumbnailsFailed > 0) process.exit(1)
