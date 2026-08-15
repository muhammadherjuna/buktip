/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
          },
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            500: '#f97316',
            600: '#ea580c',
          },
          verified: '#10B981',
        },
      },
    },
  },
  plugins: [],
}
