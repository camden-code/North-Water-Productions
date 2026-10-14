import { Fragment } from "react"
import { TeamMemberProfile } from "@/components/team-member-profile"
import { team } from "@/lib/team"

export function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-14 py-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About Us</h1>
        <p className="text-xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante
          dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.
          Fusce nec tellus sed augue semper porta.
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
