/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        surface: '#f7f7f9',
        primary: '#f80e11', // Brand red
        rose: {
          400: '#ff5f61',
          500: '#f80e11',
          600: '#d60c0f',
        },
        secondary: '#00697a', // Teal background for sections
        text: '#222222',
        muted: '#717171',
        border: '#dddddd',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 6px 16px rgba(0,0,0,0.08)',
        'floating': '0 10px 40px rgba(0,0,0,0.1)',
        'card-hover': '0 20px 60px rgba(0,105,122,0.15), 0 8px 24px rgba(248,14,17,0.08)',
        'card-elevated': '0 12px 40px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        'glass': '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        'badge': '0 2px 8px rgba(0,105,122,0.2)',
        'cta': '0 4px 15px rgba(248,14,17,0.25)',
      },
      keyframes: {
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'badge-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        shine: 'shine 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'badge-pulse': 'badge-pulse 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}
