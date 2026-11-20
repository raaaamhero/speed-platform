import type { SportSlug } from '@/lib/rules/sports'

export type SportVisual = {
  slug: SportSlug
  name: string
  tagline: string
  accent: string
  secondary: string
  glow: string
  image: string
  imageAlt: string
  motif: 'court' | 'pitch' | 'track' | 'pool' | 'indoor' | 'net' | 'shuttle' | 'table'
  detail: string
  venue: string
}

/** Local sport plates + exact SPEED 2026–27 venue copy. */
export const SPORT_VISUALS: SportVisual[] = [
  {
    slug: 'cricket',
    name: 'Cricket',
    tagline: '15-over leather-ball tournament.',
    accent: '#e2b14a',
    secondary: '#0b1208',
    glow: 'rgba(226,177,74,0.45)',
    image: '/sports/cricket.jpg',
    imageAlt: 'Floodlit cricket stadium packed for a night match',
    motif: 'pitch',
    venue: 'Endpoint',
    detail:
      'Cricket takes centre stage at Endpoint with a 15-over leather-ball tournament. With proper cricketing equipment and teams ready to compete, expect some exciting matches and plenty of action on the field.',
  },
  {
    slug: 'football',
    name: 'Football',
    tagline: 'Floodlights, skills, and teamwork.',
    accent: '#4ade80',
    secondary: '#04110a',
    glow: 'rgba(74,222,128,0.4)',
    image: '/sports/football.jpg',
    imageAlt: 'Football on the pitch inside a full stadium',
    motif: 'pitch',
    venue: 'MIT Sports Park & Endpoint',
    detail:
      'Football action heads to MIT Sports Park and Endpoint. With matches under the floodlights, teams will take to the field for some competitive football, showcasing their skills, teamwork and love for the game.',
  },
  {
    slug: 'volleyball',
    name: 'Volleyball',
    tagline: 'Serves, spikes, and rallies.',
    accent: '#fb923c',
    secondary: '#140a02',
    glow: 'rgba(251,146,60,0.4)',
    image: '/sports/volleyball.jpg',
    imageAlt: 'Players silhouetted at the net as the court lights up',
    motif: 'net',
    venue: 'TAPMI Ground',
    detail:
      'The TAPMI Ground gets ready for some volleyball action. As the court lights up, teams will battle it out through powerful serves, well-timed spikes and exciting rallies.',
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    tagline: 'Newly painted. Ready for action.',
    accent: '#ff6a00',
    secondary: '#1a0a00',
    glow: 'rgba(255,106,0,0.45)',
    image: '/sports/basketball.jpg',
    imageAlt: 'Basketball dropping through the hoop in an arena',
    motif: 'court',
    venue: 'TAPMI Basketball Court',
    detail:
      'The newly painted basketball court is ready for action. Expect competitive games, quick plays and some great basketball as teams take to the court to fight for the title.',
  },
  {
    slug: 'table-tennis',
    name: 'Table Tennis',
    tagline: 'Quick rallies. Sharp reflexes.',
    accent: '#f87171',
    secondary: '#140505',
    glow: 'rgba(248,113,113,0.4)',
    image: '/sports/table-tennis.jpg',
    imageAlt: 'Table tennis paddle and ball on a blue table',
    motif: 'table',
    venue: 'Student Centre',
    detail:
      'The Student Centre turns into the hub of table tennis action. With quick rallies, sharp reflexes and some close contests, teams will compete for the table tennis championship.',
  },
  {
    slug: 'throwball',
    name: 'Throwball',
    tagline: 'Girls take the court.',
    accent: '#f472b6',
    secondary: '#1a0612',
    glow: 'rgba(244,114,182,0.4)',
    image: '/sports/throwball.jpg',
    imageAlt: 'Girls playing throwball on the court',
    motif: 'court',
    venue: 'TAPMI Ground',
    detail:
      "It's time for the girls to take the court! Throwball will bring together teamwork, coordination and competitive spirit as the teams battle it out for the title.",
  },
  {
    slug: 'badminton',
    name: 'Badminton',
    tagline: 'Indoor courts. Marena.',
    accent: '#7dd3fc',
    secondary: '#02131f',
    glow: 'rgba(125,211,252,0.4)',
    image: '/sports/badminton.jpg',
    imageAlt: 'Indoor badminton rackets and shuttlecocks on a green court',
    motif: 'shuttle',
    venue: 'Marena',
    detail:
      "We're heading to Marena for badminton! With its indoor courts and excellent sporting facilities, it's the perfect setting for some exciting matches. SportsCom has the arrangements covered.",
  },
  {
    slug: 'athletics-relays',
    name: 'Athletics Relays',
    tagline: 'Speed, coordination, teamwork.',
    accent: '#facc15',
    secondary: '#121000',
    glow: 'rgba(250,204,21,0.4)',
    image: '/sports/athletics.jpg',
    imageAlt: 'Sprinters racing on an international athletics track',
    motif: 'track',
    venue: 'MIT Sports Park',
    detail:
      'The action moves to the tracks at MIT Sports Park, where participants will compete in the athletics relays. It’s all about speed, coordination and teamwork as teams race towards the finish line.',
  },
  {
    slug: 'swimming-relays',
    name: 'Swimming Relays',
    tagline: 'Speed, stamina, teamwork.',
    accent: '#22d3ee',
    secondary: '#021018',
    glow: 'rgba(34,211,238,0.4)',
    image: '/sports/swimming.jpg',
    imageAlt: 'Competitive swimmer powering through a lit pool lane',
    motif: 'pool',
    venue: 'Marena',
    detail:
      'Marena is back as the venue for swimming events. Participants will take to the pool to compete in the swimming relays, putting their speed, stamina and teamwork to the test.',
  },
]

export function sportVisual(slug: string) {
  return SPORT_VISUALS.find((s) => s.slug === slug)
}
