import { ExternalLink } from "lucide-react"
import { siInstagram, siLetterboxd, siSpotify, siSubstack, siThreads } from "simple-icons"
import type { ProfileLink } from "@/lib/team"

type ProfileLinkIconProps = {
  label: ProfileLink["label"]
  className?: string
}

const brandPaths: Partial<Record<ProfileLink["label"], string>> = {
  Instagram: siInstagram.path,
  Letterboxd: siLetterboxd.path,
  Spotify: siSpotify.path,
  Substack: siSubstack.path,
  Threads: siThreads.path,
}

export function BrandIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={path} />
    </svg>
  )
}

export function ProfileLinkIcon({ label, className }: ProfileLinkIconProps) {
  const path = brandPaths[label]
  if (!path) return <ExternalLink aria-hidden className={className} />
  return <BrandIcon path={path} className={className} />
}
