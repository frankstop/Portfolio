/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './games/**/*.html',
    './projects/**/*.html',
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_data/**/*.yml',
    './assets/js/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
