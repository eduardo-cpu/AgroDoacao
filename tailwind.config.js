/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#2e7d32',
        'secondary-green': '#66bb6a',
        'background-light': '#f1f8e9',
        'danger': '#c62828',
        'warning': '#ffc107',
      },
      boxShadow: {
        'card': '0 5px 15px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 20px rgba(0, 0, 0, 0.1)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    },
  },
  plugins: [],
}