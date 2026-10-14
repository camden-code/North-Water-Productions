import { Link, NavLink } from "react-router"
import { cn } from "@/lib/utils"

type NavItem = {
  to: string
  label: string
}

const navItems: NavItem[] = [
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
]

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-heading text-xl font-bold tracking-tight">
          North Water Pictures
        </Link>
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn("text-base transition-colors hover:text-foreground", isActive ? "text-foreground" : "text-muted-foreground")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
