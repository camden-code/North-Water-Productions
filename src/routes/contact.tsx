import { Mail } from "lucide-react"

const contactEmail = "camden.mknz@gmail.com"

export function ContactPage() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact</h1>
      <p className="text-xl">
        Camden McKenzie handles all coordination for North Water Pictures. Please use the email below for all
        inquiries.
      </p>
      <div className="rounded-xl border bg-card p-6">
        <p className="font-heading text-2xl font-bold">Camden McKenzie</p>
        <a
          href={`mailto:${contactEmail}`}
          className="mt-2 inline-flex items-center gap-2 text-xl text-primary underline-offset-4 hover:underline"
        >
          <Mail aria-hidden className="size-5" />
          {contactEmail}
        </a>
      </div>
    </section>
  )
}
