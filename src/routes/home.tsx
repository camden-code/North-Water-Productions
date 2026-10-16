import { useEffect, useState } from "react"
import { FilmCard } from "@/components/film-card"
import { FloatingQuotes } from "@/components/floating-quotes"
import { films } from "@/lib/films"

const firstFlippableSlug = films.find((film) => film.release.kind !== "upcoming")?.slug

// Module-level so the hint stays dismissed when navigating back to the home page.
let hintDismissed = false

export function HomePage() {
  const [flippedSlug, setFlippedSlug] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(!hintDismissed)

  const dismissHint = () => {
    hintDismissed = true
    setShowHint(false)
  }

  const flip = (slug: string) => {
    dismissHint()
    setFlippedSlug(slug)
  }

  useEffect(() => {
    const unflipOutside = (event: PointerEvent) => {
      const card = event.target instanceof Element ? event.target.closest("[data-film-card]") : null
      setFlippedSlug((current) => (card?.getAttribute("data-film-card") === current ? current : null))
    }
    document.addEventListener("pointerdown", unflipOutside)
    return () => document.removeEventListener("pointerdown", unflipOutside)
  }, [])

  return (
    <section className="mx-auto w-full max-w-6xl py-12">
      <title>Northwater Pictures</title>
      <FloatingQuotes />
      <div className="mb-10 space-y-6 text-center">
        <div>
          <h1 className="text-5xl sm:text-6xl">Northwater Pictures</h1>
          <p className="mt-2 text-xl text-muted-foreground">Films by Xavier Gamache</p>
        </div>
      </div>
      <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {films.map((film) => (
          <FilmCard
            key={film.slug}
            film={film}
            hint={showHint && film.slug === firstFlippableSlug}
            flipped={flippedSlug === film.slug}
            onHover={dismissHint}
            onFlip={() => flip(film.slug)}
            onUnflip={() => setFlippedSlug(null)}
          />
        ))}
      </div>
    </section>
  )
}
