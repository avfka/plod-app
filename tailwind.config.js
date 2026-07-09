/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        gold: '#FFD700',
        surface: {
          light: '#FFFFFF',
          dark: '#121212',
        },
        card: {
          light: '#F2F2F7',
          dark: '#1E1E24',
        },
      },
    },
  },
  plugins: [],
};
