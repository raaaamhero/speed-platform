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

/** Display order matches festival narrative: cricket → aquatics. */
export const SPORT_VISUALS: SportVisual[] = [
  {
    slug: 'cricket',
    name: 'Cricket',
    tagline: 'Night pitch. Floodlit rivalry.',
    accent: '#e2b14a',
    secondary: '#0b1208',
    glow: 'rgba(226,177,74,0.45)',
    image:
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Cricket stadium atmosphere',
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
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Football stadium under lights',
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
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Basketball arena under dramatic lights',
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
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Badminton court in motion',
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
      'https://images.unsplash.com/photo-1592656093896-567766c4c2b8?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Volleyball action in an arena',
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
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Athletes competing on indoor court',
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
      'https://images.unsplash.com/photo-1609710228159-0fa9bd6cfd61?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Table tennis paddle and ball',
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
      'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Athletics track under stadium lights',
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
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Swimming pool lanes with underwater light',
    motif: 'pool',
    detail: 'Exempt from the three-sport cap. Water, rhythm, handovers.',
  },
]

export function sportVisual(slug: string) {
  return SPORT_VISUALS.find((s) => s.slug === slug)
}
