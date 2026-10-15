export type TinyHatManLink = {
  label: "Letterboxd" | "Spotify" | "Soundtrack" | "Trailer" | "Fandango"
  href: string
}

export type CastCredit = {
  name: string
  character: string
  tmdbUrl: string
}

export type CrewCredit = {
  name: string
  jobs: string
  tmdbUrl: string
}

export type CrewDepartment = {
  department: string
  members: CrewCredit[]
}

const tmdbPerson = (id: string): string => `https://www.themoviedb.org/person/${id}`

export const tinyHatManLinks: TinyHatManLink[] = [
  { label: "Letterboxd", href: "https://letterboxd.com/film/death-of-a-tiny-hat-man/" },
  { label: "Spotify", href: "https://open.spotify.com/artist/2o4SFA6FqA9P6a5pmMKkC3" },
  {
    label: "Soundtrack",
    href: "https://www.youtube.com/watch?v=Wr-0mH197Pw&list=OLAK5uy_nuxNkBy5nYZ6eNdQyEvwBDDyAJVikMC9I",
  },
  { label: "Trailer", href: "https://www.youtube.com/watch?v=cmzYujAWQmM" },
  { label: "Fandango", href: "https://www.fandango.com/death-of-a-tiny-hat-man-2025-242856/movie-overview" },
]

export const tinyHatManCast: CastCredit[] = [
  { name: "Audrey-Anna Gamache", character: "Professor Maniacal", tmdbUrl: tmdbPerson("5305034-audrey-anna-gamache") },
  { name: "Camden McKenzie", character: "Tiny Hat Man", tmdbUrl: tmdbPerson("5305079-camden-mckenzie") },
  { name: "Bella Gamache", character: "Penelope Peterson", tmdbUrl: tmdbPerson("5305021-bella-gamache") },
  { name: "Eli Gamache", character: "Chudwick", tmdbUrl: tmdbPerson("5305030-eli-gamache") },
  { name: "Xavier Gamache", character: "Paz Peterson", tmdbUrl: tmdbPerson("5305032-xavier-gamache") },
  { name: "Hunter Doyle", character: "Detective #1", tmdbUrl: tmdbPerson("5305038-hunter-doyle") },
  { name: "Joseph Dube", character: "Detective #2", tmdbUrl: tmdbPerson("5305040-joseph-dube") },
  { name: "Barry Norman", character: "Barry Finch", tmdbUrl: tmdbPerson("1567448-barry-norman") },
  { name: "Ryan Greene", character: "Benny the Jet", tmdbUrl: tmdbPerson("5305024-ryan-greene") },
  { name: "Lydia Luparia", character: "Blue Girl", tmdbUrl: tmdbPerson("5689816-lydia-luparia") },
  { name: "Jasmine Smith-Hurley", character: "Angie", tmdbUrl: tmdbPerson("5689817-jasmine-smith-hurley") },
  { name: "Don Husman", character: "Sheriff Weiler", tmdbUrl: tmdbPerson("5689818-don-husman") },
  { name: "Jaime Pineda", character: "Police Officer", tmdbUrl: tmdbPerson("5689820-jaime-pineda") },
  { name: "Shari Gamache", character: "Sharon", tmdbUrl: tmdbPerson("5305042-shari-gamache") },
  { name: "Yui Antinomy", character: "Jerry Sullivan", tmdbUrl: tmdbPerson("4087015-yui-antinomy") },
  { name: "Kelly Weaver", character: "Case Worker", tmdbUrl: tmdbPerson("5689823-kelly-weaver") },
  { name: "William Macanack", character: "CEO", tmdbUrl: tmdbPerson("5305047-william-macanack") },
  { name: "Danielle Gamache", character: "Missing Girl", tmdbUrl: tmdbPerson("5305055-danielle-gamache") },
  { name: "Talitha McKenzie", character: "Lady of the Lake", tmdbUrl: tmdbPerson("5689826-talitha-mckenzie") },
  { name: "Leopold Karigamombe", character: "Hotel Detective", tmdbUrl: tmdbPerson("5689827-leopold-karigamombe") },
  { name: "Isabella Espenilla", character: "Hotel Girl", tmdbUrl: tmdbPerson("5689828-isabella-espenilla") },
  { name: "Jeremy Doane", character: "Musician", tmdbUrl: tmdbPerson("5689829-jeremy-doane") },
  { name: "Zoe Mckenzie", character: "French Girl", tmdbUrl: tmdbPerson("5305041-zoe-mckenzie") },
  { name: "Trey Warren", character: "News Reporter", tmdbUrl: tmdbPerson("5083643-trey-warren") },
  { name: "Keith Guild", character: "Boston Radio Host", tmdbUrl: tmdbPerson("5689830-keith-guild") },
  { name: "Jason Gamache", character: "Angry Guy", tmdbUrl: tmdbPerson("5305048-jason-gamache") },
]

export const tinyHatManCrew: CrewDepartment[] = [
  {
    department: "Directing",
    members: [
      { name: "Xavier Gamache", jobs: "Director", tmdbUrl: tmdbPerson("5305032-xavier-gamache") },
      { name: "Audrey-Anna Gamache", jobs: "Assistant Director", tmdbUrl: tmdbPerson("5305034-audrey-anna-gamache") },
    ],
  },
  {
    department: "Writing",
    members: [
      { name: "Xavier Gamache", jobs: "Writer", tmdbUrl: tmdbPerson("5305032-xavier-gamache") },
      { name: "Camden McKenzie", jobs: "Musical", tmdbUrl: tmdbPerson("5305079-camden-mckenzie") },
      { name: "Yui Antinomy", jobs: "Additional Writing", tmdbUrl: tmdbPerson("4087015-yui-antinomy") },
    ],
  },
  {
    department: "Production",
    members: [{ name: "Xavier Gamache", jobs: "Producer", tmdbUrl: tmdbPerson("5305032-xavier-gamache") }],
  },
  {
    department: "Camera",
    members: [
      {
        name: "Xavier Gamache",
        jobs: "Director of Photography, Camera Operator",
        tmdbUrl: tmdbPerson("5305032-xavier-gamache"),
      },
      { name: "Camden McKenzie", jobs: "Camera Operator", tmdbUrl: tmdbPerson("5305079-camden-mckenzie") },
    ],
  },
  {
    department: "Editing",
    members: [{ name: "Xavier Gamache", jobs: "Editor", tmdbUrl: tmdbPerson("5305032-xavier-gamache") }],
  },
  {
    department: "Sound",
    members: [
      {
        name: "Camden McKenzie",
        jobs: "Music, Music Director, Music Score Producer, Music Supervisor",
        tmdbUrl: tmdbPerson("5305079-camden-mckenzie"),
      },
      { name: "Talitha McKenzie", jobs: "Music Arranger", tmdbUrl: tmdbPerson("5689826-talitha-mckenzie") },
      { name: "Ian Maxwell", jobs: "Music", tmdbUrl: tmdbPerson("5689834-ian-maxwell") },
      { name: "Sergey Koryak", jobs: "Music", tmdbUrl: tmdbPerson("5689836-sergey-koryak") },
    ],
  },
]
