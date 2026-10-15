import { mkdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { unzipSync } from 'fflate'
import decodeHeic from 'heic-decode'
import sharp from 'sharp'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tif', '.tiff', '.avif', '.heic', '.heif'])
const HEIC_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'mif1', 'msf1'])

const USAGE = `Usage: npm run bts -- <zip> [options]

Extracts images from <zip>, converts them to black & white WebP and writes them to the output folder.

Options:
  -o, --out <dir>        Output folder (default: public/bts)
  -q, --quality <n>      WebP quality 1-100 (default: 80)
  -m, --max-size <px>    Longest edge in pixels; smaller images are not upscaled (default: 1920)
  -h, --help             Show this message`

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

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', short: 'o', default: 'public/bts' },
    quality: { type: 'string', short: 'q', default: '80' },
    'max-size': { type: 'string', short: 'm', default: '1920' },
    help: { type: 'boolean', short: 'h', default: false },
  },
})

if (values.help) {
  console.log(USAGE)
  process.exit(0)
}

const zipPath = positionals[0]
if (!zipPath) fail('a zip file path is required')

const quality = parseIntOption(values.quality, 'quality', 1, 100)
const maxSize = parseIntOption(values['max-size'], 'max-size', 1, 10000)
const outDir = path.resolve(values.out)

const zipStats = await stat(zipPath).catch(() => null)
if (!zipStats?.isFile()) fail(`zip file not found: ${zipPath}`)

const entries = unzipSync(new Uint8Array(await readFile(zipPath)), {
  filter: (file) => isImageEntry(file.name),
})
const names = Object.keys(entries).sort()

if (names.length === 0) fail(`no images found in ${zipPath}`)

await mkdir(outDir, { recursive: true })

/** @type {Set<string>} */
const usedNames = new Set()
let inputTotal = 0
let outputTotal = 0
let failed = 0

for (const name of names) {
  const input = entries[name]
  const outFile = path.join(outDir, outputName(name, usedNames))

  try {
    const image = await load(input)
    const info = await image
      .rotate()
      .resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true })
      .grayscale()
      .webp({ quality })
      .toFile(outFile)

    inputTotal += input.byteLength
    outputTotal += info.size
    console.log(`${name} -> ${path.basename(outFile)} (${formatSize(input.byteLength)} -> ${formatSize(info.size)})`)
  } catch (error) {
    failed++
    console.error(`Failed: ${name}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const converted = names.length - failed
console.log(
  `\nConverted ${converted}/${names.length} images to ${path.relative(process.cwd(), outDir) || '.'} ` +
    `(${formatSize(inputTotal)} -> ${formatSize(outputTotal)})`,
)

if (failed > 0) process.exit(1)
