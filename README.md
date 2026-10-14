# Northwater Pictures

Landing page for Northwater Pictures, a Maine based short film production company. Built with React, TypeScript, Vite, Tailwind CSS and shadcn/ui, and hosted on GitHub Pages.

## Run locally

1. Install [Node.js](https://nodejs.org) 24 (see `.nvmrc`; with nvm run `nvm use`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open the URL printed in the terminal (http://localhost:5173/North-Water-Productions/).

## Other scripts

- `npm run build` – typecheck and build to `dist/`
- `npm run preview` – serve the production build locally
- `npm run typecheck` – typecheck only

## Adding shadcn components

```bash
npx shadcn@latest add button
```

Components are added to `src/components/ui`.

## Deploying

Pushing to `main` builds and deploys via `.github/workflows/deploy.yml`. In the repo's **Settings → Pages**, set **Source** to **GitHub Actions** (one-time setup).

## Project structure

```
src/
  main.tsx          entry point
  App.tsx           router provider
  routes/           route table (index.tsx) and page components
  components/       shared components
  components/ui/    shadcn components
  lib/              utilities
  styles/           global CSS and theme tokens
```
