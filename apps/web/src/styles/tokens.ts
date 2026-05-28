/**
 * Design tokens — Dark + Gold Mystic palette.
 * Single source of truth for inline-style usages and non-Tailwind contexts.
 * Tailwind classes should use the config aliases defined in tailwind.config.ts.
 */
export const palette = {
  // Cosmic backgrounds
  cosmic: '#05060a',      // body bg
  ink: '#0b0d14',         // panel bg
  raised: '#14121a',      // card raised bg
  veil: '#1c1a24',        // hover/active raised

  // Gold metallic
  goldDeep: '#8a5a1f',
  gold: '#c89146',        // default border / accent
  goldLight: '#e9d4b6',
  goldShine: '#f4d57a',   // bright highlight
  goldMetal: '#d4af37',   // classic gold

  // Ink on dark
  cream: '#f4ecd6',       // body text on dark
  mute: '#b8a47c',        // subtitle / hint
  faint: '#7a6d4f',       // disabled

  // Mystic accents
  mountain: '#4a6c7a',    // Eastern accent
  vermilion: '#c8361d',   // warning / hắc đạo
  jade: '#6b9080',        // success / lành

  // Parchment (scroll frame only, not page bg)
  parchment: '#e9d4b6',
  parchmentDeep: '#c9a96e',
  parchmentText: '#3a2410',
} as const;

export type PaletteKey = keyof typeof palette;
