/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fff4ed',
          100: '#ffe8d5',
          200: '#ffd0aa',
          300: '#ffb074',
          400: '#ff8a3d',
          500: '#ff6019',
          600: '#f04400',
          700: '#c73400',
          800: '#9f2c06',
          900: '#81280b',
        },
        surface: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          850: '#1c1c1c',
          900: '#171717',
          950: '#0a0a0a',
        },
        success: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
        warning: { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
        error:   { 50: '#fef2f2', 500: '#ef4444', 700: '#b91c1c' },
        info:    { 50: '#eff6ff', 500: '#3b82f6', 700: '#1d4ed8' },
      },
      boxShadow: {
        'card':     '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-dark':'0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
        'elevated': '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'brand':    '0 4px 20px rgba(255,96,25,0.35)',
        'brand-sm': '0 2px 10px rgba(255,96,25,0.3)',
        'glass':    '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        'deep':     '0 20px 60px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'gradient-brand':  'linear-gradient(135deg, #ff6019 0%, #f04400 100%)',
        'gradient-dark':   'linear-gradient(135deg, #1c1c1c 0%, #0a0a0a 100%)',
        'gradient-glass':  'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-card':   'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
        'shimmer':         'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
      },
      animation: {
        'shimmer':         'shimmer 2s infinite linear',
        'slide-up':        'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down':      'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left':      'slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':         'fadeIn 0.3s ease-out',
        'scale-in':        'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-gentle':   'bounceGentle 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-brand':     'pulseBrand 2s ease-in-out infinite',
        'spin-slow':       'spin 3s linear infinite',
        'float':           'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '300% 0' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
        slideLeft: {
          '0%':   { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.94)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.06)' },
        },
        pulseBrand: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,96,25,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(255,96,25,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
      transitionTimingFunction: {
        'spring':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth':  'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
