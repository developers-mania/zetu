/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f7fb',
          100: '#b3e8f5',
          500: '#00B4D8',
          600: '#0077B6',
          900: '#0D1B2A',
        },
        zetu: {
          primary: '#00B4D8',
          secondary: '#0077B6',
          dark: '#0D1B2A',
        },
      },
    },
  },
  plugins: [],
}
