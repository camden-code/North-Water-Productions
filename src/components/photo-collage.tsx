import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
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
  row: number
  column: number
  left: number
  top: number
  displayWidth: number
  displayHeight: number
  rotation: number
  // How far the rotated card can reach from its center.
  reach: number
}

type ColorPhase = "bw" | "revealing" | "color"

// One period of an endlessly repeating collage. Rows are numbered absolutely so a card keeps the same
// row, and the same React key, when its rows are carried over into a new layout.
type CollageLayout = {
  photos: PlacedPhoto[]
  width: number
  columns: number
  cellHeight: number
  rows: number
  firstRow: number
}

type CollageCard = {
  placed: PlacedPhoto
  key: string
  top: number
}

type Motion = {
  position: number
  pending: number
  resumeAt: number
}

type PhotoCollageProps = {
  photos: BtsPhoto[]
  mode: CollageMode
  hiddenId?: string
  onSelect?: (index: number, placement: PhotoPlacement) => void
}

const TARGET_CELL_WIDTH = 280
const MIN_COLUMNS = 3
const CELL_ASPECT = 0.8
const PHOTO_FILL = 0.62
const JITTER = 0.4
const MAX_ROTATION = 24
const SKIP_CHANCE = 0.15
const CARD_BORDER_PX = 6
const SUBSET_SCREENS = 1.5
const KEEP_MARGIN_ROWS = 3
const FOCUS_MARGIN_PX = 24
const DRIFT_PX_PER_SECOND = 6
const DRIFT_RESUME_DELAY_MS = 800
const COLOR_WIPE_MS = 1400
const COLOR_FADE_MS = 700
const MAX_SCROLL_PX_PER_SECOND = 1200
const SCROLL_EASE_MS = 80
const TOUCH_MOMENTUM_MS = 250
const TOUCH_VELOCITY_STALE_MS = 100
const SCROLL_FADE_IN_MS = 600

