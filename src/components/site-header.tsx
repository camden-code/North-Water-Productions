import { useEffect, useRef, useState } from "react"
import { Link, NavLink } from "react-router"
import { Menu, X } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const pointerdown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setOpen(false)
    }
    window.addEventListener("keydown", keydown)
    document.addEventListener("pointerdown", pointerdown)
    return () => {
      window.removeEventListener("keydown", keydown)
      document.removeEventListener("pointerdown", pointerdown)
    }
  }, [open])

  return (
    <>
      {/* Fixed rather than sticky so it doesn't move when the document height or scroll position jumps (e.g. on iOS). */}
      <div aria-hidden="true" className="h-16 shrink-0" />
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-(--z-header) h-16 border-b bg-background/80 backdrop-blur"
      >
        <Collapsible open={open} onOpenChange={setOpen} className="h-full">
          <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-6">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="font-heading text-3xl tracking-wide whitespace-nowrap uppercase"
            >
              Northwater&nbsp;Pictures
            </Link>
            <nav className="hidden items-center gap-6 sm:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "text-base underline-offset-4 transition-colors hover:text-foreground",
                      isActive ? "text-foreground underline decoration-accent" : "text-muted-foreground",
                    )
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
          <CollapsibleContent className="absolute right-0 w-xs overflow-hidden shadow-xl data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none sm:hidden">
            <nav className="mr-2 flex flex-col rounded-b border bg-card/95 backdrop-blur">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "border-b px-6 py-4 text-xl text-foreground underline-offset-4 transition-colors last:border-b-0 hover:bg-background/60",
                      isActive && "font-bold underline decoration-accent",
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
