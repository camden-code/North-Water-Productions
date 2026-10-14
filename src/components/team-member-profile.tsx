import { ExternalLink } from "lucide-react"
import type { TeamMember } from "@/lib/team"

type TeamMemberProfileProps = {
  member: TeamMember
}

function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function TeamMemberProfile({ member }: TeamMemberProfileProps) {
  return (
    <article className="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-4 sm:grid-cols-[10rem_1fr] sm:gap-x-6">
      <div className="sm:row-span-2 sm:self-start">
        <div className="aspect-square overflow-hidden rounded-xl bg-muted">
          {member.photoUrl ? (
            <img src={member.photoUrl} alt={member.name} className="size-full object-cover" />
          ) : (
            <div
              aria-label={member.name}
              className="flex size-full items-center justify-center font-heading text-4xl font-bold text-muted-foreground"
            >
              {initials(member.name)}
            </div>
          )}
        </div>
      </div>
      <div className="self-center sm:self-end">
        <h3 className="text-xl font-bold sm:text-2xl">{member.name}</h3>
        <p className="text-muted-foreground">{member.role}</p>
      </div>
      <div className="col-span-2 space-y-3 sm:col-span-1">
        <p>{member.bio}</p>
        <ul className="flex flex-wrap gap-4">
          {member.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
              >
                <ExternalLink aria-hidden className="size-4" />
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
