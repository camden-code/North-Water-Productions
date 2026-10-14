export type ProfileLink = {
  label: "Letterboxd" | "Spotify" | "Instagram" | "Substack" | "Threads" | "LinkedIn"
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
    role: "Director, Writer & Producer",
    photoUrl: `${import.meta.env.BASE_URL}team/xavier.webp`,
    bio: "Xavier is a writer, director, and producer from South Paris, Maine, and filmmaking has been his passion for as long as he can remember. A devoted student of cinema with more than 1,500 films logged, he draws on classics like Robert Siodmak's The Killers, Anthony Mann's The Naked Spur, and John Ford's How Green Was My Valley, and reviewers have found echoes of David Lynch and Paul Thomas Anderson in his work. His films blend crime, comedy, and real feeling, and The Maine Playweek has named him a local filmmaker to watch. Xavier writes quickly, shoots lean, and is always onto the next idea.",
    links: [
      { label: "Letterboxd", href: "https://letterboxd.com/director/xavier-gamache-1/" },
      { label: "Instagram", href: "https://www.instagram.com/xandernander/" },
      { label: "Threads", href: "https://www.threads.com/@xandernander" },
    ],
  },
  {
    name: "Camden McKenzie",
    role: "Assistant Director & Composer",
    photoUrl: `${import.meta.env.BASE_URL}team/camden.webp`,
    bio: "Camden is our assistant director and the one who keeps each shoot organized and on schedule. He holds a B.S. in Computer Science from the University of Southern Maine and works as a software engineer, and he brings the same problem-solving to every production. He has played music all his life and composed original music for Feel Good Hotline and Death of a Tiny Hat Man. He also works in front of the camera: he played the title role in Death of a Tiny Hat Man. Camden lives in central Maine.",
    links: [
      { label: "Letterboxd", href: "https://letterboxd.com/actor/camden-mckenzie/" },
      { label: "Spotify", href: "https://open.spotify.com/artist/2o4SFA6FqA9P6a5pmMKkC3" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/camden-mckenzie" },
    ],
  },
  {
    name: "Audrey-Anna Gamache",
    role: "Director of Photography",
    photoUrl: `${import.meta.env.BASE_URL}team/audrey.webp`,
    bio: "Audrey is Xavier's sister and, in many ways, his co-director. Audrey works closely with Xavier from the first inception of an idea, through the creation of the script, proof reading, and ensures consistency while filming. Xavier moves fast and always has a new idea, and Audrey keeps the work grounded, focused, and true to what the film needs. That balance is at the heart of how North Water Pictures works. She lives in central Maine.",
    links: [
      { label: "Letterboxd", href: "https://letterboxd.com/actor/audrey-anna-gamache-1/" },
      { label: "Instagram", href: "https://www.instagram.com/scoutylynch/" },
      { label: "Substack", href: "https://scoutylynchwrites.substack.com/" },
    ],
  },
]
