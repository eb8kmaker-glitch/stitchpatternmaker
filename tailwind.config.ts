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
        linen: {
          50:  '#F7F5F2',
          100: '#EEE7DF',
          200: '#E8DDD1',
          300: '#D8C9BA',
          400: '#C4B09C',
          500: '#A89282',
        },
        sage: {
          300: '#C8D0C1',
          400: '#A8B2A1',
          500: '#7E8A78',
          600: '#5E6A58',
        },
        warm: {
          400: '#9E9890',
          500: '#7A736D',
          600: '#4F4A45',
          700: '#36322E',
        },
      },
      fontFamily: {
        serif:  ['Playfair Display', 'Georgia', 'serif'],
        italic: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:   ['Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        'card':  '22px',
        'panel': '28px',
        'btn':   '14px',
        'chip':  '9px',
        'pill':  '50px',
      },
      boxShadow: {
        'linen':  '0 10px 30px rgba(0,0,0,0.04)',
        'linen-md': '0 16px 48px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.03)',
        'linen-lg': '0 24px 64px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)',
        'canvas': '0 12px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'linen-base': 'linear-gradient(180deg, #f8f6f3 0%, #f1ece6 100%)',
        'linen-card': 'linear-gradient(160deg, rgba(248,246,243,0.9), rgba(241,236,230,0.9))',
        'linen-sidebar': 'linear-gradient(180deg, rgba(238,231,223,0.35) 0%, rgba(232,221,209,0.25) 100%)',
        'linen-grid': `
          repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(168,178,161,0.05) 23px, rgba(168,178,161,0.05) 24px),
          repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(168,178,161,0.05) 23px, rgba(168,178,161,0.05) 24px),
          linear-gradient(160deg, #f8f6f3, #f0ebe4)
        `,
      },
      animation: {
        'fade-in':    'fadeIn 0.35s ease-out',
        'slide-up':   'slideUp 0.35s ease-out',
        'bloom':      'bloom 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        bloom:   { from: { transform: 'scale(0.97)', opacity: '0.8' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}

export default config
