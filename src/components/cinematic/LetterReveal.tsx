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
    <Tag
      className={`flex flex-nowrap items-center justify-center overflow-visible ${className}`}
      style={style}
      aria-label={text}
    >
      {chars.map((ch, i) => {
        const isSpace = ch === ' '
        const far = firstFromFar && i === 0
        return (
          <motion.span
            key={`${ch}-${i}`}
            className={`inline-block will-change-transform ${isSpace ? 'w-[0.35em]' : ''}`}
            aria-hidden
            initial={{
              opacity: 0,
              y: far ? 0 : 28,
              x: far ? -120 : 0,
              scale: far ? 2.4 : 0.85,
              filter: far ? 'blur(12px)' : 'blur(4px)',
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
              scale: 1,
              filter: 'blur(0px)',
            }}
            transition={{
              delay: delay + i * stagger,
              duration: far ? 1.05 : 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {isSpace ? '\u00A0' : ch}
          </motion.span>
        )
      })}
    </Tag>
  )
}
