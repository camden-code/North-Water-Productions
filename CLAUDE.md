# CLAUDE.md

Static landing page for North Water Pictures. React + TypeScript + Vite + Tailwind v4 + shadcn/ui, deployed to GitHub Pages.

## Constraints

- Static only: no backend, database, persistence, or data processing.
- Keep dependencies minimal. Justify any new dependency before adding it.
- Vite `base` is `/North-Water-Productions/`; use router `Link`s or `import.meta.env.BASE_URL` for paths, never hard-coded absolute URLs.

## Structure

- `src/routes/` – route table in `index.tsx`, one file per page.
- `src/components/` – shared components; `src/components/ui/` is for shadcn components (add via `npx shadcn@latest add <name>`).
- `src/lib/` – utilities. `src/styles/` – global CSS and theme tokens.
- Import with the `@/` alias.

## Code conventions

- Minimal comments. Only comment when the code isn't self-explanatory.
- Comments are short and purposeful; no header blurbs on simple components.
- Never write comments describing a requested change (e.g. "changed to X", "now does Y").
- Strict typing: prefer explicit types and union types; avoid `any` (use `unknown` and narrow if needed).
- Named exports for components.

## Verify

`npm run build` must pass (runs `tsc -b` then `vite build`).
