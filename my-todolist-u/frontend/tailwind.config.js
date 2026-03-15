/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF5F0',
          100: '#FEE6D8',
          200: '#FDC7A8',
          300: '#FAA06E',
          400: '#F9783F',
          500: '#F4511E',
          600: '#E64A19',
          700: '#B83C18',
          800: '#8D3117',
          900: '#652512',
        },
      },
      boxShadow: {
        card: '0 24px 60px rgba(18, 24, 40, 0.12)',
      },
      fontFamily: {
        sans: ['Google Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
