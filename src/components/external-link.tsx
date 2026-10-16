import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type ExternalLinkProps = {
  href: string
  children: ReactNode
  className?: string
}

export function ExternalLink({ href, children, className }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "text-foreground underline decoration-muted-foreground/60 underline-offset-4 transition-colors hover:decoration-accent",
        className,
      )}
    >
      {children}
    </a>
  )
}
