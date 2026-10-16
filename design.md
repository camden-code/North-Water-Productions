# Design

Northwater Pictures is a small, no-budget film company from Maine. The site should feel like **a dark screening room on a cold lake**: projected film, printed stills, and handmade objects. The work is ambitious and strange but made by hand. The design should look like the people who made the films built it, not like a studio template.

Tokens live in `src/styles/globals.css`. Use them. Don't add one-off hex values to components.

## Palette

All surfaces are dark lake water, and text is the off-white of a photo print. Colour is used sparingly so the film posters supply most of it.

| Token | Hex | Role |
| --- | --- | --- |
| `--lake` | `#0e1a1f` | Page background (`bg-background`). Also the `theme-color`. |
| `--lake-raised` | `#15252b` | Cards, popovers, muted fills (`bg-card`, `bg-muted`). |
| `--lake-deep` | `#091216` | The footer, the deepest layer. |
| `--print-white` | `#f2efe6` | Text, primary buttons, and the white border on photo prints (`border-primary`). |
| `--fog` | `#8fa3a8` | Secondary text (`text-muted-foreground`). |
| `--slate` | `#2e3639` | Borders and dividers. |
| `--spruce` | `#2f5d50` | `secondary`. Reserved and currently unused. |
| `--lantern` | `#d4a24c` | The only accent: link underlines on hover, active nav underline, text selection, the `#savetinyhatman` tag. |
| `--film-burn` | `#d2452b` | Only for the burned-film effect on the 404 page. |

Rules:
- Lantern is a small warm light, not a brand fill. Use it for underlines, selection and very small marks. Never use it for large areas, backgrounds or whole buttons.
- Primary buttons are print-white on lake (`bg-primary text-primary-foreground`), not lantern.
- There is no light mode. `<html class="dark">` is fixed.

## Typography

Two clearly different faces, both loaded from Google Fonts in `index.html`:

- **League Gothic** (`font-heading`) is for headings and the wordmark. It is a condensed, poster-style gothic. The base layer sets every `h1`–`h6` to uppercase, normal weight and `tracking-wide`, so components don't need to repeat it. Use it like a film title card: large and stacked.
- **Amiri** (`font-body`, also `font-sans`) is for everything else. It is a book serif. Use its italic for quotes and asides.

The scale is the classic typographic scale (14, 16, 18, 21, 24, 36, 48, 60, 72) mapped onto Tailwind's `text-sm`…`text-6xl`. Stay on that scale.

- Page `h1`: `text-5xl sm:text-6xl`. Section `h2`: `text-4xl sm:text-5xl`. Card titles: `text-2xl`–`text-4xl`.
- Lead/body copy on content pages: `text-xl`, measure ≤ `65ch`.
- Supporting copy, release dates and roles: `text-muted-foreground`.
- Quotes: italic Amiri in curly quotes `“…”`, with the attribution on its own line in `text-sm` muted. Use `<figure>`/`<blockquote>`/`<figcaption>`.
- Film titles in running text use `<cite>`.
- Use `&nbsp;` to keep short names together (`Northwater&nbsp;Pictures`, `About&nbsp;Us`).

## Layout

- Content column: `mx-auto max-w-6xl`, with `px-6` gutters set on `<main>`. Pages add vertical rhythm with `py-12` or `pt-12 pb-24`.
- The header is a fixed `h-16` bar with a spacer below it (not `sticky`, which jumps on iOS). It uses `bg-background/80 backdrop-blur` and a bottom border. Below `sm` the nav collapses into a Collapsible menu.
- The footer is a thin `--lake-deep` strip with the wordmark, © year, nav, and a faint `#savetinyhatman` easter-egg link.
- The home page centres its title and lays out the film grid in `sm:grid-cols-2 lg:grid-cols-3`, using 2:3 poster cards.
- Content pages (About) are left-aligned prose. Short single-purpose pages (Contact, 404) are centred vertically and horizontally.
- Very wide screens (`min-[1800px]`) put the gutters to use: quotes drift up both sides of the home page instead of the inline rotating quote.
- Z-index only ever comes from the `--z-*` tokens (`z-(--z-header)` etc.).

## Signature motifs

These are the elements that make the site Northwater. Reuse them; don't invent parallel ones.

