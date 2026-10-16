import { Mail } from "lucide-react"

const contactEmail = "info@northwaterpictures.com"

export function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-10 pt-12 pb-28 motion-safe:animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact</h1>
        <p className="text-xl">
          Questions, collaborations, or screenings?
          <br className="sm:hidden" /> We&apos;d love to hear from you. Reach out at the email below.
        </p>
      </div>
      <div className="rounded-lg border border-neutral-400/40 px-6 py-6 text-center">
        <h2 className="text-xl font-bold tracking-tight">Northwater Pictures</h2>
        <a
          href={`mailto:${contactEmail}`}
          className="mt-2 inline-flex items-center gap-2 text-lg break-all text-primary underline-offset-4 hover:underline"
        >
          <Mail aria-hidden className="size-4 shrink-0" />
          {contactEmail}
        </a>
      </div>
    </section>
  )
}
