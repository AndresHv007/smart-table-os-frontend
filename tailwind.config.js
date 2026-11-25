/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'system-ui',
          'sans-serif',
        ],
      },
      keyframes: {
        diceroll: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.2) rotate(-15deg)' },
          '50%': { transform: 'scale(1.2) rotate(15deg)' },
          '75%': { transform: 'scale(1.2) rotate(-15deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(12px, -16px, 0) scale(1.06)' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(14px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        modalPop: {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmerSweep: {
          '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
          '100%': { transform: 'translateX(220%) skewX(-18deg)' },
        },
      },
      animation: {
        diceroll: 'diceroll 0.6s ease-in-out',
        'float-slow': 'floatSlow 14s ease-in-out infinite',
        'fade-slide-up': 'fadeSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'modal-pop': 'modalPop 0.32s cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer-sweep': 'shimmerSweep 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
