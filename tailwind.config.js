/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B1A',
          900: '#0A1633',
          800: '#122148',
          700: '#1B2F63',
        },
        blue: {
          400: '#3B82F6',
          500: '#2563EB',
        },
        sky: {
          300: '#7DD3FC',
        },
        slate: {
          50: '#F8FAFC',
          500: '#64748B',
        },
        success: '#10B981',
        pending: '#F59E0B',
        danger: '#F43F5E',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.015em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        display: ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(6, 11, 26, 0.06), 0 8px 24px rgba(6, 11, 26, 0.08)',
        'soft-dark': '0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.4)',
        glow: '0 8px 30px rgba(37, 99, 235, 0.25)',
        'glow-lg': '0 12px 40px rgba(37, 99, 235, 0.35)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        shine: {
          '0%': { transform: 'translateX(-150%) skewX(-20deg)' },
          '100%': { transform: 'translateX(150%) skewX(-20deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        shine: 'shine 1.1s ease-in-out',
      },
    },
  },
  plugins: [],
}
