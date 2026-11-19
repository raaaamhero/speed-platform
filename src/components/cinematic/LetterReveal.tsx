'use client'

import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'

type Props = {
  text: string
  className?: string
  style?: CSSProperties
  /** Extra travel for the first letter (e.g. S of SPORTSCOM) */
  firstFromFar?: boolean
  delay?: number
  stagger?: number
  as?: 'h1' | 'h2' | 'p' | 'span'
}

export function LetterReveal({
  text,
  className = '',
  style,
  firstFromFar = false,
  delay = 0,
  stagger = 0.045,
  as: Tag = 'p',
}: Props) {
  const chars = text.split('')

  return (
    <Tag className={`inline-flex flex-wrap justify-center ${className}`} style={style} aria-label={text}>
      {chars.map((ch, i) => {
        const isSpace = ch === ' '
        const far = firstFromFar && i === 0
        return (
          <motion.span
            key={`${ch}-${i}`}
            className={`inline-block ${isSpace ? 'w-[0.35em]' : ''}`}
            aria-hidden
            initial={{
              opacity: 0,
              y: far ? 0 : 36,
              x: far ? -180 : i % 2 === 0 ? -18 : 18,
              scale: far ? 3.2 : 0.6,
              filter: far ? 'blur(14px)' : 'blur(6px)',
              rotate: far ? -18 : i % 3 === 0 ? -8 : 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
              scale: 1,
              filter: 'blur(0px)',
              rotate: 0,
            }}
            transition={{
              delay: delay + i * stagger + (far ? 0 : 0.02),
              duration: far ? 1.15 : 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={
              isSpace
                ? undefined
                : {
                    y: -6,
                    scale: 1.12,
                    color: '#e2b14a',
                    transition: { type: 'spring', stiffness: 420, damping: 18 },
                  }
            }
            whileTap={
              isSpace
                ? undefined
                : {
                    scale: 0.92,
                    color: '#e2b14a',
                  }
            }
          >
            {isSpace ? '\u00A0' : ch}
          </motion.span>
        )
      })}
    </Tag>
  )
}
