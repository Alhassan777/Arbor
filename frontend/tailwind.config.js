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
        // Primary - Arbor's growth accent
        canopy: {
          DEFAULT: '#2dd4a7',
          light: '#5eead4',
          muted: 'rgba(45, 212, 167, 0.15)',
        },
        // Neutrals - Organic dark palette
        'midnight-soil': '#0c0f0e',
        'forest-floor': '#131917',
        undergrowth: '#1c2420',
        branch: '#2a3530',
        lichen: '#4a5854',
        birch: '#9caba3',
        parchment: '#e8efe9',
        // Accents
        'amber-sap': '#f59e0b',
        berry: '#f472b6',
        'morning-light': '#fef3c7',
        // Legacy mappings for compatibility (will be phased out)
        background: '#0c0f0e',
        surface: '#131917',
        'surface-hover': '#1c2420',
        border: '#2a3530',
        primary: {
          DEFAULT: '#2dd4a7',
          hover: '#5eead4',
          muted: 'rgba(45, 212, 167, 0.15)',
        },
        'text-primary': '#e8efe9',
        'text-secondary': '#9caba3',
        'text-muted': '#4a5854',
        success: '#2dd4a7',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'organic-sm': '4px',
        'organic': '8px',
        'organic-lg': '12px',
        'organic-xl': '16px',
      },
      boxShadow: {
        'glow-canopy': '0 0 20px rgba(45, 212, 167, 0.2)',
        'glow-canopy-strong': '0 0 30px rgba(45, 212, 167, 0.3)',
        'dappled': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'pulse-subtle': 'pulseSoft 2s ease-in-out infinite',
        'grow': 'grow 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        grow: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
