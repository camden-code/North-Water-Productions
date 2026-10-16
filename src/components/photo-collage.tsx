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

type ColorPhase = "bw" | "revealing" | "color"

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
const COLOR_WIPE_MS = 1400
const COLOR_FADE_MS = 700
const MAX_SCROLL_PX_PER_SECOND = 1200
const SCROLL_EASE_MS = 80
const TOUCH_MOMENTUM_MS = 250
const TOUCH_VELOCITY_STALE_MS = 100
const SCROLL_FADE_IN_MS = 600

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

function isOnScreen(rect: DOMRect): boolean {
  return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
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

export function PhotoCollage({ photos, mode, hiddenId, onSelect }: PhotoCollageProps) {
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }))
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 32))
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set())
  const [colorRequested, setColorRequested] = useState(false)
  const [colorPhase, setColorPhase] = useState<ColorPhase>("bw")
  const scrollerRef = useRef<HTMLDivElement>(null)
  const resumeTimeoutRef = useRef<number | undefined>(undefined)
  const userScrollingRef = useRef(false)
  const [scrolling, setScrolling] = useState(false)
  const gallery = mode === "gallery"
  const colorShown = gallery && (colorPhase === "revealing" || colorPhase === "color")

  useEffect(() => {
    // Only react to width changes so mobile toolbars showing/hiding don't restart the drift.
    const resize = () =>
      setViewport((current) =>
        current.width === window.innerWidth ? current : { width: window.innerWidth, height: window.innerHeight },
      )
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  useLayoutEffect(() => {
    if (!gallery) {
      setColorPhase("bw")
      return
    }
    // Delays each card by its height on screen so the color fades in from top to bottom.
    for (const card of scrollerRef.current?.querySelectorAll<HTMLElement>("[data-collage-photo]") ?? []) {
      const rect = card.getBoundingClientRect()
      const position = clamp((rect.top + rect.height / 2) / window.innerHeight, 0, 1)
      card.style.setProperty("--color-delay", `${Math.round(position * COLOR_WIPE_MS)}ms`)
    }
    setColorRequested(true)
    setColorPhase("revealing")
  }, [gallery])

  useEffect(() => {
    if (colorPhase !== "revealing") return
    const timeout = window.setTimeout(() => setColorPhase("color"), COLOR_WIPE_MS + COLOR_FADE_MS)
    return () => window.clearTimeout(timeout)
  }, [colorPhase])

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

  // Wheel and touch input is applied by hand so manual scrolling can be eased and speed capped.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || !gallery) return
    let pending = 0
    let frame = 0
    let lastFrame = 0
    let touchY: number | null = null
    let touchTime = 0
    let touchVelocity = 0

    const step = (now: number) => {
      const elapsed = Math.min(now - lastFrame, 50)
      lastFrame = now
      const maxStep = (MAX_SCROLL_PX_PER_SECOND * elapsed) / 1000
      const delta = clamp(pending * (1 - Math.exp(-elapsed / SCROLL_EASE_MS)), -maxStep, maxStep)
      scroller.scrollTop += delta
      pending -= delta
      if (Math.abs(pending) < 0.5) {
        pending = 0
        frame = 0
        return
      }
      frame = requestAnimationFrame(step)
    }

    const push = (delta: number) => {
      const limit = scroller.clientHeight
      pending = clamp(pending + delta, -limit, limit)
      if (frame) return
      lastFrame = performance.now()
      frame = requestAnimationFrame(step)
    }

    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      event.preventDefault()
      const unit =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? scroller.clientHeight
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
      pending = 0
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

    scroller.addEventListener("wheel", wheel, { passive: false })
    scroller.addEventListener("touchstart", touchstart, { passive: true })
    scroller.addEventListener("touchmove", touchmove, { passive: false })
    scroller.addEventListener("touchend", touchend)
    scroller.addEventListener("touchcancel", touchend)
    return () => {
      cancelAnimationFrame(frame)
      scroller.removeEventListener("wheel", wheel)
      scroller.removeEventListener("touchstart", touchstart)
      scroller.removeEventListener("touchmove", touchmove)
      scroller.removeEventListener("touchend", touchend)
      scroller.removeEventListener("touchcancel", touchend)
    }
  }, [gallery])

  // Fades photos in as they enter the screen during manual scrolling. Visibility is counted per layout
  // position rather than per element, so the jump between identical copies when looping doesn't fade.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || !gallery) return
    const visible = new Set<Element>()
    const visibleCounts = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (!isIntersecting || visible.has(target)) continue
          const key = (target as HTMLElement).dataset.collageKey ?? ""
          const count = visibleCounts.get(key) ?? 0
          visible.add(target)
          visibleCounts.set(key, count + 1)
          if (count === 0 && userScrollingRef.current) {
            target.animate([{ opacity: 0 }, { opacity: 1 }], { duration: SCROLL_FADE_IN_MS, easing: "ease-out" })
          }
        }
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting || !visible.delete(target)) continue
          const key = (target as HTMLElement).dataset.collageKey ?? ""
          visibleCounts.set(key, (visibleCounts.get(key) ?? 1) - 1)
        }
      },
      { root: scroller },
    )
    for (const element of scroller.querySelectorAll("[data-collage-key]")) observer.observe(element)
    return () => observer.disconnect()
  }, [gallery, layout, copies])

  const handleScroll = () => {
    wrapScroll()
    if (!gallery) return
    userScrollingRef.current = true
    setScrolling(true)
    window.clearTimeout(resumeTimeoutRef.current)
    resumeTimeoutRef.current = window.setTimeout(() => {
      userScrollingRef.current = false
      setScrolling(false)
    }, DRIFT_RESUME_DELAY_MS)
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
            "animate-collage-drift motion-reduce:animate-none",
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
                  aria-label={`Behind-the-scenes photo ${(indexById.get(photo.id) ?? 0) + 1} of ${photos.length}`}
                  data-collage-photo={photo.id}
                  data-collage-key={key}
                  data-rotation={rotation}
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
                    loading="lazy"
                    decoding="async"
                    onLoad={() => markLoaded(photo.thumbnail.bw.src)}
                    className={cn(
                      "absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-out",
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
                        colorShown && loaded.has(photo.thumbnail.color.src) ? "opacity-100" : "opacity-0",
                      )}
                      style={colorShown && colorPhase === "revealing" ? { transitionDelay: "var(--color-delay)" } : undefined}
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
