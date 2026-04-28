/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rydo: {
          navy: '#0f172a',
          accent: '#6C63FF',
          accentDark: '#554de8'
        }
      },
      boxShadow: {
        soft: '0 14px 40px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
