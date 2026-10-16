import { Link } from "react-router"

export function NotFoundPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
      <title>Page not found | Northwater Pictures</title>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-(--z-backdrop) film-burn-edges motion-safe:animate-film-burn"
      />
      <h1 className="text-5xl sm:text-6xl">This scene was cut</h1>
      <p className="max-w-[45ch] text-xl text-muted-foreground">
        The page you followed doesn&rsquo;t exist or has moved.
      </p>
      <Link
        to="/"
        className="text-lg underline decoration-muted-foreground/60 underline-offset-4 transition-colors hover:decoration-accent"
      >
        Go to the home page
      </Link>
    </section>
  )
}
