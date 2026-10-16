import { useEffect, useMemo, useRef } from "react"
import { quotes } from "@/lib/quotes"

type FloatingItem =
  | { kind: "quote"; text: string; author: string }
  | { kind: "tag"; text: string }

type Side = "left" | "right"

const HASHTAG = "#savetinyhatman"
const HASHTAG_EVERY = 5
const GAP = 150
const EDGE_FADE = 140
const HEADER_HEIGHT = 64
const HEADER_FADE = 280
const MAX_OPACITY = 0.8
const DRIFT_PX_PER_SECOND = 25
const INTRO_SECONDS = 2.5
const INTRO_SOFTNESS = 200

function buildSides(): Record<Side, FloatingItem[]> {
  const sides: Record<Side, FloatingItem[]> = { left: [], right: [] }
  let placed = 0
  quotes.forEach((quote) => {
    placed += 1
    const side: Side = placed % 2 === 0 ? "right" : "left"
    sides[side].push({ kind: "quote", text: quote.text, author: quote.author })
    if (placed % HASHTAG_EVERY === 0) {
      sides[side === "left" ? "right" : "left"].push({ kind: "tag", text: HASHTAG })
    }
  })
  return sides
}

function emptyLayout() {
  return { offsets: [], heights: [], loop: 0, tallest: 0 }
}

function wrap(value: number, length: number): number {
  return ((value % length) + length) % length
}

export function FloatingQuotes() {
  const sides = useMemo(buildSides, [])
  const elements = useRef<Record<Side, (HTMLElement | null)[]>>({ left: [], right: [] })

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const start = performance.now()
    let frame = 0
    let layout: Record<Side, { offsets: number[]; heights: number[]; loop: number; tallest: number }>

    const measure = () => {
      const viewport = window.innerHeight
      layout = { left: emptyLayout(), right: emptyLayout() }
      for (const side of ["left", "right"] as const) {
        const heights = elements.current[side].map((element) => element?.offsetHeight ?? 0)
        const offsets: number[] = []
        let total = 0
        heights.forEach((height) => {
          offsets.push(total)
          total += height + GAP
        })
        const tallest = Math.max(0, ...heights)
        const stagger = side === "right" ? total / Math.max(1, heights.length) / 2 : 0
        layout[side] = { offsets: offsets.map((offset) => offset + stagger), heights, loop: Math.max(total, viewport + tallest + GAP), tallest }
      }
    }

    const update = (now: number) => {
      const elapsed = reducedMotion ? 0 : (now - start) / 1000
      const viewport = window.innerHeight
      const revealFront = reducedMotion ? Infinity : (elapsed / INTRO_SECONDS) * (viewport + INTRO_SOFTNESS)
      for (const side of ["left", "right"] as const) {
        const { offsets, heights, loop, tallest } = layout[side]
        elements.current[side].forEach((element, index) => {
          if (!element) return
          const y = wrap(offsets[index]! - elapsed * DRIFT_PX_PER_SECOND + tallest, loop) - tallest
          const top = (y - HEADER_HEIGHT) / HEADER_FADE
          const bottom = (viewport - y - heights[index]!) / EDGE_FADE
          const edge = Math.min(1, Math.max(0, Math.min(top, bottom)))
          const intro = Math.min(1, Math.max(0, (revealFront - y) / INTRO_SOFTNESS))
          element.style.transform = `translate3d(0, ${y}px, 0)`
          element.style.opacity = String(edge * intro * MAX_OPACITY)
        })
      }
      if (!reducedMotion) frame = requestAnimationFrame(update)
    }

    measure()
    frame = requestAnimationFrame(update)
    window.addEventListener("resize", measure)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", measure)
    }
  }, [sides])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-(--z-backdrop) hidden overflow-hidden min-[1800px]:block">
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className={`absolute top-0 h-full w-[calc((100%-72rem)/2)] px-8 ${side === "left" ? "left-0" : "right-0"}`}
        >
          {sides[side].map((item, index) => (
            <figure
              key={`${item.kind}-${index}`}
              ref={(element) => {
                elements.current[side][index] = element
              }}
              className="absolute inset-x-8 top-0 mx-auto max-w-64 text-center opacity-0 will-change-transform"
            >
              {item.kind === "quote" ? (
                <>
                  <blockquote className="text-base italic leading-snug text-muted-foreground">“{item.text}”</blockquote>
                  <figcaption className="mt-2 text-sm text-muted-foreground/80">
                    {item.author}
                  </figcaption>
                </>
              ) : (
                <p className="font-heading text-3xl tracking-wide text-accent/80">{item.text}</p>
              )}
            </figure>
          ))}
        </div>
      ))}
    </div>
  )
}
