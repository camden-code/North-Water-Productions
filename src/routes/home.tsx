import { FilmCard } from "@/components/film-card"
import { films } from "@/lib/films"

export function HomePage() {
  return (
    <section className="mx-auto w-full max-w-6xl py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">North Water Pictures</h1>
        <p className="mt-2 text-xl text-muted-foreground">Films by Xavier Gamache</p>
      </div>
      <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {films.map((film) => (
          <FilmCard key={film.slug} film={film} />
        ))}
      </div>
    </section>
  )
}
