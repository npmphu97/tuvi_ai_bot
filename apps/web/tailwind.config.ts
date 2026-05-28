import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Legacy aliases — REMAPPED to dark theme equivalents.
          // All components using bg-brand-cream / text-brand-purple auto-render new palette.
          purple: '#c89146',        // was đồng cổ → now gold (heading accent on dark)
          purpleDark: '#05060a',    // was mực tàu → now cosmic (deepest bg)
          ink: '#05060a',           // cosmic bg
          mute: '#b8a47c',          // subtitle on dark
          cream: '#f4ecd6',         // ink-on-dark (was page bg → now text on dark)
          gold: '#c89146',
          goldLight: '#e9d4b6',
          mountain: '#4a6c7a',
          vermilion: '#c8361d',
        },
        cosmic: {
          DEFAULT: '#05060a',
          panel: '#0b0d14',
          raised: '#14121a',
          veil: '#1c1a24',
        },
        gold: {
          deep: '#8a5a1f',
          DEFAULT: '#c89146',
          light: '#e9d4b6',
          shine: '#f4d57a',
          metal: '#d4af37',
        },
        parchment: {
          DEFAULT: '#e9d4b6',
          deep: '#c9a96e',
          ink: '#3a2410',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-sf-pro)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          '"Segoe UI"',
          'system-ui',
          'sans-serif',
        ],
        // Cormorant Garamond — mystical display headlines only
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -15px rgba(0,0,0,0.6)',
        ring: '0 0 0 1px rgba(200,145,70,0.4)',
        goldGlow: '0 0 30px -5px rgba(212,175,55,0.45)',
        cosmicLift: '0 20px 60px -20px rgba(212,175,55,0.25)',
      },
      backgroundImage: {
        'gold-metal':
          'linear-gradient(135deg, #b8862b 0%, #f4d57a 35%, #d4af37 50%, #f4d57a 65%, #8a5a1f 100%)',
        'gold-soft': 'linear-gradient(180deg, #f4d57a 0%, #c89146 100%)',
        'cosmic-vignette':
          'radial-gradient(ellipse at center, #0b0d14 0%, #05060a 70%)',
      },
    },
  },
  plugins: [],
};

export default config;
