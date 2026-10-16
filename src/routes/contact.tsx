import { Mail } from "lucide-react"

const contactEmail = "camden.mknz@gmail.com"

export function ContactPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center py-12">
      <title>Contact | Northwater Pictures</title>
      <div className="flex w-full max-w-2xl flex-col gap-6 text-center">
        <h1 className="text-5xl sm:text-6xl">Get in touch</h1>
        <p className="text-xl">Questions, collaborations, or screenings? Send us an email.</p>
        <div className="rounded-xl border bg-card p-6">
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-2 text-xl underline decoration-muted-foreground/60 underline-offset-4 transition-colors hover:decoration-accent"
          >
            <Mail aria-hidden className="size-5" />
            {contactEmail}
          </a>
          <p className="mt-4 text-muted-foreground italic">All inquiries are coordinated by Camden McKenzie.</p>
        </div>
      </div>
    </section>
  )
}
