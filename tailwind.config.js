/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#2196F3',
        'brand-green': '#66BB6A',
        'accent-yellow': '#FFD700',
        'accent-orange': '#FFA726',
        'accent-red': '#F44336',
        'neutral-white': '#FFFFFF',
        'neutral-light': '#F7FAFC',
        'neutral-medium': '#E2E8F0',
        'neutral-dark': '#A0AEC0',
        'text-primary': '#2D3748',
        'text-secondary': '#718096',
      },
      animation: {
        shine: 'shine 4s linear infinite',
      },
      keyframes: {
        shine: {
         '0%': { backgroundPosition: '0% 50%' },
         '100%': { backgroundPosition: '200% 50%' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
