/** @type {import('tailwindcss').Config} */ 
// trigger build
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#cf3333',
          700: '#b12a2a', // JeyFoods Vermelho Principal
          800: '#991b1b',
          900: '#7f1d1d',
        }
      }
    },
  },
  plugins: [],
}
