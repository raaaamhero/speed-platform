/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        display: ['var(--font-bebas)', 'Impact', 'sans-serif'],
      },
      colors: {
        speed: {
          bg: '#07080b',
          ink: '#f4f1ea',
          muted: '#9a958c',
          gold: '#e2b14a',
          crimson: '#c81e2c',
        },
      },
    },
  },
  plugins: [],
}
