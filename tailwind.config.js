/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        diceroll: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.2) rotate(-15deg)' },
          '50%': { transform: 'scale(1.2) rotate(15deg)' },
          '75%': { transform: 'scale(1.2) rotate(-15deg)' },
        }
      },
      animation: {
        diceroll: 'diceroll 0.6s ease-in-out',
      }
    },
  },
  plugins: [],
}