function shuffle<T>(items: readonly T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function columnsFor(width: number): number {
  return Math.max(MIN_COLUMNS, Math.round(width / TARGET_CELL_WIDTH))
}

function uniquePhotos(placed: PlacedPhoto[]): BtsPhoto[] {
  return [...new Map(placed.map(({ photo }) => [photo.id, photo])).values()]
}

type LayoutOptions = {
  pool: BtsPhoto[]
  width: number
  height: number
  kept?: PlacedPhoto[]
  keptRows?: number
  firstRow?: number
}

function buildLayout({ pool, width, height, kept = [], keptRows = 0, firstRow = 0 }: LayoutOptions): CollageLayout {
  const columns = columnsFor(width)
  const cellWidth = width / columns
  const cellHeight = cellWidth * CELL_ASPECT
  const screenRows = Math.ceil(height / cellHeight)
  const minCells = Math.max(keptRows + screenRows, screenRows * 2) * columns
  const order = shuffle(pool)
  const placed = [...kept]
  let cell = keptRows * columns
  if (order.length === 0) return { photos: placed, width, columns, cellHeight, rows: Math.max(keptRows, 1), firstRow }

  // Keep placing past the last photo until the period is long enough and ends on a full, even row, so the
  // brick offset alternates across the loop seam. Repeats start halfway through the order so they don't
  // sit next to their originals.
  for (
    let index = 0;
    index < order.length || cell % columns !== 0 || cell < minCells || (cell / columns) % 2 !== 0;
    index++
  ) {
    const repeat = index >= order.length
    const photo = order[(repeat ? index + Math.floor(order.length / 2) : index) % order.length]!
    while (!repeat && Math.random() < SKIP_CHANCE) cell++
    const row = Math.floor(cell / columns)
    const column = cell % columns
    cell++

    const { width: photoWidth, height: photoHeight } = photo.thumbnail.bw
    const aspect = photoWidth / photoHeight
    const area = cellWidth * cellWidth * PHOTO_FILL * (0.8 + Math.random() * 0.4)
    const displayWidth = Math.sqrt(area * aspect)
    const displayHeight = Math.sqrt(area / aspect)
    const brickOffset = Math.abs(firstRow + row) % 2 === 1 ? 0.5 : 0
    const centerX = (column + 0.5 + brickOffset + (Math.random() - 0.5) * JITTER) * cellWidth
    const centerY = (row + 0.5 + (Math.random() - 0.5) * JITTER) * cellHeight

    placed.push({
      photo,
      row,
      column,
      left: (centerX % width) - displayWidth / 2,
      top: centerY - displayHeight / 2,
      displayWidth,
      displayHeight,
      rotation: (Math.random() * 2 - 1) * MAX_ROTATION,
      reach: Math.hypot(displayWidth, displayHeight) / 2 + CARD_BORDER_PX,
    })
  }

  return { photos: placed, width, columns, cellHeight, rows: cell / columns, firstRow }
}

function initialLayout(photos: BtsPhoto[]): CollageLayout {
  const width = window.innerWidth
  const height = window.innerHeight
  const columns = columnsFor(width)
  const screenRows = Math.ceil(height / ((width / columns) * CELL_ASPECT))
  const subsetSize = clamp(Math.round(columns * screenRows * SUBSET_SCREENS), 1, photos.length)
  return buildLayout({ pool: shuffle(photos).slice(0, subsetSize), width, height })
}

/** Starts a new layout with the rows around the screen carried over unchanged, followed by photos from `pickPool`. */
function continueLayout(
  layout: CollageLayout,
  position: number,
  height: number,
  pickPool: (kept: PlacedPhoto[]) => BtsPhoto[],
): CollageLayout {
  const firstRow = Math.floor(position / layout.cellHeight) - KEEP_MARGIN_ROWS
  const lastRow = Math.floor((position + height) / layout.cellHeight) + KEEP_MARGIN_ROWS
  const kept: PlacedPhoto[] = []

  for (const placed of layout.photos) {
    const offset = layout.firstRow + placed.row
    for (let period = Math.ceil((firstRow - offset) / layout.rows); offset + period * layout.rows <= lastRow; period++) {
      const row = offset + period * layout.rows - firstRow
      kept.push({ ...placed, row, top: placed.top + (row - placed.row) * layout.cellHeight })
    }
  }

  const pool = pickPool(kept)
  return buildLayout({
    pool: pool.length > 0 ? pool : uniquePhotos(kept),
    width: layout.width,
    height,
    kept,
    keptRows: lastRow - firstRow + 1,
    firstRow,
  })
}

/** The cards whose rotated bounds overlap `top` to `bottom`, across however many periods that spans. */
function cardsBetween(layout: CollageLayout, top: number, bottom: number): CollageCard[] {
  const periodHeight = layout.rows * layout.cellHeight
  const origin = layout.firstRow * layout.cellHeight
  const cards: CollageCard[] = []

  for (const placed of layout.photos) {
    const centerY = origin + placed.top + placed.displayHeight / 2
    for (
      let period = Math.ceil((top - placed.reach - centerY) / periodHeight);
      centerY + period * periodHeight - placed.reach <= bottom;
      period++
    ) {
      const row = layout.firstRow + period * layout.rows + placed.row
      cards.push({
        placed,
        key: `${row}:${placed.column}:${placed.photo.id}`,
        top: origin + placed.top + period * periodHeight,
      })
    }
  }
  return cards
}

function pushScroll(motion: Motion, delta: number) {
  motion.pending = clamp(motion.pending + delta, -window.innerHeight, window.innerHeight)
  motion.resumeAt = performance.now() + DRIFT_RESUME_DELAY_MS
}

function isOnScreen(rect: DOMRect): boolean {
  return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
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
    if (!isOnScreen(element.getBoundingClientRect())) continue

    const placement = placementOf(element)
    const distance = Math.hypot(placement.centerX - viewportCenterX, placement.centerY - viewportCenterY)
    if (distance < bestDistance) {
      best = placement
      bestDistance = distance
    }
  }
  return best
}

/**
 * Only the cards near the screen are rendered, and the layout holds a subset of the photos outside the
 * gallery, which keeps memory low enough for iOS browsers other than Safari.
 */
