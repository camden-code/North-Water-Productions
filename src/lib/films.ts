export type FilmRelease = { kind: "date"; date: string } | { kind: "year"; year: number } | { kind: "upcoming" }

export type FilmQuote = {
  text: string
  author: string
}

export type Film = {
  slug: string
  title: string
  release: FilmRelease
  posterUrl?: string
  description: string
  quote?: FilmQuote
  letterboxdUrl?: string
  watchUrl?: string
  trailerUrl?: string
  soundtrackUrl?: string
  pagePath?: string
}

const poster = (slug: string): string => `${import.meta.env.BASE_URL}films/${slug}.webp`

export const films: Film[] = [
  {
    slug: "alien-mind-beam",
    title: "Alien Mind Beam",
    release: { kind: "upcoming" },
    description: "Coming soon.",
  },
  {
    slug: "death-of-a-tiny-hat-man",
    title: "Death of a Tiny Hat Man",
    release: { kind: "date", date: "2025-11-22" },
    pagePath: "/tinyhatman",
    posterUrl: poster("death-of-a-tiny-hat-man"),
    description:
      "After the death of a once-great film director. Two fanatics seek to restore his last unreleased film and get revenge on the man who canceled it. Meanwhile, two detectives are on the case.",
    quote: { text: "…a well-paced action film with a clear artistic thesis that positions Gamache as a local filmmaker to watch.", author: "The Maine Playweek" },
    letterboxdUrl: "https://letterboxd.com/film/death-of-a-tiny-hat-man/",
    trailerUrl: "https://www.youtube.com/watch?v=cmzYujAWQmM",
    soundtrackUrl: "https://www.youtube.com/watch?v=Wr-0mH197Pw&list=OLAK5uy_nuxNkBy5nYZ6eNdQyEvwBDDyAJVikMC9I",
  },
  {
    slug: "feel-good-hotline",
    title: "Feel Good Hotline",
    release: { kind: "date", date: "2025-03-13" },
    posterUrl: poster("feel-good-hotline"),
    description:
      "In this dark thriller, three individuals, each with their own painful past, are drawn together by a series of mysterious events that lead them to a common target: the man who wronged them.",
    quote: { text: "Truly a film without ‘filler’.", author: "comrade_yui" },
    letterboxdUrl: "https://letterboxd.com/film/feel-good-hotline/",
    watchUrl: "https://fawesome.tv/movies/10666523/feel-good-hotline",
  },
  {
    slug: "daemon",
    title: "DAEMON",
    release: { kind: "year", year: 2024 },
    posterUrl: poster("daemon"),
    description:
      "An internet “faith healer” is hired to do an exorcism on a teenage boy, leading him to question his faith and reality itself.",
    letterboxdUrl: "https://letterboxd.com/film/daemon-1/",
  },
  {
    slug: "pumpkin-boys-daydream",
    title: "Pumpkin Boy's Daydream",
    release: { kind: "date", date: "2026-09-26" },
    posterUrl: poster("pumpkin-boys-daydream"),
    description: "",
    watchUrl: "https://www.youtube.com/watch?v=IcG0LNFjZM0",
  },
  {
    slug: "i-feel-better-now",
    title: "I Feel Better Now",
    release: { kind: "year", year: 2020 },
    posterUrl: poster("i-feel-better-now"),
    description: "A paranoid young man deals with a secret hiding in his closet.",
    letterboxdUrl: "https://letterboxd.com/film/i-feel-better-now/",
    watchUrl: "https://youtu.be/BEiP9alSraU",
  },
  {
    slug: "last-slice",
    title: "Last Slice",
    release: { kind: "date", date: "2020-04-13" },
    posterUrl: poster("last-slice"),
    description: "Low budget, Horror, Comedy short film.",
    letterboxdUrl: "https://letterboxd.com/film/last-slice/",
    watchUrl: "https://www.youtube.com/watch?v=jrs-mywqxro",
  },
]

export function posterTransitionName(slug: string): string {
  return `poster-${slug}`
}

export function formatRelease(release: FilmRelease): string {
  if (release.kind === "upcoming") return "Releasing 2026"
  if (release.kind === "year") return String(release.year)
  // Parse as UTC so the date doesn't shift with the viewer's timezone.
  return new Date(`${release.date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}
