/**
 * SunMoon emblem — radiating sun rays + crescent moon overlay.
 * Gold gradient stroke on transparent background.
 * Phase 02 full implementation.
 */
export function SunMoon({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="sm-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5d76e" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#a07830" />
        </linearGradient>
        <filter id="sm-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sun rays — 8 rays at cardinal + diagonal angles */}
      <g stroke="url(#sm-gold)" strokeWidth="2" strokeLinecap="round" filter="url(#sm-glow)">
        <line x1="32" y1="3" x2="32" y2="13" />
        <line x1="32" y1="51" x2="32" y2="61" />
        <line x1="3" y1="32" x2="13" y2="32" />
        <line x1="51" y1="32" x2="61" y2="32" />
        <line x1="10.5" y1="10.5" x2="17.5" y2="17.5" />
        <line x1="46.5" y1="46.5" x2="53.5" y2="53.5" />
        <line x1="53.5" y1="10.5" x2="46.5" y2="17.5" />
        <line x1="10.5" y1="53.5" x2="17.5" y2="46.5" />
      </g>

      {/* Sun circle */}
      <circle cx="32" cy="32" r="15" stroke="url(#sm-gold)" strokeWidth="1.5" fill="none" opacity="0.7" />

      {/* Crescent moon — arc path creating crescent pointing right */}
      <path
        d="M 32 18 A 14 14 0 0 1 32 46 A 9 9 0 0 0 32 18 Z"
        fill="url(#sm-gold)"
        opacity="0.9"
        filter="url(#sm-glow)"
      />

      {/* Inner glow fill */}
      <circle cx="32" cy="32" r="14" fill="#d4af37" opacity="0.08" />

      {/* Center dot */}
      <circle cx="32" cy="32" r="2.5" fill="url(#sm-gold)" />
    </svg>
  );
}
