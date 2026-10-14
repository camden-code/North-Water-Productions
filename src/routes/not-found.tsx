import { Link } from "react-router"

export function NotFoundPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
        Back home
      </Link>
    </section>
  )
}
