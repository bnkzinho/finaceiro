/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#0b0b0d',
        surface: '#151316',
        surface2: '#0e0e10',
        ink: '#f2e8d5',
        muted: '#938768',
        line: '#2a2620',
        brand: {
          50: 'rgba(212,175,106,0.08)',
          500: '#d4af6a',
          600: '#cda263',
          700: '#b98f4a',
        },
        bad: { text: '#e98a7a', bg: 'rgba(233,138,122,0.08)', border: 'rgba(233,138,122,0.28)' },
        good: { text: '#8fd6a6', bg: 'rgba(143,214,166,0.08)', border: 'rgba(143,214,166,0.28)' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
