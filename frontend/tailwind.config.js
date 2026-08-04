import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff0f5',
          100: '#ffe4ef',
          500: '#db2777',
        },
      },
      boxShadow: {
        soft: '0 24px 60px rgba(23, 32, 51, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config
