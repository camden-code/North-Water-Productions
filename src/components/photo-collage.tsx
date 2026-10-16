import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import type { BtsPhoto } from "@/lib/bts-photos"
import { cn } from "@/lib/utils"

export type CollageMode = "background" | "gallery"

export type PhotoPlacement = {
  centerX: number
  centerY: number
  width: number
  height: number
  rotation: number
}

type PlacedPhoto = {
  photo: BtsPhoto
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

type PhotoCollageProps = {
  photos: BtsPhoto[]
  mode: CollageMode
  hiddenId?: string
  onSelect?: (index: number, placement: PhotoPlacement) => void
}

const TARGET_CELL_WIDTH = 280
const MIN_COLUMNS = 2
const CELL_ASPECT = 0.8
const PHOTO_FILL = 0.62
const JITTER = 0.4
const MAX_ROTATION = 24
const SKIP_CHANCE = 0.15
const DRIFT_PX_PER_SECOND = 6
const DRIFT_RESUME_DELAY_MS = 800

function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildLayout(photos: BtsPhoto[], viewportWidth: number, seed: number): CollageLayout {
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

    const { width, height } = photo.thumbnail.bw
    const aspect = width / height
    const area = (cellWidth * cellWidth * PHOTO_FILL) * (0.8 + random() * 0.4)
    const displayWidth = Math.sqrt(area * aspect)
    const displayHeight = Math.sqrt(area / aspect)
    const brickOffset = row % 2 === 1 ? 0.5 : 0
    const centerX = (column + 0.5 + brickOffset + (random() - 0.5) * JITTER) * cellWidth
    const centerY = (row + 0.5 + (random() - 0.5) * JITTER) * cellHeight

    placed.push({
      photo,
      key: `${index}-${photo.id}`,
      left: (centerX % viewportWidth) - displayWidth / 2,
      top: centerY - displayHeight / 2,
      displayWidth,
      displayHeight,
      rotation: (random() * 2 - 1) * MAX_ROTATION,
    })
  }

  return { photos: placed, height: (cell / columns) * cellHeight }
}

function placementOf(element: HTMLElement): PhotoPlacement {
  // The bounding rect of a rotated element is its axis-aligned bounds, but its center is unaffected.
  const rect = element.getBoundingClientRect()
  return {
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
    width: element.offsetWidth,
    height: element.offsetHeight,
    rotation: Number(element.dataset.rotation ?? 0),
  }
}

/** Finds where a photo currently sits in the collage, preferring the copy closest to the middle of the screen. */
export function findPhotoPlacement(id: string): PhotoPlacement | null {
  const viewportCenterX = window.innerWidth / 2
  const viewportCenterY = window.innerHeight / 2
  let best: PhotoPlacement | null = null
  let bestDistance = Infinity

  for (const element of document.querySelectorAll<HTMLElement>("[data-collage-photo]")) {
    if (element.dataset.collagePhoto !== id) continue
    const rect = element.getBoundingClientRect()
    const onScreen = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
    if (!onScreen) continue

    const placement = placementOf(element)
    const distance = Math.hypot(placement.centerX - viewportCenterX, placement.centerY - viewportCenterY)
    if (distance < bestDistance) {
      best = placement
      bestDistance = distance
    }
  }
  return best
}

