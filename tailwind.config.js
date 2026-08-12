/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        alayaa: {
          background: '#FAF9F6',
          soft: '#F8F8F7',
          surface: '#FFFFFF',
          primary: '#0F766E',
          secondary: '#134E4A',
          text: '#1F2937',
          muted: '#6B7280',
          border: '#E5E7EB',
        },
      },
    },
  },
  plugins: [],
};
