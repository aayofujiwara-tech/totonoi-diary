import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          sauna: '#D4853A',
          light: '#E8A05A',
          dark: '#B36A20',
        },
        dark: {
          bg: '#111111',
          card: '#1E1E1E',
          border: '#2E2E2E',
          surface: '#252525',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto)', 'Noto Sans JP', 'sans-serif'],
      },
      maxWidth: {
        app: '430px',
      },
    },
  },
  plugins: [],
}

export default config
