import { useEffect, useRef, type ReactNode } from "react"
import { Link, ScrollRestoration } from "react-router"
import { ArrowLeft, Music, Play, Ticket } from "lucide-react"
import { siLetterboxd, siSpotify } from "simple-icons"
import { films } from "@/lib/films"
import { tinyHatManCast, tinyHatManCrew, tinyHatManLinks, type TinyHatManLink } from "@/lib/tiny-hat-man"
import "@/styles/tiny-hat-man.css"

const posterUrl = films.find((film) => film.slug === "death-of-a-tiny-hat-man")?.posterUrl
const backdropUrl = `${import.meta.env.BASE_URL}films/death-of-a-tiny-hat-man-backdrop.webp`

function BrandIcon({ path }: { path: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="thm-link-icon">
      <path d={path} />
    </svg>
  )
}

const linkIcons: Record<TinyHatManLink["label"], ReactNode> = {
  Letterboxd: <BrandIcon path={siLetterboxd.path} />,
  Spotify: <BrandIcon path={siSpotify.path} />,
  Soundtrack: <Music aria-hidden className="thm-link-icon" />,
  Trailer: <Play aria-hidden className="thm-link-icon" />,
  Fandango: <Ticket aria-hidden className="thm-link-icon" />,
}

function TitleWords() {
  return (
    <>
      <span className="thm-title-death">Death</span>
      <span className="thm-title-of">of a</span>
      <span className="thm-title-man">Tiny Hat Man</span>
    </>
  )
}

export function TinyHatManPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const title = titleRef.current
      if (!title) return
      const progress = Math.min(Math.max(window.scrollY / (title.offsetHeight * 0.75), 0), 1)
      pageRef.current?.style.setProperty("--thm-scroll", progress.toFixed(3))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <div ref={pageRef} className="thm">
      <title>Death of a Tiny Hat Man | Northwater&nbsp;Pictures</title>
      <div className="thm-bar">
        <Link to="/" aria-label="Back to Northwater&nbsp;Pictures" className="thm-back">
          <ArrowLeft aria-hidden />
        </Link>
        <p aria-hidden className="thm-bar-title">
          <TitleWords />
        </p>
      </div>

      <header ref={titleRef} className="thm-title">
        <h1>
          <TitleWords />
        </h1>
      </header>

      <main className="thm-main">
        {posterUrl && (
          <img src={posterUrl} alt="Death of a Tiny Hat Man poster" className="thm-poster" />
        )}

        <nav aria-label="Watch and listen" className="thm-links">
          {tinyHatManLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="thm-link">
              {linkIcons[link.label]}
              {link.label}
            </a>
          ))}
        </nav>

        <section aria-labelledby="thm-credits-heading" className="thm-credits">
          <h2 id="thm-credits-heading" className="thm-credits-heading">
            Cast &amp; Crew
          </h2>

          <h3 className="thm-dept">Cast</h3>
          <dl className="thm-credit-list">
            {tinyHatManCast.map((credit) => (
              <div key={credit.character} className="thm-credit">
                <dt>{credit.character}</dt>
                <dd>
                  <a href={credit.tmdbUrl} target="_blank" rel="noreferrer">
                    {credit.name}
                  </a>
                </dd>
              </div>
            ))}
          </dl>

          {tinyHatManCrew.map((group) => (
            <div key={group.department}>
              <h3 className="thm-dept">{group.department}</h3>
              <dl className="thm-credit-list">
                {group.members.map((credit) => (
                  <div key={credit.name} className="thm-credit">
                    <dt>{credit.jobs}</dt>
                    <dd>
                      <a href={credit.tmdbUrl} target="_blank" rel="noreferrer">
                        {credit.name}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </section>
      </main>

      <img src={backdropUrl} alt="" loading="lazy" className="thm-backdrop" />
      <ScrollRestoration />
    </div>
  )
}
