/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#F7F7F5',
          surface: '#FFFFFF',
          text: '#141413',
          muted: '#6B6A65',
          border: '#E4E4DE',
          'border-subtle': '#EFEFEA',
          accent: '#0F766E',
          'accent-hover': '#115E59',
          'accent-subtle': '#F0FDFA',
          'accent-light': '#CCFBF1',
          danger: '#DC2626',
          'danger-subtle': '#FEF2F2',
          warning: '#D97706',
          'warning-subtle': '#FFFBEB',
          success: '#15803D',
          'success-subtle': '#F0FDF4',
        }
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
