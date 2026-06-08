/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f9f0',
          100: '#dcf0dc',
          200: '#bce2bc',
          300: '#8ecb8e',
          400: '#5aad5a',
          500: '#3a8f3a',
          600: '#2c712c',
          700: '#255825',
          800: '#204520',
          900: '#1a381a',
          950: '#0d1f0d',
        },
        earth: {
          50: '#fdf8f0',
          100: '#faefd8',
          200: '#f4dcb0',
          300: '#ecc37e',
          400: '#e3a44a',
          500: '#d88a28',
          600: '#c06f1e',
          700: '#9f541c',
          800: '#82441e',
          900: '#6b391b',
          950: '#3a1c0c',
        },
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.12), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};
