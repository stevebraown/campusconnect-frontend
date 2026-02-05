/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0E14',
        indigo: '#5B5F97',
        cyber: '#9ef01a',
        neon: '#2ECC71',
        midnight: '#0f172a',
        glass: {
          light: 'rgba(255, 255, 255, 0.6)',
          dark: 'rgba(255, 255, 255, 0.06)',
        },
        campus: {
          green: {
            50: '#e9f9ef',
            100: '#c8f1d9',
            200: '#9ee5be',
            300: '#6bd79f',
            400: '#38c97e',
            500: '#2ECC71',
            600: '#22a05a',
            700: '#1b8048',
            800: '#156138',
            900: '#0f4227',
          },
          gray: {
            50: '#f8fafc',
            100: '#eef2f6',
            200: '#d9e2ec',
            300: '#c0ccda',
            400: '#99a9bf',
            500: '#6f7d95',
            600: '#4f5d75',
            700: '#2d3748',
            800: '#1a2233',
            900: '#0f172a',
          },
        },
      },
      fontFamily: {
        sans: ['"Geist Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 50px rgba(46, 204, 113, 0.25)',
        glass: '0 20px 60px rgba(0, 0, 0, 0.35)',
        innerGlow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
      },
      backdropBlur: {
        22: '22px',
        24: '24px',
      },
      borderRadius: {
        glass: '18px',
      },
      keyframes: {
        'scan-fade': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '50%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translateY(-4px)' },
        },
        'pulse-glass': {
          '0%, 100%': { opacity: 0.72 },
          '50%': { opacity: 1 },
        },
      },
      animation: {
        'scan-fade': 'scan-fade 0.8s ease-in-out',
        'pulse-glass': 'pulse-glass 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}