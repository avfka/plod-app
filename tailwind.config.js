/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // «детективное досье»: бумага/чернила + сигнальный красный
        accent: '#E8352A',
        thread: '#FF1F0F',
        ink: '#141210',
        paper: '#FAF7F2',
        gold: '#FFD700',
        // тёмная тема (CCTV night mode)
        night: '#12100E',
        'night-element': '#1C1916',
        'paper-dark': '#F5F1E8',
      },
    },
  },
  plugins: [],
};
