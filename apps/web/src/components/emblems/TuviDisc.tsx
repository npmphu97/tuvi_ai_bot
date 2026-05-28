'use client';

/**
 * TuviDisc emblem — 12 cung (palace) labels arranged around a circle.
 * Gold stroke on dark background. Phase 02 full implementation.
 */

const CUNG_LABELS = [
  'Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch',
  'Quan Lộc', 'Nô Bộc', 'Di Chuyển', 'Tật Ách',
  'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ',
];

export function TuviDisc({ size = 200, className = '' }: { size?: number; className?: string }) {
  const cx = 100;
  const cy = 100;
  const outerR = 94;
  const labelR = 78;   // radius for cung labels
  const spokeR = 60;   // inner end of spokes
  const innerR = 40;   // inner decoration ring

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="td-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5d76e" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#a07830" />
        </linearGradient>
        <radialGradient id="td-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1408" />
          <stop offset="100%" stopColor="#0a0804" />
        </radialGradient>
        <filter id="td-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dark fill */}
      <circle cx={cx} cy={cy} r={outerR} fill="url(#td-bg)" />

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} stroke="url(#td-gold)" strokeWidth="1.5" />

      {/* Middle ring */}
      <circle cx={cx} cy={cy} r={spokeR + 4} stroke="#d4af37" strokeWidth="0.75" opacity="0.4" />

      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={innerR} stroke="url(#td-gold)" strokeWidth="1" opacity="0.8" />

      {/* 12 spokes + cung labels */}
      {CUNG_LABELS.map((label, i) => {
        const angleDeg = (i * 30) - 90; // start at top, 30° each
        const angleRad = (angleDeg * Math.PI) / 180;

        // Spoke endpoints
        const sx1 = cx + (innerR + 2) * Math.cos(angleRad);
        const sy1 = cy + (innerR + 2) * Math.sin(angleRad);
        const sx2 = cx + (spokeR + 2) * Math.cos(angleRad);
        const sy2 = cy + (spokeR + 2) * Math.sin(angleRad);

        // Label position
        const lx = cx + labelR * Math.cos(angleRad);
        const ly = cy + labelR * Math.sin(angleRad);

        // Tick mark on outer ring
        const tx1 = cx + (outerR - 6) * Math.cos(angleRad);
        const ty1 = cy + (outerR - 6) * Math.sin(angleRad);
        const tx2 = cx + outerR * Math.cos(angleRad);
        const ty2 = cy + outerR * Math.sin(angleRad);

        // Rotation so text aligns with radius
        const textRotate = angleDeg + 90;

        return (
          <g key={label} filter="url(#td-glow)">
            {/* Tick on outer ring */}
            <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#d4af37" strokeWidth="1.2" opacity="0.6" />
            {/* Spoke from inner to mid ring */}
            <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke="#d4af37" strokeWidth="0.6" opacity="0.35" />
            {/* Label */}
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fill="#d4af37"
              fontFamily="'Cormorant Garamond', Georgia, serif"
              transform={`rotate(${textRotate} ${lx} ${ly})`}
              opacity="0.9"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Center compass — 4 cardinal lines */}
      <g stroke="url(#td-gold)" strokeWidth="1" opacity="0.6">
        <line x1={cx} y1={cy - innerR + 6} x2={cx} y2={cy + innerR - 6} />
        <line x1={cx - innerR + 6} y1={cy} x2={cx + innerR - 6} y2={cy} />
      </g>

      {/* Center text 命 */}
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="16"
        fill="url(#td-gold)"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontStyle="italic"
        filter="url(#td-glow)"
      >
        命
      </text>
    </svg>
  );
}
