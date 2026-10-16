import { ExternalLink } from "@/components/external-link"
import { ProfileLinkIcon } from "@/components/profile-link-icon"
import type { TeamMember } from "@/lib/team"

type TeamMemberProfileProps = {
  member: TeamMember
  tilt: number
}

function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function TeamMemberProfile({ member, tilt }: TeamMemberProfileProps) {
  return (
    <article className="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-4 sm:grid-cols-[10rem_1fr] sm:gap-x-8">
      <div className="sm:row-span-2 sm:self-start">
        <div
          style={{ transform: `rotate(${tilt}deg)` }}
          className="aspect-square overflow-hidden border-4 border-primary bg-muted shadow-lg shadow-black/60 sm:border-[6px]"
        >
          {member.photoUrl ? (
            <img src={member.photoUrl} alt={member.name} className="size-full object-cover" />
          ) : (
            <div
              aria-label={member.name}
              className="flex size-full items-center justify-center font-heading text-4xl text-muted-foreground"
            >
              {initials(member.name)}
            </div>
          )}
        </div>
      </div>
      <div className="self-center sm:self-end">
        <h3 className="text-3xl">{member.name}</h3>
        <p className="text-muted-foreground">{member.role}</p>
      </div>
      <div className="col-span-2 space-y-3 sm:col-span-1">
        <p>{member.bio}</p>
        <ul className="flex flex-wrap gap-4">
          {member.links.map((link) => (
            <li key={link.href}>
              <ExternalLink href={link.href} className="inline-flex items-center gap-1.5">
                <ProfileLinkIcon label={link.label} className="size-4" />
                {link.label}
              </ExternalLink>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
