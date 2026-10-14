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
    <article className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="w-40 shrink-0 self-center sm:self-start">
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
      <div className="flex-1 space-y-3">
        <div>
          <h3 className="text-2xl font-bold">{member.name}</h3>
          <p className="text-muted-foreground">{member.role}</p>
        </div>
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
