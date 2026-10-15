import { useState } from "react"
import { Link, NavLink } from "react-router"
import { Menu, X } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

type NavItem = {
  to: string
  label: string
}

const navItems: NavItem[] = [
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-neutral-400 bg-background/80 backdrop-blur">
        <Collapsible open={open} onOpenChange={setOpen}>
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <Link to="/" onClick={() => setOpen(false)} className="font-heading text-xl font-bold tracking-tight whitespace-nowrap">
              Northwater Pictures
            </Link>
            <nav className="hidden items-center gap-6 sm:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn("text-base transition-colors hover:text-foreground", isActive ? "text-foreground underline" : "text-muted-foreground")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                className="-mr-2 inline-flex size-12 cursor-pointer items-center justify-center rounded-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 sm:hidden"
              >
                {open ? <X aria-hidden className="size-7" /> : <Menu aria-hidden className="size-7" />}
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none sm:hidden absolute right-0 w-xs shadow-xl">
            <nav className="flex flex-col border rounded-b mr-2 border-neutral-200 bg-neutral-950/90 backdrop-blur">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "border-b border-neutral-200 px-6 py-4 text-xl text-foreground transition-colors last:border-b-0 hover:bg-neutral-800/90 active:bg-neutral-900/90",
                      isActive && "font-semibold bg-neutral-900/90 underline",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </CollapsibleContent>
        </Collapsible>
      </header>
    </>
  )
}
