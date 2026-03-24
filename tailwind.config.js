/** @type {import('tailwindcss').Config} */

/**
 * Tailwind CSS Configuration for BOCRA Website
 * 
 * Brand Colors extracted from BOCRA's official branding:
 * - Primary Blue: #00458B (main brand color from logo)
 * - Accent Cyan: #00A6CE (secondary brand accent)
 * - Accent Magenta: #C8237B (from BOCRA dots)
 * - Accent Yellow: #F7B731 (from BOCRA dots)
 * - Accent Green: #6BBE4E (from BOCRA dots)
 * 
 * The four colored dots in the BOCRA logo represent the four sectors:
 * Telecommunications, Broadcasting, Postal, and Internet
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bocra: {
          blue: '#00458B',
          'blue-dark': '#002D5C',
          'blue-light': '#0066CC',
          cyan: '#00A6CE',
          magenta: '#C8237B',
          yellow: '#F7B731',
          green: '#6BBE4E',
          slate: '#1E293B',
          'off-white': '#F8FAFC',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
