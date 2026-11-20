'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

/** First four are committee heads (order only — same visual style). Rest A–Z. */
const SENIOR_SPORTSCOM = [
  'Arun',
  'Ram',
  'Hitesh',
  'Ritika',
  'Anubhav',
  'Anusha',
  'Archit',
  'Atul',
  'Chaitanya',
  'Daniel',
  'Gautham',
  'Harshit',
  'Leo',
  'Pranshu',
  'Samyak',
  'Shruti Awasthi',
  'Subham',
  'Unni',
  'Vasuu',
  'Yausnika',
] as const

const JUNIOR_SPORTSCOM = [
  'Aaditya Vijaykrishnan',
  'Aathish Kumar A',
  'Abel',
  'Anisha',
  'Atrayee Chakraborty',
  'B Shyam Sundar',
  'Hrid Bhowmik',
  'Jinesh Doshi',
  'K G Janahni',
  'Kankshi Shah',
  'Kushal Mishra',
  'Mahek Jhunjhunwala',
  'Mahi Palit',
  'Neha Sri Kamepalli',
  'Piyush Keshav Jha',
  'Prabodh Singh',
  'Pushkar Khurana',
  'Rohit Manoj',
  'Sagar Ramchandani',
  'Sanika Gaidhani',
  'Sanya Gupta',
  'Saptarshi Bhattacharjee',
  'Saumya Singh',
  'Sidhant Karki',
] as const

function NameGrid({ names }: { names: readonly string[] }) {
  return (
    <ul className="mt-6 grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2">
      {names.map((name) => (
        <li
          key={name}
          className="border-b border-white/10 pb-3 text-[15px] font-medium leading-snug tracking-wide text-white/85 sm:text-base"
          style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
        >
          {name}
        </li>
      ))}
    </ul>
  )
}

export function ManifestoSection() {
  const reduced = useReducedMotion()

  return (
    <section id="about" className="relative scroll-mt-20 border-t border-white/10 bg-[#050608] py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(226,177,74,0.1),transparent_45%)]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl space-y-5 text-base leading-relaxed text-[var(--speed-muted)] sm:text-lg">
          <p>
            SPEED is TAPMI&apos;s flagship sporting festival, organised by the Sports Committee. What
            began as a sectional rivalry has evolved into a bigger competition, bringing together
            students from different sections to form teams and compete for the ultimate title.
          </p>
          <p>
            Featuring nine sports — Cricket, Football, Volleyball, Basketball, Table Tennis,
            Throwball, Badminton, Athletics and Swimming — SPEED brings together over 800 students
            for a celebration of sport, teamwork and competition.
          </p>
          <p>
            Built by SportsCom, for TAPMI, SPEED is more than just a tournament. For many students,
            this could be one of their last opportunities to experience campus sports, compete
            alongside their friends and create memories on the field. We want to make this edition
            truly memorable and give every participant an experience to cherish long after their
            time at TAPMI.
          </p>
          <p>
            Come be a part of this grand celebration of teamwork, hard work, skill and the spirit of
            competition.
          </p>
        </div>

        <Link href="/register" className="speed-cta speed-cta-sweep mt-10 inline-flex">
          REGISTER FOR SPEED
        </Link>

        {/* The Team behind SPEED */}
        <div className="mt-20 border-t border-white/10 pt-16">
          <p className="speed-kicker">SPORTSCOM</p>
          <h3 className="mt-3 font-display text-3xl tracking-[0.06em] text-white sm:text-5xl">
            The Team behind SPEED
          </h3>
          <p className="mt-3 max-w-xl text-[var(--speed-muted)]">
            Senior SportsCom and Junior SportsCom — the committee that builds SPEED.
          </p>

          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <p className="font-display text-base tracking-[0.22em] text-[var(--speed-gold)]">
                SENIOR SPORTSCOM
              </p>
              <NameGrid names={SENIOR_SPORTSCOM} />
            </motion.div>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              <p className="font-display text-base tracking-[0.22em] text-[var(--speed-gold)]">
                JUNIOR SPORTSCOM
              </p>
              <NameGrid names={JUNIOR_SPORTSCOM} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
