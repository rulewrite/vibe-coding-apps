/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 마법사 실험실 테마 색상
        mystic: {
          50: '#f8f6ff',
          100: '#ede7ff',
          200: '#ddd2ff',
          300: '#c2b0ff',
          400: '#a185ff',
          500: '#8054ff',
          600: '#7530ff',
          700: '#6618ff',
          800: '#5815d6',
          900: '#4a12b0',
        },
        alchemy: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        medieval: ['Cinzel', 'serif'],
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite alternate',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': {
            'box-shadow':
              '0 0 5px rgba(128, 84, 255, 0.5), 0 0 10px rgba(128, 84, 255, 0.3)',
          },
          '100%': {
            'box-shadow':
              '0 0 20px rgba(128, 84, 255, 0.8), 0 0 30px rgba(128, 84, 255, 0.6)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
