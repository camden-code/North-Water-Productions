import { Fragment } from "react"
import { TeamMemberProfile } from "@/components/team-member-profile"
import { team } from "@/lib/team"
import { ExternalLink } from "lucide-react"

export function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-14 py-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About&nbsp;Us</h1>
        <p className="text-xl">
          North Water Pictures is an independent film company based in Maine. Made up of only a handful of crew,
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
  )
}