export function PhotoCollage({ photos, mode, hiddenId, onSelect }: PhotoCollageProps) {
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }))
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 32))
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set())
  const [colorRequested, setColorRequested] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const resumeTimeoutRef = useRef<number | undefined>(undefined)
  const [scrolling, setScrolling] = useState(false)
  const gallery = mode === "gallery"

  useEffect(() => {
    // Only react to width changes so mobile toolbars showing/hiding don't restart the drift.
    const resize = () =>
      setViewport((current) =>
        current.width === window.innerWidth ? current : { width: window.innerWidth, height: window.innerHeight },
      )
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  useEffect(() => {
    if (gallery) setColorRequested(true)
  }, [gallery])

  const layout = useMemo(() => buildLayout(photos, viewport.width, seed), [photos, viewport.width, seed])
  const indexById = useMemo(() => new Map(photos.map((photo, index) => [photo.id, index])), [photos])
  // The scroll position is kept within the second copy and the drift moves up to one more, so two
  // copies above the viewport plus enough to fill it are always needed.
  const copies = Math.ceil(viewport.height / layout.height) + 3

  // Copies are identical, so jumping by a whole copy keeps the scroll looping seamlessly.
  const wrapScroll = () => {
    const scroller = scrollerRef.current
    if (!scroller || layout.height <= 0) return
    if (scroller.scrollTop < layout.height) scroller.scrollTop += layout.height
    else if (scroller.scrollTop >= layout.height * 2) scroller.scrollTop -= layout.height
  }

  useLayoutEffect(wrapScroll)

  useEffect(() => () => window.clearTimeout(resumeTimeoutRef.current), [])

  const handleScroll = () => {
    wrapScroll()
    if (!gallery) return
    setScrolling(true)
    window.clearTimeout(resumeTimeoutRef.current)
    resumeTimeoutRef.current = window.setTimeout(() => setScrolling(false), DRIFT_RESUME_DELAY_MS)
  }

  const markLoaded = (src: string) => setLoaded((current) => (current.has(src) ? current : new Set(current).add(src)))

  return (
    <div
      ref={scrollerRef}
      aria-hidden={!gallery}
      onScroll={handleScroll}
      className={cn(
        "absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-contain transition-opacity duration-700 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        gallery ? "opacity-100" : "pointer-events-none opacity-15",
      )}
    >
      {layout.height > 0 && (
        <div
          className={cn(
            "animate-collage-drift will-change-transform motion-reduce:animate-none",
            gallery && scrolling && "[animation-play-state:paused]",
          )}
          style={
            {
              "--collage-height": `${layout.height}px`,
              animationDuration: `${layout.height / DRIFT_PX_PER_SECOND}s`,
            } as CSSProperties
          }
        >
          {Array.from({ length: copies }, (_, copy) => (
            <div key={copy} className="relative" style={{ height: layout.height }}>
              {layout.photos.map(({ photo, key, left, top, displayWidth, displayHeight, rotation }) => (
                <button
                  key={key}
                  type="button"
                  disabled={!gallery}
                  tabIndex={copy === 1 ? undefined : -1}
                  aria-label="View photo"
                  data-collage-photo={photo.id}
                  data-rotation={rotation}
                  onClick={(event) => onSelect?.(indexById.get(photo.id) ?? 0, placementOf(event.currentTarget))}
                  className={cn(
                    "absolute overflow-hidden border-[6px] border-white bg-white shadow-lg shadow-black/60 transition-[scale] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2",
                    gallery && "cursor-pointer hover:scale-105",
                    photo.id === hiddenId && "invisible",
                  )}
                  style={{ left, top, width: displayWidth, height: displayHeight, transform: `rotate(${rotation}deg)` }}
                >
                  <img
                    src={photo.thumbnail.bw.src}
                    alt=""
                    width={photo.thumbnail.bw.width}
                    height={photo.thumbnail.bw.height}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => markLoaded(photo.thumbnail.bw.src)}
                    className={cn(
                      "absolute inset-0 size-full object-cover transition-opacity duration-1000",
                      loaded.has(photo.thumbnail.bw.src) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {colorRequested && (
                    <img
                      src={photo.thumbnail.color.src}
                      alt=""
                      width={photo.thumbnail.color.width}
                      height={photo.thumbnail.color.height}
                      loading="lazy"
                      decoding="async"
                      onLoad={() => markLoaded(photo.thumbnail.color.src)}
                      className={cn(
                        "absolute inset-0 size-full object-cover transition-opacity duration-700",
                        gallery && loaded.has(photo.thumbnail.color.src) ? "opacity-100" : "opacity-0",
                      )}
                    />
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
