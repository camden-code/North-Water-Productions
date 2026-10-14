import { useState, type PointerEvent } from "react"
import { ExternalLink, Film as FilmIcon, Play } from "lucide-react"
import { formatRelease, type Film } from "@/lib/films"
import { cn } from "@/lib/utils"

type FilmCardProps = {
  film: Film
  flipped: boolean
  onFlip: () => void
}

const MAX_TILT_Y = 12
const MAX_TILT_X = 6

type Tilt = { x: number; y: number }

const linkClass = "inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"

export function FilmCard({ film, flipped, onFlip }: FilmCardProps) {
  const release = formatRelease(film.release)
  const [tilt, setTilt] = useState<Tilt | null>(null)

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return
    const rect = event.currentTarget.getBoundingClientRect()
    setTilt({
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
    })
  }

  return (
    <article
      data-film-card={film.slug}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt(null)}
      className="aspect-[2/3] perspective-distant"
    >
      <div
        style={
          !flipped && tilt
            ? { transform: `rotateY(${tilt.x * MAX_TILT_Y}deg) rotateX(${-tilt.y * MAX_TILT_X}deg)` }
            : undefined
        }
        className={cn(
          "relative size-full transition-transform transform-3d motion-reduce:duration-0",
          tilt && !flipped ? "duration-150" : "duration-500",
          flipped && "rotate-y-180",
        )}
      >
        <button
          type="button"
          onClick={onFlip}
          inert={flipped}
          aria-label={`${film.title}, ${release}. Show details`}
          className="absolute inset-0 cursor-pointer overflow-hidden rounded-xl border bg-muted shadow-sm backface-hidden focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {film.posterUrl ? (
            <img
              src={film.posterUrl}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
              <FilmIcon aria-hidden className="size-10" />
              <span className="text-2xl font-bold text-foreground">{film.title}</span>
              <span>{release}</span>
            </div>
          )}
          {film.quote && (
            <figure className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 pt-12 pb-4 text-left text-white">
              <blockquote className="text-lg leading-snug font-semibold italic">“{film.quote.text}”</blockquote>
              <figcaption className="mt-1 text-sm text-white/70">— {film.quote.author}</figcaption>
            </figure>
          )}
        </button>

        <div
          inert={!flipped}
          className="absolute inset-0 flex rotate-y-180 flex-col overflow-hidden rounded-xl border bg-card p-5 text-card-foreground shadow-sm backface-hidden"
        >
          <header>
            <h2 className="text-xl leading-tight font-bold">{film.title}</h2>
            <p className="text-muted-foreground">{release}</p>
          </header>
          <p className="mt-4 flex-1 overflow-y-auto">{film.description}</p>
          <footer className="mt-4 flex flex-wrap gap-4 border-t pt-4">
            {film.letterboxdUrl && (
              <a href={film.letterboxdUrl} target="_blank" rel="noreferrer" className={linkClass}>
                <ExternalLink aria-hidden className="size-4" />
                Letterboxd
              </a>
            )}
            {film.trailerUrl && (
              <a href={film.trailerUrl} target="_blank" rel="noreferrer" className={linkClass}>
                <Play aria-hidden className="size-4" />
                Trailer
              </a>
            )}
          </footer>
        </div>
      </div>
    </article>
  )
}
