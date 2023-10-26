/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        twinch: {
          50:'#f4f6f9',
          100:'#eceef3',
          200:'#dce0e9',
          300:'#c6ccdb',
          400:'#adb5cc',
          500:'#989fbc',
          600:'#8185aa',
          700:'#767999',
          800:'#5b5e78',
          900:'#4d4f62',
          950:'#2d2e39'
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
}
