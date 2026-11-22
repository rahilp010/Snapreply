/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#000000',
          900: '#050507',
          850: '#09090d',
          800: '#0e0e13',
          750: '#14141b',
          700: '#1c1c24',
          600: '#282833',
        },
        prismatic: {
          cyan: '#38bdf8',
          violet: '#818cf8',
          orange: '#fb923c',
          rose: '#f43f5e',
          amber: '#facc15',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'SF Pro Display',
          'Segoe UI',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          'SF Mono',
          'JetBrains Mono',
          'ui-monospace',
          'monospace'
        ]
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'island-pop': 'islandPop 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'orb-breathe': 'orbBreathe 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        islandPop: {
          '0%': { opacity: '0', transform: 'scale(0.88) translateY(6px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        orbBreathe: {
          '0%, 100%': { transform: 'scale(0.96)', opacity: '0.7' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
