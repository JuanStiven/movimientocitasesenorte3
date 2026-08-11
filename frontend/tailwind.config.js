/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6fc',
          100: '#d8eaf6',
          200: '#b8daf0',
          300: '#88c2e7',
          400: '#50a3db',
          500: '#005696',
          600: '#004884',
          700: '#003766',
          800: '#00274a',
          900: '#041b31',
          950: '#020f1c',
        },
        sidebar: {
          DEFAULT: '#061424',
          hover: '#0c233c',
          active: '#004884',
          text: '#9eb3c2',
          textActive: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}
