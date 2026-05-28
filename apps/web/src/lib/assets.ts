/**
 * Static asset path constants for the dark-gold mystic redesign.
 * All paths are relative to the Next.js `public/` directory (served at `/`).
 */

/** Zodiac sign slugs (English, lowercase) mapped to their icon PNG paths. */
export const ZODIAC_ICONS: Record<string, string> = {
  aries:        '/zodiac/aries.png',
  taurus:       '/zodiac/taurus.png',
  gemini:       '/zodiac/gemini.png',
  cancer:       '/zodiac/cancer.png',
  leo:          '/zodiac/leo.png',
  virgo:        '/zodiac/virgo.png',
  libra:        '/zodiac/libra.png',
  scorpio:      '/zodiac/scorpio.png',
  sagittarius:  '/zodiac/sagittarius.png',
  capricorn:    '/zodiac/capricorn.png',
  aquarius:     '/zodiac/aquarius.png',
  pisces:       '/zodiac/pisces.png',
};

/** Textures */
export const TEXTURES = {
  /** Seamless tileable aged parchment — used as scroll body bg. */
  parchment:      '/textures/parchment.png',
  /** Dark wood + gold inlay bar — scroll cap top. */
  scrollBarTop:   '/textures/scroll-bar-top.png',
  /** Dark wood + gold inlay bar — scroll cap bottom. */
  scrollBarBottom: '/textures/scroll-bar-bottom.png',
} as const;

/**
 * Returns the zodiac icon path for an English sign name.
 * Falls back to undefined if sign is unrecognised.
 */
export function getZodiacIconPath(enName: string): string | undefined {
  return ZODIAC_ICONS[enName.toLowerCase()];
}