- **Film grain.** A fixed full-screen noise overlay (`film-grain`, 6% opacity) sits over everything except the lightbox. Never remove it.
- **Photo prints.** Behind-the-scenes photos and team portraits look like physical prints: a thick `border-primary` (4–6px), square corners, `shadow-lg shadow-black/60`, and a slight rotation (alternating about ±2° for portraits, up to ±24° in the collage). These have **no** border radius.
- **Black-and-white to colour.** The About collage drifts in black and white at 15% opacity behind the page, under a `bg-background/50` scrim with `backdrop-blur-[3px]` on desktop. Below `lg` the scrim is a plain `bg-background/60` with no blur: a full-screen backdrop blur over the drifting collage crashes Chrome and other non-Safari browsers on iOS. To keep memory low, the collage only renders cards near the screen and loops a subset of roughly one to two screens of photos (3 columns minimum, so phones get smaller cards, with a 4px border below `sm`). Opening the gallery keeps the photos on screen in place and adds the rest after them; closing it makes the photos on and around the screen the new subset. Opening the gallery wipes colour in from top to bottom. Colour is the reward for engaging.
- **Poster cards.** Released films are 2:3 posters that tilt toward the mouse with a soft glare, then flip in 3D to show details and links. Rounded `rounded-xl`, since they are objects on screen rather than prints.
- **CRT screen.** Upcoming films are drawn as an old TV: a thick near-black bezel, inset shadow, crawling scanlines, a rolling bar, and a flickering title. Use it only for "not out yet".
- **Burned film.** On the 404 page, `film-burn-edges` glows at the corners: "This scene was cut".
- **Film pages are their own world.** A film page (e.g. `/tinyhatman`) drops the site chrome and takes its art direction from that film's poster. It gets its own scoped stylesheet with prefixed tokens and classes (`.thm`, `--thm-*`) and its own fonts, loaded on that page only. The poster carries over from the home page through a view transition (`posterTransitionName`). New film pages should follow the same pattern with a new prefix, not reuse `.thm`.

## Shape

- Default radius is `--radius` (0.625rem). Cards and panels use `rounded-xl`, small controls use `rounded-md`, and floating pill actions (the "Film page" button and the "Behind the Scenes" toggle) use `rounded-full`.
- Photo prints are always square-cornered. Film-page styles may be square throughout to suit their poster.
- Shadows are deep and black (`shadow-black/40`–`/60`), as if in a dark room, not soft grey.

## Interaction & motion

- Links are underlined with a muted decoration (`decoration-muted-foreground/60 underline-offset-4`) that warms to lantern on hover. External links go through `ExternalLink`.
- The active nav item gets a lantern underline. Inactive items are muted and brighten on hover.
- Motion should respond to the visitor (tilt, flip, gallery reveal, lightbox) or be slow and ambient (collage drift, floating quotes, CRT flicker). Don't add scroll-triggered fade-ups to every section. Page content uses at most a single `animate-fade-in`.
- Every animation is gated with `motion-safe:`/`motion-reduce:` or a `prefers-reduced-motion` check in JS. Ambient loops stop entirely when motion is reduced.
- Focus is always visible: `focus-visible:outline-2 focus-visible:outline-offset-2` (ring is print-white). Film pages set their own focus colour.
- Icons come from `lucide-react` at `size-4`–`size-5` and sit inline with their label. Brand icons (Letterboxd, Spotify, …) come from `simple-icons` through `BrandIcon`/`ProfileLinkIcon`.

## Voice

- Plain, warm, first-person plural ("we"). Specific about Maine, the theatres, and the crew.
- Film vernacular is welcome when it's light and clear ("This scene was cut", "Behind the Scenes"). Don't let it hide what something does.
- Buttons and links say what happens: "Film page", "Watch", "Trailer", "Back to About Us", "Go to the home page".
- Sentence case for body text and controls. Headings are uppercase only because of the heading face.
- Each page sets its own `<title>` as `Page | Northwater Pictures`.

## Avoid

- Lantern or film-burn as large fills, gradients used as decoration, or a second accent colour.
- Identical rounded cards with grey shadows for content that isn't a film.
- All-caps tracked eyebrow labels above headings, and numbered `01 / 02` markers.
- New font families on the main site. (Film pages may bring their own.)
- Light backgrounds on the main site.
