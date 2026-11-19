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

/** Local sport plates + SPEED 2026–27 venue copy. */
export const SPORT_VISUALS: SportVisual[] = [
  {
    slug: 'cricket',
    name: 'Cricket',
    tagline: 'Endpoint. Leather. Fifteen overs.',
    accent: '#e2b14a',
    secondary: '#0b1208',
    glow: 'rgba(226,177,74,0.45)',
    image: '/sports/cricket.jpg',
    imageAlt: 'Floodlit cricket stadium packed for a night match',
    motif: 'pitch',
    venue: 'Endpoint',
    detail:
      'Fierce competition at Endpoint — leather ball, proper equipment, full rules. A 15-over tournament where every over counts.',
  },
  {
    slug: 'football',
    name: 'Football',
    tagline: 'Floodlights. International standard.',
    accent: '#4ade80',
    secondary: '#04110a',
    glow: 'rgba(74,222,128,0.4)',
    image: '/sports/football.jpg',
    imageAlt: 'Football on the pitch inside a full stadium',
    motif: 'pitch',
    venue: 'MIT Sports Park · Endpoint',
    detail:
      'Under the floodlights at MIT Sports Park to international standards — and also at Endpoint. The arena breathes with every pass.',
  },
  {
    slug: 'volleyball',
    name: 'Volleyball',
    tagline: 'TAPMI ground lights up.',
    accent: '#fb923c',
    secondary: '#140a02',
    glow: 'rgba(251,146,60,0.4)',
    image: '/sports/volleyball.jpg',
    imageAlt: 'Players silhouetted at the net as the court lights up',
    motif: 'net',
    venue: 'TAPMI Ground',
    detail:
      'TAPMI ground comes alive as the volleyball court lights up — spike lines, net tension, and airborne finishes.',
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    tagline: 'Newly painted. Contest of the year.',
    accent: '#ff6a00',
    secondary: '#1a0a00',
    glow: 'rgba(255,106,0,0.45)',
    image: '/sports/basketball.jpg',
    imageAlt: 'Basketball dropping through the hoop in an arena',
    motif: 'court',
    venue: 'Basketball court',
    detail:
      'On the newly painted court, basketball feels like the contest of the year — hardwood heat, elevation, instant momentum.',
  },
  {
    slug: 'table-tennis',
    name: 'Table Tennis',
    tagline: 'Student Centre. Stadium energy.',
    accent: '#f87171',
    secondary: '#140505',
    glow: 'rgba(248,113,113,0.4)',
    image: '/sports/table-tennis.jpg',
    imageAlt: 'Table tennis paddle and ball on a blue table',
    motif: 'table',
    venue: 'Student Centre',
    detail:
      'The Student Centre becomes a stadium as teams fight for the table tennis champion title — spin, pace, and milliseconds.',
  },
  {
    slug: 'throwball',
    name: 'Throwball',
    tagline: 'Girls take the field.',
    accent: '#f472b6',
    secondary: '#1a0612',
    glow: 'rgba(244,114,182,0.4)',
    image: '/sports/throwball.jpg',
    imageAlt: 'Athlete ready on the court for throwball',
    motif: 'court',
    venue: 'Court',
    detail:
      'Girls are ready to take the field and show how it’s done — force, timing, and full court control.',
  },
  {
    slug: 'badminton',
    name: 'Badminton',
    tagline: 'Marena. World-class indoors.',
    accent: '#7dd3fc',
    secondary: '#02131f',
    glow: 'rgba(125,211,252,0.4)',
    image: '/sports/badminton.jpg',
    imageAlt: 'Indoor badminton rackets and shuttlecocks on a green court',
    motif: 'shuttle',
    venue: 'Marena',
    detail:
      'Now to Marena — world-class indoor badminton courts and amenities. SportsCom has you covered.',
  },
  {
    slug: 'athletics-relays',
    name: 'Athletics Relays',
    tagline: 'International tracks. Pure speed.',
    accent: '#facc15',
    secondary: '#121000',
    glow: 'rgba(250,204,21,0.4)',
    image: '/sports/athletics.jpg',
    imageAlt: 'Sprinters racing on an international athletics track',
    motif: 'track',
    venue: 'MIT Sports Park',
    detail:
      'Run on international-standard tracks at MIT Sports Park. Exempt from the three-sport cap — baton, lanes, inheritance of speed.',
  },
  {
    slug: 'swimming-relays',
    name: 'Swimming Relays',
    tagline: 'Marena opens the lanes.',
    accent: '#22d3ee',
    secondary: '#021018',
    glow: 'rgba(34,211,238,0.4)',
    image: '/sports/swimming.jpg',
    imageAlt: 'Competitive swimmer powering through a lit pool lane',
    motif: 'pool',
    venue: 'Marena',
    detail:
      'Marena enters again — your chance to race in the pool. Exempt from the three-sport cap. Water, rhythm, handovers.',
  },
]

export function sportVisual(slug: string) {
  return SPORT_VISUALS.find((s) => s.slug === slug)
}
