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
        primary: '#FA3E4E', // Coral accent
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
      },
      keyframes: {
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        }
      },
      animation: {
        shine: 'shine 3s infinite',
      }
    },
  },
  plugins: [],
}
