/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        'shark': {
          '50': '#e0e4e7',
          '100': '#c0c9cf',
          '200': '#99a5af',
          '300': '#73828e',
          '400': '#596773',
          '500': '#46515b',
          '600': '#3a434b',
          '700': '#2c3035',
          '800': '#23282e',
          '900': '#1d2126',
          '950': '#131618',
        },      
      }
    },
  },
  plugins: [],
}

