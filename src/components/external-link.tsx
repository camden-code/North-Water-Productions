import type { ReactNode } from "react";

export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
    const classNames = "text-primary underline-offset-4 hover:underline " + className
    return (
        <a href={href} target="_blank" rel="noreferrer" className={classNames}>
            {children}
        </a>
    )
}