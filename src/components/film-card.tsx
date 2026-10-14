import { useId, useState } from "react"
import { ChevronDown, ExternalLink, Play } from "lucide-react"
import { formatRelease, type Film } from "@/lib/films"
import { cn } from "@/lib/utils"

type FilmCardProps = {
  film: Film
}

export function FilmCard({ film }: FilmCardProps) {
  const [expanded, setExpanded] = useState<boolean>(false)
  const detailsId = useId()

  return (
    <article className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls={detailsId}
        className="group block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <div className="aspect-[2/3] overflow-hidden bg-muted">
          <img
            src={film.posterUrl}
            alt={`${film.title} poster`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex items-start justify-between gap-3 p-4">
          <div>
            <h2 className="text-xl font-bold leading-tight">{film.title}</h2>
            <p className="text-muted-foreground">{formatRelease(film.release)}</p>
          </div>
          <ChevronDown
            aria-hidden
            className={cn("mt-1 size-5 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
          />
        </div>
      </button>

      <div id={detailsId} hidden={!expanded} className="space-y-4 border-t px-4 pt-3 pb-4">
        <p>{film.description}</p>
        <div className="flex flex-wrap gap-4">
          <a
            href={film.letterboxdUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
          >
            <ExternalLink aria-hidden className="size-4" />
            Letterboxd
          </a>
          {film.trailerUrl && (
            <a
              href={film.trailerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
            >
              <Play aria-hidden className="size-4" />
              Trailer
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
