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
}

/** Curated sport-specific Unsplash plates (distinct per discipline). */
export const SPORT_VISUALS: SportVisual[] = [
  {
    slug: 'cricket',
    name: 'Cricket',
    tagline: 'Night pitch. Floodlit rivalry.',
    accent: '#e2b14a',
    secondary: '#0b1208',
    glow: 'rgba(226,177,74,0.45)',
    image:
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=75',
    imageAlt: 'Cricket bat and ball on the pitch',
    motif: 'pitch',
    detail: 'Night-match energy. Floodlights. Leather and willow.',
  },
  {
    slug: 'football',
    name: 'Football',
    tagline: 'The arena breathes with every pass.',
    accent: '#4ade80',
    secondary: '#04110a',
    glow: 'rgba(74,222,128,0.4)',
    image:
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1600&q=75',
    imageAlt: 'Football stadium packed with fans under lights',
    motif: 'pitch',
    detail: 'Cinematic pitch. Crowds. Sudden turns of fortune.',
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    tagline: 'Hardwood. Floodlights. Elevation.',
    accent: '#ff6a00',
    secondary: '#1a0a00',
    glow: 'rgba(255,106,0,0.45)',
    image:
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1600&q=75',
    imageAlt: 'Basketball going through the hoop',
    motif: 'court',
    detail: 'Indoor heat. Vertical drama. Instant momentum.',
  },
  {
    slug: 'badminton',
    name: 'Badminton',
    tagline: 'Shuttle. Speed. Precision.',
    accent: '#7dd3fc',
    secondary: '#02131f',
    glow: 'rgba(125,211,252,0.4)',
    image:
      'https://images.unsplash.com/photo-1599394022918-6c277653560a?auto=format&fit=crop&w=1600&q=75',
    imageAlt: 'Badminton shuttlecock in play',
    motif: 'shuttle',
    detail: 'Motion trails. Court geometry. Split-second reads.',
  },
  {
    slug: 'volleyball',
    name: 'Volleyball',
    tagline: 'Above the net. Into the lights.',
    accent: '#fb923c',
    secondary: '#140a02',
    glow: 'rgba(251,146,60,0.4)',
    image:
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1600&q=75',
    imageAlt: 'Volleyball spike over the net',
    motif: 'net',
    detail: 'Spike lines. Net tension. Airborne finish.',
  },
  {
    slug: 'throwball',
    name: 'Throwball',
    tagline: 'Court lines. Sudden force.',
    accent: '#f472b6',
    secondary: '#1a0612',
    glow: 'rgba(244,114,182,0.4)',
    image:
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1600&q=75',
    imageAlt: 'Athletes competing with a ball on court',
    motif: 'court',
    detail: 'Distinct from volleyball — force, timing, court control.',
  },
  {
    slug: 'table-tennis',
    name: 'Table Tennis',
    tagline: 'Milliseconds. Motion trails.',
    accent: '#f87171',
    secondary: '#140505',
    glow: 'rgba(248,113,113,0.4)',
    image:
      'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1600&q=75',
    imageAlt: 'Table tennis paddle and ball on table',
    motif: 'table',
    detail: 'Precision. Spin. Relentless pace.',
  },
  {
    slug: 'athletics-relays',
    name: 'Athletics Relays',
    tagline: 'Baton. Lanes. Inheritance of speed.',
    accent: '#facc15',
    secondary: '#121000',
    glow: 'rgba(250,204,21,0.4)',
    image:
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=75',
    imageAlt: 'Sprinters racing on athletics track',
    motif: 'track',
    detail: 'Exempt from the three-sport cap. Pure relay theatre.',
  },
  {
    slug: 'swimming-relays',
    name: 'Swimming Relays',
    tagline: 'Lanes of light beneath the surface.',
    accent: '#22d3ee',
    secondary: '#021018',
    glow: 'rgba(34,211,238,0.4)',
    image:
      'https://images.unsplash.com/photo-1519315901367-f34ff915448b?auto=format&fit=crop&w=1600&q=75',
    imageAlt: 'Swimmer underwater in a lit pool lane',
    motif: 'pool',
    detail: 'Exempt from the three-sport cap. Water, rhythm, handovers.',
  },
]

export function sportVisual(slug: string) {
  return SPORT_VISUALS.find((s) => s.slug === slug)
}
