/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        char: {
          950: '#0B0908',
          900: '#12100D',
          800: '#1A1713',
          700: '#252019',
          600: '#332C22',
          500: '#4A4034',
        },
        cream: {
          50: '#FBF7F0',
          100: '#F3EDE2',
          200: '#E2D8C7',
          400: '#A79B87',
          600: '#6F6555',
        },
        brass: {
          DEFAULT: '#C8A45C',
          light: '#DDBE7E',
          dark: '#A5843E',
        },
        clay: '#A8563C',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.34em',
      },
      maxWidth: { shell: '78rem' },
      transitionTimingFunction: { smooth: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      keyframes: {
        'ember-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: '0.35' },
          '50%': { transform: 'translate3d(0,-18px,0) scale(1.08)', opacity: '0.55' },
        },
        'rule-in': { '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } },
      },
      animation: {
        'ember-drift': 'ember-drift 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
