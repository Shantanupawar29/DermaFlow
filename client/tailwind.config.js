/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rose:  { DEFAULT: '#7B2D3C', light: '#F5E8EA', border: '#C47E8A' },
        teal:  { DEFAULT: '#0F6E56', light: '#E1F5EE' },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
