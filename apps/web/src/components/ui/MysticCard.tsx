import { HTMLAttributes } from 'react';

export type MysticCardTone = 'east' | 'west' | 'neutral';

interface MysticCardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: MysticCardTone;
  hover?: boolean;
}

/** Chữ Hán watermark for east tone */
function EastWatermark() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute bottom-3 right-4 text-7xl font-serif italic text-gold/10 select-none leading-none"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      命
    </span>
  );
}

/** Faint constellation cross for west tone */
function WestWatermark() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute bottom-0 right-0 w-24 h-24 opacity-[0.07]"
      viewBox="0 0 80 80"
      fill="none"
    >
      <circle cx="40" cy="20" r="2" fill="#c89146" />
      <circle cx="60" cy="40" r="2" fill="#c89146" />
      <circle cx="40" cy="60" r="2" fill="#c89146" />
      <circle cx="20" cy="40" r="2" fill="#c89146" />
      <line x1="40" y1="20" x2="60" y2="40" stroke="#c89146" strokeWidth="0.7" />
      <line x1="60" y1="40" x2="40" y2="60" stroke="#c89146" strokeWidth="0.7" />
      <line x1="40" y1="60" x2="20" y2="40" stroke="#c89146" strokeWidth="0.7" />
      <line x1="20" y1="40" x2="40" y2="20" stroke="#c89146" strokeWidth="0.7" />
    </svg>
  );
}

/**
 * MysticCard — dark raised card with gold border + glow.
 * tone='east': chữ Hán watermark; tone='west': constellation; tone='neutral': plain.
 */
export function MysticCard({
  tone = 'neutral',
  hover = true,
  children,
  className = '',
  ...rest
}: MysticCardProps) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl',
        'bg-cosmic-raised border border-gold/40 shadow-goldGlow',
        hover ? 'transition-transform duration-200 hover:-translate-y-1 hover:shadow-cosmicLift hover:border-gold/70' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {tone === 'east' && <EastWatermark />}
      {tone === 'west' && <WestWatermark />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
