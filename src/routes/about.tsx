import { TeamMemberProfile } from "@/components/team-member-profile"
import { team } from "@/lib/team"

export function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-14 py-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About Us</h1>
        <p className="text-xl">
          North Water Pictures is an independent film company based in Maine. We're a small team, and that's our
          strength: everyone takes on several roles, decisions happen fast, and nothing stands between an idea and the
          camera. We work without a budget and without anyone's permission, which leaves us free to make the
          ambitious, strange, and personal films we want to see.
        </p>
        <p className="text-xl">
          Our films are made in Maine, with local casts, crews, and locations, and they premiere in Maine theaters,
          from the{" "}
          <a
            href="https://www.eveningstarcinema.com/"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            Eveningstar Cinema
          </a>{" "}
          in Brunswick to the{" "}
          <a
            href="https://apohadiontheater.org/"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            Apohadion Theater
          </a>{" "}
          in Portland. We've played to sold-out
          crowds and reached audiences online, and we're now at work on Alien Mind Beam, our fourth feature
          film.
        </p>
      </div>
      <div className="space-y-10">
        <h2 className="text-3xl font-bold">The Team</h2>
        {team.map((member) => (
          <TeamMemberProfile key={member.name} member={member} />
        ))}
      </div>
    </section>
  )
}
