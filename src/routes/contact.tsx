import { Mail } from "lucide-react"

const contactEmail = "camden.mknz@gmail.com"

export function ContactPage() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact Northwater&nbsp;Pictures</h1>
      <div className="text-xl">
        <div>
          Questions, collaborations, or screenings?
        </div>
        <div>
          Reach Northwater&nbsp;Pictures at the email below.
        </div>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <a
          href={`mailto:${contactEmail}`}
          className="mt-3 inline-flex items-center gap-2 text-xl text-primary underline-offset-4 hover:underline"
        >
          <Mail aria-hidden className="size-5" />
          {contactEmail}
        </a>
        <p className="mt-4 text-muted-foreground italic">
          All inquiries are coordinated by Camden McKenzie.
        </p>
      </div>
    </section>
  )
}
