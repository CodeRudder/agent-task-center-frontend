/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        support: '#10B981',
        oppose: '#EF4444',
        abstain: '#6B7280',
      }
    },
  },
  plugins: [],
}
