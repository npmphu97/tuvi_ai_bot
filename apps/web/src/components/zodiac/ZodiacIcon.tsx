import Image from 'next/image';
import { MysticCard } from '@/components/ui/MysticCard';

export type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

interface ZodiacIconProps {
  sign: ZodiacSign;
  /** Pixel size for the icon. Default: 48 */
  size?: number;
  /** If true, wrap in MysticCard with sign glow */
  withFrame?: boolean;
  className?: string;
  alt?: string;
}

/**
 * ZodiacIcon — renders a zodiac sign image from /zodiac/{sign}.png.
 * withFrame: wraps in MysticCard (west tone for constellation feel).
 */
export function ZodiacIcon({ sign, size = 48, withFrame = false, className = '', alt }: ZodiacIconProps) {
  const img = (
    <Image
      src={`/zodiac/${sign}.png`}
      alt={alt ?? sign}
      width={size}
      height={size}
      className={['object-contain', className].filter(Boolean).join(' ')}
    />
  );

  if (!withFrame) return img;

  return (
    <MysticCard tone="west" hover className="inline-flex items-center justify-center p-2">
      {img}
    </MysticCard>
  );
}
