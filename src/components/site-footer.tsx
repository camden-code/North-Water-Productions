import { Link } from "react-router"

const linkClassName = "text-muted-foreground transition-colors hover:text-foreground"

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t bg-(--lake-deep) px-6 py-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          <Link to="/" className="font-heading text-lg tracking-wide text-foreground uppercase">
            Northwater&nbsp;Pictures
          </Link>{" "}
          &copy; {new Date().getFullYear()}. All rights reserved.
        </p>
        <nav aria-label="Footer" className="flex items-center gap-5">
          <Link to="/about" className={linkClassName}>
            About Us
          </Link>
          <Link to="/contact" className={linkClassName}>
            Contact
          </Link>
          <Link to="/tinyhatman" className="text-muted-foreground/40 transition-colors hover:text-muted-foreground">
            #savetinyhatman
          </Link>
        </nav>
      </div>
    </footer>
  )
}
