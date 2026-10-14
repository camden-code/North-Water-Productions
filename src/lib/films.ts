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
  trailerUrl?: string
}

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
    posterUrl:
      "https://a.ltrbxd.com/resized/film-poster/1/4/2/0/9/7/0/1420970-death-of-a-tiny-hat-man-0-600-0-900-crop.jpg?v=154c28cf94",
    description:
      "After the death of a once-great film director. Two fanatics seek to restore his last unreleased film and get revenge on the man who canceled it. Meanwhile, two detectives are on the case.",
    quote: { text: "…a well-paced action film with a clear artistic thesis that positions Gamache as a local filmmaker to watch.", author: "The Maine Playweek" },
    letterboxdUrl: "https://letterboxd.com/film/death-of-a-tiny-hat-man/",
    trailerUrl: "https://www.youtube.com/watch?v=cmzYujAWQmM",
  },
  {
    slug: "feel-good-hotline",
    title: "Feel Good Hotline",
    release: { kind: "date", date: "2025-03-13" },
    posterUrl:
      "https://a.ltrbxd.com/resized/film-poster/1/3/2/5/4/0/7/1325407-feel-good-hotline-1-0-600-0-900-crop.jpg?v=e2209c2cda",
    description:
      "In this dark thriller, three individuals, each with their own painful past, are drawn together by a series of mysterious events that lead them to a common target: the man who wronged them.",
    quote: { text: "Truly a film without ‘filler’.", author: "comrade_yui" },
    letterboxdUrl: "https://letterboxd.com/film/feel-good-hotline/",
  },
  {
    slug: "daemon",
    title: "DAEMON",
    release: { kind: "year", year: 2024 },
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/1/1/1/8/4/6/9/1118469-daemon-0-600-0-900-crop.jpg?v=97ff374d5c",
    description:
      "An internet “faith healer” is hired to do an exorcism on a teenage boy, leading him to question his faith and reality itself.",
    letterboxdUrl: "https://letterboxd.com/film/daemon-1/",
  },
  {
    slug: "i-feel-better-now",
    title: "I Feel Better Now",
    release: { kind: "year", year: 2020 },
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/6/5/1/6/7/9/651679-i-feel-better-now-0-600-0-900-crop.jpg?v=ee769ce02a",
    description: "A paranoid young man deals with a secret hiding in his closet.",
    letterboxdUrl: "https://letterboxd.com/film/i-feel-better-now/",
  },
  {
    slug: "last-slice",
    title: "Last Slice",
    release: { kind: "date", date: "2020-04-13" },
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/6/1/8/0/9/9/618099-last-slice-0-600-0-900-crop.jpg?v=0c34fdf490",
    description: "Low budget, Horror, Comedy short film.",
    letterboxdUrl: "https://letterboxd.com/film/last-slice/",
  },
]

export function formatRelease(release: FilmRelease): string {
  if (release.kind === "upcoming") return "Coming soon"
  if (release.kind === "year") return String(release.year)
  // Parse as UTC so the date doesn't shift with the viewer's timezone.
  return new Date(`${release.date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}
