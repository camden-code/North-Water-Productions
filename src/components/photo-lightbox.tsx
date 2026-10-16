import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react"
import { ChevronLeft, ChevronRight, LoaderCircle, X } from "lucide-react"
import { findPhotoPlacement, type PhotoPlacement } from "@/components/photo-collage"
import type { BtsPhoto } from "@/lib/bts-photos"
import { cn } from "@/lib/utils"

type PhotoLightboxProps = {
  photos: BtsPhoto[]
  index: number
  origin: PhotoPlacement | null
  onNavigate: (index: number) => void
  onClose: () => void
}

type Viewport = {
  width: number
  height: number
}

const MOVE_DURATION = 450
const FADE_DURATION = 250
const EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)"
const SIDE_MARGIN = 16
const TOP_MARGIN = 72
const BOTTOM_MARGIN = 88

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function fitPlacement(photo: BtsPhoto, viewport: Viewport): PhotoPlacement {
  const { width, height } = photo.original
  const maxWidth = viewport.width - SIDE_MARGIN * 2
  const maxHeight = viewport.height - TOP_MARGIN - BOTTOM_MARGIN
  const scale = Math.min(maxWidth / width, maxHeight / height)
  return {
    centerX: viewport.width / 2,
    centerY: TOP_MARGIN + maxHeight / 2,
    width: width * scale,
    height: height * scale,
    rotation: 0,
  }
}

type Box = {
  left: string
  top: string
  width: string
  height: string
  transform: string
}

function box({ centerX, centerY, width, height, rotation }: PhotoPlacement): Box {
  return {
    left: `${centerX - width / 2}px`,
    top: `${centerY - height / 2}px`,
    width: `${width}px`,
    height: `${height}px`,
    transform: `rotate(${rotation}deg)`,
  }
}

function LightboxFrame({
  photo,
  placement,
  entrance,
  frameRef,
}: {
  photo: BtsPhoto
  placement: PhotoPlacement
  entrance: PhotoPlacement | null
  frameRef: RefObject<HTMLDivElement | null>
}) {
  const [originalLoaded, setOriginalLoaded] = useState(false)
  const entranceRef = useRef(entrance)
  const placementRef = useRef(placement)

  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame || prefersReducedMotion()) return
    const from = entranceRef.current
    if (from) {
      frame.animate([box(from), box(placementRef.current)], { duration: MOVE_DURATION, easing: EASING })
    } else {
      frame.animate([{ opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1 }], { duration: FADE_DURATION, easing: EASING })
    }
  }, [frameRef])

  return (
    <div
      ref={frameRef}
      className="fixed overflow-hidden border-[6px] border-white bg-white shadow-2xl shadow-black/70"
      style={box(placement)}
    >
      <img src={photo.thumbnail.color.src} alt="" className="absolute inset-0 size-full object-cover" />
      <img
        src={photo.original.src}
        alt="Behind the scenes photo"
        decoding="async"
        onLoad={() => setOriginalLoaded(true)}
        className={cn(
          "absolute inset-0 size-full object-cover transition-opacity duration-300",
          originalLoaded ? "opacity-100" : "opacity-0",
        )}
      />
      {!originalLoaded && (
        // Delayed so cached originals don't flash the spinner.
        <span
          role="status"
          aria-label="Loading full resolution photo"
          className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full bg-black/60 text-white animate-fade-in [animation-delay:300ms] [animation-fill-mode:backwards]"
        >
          <LoaderCircle aria-hidden className="size-5 animate-spin" />
        </span>
      )}
    </div>
  )
}

export function PhotoLightbox({ photos, index, origin, onNavigate, onClose }: PhotoLightboxProps) {
  const [viewport, setViewport] = useState<Viewport>(() => ({ width: window.innerWidth, height: window.innerHeight }))
  const [entrance, setEntrance] = useState<PhotoPlacement | null>(origin)
  const [closing, setClosing] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const photo = photos[index]!
  const placement = fitPlacement(photo, viewport)

  const navigate = (offset: number) => {
    if (closing) return
    setEntrance(null)
    onNavigate((index + offset + photos.length) % photos.length)
  }

  const close = () => {
    if (closing) return
    setClosing(true)
    const frame = frameRef.current
    if (!frame || prefersReducedMotion()) {
      onClose()
      return
    }

    const target = findPhotoPlacement(photo.id)
    const options: KeyframeAnimationOptions = { duration: target ? MOVE_DURATION : FADE_DURATION, easing: EASING, fill: "forwards" }
    const animation = target
      ? frame.animate([box(placement), box(target)], options)
      : frame.animate([{ opacity: 1, scale: 1 }, { opacity: 0, scale: 0.96 }], options)
    backdropRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], options)
    animation.finished.then(onClose, onClose)
  }

  const handlers = useRef({ close, navigate })
  handlers.current = { close, navigate }

  useEffect(() => {
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handlers.current.close()
      else if (event.key === "ArrowRight") handlers.current.navigate(1)
      else if (event.key === "ArrowLeft") handlers.current.navigate(-1)
      else return
      event.preventDefault()
    }
    window.addEventListener("resize", resize)
    window.addEventListener("keydown", keydown)
    closeButtonRef.current?.focus({ preventScroll: true })
    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("keydown", keydown)
    }
  }, [])

  useEffect(() => {
    const next = photos[(index + 1) % photos.length]
    if (next) new Image().src = next.original.src
  }, [photos, index])

  const controlClassName =
    "inline-flex size-12 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"

  return (
    <div role="dialog" aria-modal="true" aria-label="Behind the scenes photo viewer" className="fixed inset-0 z-60">
      <div
        ref={backdropRef}
        onClick={close}
        className="absolute inset-0 bg-black/85 motion-safe:animate-fade-in"
      />
      <LightboxFrame key={photo.id} photo={photo} placement={placement} entrance={entrance} frameRef={frameRef} />
      <div className={cn("transition-opacity duration-200", closing && "opacity-0")}>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={close}
          aria-label="Close photo"
          className={cn(controlClassName, "fixed top-4 right-4")}
        >
          <X aria-hidden className="size-6" />
        </button>
        <div className="fixed inset-x-0 bottom-5 flex items-center justify-center gap-4 text-white">
          <button type="button" onClick={() => navigate(-1)} aria-label="Previous photo" className={controlClassName}>
            <ChevronLeft aria-hidden className="size-7" />
          </button>
          <span aria-live="polite" className="min-w-16 text-center tabular-nums">
            {index + 1} / {photos.length}
          </span>
          <button type="button" onClick={() => navigate(1)} aria-label="Next photo" className={controlClassName}>
            <ChevronRight aria-hidden className="size-7" />
          </button>
        </div>
      </div>
    </div>
  )
}
