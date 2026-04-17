import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 10px 30px -14px rgba(15, 23, 42, 0.18)',
      },
      colors: {
        ink: {
          950: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
