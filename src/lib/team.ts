export type ProfileLink = {
  label: "Letterboxd" | "Spotify"
  href: string
}

export type TeamMember = {
  name: string
  role: string
  photoUrl?: string
  bio: string
  links: ProfileLink[]
}

export const team: TeamMember[] = [
  {
    name: "Xavier Gamache",
    role: "Director",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    links: [{ label: "Letterboxd", href: "https://letterboxd.com/director/xavier-gamache-1/" }],
  },
  {
    name: "Camden McKenzie",
    role: "Assistant Director",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    links: [{ label: "Letterboxd", href: "https://letterboxd.com/actor/camden-mckenzie/" }],
  },
  {
    name: "Audrey-Anna Gamache",
    role: "Director of Photography",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    links: [{ label: "Letterboxd", href: "https://letterboxd.com/actor/audrey-anna-gamache-1/" }],
  },
]
