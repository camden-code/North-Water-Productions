import { useEffect, useState } from "react"
import { FilmCard } from "@/components/film-card"
import { films } from "@/lib/films"

export function HomePage() {
  const [flippedSlug, setFlippedSlug] = useState<string | null>(null)

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
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Northwater Pictures</h1>
        <p className="mt-2 text-xl text-muted-foreground">Films by Xavier Gamache</p>
      </div>
      <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {films.map((film) => (
          <FilmCard
            key={film.slug}
            film={film}
            flipped={flippedSlug === film.slug}
            onFlip={() => setFlippedSlug(film.slug)}
            onUnflip={() => setFlippedSlug(null)}
          />
        ))}
      </div>
    </section>
  )
}
