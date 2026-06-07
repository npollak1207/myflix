/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Layered near-black with a faint violet undertone (refined cinematic)
        ink: '#0a0a0f', // page background
        surface: '#13131b', // cards / panels
        'surface-2': '#1d1d29', // elevated / hover
        line: 'rgba(255,255,255,0.08)', // hairline borders
        accent: {
          DEFAULT: '#6366f1', // indigo-500
          soft: '#a5b4fc', // indigo-300 (links/hover text)
          600: '#4f46e5',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk Variable"', '"Inter Variable"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        glow: '0 16px 50px -12px rgba(99,102,241,0.45)',
        card: '0 12px 40px -12px rgba(0,0,0,0.7)',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
