import { useRef, useState, type PointerEvent } from "react"
import { flushSync } from "react-dom"
import { Link } from "react-router"
import { ArrowRight, Film as FilmIcon, Music, Play, RotateCcw, X } from "lucide-react"
import { ExternalLink } from "@/components/external-link"
import { ProfileLinkIcon } from "@/components/profile-link-icon"
import { formatRelease, posterTransitionName, type Film } from "@/lib/films"
import { cn } from "@/lib/utils"

type FilmCardProps = {
  film: Film
  hint: boolean
  flipped: boolean
  onHover: () => void
  onFlip: () => void
  onUnflip: () => void
}

const MAX_TILT_Y = 12
const MAX_TILT_X = 6
// Matches the card's duration-500 flip transition.
const FLIP_MS = 500

type Tilt = { x: number; y: number }

const linkClass = "inline-flex items-center gap-1.5"

const tvScreenClass =
  "relative overflow-hidden rounded-2xl border-8 border-[#050a0c] bg-card shadow-[inset_0_0_2.5rem_rgb(0_0_0/0.75),0_0_0_1px_var(--border)]"

function TvStatic() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 scanlines motion-safe:animate-scanline-crawl" />
      <div className="absolute inset-x-0 top-0 crt-roll motion-safe:animate-crt-roll motion-reduce:hidden" />
    </div>
  )
}

function UpcomingFilm({ film, release }: { film: Film; release: string }) {
  return (
    <>
      <article className={cn(tvScreenClass, "flex items-center gap-4 p-4 sm:hidden")}>
        <FilmIcon aria-hidden className="size-6 shrink-0 text-muted-foreground" />
        <div className="motion-safe:animate-crt-flicker">
          <h2 className="text-2xl">{film.title}</h2>
          <p className="text-muted-foreground">{release}</p>
        </div>
        <TvStatic />
      </article>
      <article className={cn(tvScreenClass, "hidden aspect-[2/3] sm:block")}>
        {film.posterUrl ? (
          <img src={film.posterUrl} alt={film.title} loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center motion-safe:animate-crt-flicker">
            <FilmIcon aria-hidden className="size-10 text-muted-foreground" />
            <h2 className="text-4xl">{film.title}</h2>
            <p className="text-muted-foreground">{release}</p>
          </div>
        )}
        <TvStatic />
      </article>
    </>
  )
}

export function FilmCard({ film, hint, flipped, onHover, onFlip, onUnflip }: FilmCardProps) {
  const release = formatRelease(film.release)
  const [tilt, setTilt] = useState<Tilt | null>(null)
  const [settling, setSettling] = useState(false)
  const frontRef = useRef<HTMLButtonElement>(null)

  const unflip = () => {
    flushSync(() => {
      setTilt(null)
      setSettling(true)
      onUnflip()
    })
    setTimeout(() => setSettling(false), FLIP_MS)
    frontRef.current?.focus({ preventScroll: true })
  }

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || settling) return
    const rect = event.currentTarget.getBoundingClientRect()
    setTilt({
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
    })
  }

  // Upcoming films can't be flipped.
  if (film.release.kind === "upcoming") return <UpcomingFilm film={film} release={release} />

  return (
    <article
      data-film-card={film.slug}
      onPointerEnter={onHover}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt(null)}
      style={film.pagePath ? { viewTransitionName: posterTransitionName(film.slug) } : undefined}
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
        {/* Front */}
        <button
          ref={frontRef}
          type="button"
          onClick={onFlip}
          inert={flipped}
          aria-label={`${film.title}, ${release}. Show details`}
          className="group absolute inset-0 cursor-pointer overflow-hidden rounded-xl bg-muted shadow-sm translate-z-px backface-hidden focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {film.posterUrl ? (
            <img src={film.posterUrl} alt="" loading="lazy" className="size-full object-cover backface-hidden" />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
              <FilmIcon aria-hidden className="size-10" />
              <span className="font-heading text-4xl tracking-wide text-foreground uppercase">{film.title}</span>
              <span>{release}</span>
            </div>
          )}
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-background/80 px-2.5 py-1 text-sm text-foreground backdrop-blur transition-opacity duration-300 motion-reduce:transition-none",
              !hint && "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
            )}
          >
            <RotateCcw aria-hidden className="size-3.5" />
            Click for details
          </span>
          {film.quote && (
            <figure className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 pt-12 pb-4 text-left text-white">
              <blockquote className="text-lg leading-snug italic">“{film.quote.text}”</blockquote>
              <figcaption className="mt-1 text-sm text-white/70">{film.quote.author}</figcaption>
            </figure>
          )}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-300",
              tilt && !flipped ? "opacity-100" : "opacity-0",
            )}
            style={
              tilt
                ? {
                    background: `radial-gradient(circle at ${(tilt.x + 1) * 50}% ${(tilt.y + 1) * 50}%, rgb(255 255 255 / 0.07), transparent 70%)`,
                  }
                : undefined
            }
          />
        </button>

        {/* Back */}
        <div
          inert={!flipped}
          className="absolute inset-0 flex -translate-z-px rotate-y-180 flex-col overflow-hidden rounded-xl border bg-card p-5 text-card-foreground shadow-sm backface-hidden"
        >
          <button
            type="button"
            onClick={unflip}
            aria-label={`Close ${film.title} details`}
            className="absolute top-3 right-3 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X aria-hidden className="size-5" />
          </button>
          <header className="pr-8">
            <h2 className="text-3xl">{film.title}</h2>
            <p className="text-muted-foreground">{release}</p>
          </header>
          <p className="mt-4 flex-1 overflow-y-auto">{film.description}</p>
          {film.pagePath && (
            <Link
              to={film.pagePath}
              viewTransition
              className="mt-4 inline-flex items-center gap-2 self-center rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Film page
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          )}
          <footer className="mt-4 flex flex-wrap gap-4 border-t pt-4">
            {film.letterboxdUrl && (
              <ExternalLink href={film.letterboxdUrl} className={linkClass}>
                <ProfileLinkIcon label="Letterboxd" className="size-4" />
                Letterboxd
              </ExternalLink>
            )}
            {film.watchUrl && (
              <ExternalLink href={film.watchUrl} className={linkClass}>
                <Play aria-hidden className="size-4" />
                Watch
              </ExternalLink>
            )}
            {film.trailerUrl && (
              <ExternalLink href={film.trailerUrl} className={linkClass}>
                <Play aria-hidden className="size-4" />
                Trailer
              </ExternalLink>
            )}
            {film.soundtrackUrl && (
              <ExternalLink href={film.soundtrackUrl} className={linkClass}>
                <Music aria-hidden className="size-4" />
                Soundtrack
              </ExternalLink>
            )}
          </footer>
        </div>
      </div>
    </article>
  )
}
