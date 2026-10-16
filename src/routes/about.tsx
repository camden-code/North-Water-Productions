import { Fragment, useEffect, useState } from "react"
import { Images, X } from "lucide-react"
import { ExternalLink } from "@/components/external-link"
import { PhotoCollage, type PhotoPlacement } from "@/components/photo-collage"
import { PhotoLightbox } from "@/components/photo-lightbox"
import { TeamMemberProfile } from "@/components/team-member-profile"
import { btsPhotos } from "@/lib/bts-photos"
import { team } from "@/lib/team"
import { cn } from "@/lib/utils"

type ViewerState = {
  index: number
  origin: PhotoPlacement
}

export function AboutPage() {
  const [gallery, setGallery] = useState(false)
  const [viewer, setViewer] = useState<ViewerState | null>(null)

  const enterGallery = () => setGallery(true)
  const exitGallery = () => setGallery(false)

  // Locks the page behind the gallery so its scrollbar goes away without changing its scroll position.
  useEffect(() => {
    if (!gallery) return
    const root = document.documentElement
    root.style.overflow = "hidden"
    return () => {
      root.style.overflow = ""
    }
  }, [gallery])

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
      <title>About Us | Northwater Pictures</title>
      {/* Raised above the page content only once it has faded out, so photos can be clicked in the gallery.
          The solid background covers the footer while the gallery is open. */}
      <div
        className={cn(
          "fixed inset-0 bg-background transition-[z-index] duration-0",
          gallery ? "z-(--z-gallery) delay-300" : "z-(--z-backdrop)",
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
            "pointer-events-none absolute inset-0 bg-background/60 transition-[opacity,visibility] lg:bg-background/50 lg:backdrop-blur-[3px] duration-700 lg:inset-x-auto lg:left-1/2 lg:w-[calc(var(--container-6xl)+8rem)] lg:-translate-x-1/2 lg:fade-x",
            gallery && "invisible opacity-0",
          )}
        />
      </div>
      <div className="mx-auto w-full max-w-6xl">
        <section
          inert={gallery}
          className={cn(
            "space-y-14 pt-12 pb-24 transition-[opacity,visibility] duration-300 motion-safe:animate-fade-in",
            gallery && "invisible opacity-0",
          )}
        >
          <div className="max-w-[65ch] space-y-4">
            <h1 className="text-5xl sm:text-6xl">About&nbsp;Us</h1>
            <p className="text-xl">
              Northwater Pictures is an independent film company based in Maine. Made up of only a handful of crew,
              everyone takes on several roles, working without a budget to fulfill our passion of making ambitious,
              strange, and sometimes personal films.
            </p>
            <p className="text-xl">
              All of our films are shot in Maine with a local cast and crew, and premiere at independent Maine theaters
              such as the <ExternalLink href="https://www.eveningstarcinema.com/">Eveningstar Cinema</ExternalLink> in
              Brunswick and the <ExternalLink href="https://apohadiontheater.org/">Apohadion Theater</ExternalLink> in
              Portland. Our last feature, <cite>Death of a Tiny Hat Man</cite>, premiered to a sold-out theater, and our
              second feature, <cite>Feel Good Hotline</cite>, is streaming on{" "}
              <ExternalLink href="https://fawesome.tv/movies/10666523/feel-good-hotline">Fawesome TV</ExternalLink>.
              We are now at work on our fourth feature, <cite>Alien Mind Beam</cite>, a mind-bending psychological
              thriller that delves into the philosophical questions which arise as technology advances at a pace rarely
              seen before in human history.
            </p>
          </div>
          <div className="max-w-4xl space-y-10">
            <h2 className="text-4xl sm:text-5xl">The Team</h2>
            {team.map((member, index) => (
              <Fragment key={member.name}>
                {index > 0 && <hr className="sm:hidden" />}
                <TeamMemberProfile member={member} tilt={index % 2 === 0 ? -2 : 1.5} />
              </Fragment>
            ))}
          </div>
        </section>
        {/* Zero-height sticky anchor: the button follows the bottom of the screen without taking up space,
            and comes to rest at the end of the content instead of covering the footer. */}
        <div className="sticky bottom-6 z-(--z-gallery-controls) h-0">
          <button
            type="button"
            onClick={gallery ? exitGallery : enterGallery}
            className="absolute bottom-0 left-1/2 inline-flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full border bg-background/80 px-6 py-3 text-lg whitespace-nowrap shadow-lg shadow-black/40 backdrop-blur transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 sm:right-0 sm:left-auto sm:translate-x-0"
          >
            {gallery ? <X aria-hidden className="size-5" /> : <Images aria-hidden className="size-5" />}
            {gallery ? "Back to About Us" : "Behind the Scenes"}
          </button>
        </div>
      </div>
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
