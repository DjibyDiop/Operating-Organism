/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 18s linear infinite',
        'spin-reverse-slow': 'spin 12s linear infinite reverse',
      }
    },
  },
  plugins: [],
}
