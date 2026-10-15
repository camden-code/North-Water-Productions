import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Images, X } from "lucide-react"
import { PhotoCollage, type PhotoPlacement } from "@/components/photo-collage"
import { PhotoLightbox } from "@/components/photo-lightbox"
import { TeamMemberProfile } from "@/components/team-member-profile"
import { btsPhotos } from "@/lib/bts-photos"
import { team } from "@/lib/team"
import { cn } from "@/lib/utils"
import { ExternalLink } from "../components/external-link"

type ViewerState = {
  index: number
  origin: PhotoPlacement
}

const CONTENT_FADE_MS = 300

export function AboutPage() {
  const [gallery, setGallery] = useState(false)
  const [viewer, setViewer] = useState<ViewerState | null>(null)
  const [contentMounted, setContentMounted] = useState(true)
  const savedScroll = useRef<number | null>(null)

  const enterGallery = () => {
    savedScroll.current = window.scrollY
    setGallery(true)
  }

  const exitGallery = () => {
    setGallery(false)
    setContentMounted(true)
  }

  // The content is unmounted once it has faded out so the page scrollbar goes away in the gallery.
  useEffect(() => {
    if (!gallery) return
    const timeout = window.setTimeout(() => setContentMounted(false), CONTENT_FADE_MS)
    return () => window.clearTimeout(timeout)
  }, [gallery])

  useLayoutEffect(() => {
    if (!contentMounted || savedScroll.current === null) return
    window.scrollTo(0, savedScroll.current)
    savedScroll.current = null
  }, [contentMounted])

  useEffect(() => {
    if (!gallery || viewer) return
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") exitGallery()
    }
    window.addEventListener("keydown", keydown)
    return () => window.removeEventListener("keydown", keydown)
  }, [gallery, viewer])

  return (
    <>
      {/* Raised above the page content only once it has faded out, so photos can be clicked in the gallery. */}
      <div
        className={cn(
          "fixed inset-0 transition-[z-index] duration-0",
          gallery ? "z-10 delay-300" : "-z-10",
        )}
      >
        <PhotoCollage
          photos={btsPhotos}
          mode={gallery ? "gallery" : "background"}
          hiddenId={viewer ? btsPhotos[viewer.index]?.id : undefined}
          onSelect={(index, origin) => setViewer({ index, origin })}
        />
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 bg-background/50 backdrop-blur-[3px] transition-opacity duration-700 lg:inset-x-auto lg:left-1/2 lg:w-[calc(var(--container-4xl)+8rem)] lg:-translate-x-1/2 lg:fade-x",
            gallery && "opacity-0",
          )}
        />
      </div>
      {contentMounted && (
        <section
          inert={gallery}
          className={cn(
            "mx-auto w-full max-w-4xl space-y-14 pt-12 pb-28 transition-opacity duration-300 motion-safe:animate-fade-in",
            gallery && "opacity-0",
          )}
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About&nbsp;Us</h1>
            <p className="text-xl">
              Northwater Pictures is an independent film company based in Maine. Made up of only a handful of crew,
              everyone takes on several roles, working without a budget to fulfill our passion of making ambitious,
              strange, and sometimes personal films.
            </p>
            <p className="text-xl">
              All of our films are shot in Maine, with a local cast and crew, and premiere at independent Maine theaters,
              such as the <ExternalLink href="https://www.eveningstarcinema.com/">Eveningstar Cinema</ExternalLink> in
              Brunswick and the <ExternalLink href="https://apohadiontheater.org/">Apohadion Theater</ExternalLink> in
              Portland. As well as having our last feature, &quot;Death of a Tiny Hat Man&quot; premiere to a sold out
              theater, our second feature, &quot;Feel Good Hotline&quot; is streaming on{" "}
              <ExternalLink href="https://fawesome.tv/movies/10666523/feel-good-hotline">Fawesome TV</ExternalLink>.
              Currently we are at work on our fourth feature film, Alien Mind Beam, a mind-bending psychological thriller
              that delves into the philosophical questions which arise as technological progress advances at a pace rarely
              seen before in human history
            </p>
          </div>
          <div className="space-y-10">
            <h2 className="text-3xl font-bold">The Team</h2>
            {team.map((member, index) => (
              <Fragment key={member.name}>
                {index > 0 && <hr className="sm:hidden" />}
                <TeamMemberProfile member={member} />
              </Fragment>
            ))}
          </div>
        </section>
      )}
      <button
        type="button"
        onClick={gallery ? exitGallery : enterGallery}
        className="fixed bottom-6 left-1/2 z-20 inline-flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full border border-neutral-400 bg-background/80 px-6 py-3 text-lg whitespace-nowrap shadow-lg shadow-black/40 backdrop-blur transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 sm:right-6 sm:left-auto sm:translate-x-0"
      >
        {gallery ? <X aria-hidden className="size-5" /> : <Images aria-hidden className="size-5" />}
        {gallery ? "Back to About Us" : "Behind the Scenes"}
      </button>
      {viewer && (
        <PhotoLightbox
          photos={btsPhotos}
          index={viewer.index}
          origin={viewer.origin}
          onNavigate={(index) => setViewer((current) => (current ? { ...current, index } : current))}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  )
}
