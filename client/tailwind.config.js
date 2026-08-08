/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          DEFAULT: '#2563EB',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          800: '#1E293B',
          900: '#0F172A',
          DEFAULT: '#0F172A',
        },
        success: {
          500: '#22C55E',
          DEFAULT: '#22C55E',
        },
        warning: {
          500: '#F59E0B',
          DEFAULT: '#F59E0B',
        },
        danger: {
          500: '#EF4444',
          DEFAULT: '#EF4444',
        }
      },
      borderRadius: {
        'enterprise': '16px',
        'xl': '16px'
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'soft': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'hover': '0 20px 40px -15px rgba(37, 99, 235, 0.15)'
      }
    },
  },
  plugins: [],
}