export function PhotoCollage({ photos, mode, hiddenId, onSelect }: PhotoCollageProps) {
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }))
  const [layout, setLayout] = useState(() => initialLayout(photos))
  const [windowRow, setWindowRow] = useState(0)
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set())
  const [colorPhase, setColorPhase] = useState<ColorPhase>("bw")
  const [colorFading, setColorFading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const motionRef = useRef<Motion>({ position: 0, pending: 0, resumeAt: 0 })
  const layoutRef = useRef(layout)
  const windowRowRef = useRef(windowRow)
  const previousModeRef = useRef(mode)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const gallery = mode === "gallery"
  const colorShown = gallery && (colorPhase === "revealing" || colorPhase === "color")

  useLayoutEffect(() => {
    layoutRef.current = layout
  }, [layout])

  useEffect(() => {
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  useEffect(() => {
    if (layout.width === viewport.width) return
    const { position } = motionRef.current
    const pool = gallery ? photos : uniquePhotos(layout.photos)
    const cellHeight = (viewport.width / columnsFor(viewport.width)) * CELL_ASPECT
    setLayout(
      buildLayout({ pool, width: viewport.width, height: viewport.height, firstRow: Math.floor(position / cellHeight) }),
    )
  }, [viewport, layout, gallery, photos])

  useLayoutEffect(() => {
    if (previousModeRef.current === mode) return
    previousModeRef.current = mode
    const { position } = motionRef.current

    if (!gallery) {
      motionRef.current = { position, pending: 0, resumeAt: 0 }
      setLayout((current) => continueLayout(current, position, window.innerHeight, uniquePhotos))
      setColorPhase("bw")
      setColorFading(true)
      return
    }

    setLayout((current) =>
      continueLayout(current, position, window.innerHeight, (kept) => {
        const keptIds = new Set(kept.map(({ photo }) => photo.id))
        return photos.filter((photo) => !keptIds.has(photo.id))
      }),
    )
    // Delays each card by its height on screen so the color fades in from top to bottom.
    for (const card of contentRef.current?.querySelectorAll<HTMLElement>("[data-collage-photo]") ?? []) {
      const rect = card.getBoundingClientRect()
      const position = clamp((rect.top + rect.height / 2) / window.innerHeight, 0, 1)
      card.style.setProperty("--color-delay", `${Math.round(position * COLOR_WIPE_MS)}ms`)
    }
    setColorPhase("revealing")
  }, [mode, gallery, photos])

  useEffect(() => {
    if (colorPhase !== "revealing") return
    const timeout = window.setTimeout(() => setColorPhase("color"), COLOR_WIPE_MS + COLOR_FADE_MS)
    return () => window.clearTimeout(timeout)
  }, [colorPhase])

  // Color images stay mounted only long enough to fade out after leaving the gallery.
  useEffect(() => {
    if (!colorFading) return
    const timeout = window.setTimeout(() => setColorFading(false), COLOR_FADE_MS)
    return () => window.clearTimeout(timeout)
  }, [colorFading])

  // Drift and eased manual scrolling both move one position, applied as a transform on every frame.
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0
    let lastFrame = performance.now()

    const tick = (now: number) => {
      const elapsed = Math.min(now - lastFrame, 50)
      lastFrame = now
      const motion = motionRef.current

      if (motion.pending !== 0) {
        const maxStep = (MAX_SCROLL_PX_PER_SECOND * elapsed) / 1000
        const delta = clamp(motion.pending * (1 - Math.exp(-elapsed / SCROLL_EASE_MS)), -maxStep, maxStep)
        motion.position += delta
        motion.pending = Math.abs(motion.pending - delta) < 0.5 ? 0 : motion.pending - delta
        motion.resumeAt = now + DRIFT_RESUME_DELAY_MS
      } else if (now >= motion.resumeAt && !reducedMotion.matches) {
        motion.position += (DRIFT_PX_PER_SECOND * elapsed) / 1000
      }

      if (contentRef.current) contentRef.current.style.transform = `translate3d(0, ${-motion.position}px, 0)`
      const row = Math.floor(motion.position / layoutRef.current.cellHeight)
      if (row !== windowRowRef.current) {
        windowRowRef.current = row
        setWindowRow(row)
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  useLayoutEffect(() => {
    if (contentRef.current) contentRef.current.style.transform = `translate3d(0, ${-motionRef.current.position}px, 0)`
  }, [])

  // Wheel and touch input is applied by hand so manual scrolling can be eased and speed capped.
  useEffect(() => {
    const container = containerRef.current
    if (!container || !gallery) return
    const push = (delta: number) => pushScroll(motionRef.current, delta)
    let touchY: number | null = null
    let touchTime = 0
    let touchVelocity = 0

    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      event.preventDefault()
      const unit =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1
      push(event.deltaY * unit)
    }

    const touchstart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        touchY = null
        return
      }
      touchY = event.touches[0]!.clientY
      touchTime = event.timeStamp
      touchVelocity = 0
      motionRef.current.pending = 0
    }

    const touchmove = (event: TouchEvent) => {
      if (touchY === null || event.touches.length !== 1) return
      event.preventDefault()
      const y = event.touches[0]!.clientY
      const delta = touchY - y
      touchVelocity = delta / Math.max(event.timeStamp - touchTime, 1)
      touchY = y
      touchTime = event.timeStamp
      push(delta)
    }

    const touchend = (event: TouchEvent) => {
      if (touchY === null) return
      touchY = null
      if (event.timeStamp - touchTime < TOUCH_VELOCITY_STALE_MS) push(touchVelocity * TOUCH_MOMENTUM_MS)
    }

    container.addEventListener("wheel", wheel, { passive: false })
    container.addEventListener("touchstart", touchstart, { passive: true })
    container.addEventListener("touchmove", touchmove, { passive: false })
    container.addEventListener("touchend", touchend)
    container.addEventListener("touchcancel", touchend)
    return () => {
      container.removeEventListener("wheel", wheel)
      container.removeEventListener("touchstart", touchstart)
      container.removeEventListener("touchmove", touchmove)
      container.removeEventListener("touchend", touchend)
      container.removeEventListener("touchcancel", touchend)
    }
  }, [gallery])

  useEffect(() => () => observerRef.current?.disconnect(), [])

  // Fades cards in as they enter the screen during manual scrolling.
  const observeCard = useCallback((element: HTMLButtonElement | null) => {
    if (!element) return
    observerRef.current ??= new IntersectionObserver((entries) => {
      if (performance.now() >= motionRef.current.resumeAt) return
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting) {
          target.animate([{ opacity: 0 }, { opacity: 1 }], { duration: SCROLL_FADE_IN_MS, easing: "ease-out" })
        }
      }
    })
    const observer = observerRef.current
    observer.observe(element)
    return () => observer.unobserve(element)
  }, [])

  // Cards are moved by transform rather than scrolled, so a focused card off screen has to be brought into view.
  const revealCard = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    if (rect.top < 0) pushScroll(motionRef.current, rect.top - FOCUS_MARGIN_PX)
    else if (rect.bottom > window.innerHeight) {
      pushScroll(motionRef.current, rect.bottom - window.innerHeight + FOCUS_MARGIN_PX)
    }
  }

  const cards = useMemo(() => {
    const top = (windowRow - 1) * layout.cellHeight
    return cardsBetween(layout, top, top + viewport.height + layout.cellHeight * 3)
  }, [layout, windowRow, viewport.height])
  const indexById = useMemo(() => new Map(photos.map((photo, index) => [photo.id, index])), [photos])
  const markLoaded = (src: string) => setLoaded((current) => (current.has(src) ? current : new Set(current).add(src)))

  return (
    <div
      ref={containerRef}
      aria-hidden={!gallery}
      className={cn(
        "absolute inset-0 overflow-clip transition-opacity duration-700",
        gallery ? "opacity-100" : "pointer-events-none opacity-15",
      )}
    >
      <div ref={contentRef} className="relative">
        {cards.map(({ placed, key, top }) => {
          const { photo, left, displayWidth, displayHeight, rotation } = placed
          return (
            <button
              key={key}
              ref={observeCard}
              type="button"
              disabled={!gallery}
              aria-label={`Behind-the-scenes photo ${(indexById.get(photo.id) ?? 0) + 1} of ${photos.length}`}
              data-collage-photo={photo.id}
              data-rotation={rotation}
              onFocus={(event) => revealCard(event.currentTarget)}
              onClick={(event) => onSelect?.(indexById.get(photo.id) ?? 0, placementOf(event.currentTarget))}
              className={cn(
                "absolute overflow-hidden border-[6px] border-primary bg-black shadow-lg shadow-black/60 transition-[scale] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2",
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
                decoding="async"
                onLoad={() => markLoaded(photo.thumbnail.bw.src)}
                className={cn(
                  "absolute inset-0 size-full object-cover [transition:opacity_1s_ease-out,filter_3s_ease-out]",
                  loaded.has(photo.thumbnail.bw.src)
                    ? "opacity-100 filter-none"
                    : "opacity-0 blur-[1px] brightness-[.35] contrast-[.6] sepia-[.7]",
                )}
              />
              {(colorShown || colorFading) && (
                <img
                  src={photo.thumbnail.color.src}
                  alt=""
                  width={photo.thumbnail.color.width}
                  height={photo.thumbnail.color.height}
                  decoding="async"
                  onLoad={() => markLoaded(photo.thumbnail.color.src)}
                  className={cn(
                    "absolute inset-0 size-full object-cover transition-opacity duration-700",
                    colorShown && loaded.has(photo.thumbnail.color.src) ? "opacity-100" : "opacity-0",
                  )}
                  style={colorShown && colorPhase === "revealing" ? { transitionDelay: "var(--color-delay)" } : undefined}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
