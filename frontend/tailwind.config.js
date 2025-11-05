/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
        'sf-mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'monospace'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          bg: '#000000',
          card: '#1c1c1e',
          border: '#38383a',
        },
        light: {
          bg: '#ffffff',
          card: '#f2f2f7',
          border: '#d1d1d6',
        }
      },
      borderRadius: {
        'apple': '12px',
      },
      boxShadow: {
        'apple': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'apple-dark': '0 4px 16px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
