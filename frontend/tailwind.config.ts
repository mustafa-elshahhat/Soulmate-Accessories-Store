import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C8A96E',
          light: '#E8D5B0',
          dark: '#A88B4A',
        },
        foreground: '#1A1A1A',
        'muted-foreground': '#4A4A4A',
        muted: '#F5F5F5',
        border: '#D1D5DB',
        background: '#FFFFFF',
        destructive: '#DC2626',
        success: '#16A34A',
        warning: '#F59E0B',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)'],
        inter: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
} satisfies Config;
