/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./popup.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0D1117',
          secondary: '#161B22',
          tertiary: '#21262D',
        },
        border: {
          subtle: '#30363D',
          hover: '#8B949E',
        },
        accent: {
          DEFAULT: '#7C3AED',
          hover: '#6D28D9',
          light: '#A78BFA',
        },
        text: {
          primary: '#F0F6FC',
          secondary: '#8B949E',
          muted: '#6E7681',
        }
      }
    },
  },
  plugins: [],
}
