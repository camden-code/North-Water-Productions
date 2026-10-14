import { Mail } from "lucide-react"

const contactEmail = "camden.mknz@gmail.com"

export function ContactPage() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact</h1>
      <p className="text-xl">Questions, collaborations, or screenings? Reach Northwater Pictures at the email below.</p>
      <div className="rounded-xl border bg-card p-6">
        <p className="font-heading text-3xl font-bold">Northwater Pictures</p>
        <a
          href={`mailto:${contactEmail}`}
          className="mt-3 inline-flex items-center gap-2 text-xl text-primary underline-offset-4 hover:underline"
        >
          <Mail aria-hidden className="size-5" />
          {contactEmail}
        </a>
        <p className="mt-4 text-muted-foreground">
          All inquiries are coordinated by Camden McKenzie.
        </p>
      </div>
    </section>
  )
}
