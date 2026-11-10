/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./dashboard.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        hero: ['Kanit', 'Saira Semi Condensed', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        'it-bg': '#F9F9F7',
        'it-card': '#FFFFFF',
        'it-stone': '#F3F2E9',
        'it-stone-dark': '#EDEBDE',
        'it-forest': '#004020',
        'it-forest-dark': '#002518',
        'it-forest-light': '#005550',
        'it-green': {
          DEFAULT: '#64C800',
          hover: '#56AD00',
          subtle: 'rgba(100, 200, 0, 0.12)',
          dark: '#00A050',
        },
        'it-dark': '#262626',
        'it-darker': '#1A1A1A',
        'it-muted': '#707070',
        'it-faint': '#9E9E9E',
        'it-border': '#E5E4DC',
        'it-border-light': '#EFEFEA',
        navy: {
          DEFAULT: '#0B1528',
          hover: '#16243E',
          dark: '#060C17',
          light: '#1E2D48',
          subtle: 'rgba(11, 21, 40, 0.04)',
          border: 'rgba(11, 21, 40, 0.1)',
          muted: '#64748B',
          faint: '#94A3B8',
        },
        brand: {
          navy: '#0B1528',
          bg: '#FFFFFF',
          surface: '#F8FAFC',
          border: '#E2E8F0',
        }
      },
      boxShadow: {
        'it-card': '0 4px 20px -2px rgba(0, 40, 20, 0.06), 0 2px 6px -1px rgba(0, 40, 20, 0.03)',
        'it-card-hover': '0 16px 40px -6px rgba(0, 40, 20, 0.12), 0 4px 12px -2px rgba(0, 40, 20, 0.06)',
        'it-pill': '0 4px 14px rgba(100, 200, 0, 0.35)',
        'it-pill-hover': '0 6px 20px rgba(100, 200, 0, 0.5)',
        'glass': '0 8px 30px rgba(11, 21, 40, 0.05), 0 1px 3px rgba(11, 21, 40, 0.04)',
        'glass-hover': '0 16px 40px rgba(11, 21, 40, 0.09), 0 2px 6px rgba(11, 21, 40, 0.04)',
      },
      borderRadius: {
        'pill': '9999px',
        '2.5xl': '1.375rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      backdropBlur: {
        'glass': '16px',
        'header': '20px',
      }
    },
  },
  plugins: [],
}
