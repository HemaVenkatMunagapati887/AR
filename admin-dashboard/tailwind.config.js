/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        safety: {
          orange: '#F97316',
          dark: '#111827',
        },
      },
    },
  },
  plugins: [],
};
