/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f7f8fa',
        surface: '#ffffff',
        ink: '#101828',
        muted: '#667085',
        line: '#e4e7ec',
        brand: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        bad: { text: '#b42318', bg: '#fef3f2', border: '#fecdca' },
        good: { text: '#067647', bg: '#ecfdf3', border: '#abefc6' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
