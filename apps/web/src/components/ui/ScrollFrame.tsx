import { HTMLAttributes } from 'react';

interface ScrollFrameProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional label shown inside the frame top edge */
  title?: string;
}

/**
 * ScrollFrame — decorative parchment scroll container.
 * Uses texture PNGs if available; falls back to CSS gradients gracefully.
 * - Outer: cosmic-panel bg + gold border
 * - Top/Bottom bars: /textures/scroll-bar-top.png (fallback: gold-metal gradient)
 * - Body: /textures/parchment.png (fallback: parchment warm gradient)
 */
export function ScrollFrame({ title, children, className = '', ...rest }: ScrollFrameProps) {
  return (
    <div
      className={['rounded-2xl border border-gold/40 bg-cosmic-panel shadow-goldGlow overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {/* Top wood bar */}
      <div
        className="h-8 w-full bg-gold-metal"
        style={{
          backgroundImage: `url('/textures/scroll-bar-top.png'), linear-gradient(90deg, #8a5a1f, #d4af37, #8a5a1f)`,
          backgroundSize: 'auto 100%, 100% 100%',
          backgroundRepeat: 'repeat-x, no-repeat',
        }}
        aria-hidden
      />

      {/* Parchment body */}
      <div
        className="relative px-6 py-6 text-parchment-ink"
        style={{
          backgroundImage: `url('/textures/parchment.png'), linear-gradient(180deg, #e9d4b6 0%, #d4b896 50%, #c9a96e 100%)`,
          backgroundSize: 'cover, 100% 100%',
          backgroundRepeat: 'no-repeat, no-repeat',
        }}
      >
        {title && (
          <div
            className="text-center text-[13px] tracking-[0.3em] uppercase text-parchment-deep mb-4 font-semibold"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {title}
          </div>
        )}
        {children}
      </div>

      {/* Bottom wood bar */}
      <div
        className="h-8 w-full bg-gold-metal"
        style={{
          backgroundImage: `url('/textures/scroll-bar-bottom.png'), linear-gradient(90deg, #8a5a1f, #d4af37, #8a5a1f)`,
          backgroundSize: 'auto 100%, 100% 100%',
          backgroundRepeat: 'repeat-x, no-repeat',
        }}
        aria-hidden
      />
    </div>
  );
}
