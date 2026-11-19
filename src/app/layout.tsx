import type { Metadata } from 'next'
import { Bebas_Neue, Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

const bebas = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: 'SPEED 2026–27 | SportsCom · TAPMI',
  description:
    'SportsCom presents SPEED 2026–27 — Where Rivalries Are Born. Register, follow standings, and track the tournament.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${bebas.variable} antialiased`}>{children}</body>
    </html>
  )
}
