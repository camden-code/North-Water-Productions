import { useEffect, useMemo, useState, type CSSProperties } from "react"

type CollagePhoto = {
  src: string
  width: number
  height: number
}

type PlacedPhoto = CollagePhoto & {
  key: string
  left: number
  top: number
  displayWidth: number
  displayHeight: number
  rotation: number
}

type CollageLayout = {
  photos: PlacedPhoto[]
  height: number
}

const PHOTO_DIR = `${import.meta.env.BASE_URL}bts/`
const TARGET_CELL_WIDTH = 280
const MIN_COLUMNS = 2
const CELL_ASPECT = 0.8
const PHOTO_FILL = 0.62
const JITTER = 0.4
const MAX_ROTATION = 24
const SKIP_CHANCE = 0.15
const DRIFT_PX_PER_SECOND = 6

function isCollagePhoto(value: unknown): value is CollagePhoto {
  if (typeof value !== "object" || value === null) return false
  const { src, width, height } = value as Record<string, unknown>
  return typeof src === "string" && typeof width === "number" && typeof height === "number"
}

function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildLayout(photos: CollagePhoto[], viewportWidth: number, seed: number): CollageLayout {
  const random = seededRandom(seed)
  const shuffled = [...photos]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }

  const columns = Math.max(MIN_COLUMNS, Math.round(viewportWidth / TARGET_CELL_WIDTH))
  const cellWidth = viewportWidth / columns
  const cellHeight = cellWidth * CELL_ASPECT
  const placed: PlacedPhoto[] = []
  let cell = 0

  // Keep placing past the last photo until the final row is full, so the loop seam has no gap.
  // Repeats start halfway through the order so they don't sit next to their originals across the seam.
  for (let index = 0; index < shuffled.length || cell % columns !== 0; index++) {
    const photo = shuffled[(index < shuffled.length ? index : index + Math.floor(shuffled.length / 2)) % shuffled.length]!
    while (index < shuffled.length && random() < SKIP_CHANCE) cell++
    const row = Math.floor(cell / columns)
    const column = cell % columns
    cell++

    const aspect = photo.width / photo.height
    const area = (cellWidth * cellWidth * PHOTO_FILL) * (0.8 + random() * 0.4)
    const displayWidth = Math.sqrt(area * aspect)
    const displayHeight = Math.sqrt(area / aspect)
    const brickOffset = row % 2 === 1 ? 0.5 : 0
    const centerX = (column + 0.5 + brickOffset + (random() - 0.5) * JITTER) * cellWidth
    const centerY = (row + 0.5 + (random() - 0.5) * JITTER) * cellHeight

    placed.push({
      ...photo,
      key: `${index}-${photo.src}`,
      left: (centerX % viewportWidth) - displayWidth / 2,
      top: centerY - displayHeight / 2,
      displayWidth,
      displayHeight,
      rotation: (random() * 2 - 1) * MAX_ROTATION,
    })
  }

  return { photos: placed, height: (cell / columns) * cellHeight }
}

export function PhotoCollage() {
  const [photos, setPhotos] = useState<CollagePhoto[]>([])
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }))
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 32))
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set())

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${PHOTO_DIR}manifest.json`, { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<unknown>) : []))
      .then((data) => setPhotos(Array.isArray(data) ? data.filter(isCollagePhoto) : []))
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    // Only react to width changes so mobile toolbars showing/hiding don't restart the drift.
    const resize = () =>
      setViewport((current) =>
        current.width === window.innerWidth ? current : { width: window.innerWidth, height: window.innerHeight },
      )
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  const layout = useMemo(() => buildLayout(photos, viewport.width, seed), [photos, viewport.width, seed])
  const copies = Math.ceil(viewport.height / layout.height) + 1

  const markLoaded = (src: string) => setLoaded((current) => (current.has(src) ? current : new Set(current).add(src)))

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-15">
      {layout.height > 0 && (
        <div
          className="animate-collage-drift will-change-transform motion-reduce:animate-none"
          style={
            {
              "--collage-height": `${layout.height}px`,
              animationDuration: `${layout.height / DRIFT_PX_PER_SECOND}s`,
            } as CSSProperties
          }
        >
          {Array.from({ length: copies }, (_, copy) => (
            <div key={copy} className="relative" style={{ height: layout.height }}>
              {layout.photos.map((photo) => (
                <img
                  key={photo.key}
                  src={`${PHOTO_DIR}${photo.src}`}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  onLoad={() => markLoaded(photo.src)}
                  className={`absolute border-[6px] border-white bg-white object-cover shadow-lg shadow-black/60 transition-opacity duration-1000 ${loaded.has(photo.src) ? "opacity-100" : "opacity-0"}`}
                  style={{
                    left: photo.left,
                    top: photo.top,
                    width: photo.displayWidth,
                    height: photo.displayHeight,
                    transform: `rotate(${photo.rotation}deg)`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
