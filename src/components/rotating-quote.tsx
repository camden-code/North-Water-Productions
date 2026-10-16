import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { quotes } from "@/lib/quotes"

const ROTATE_MS = 8000

export function RotatingQuote({ className }: { className?: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const interval = window.setInterval(() => setIndex((current) => (current + 1) % quotes.length), ROTATE_MS)
    return () => window.clearInterval(interval)
  }, [])

  const quote = quotes[index]!

  return (
    <figure className={cn("mx-auto max-w-xl min-h-24", className)}>
      <div key={index} className="motion-safe:animate-fade-in">
        <blockquote className="text-lg leading-snug text-muted-foreground italic">“{quote.text}”</blockquote>
        <figcaption className="mt-1 text-sm text-muted-foreground/80">{quote.author}</figcaption>
      </div>
    </figure>
  )
}
