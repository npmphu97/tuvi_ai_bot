/**
 * CardFace — renders a single tarot card face (CDN image) with gold frame.
 * Also exports MiniCardBack for the deck grid + MiniCardFront for tray.
 */
import { getImageUrl, type TarotCard } from '@tuvi/tarot';

const SERIF = "'Cormorant Garamond',serif";

/** Gold filigree card back for the deck grid (small ~50×75px) */
export function MiniCardBack() {
  return (
    <div className="w-full h-full rounded-md bg-gradient-to-br from-[#05060a] via-[#0b0d14] to-[#14121a] border border-[#c89146]/80 relative overflow-hidden flex items-center justify-center">
      {/* dot-grid filigree */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #c89146 0px, transparent 1.2px)',
          backgroundSize: '12px 12px',
        }}
      />
      {/* centre sigil */}
      <div
        className="relative z-10 text-[#c89146] text-base leading-none select-none"
        style={{ fontFamily: SERIF }}
        aria-hidden
      >
        ✦
      </div>
      {/* inner border */}
      <div className="absolute inset-1 rounded-sm border border-[#c89146]/25 pointer-events-none" />
      {/* corner marks */}
      {['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'].map((pos) => (
        <div
          key={pos}
          aria-hidden
          className={`absolute ${pos} w-2 h-2 border-[#c89146]/50`}
          style={{
            borderTopWidth: pos.includes('top') ? 1 : 0,
            borderBottomWidth: pos.includes('bottom') ? 1 : 0,
            borderLeftWidth: pos.includes('left') ? 1 : 0,
            borderRightWidth: pos.includes('right') ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}

/** Full-size card face for tray / result grid */
export function CardFace({
  card,
  reversed,
  className = '',
}: {
  card: TarotCard;
  reversed: boolean;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border-2 border-[#c89146]/70 shadow-[0_0_18px_-4px_rgba(212,175,55,0.4)] bg-[#05060a] ${className}`}
    >
      <img
        src={getImageUrl(card)}
        alt={card.nameVi}
        loading="lazy"
        className="w-full h-full object-cover"
        style={reversed ? { transform: 'rotate(180deg)' } : undefined}
      />
    </div>
  );
}

/** Label chip shown under a card in the result spread */
export function PositionChip({ label, idx }: { label: string; idx: number }) {
  return (
    <div className="mt-2 text-center">
      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold text-[#c89146] border border-[#c89146]/40 bg-[#0b0d14]">
        {idx + 1}. {label}
      </span>
    </div>
  );
}

/** Card name line in serif */
export function CardNameLabel({
  card,
  reversed,
}: {
  card: TarotCard;
  reversed: boolean;
}) {
  return (
    <div className="mt-1 text-center">
      <div
        className="text-[12px] font-bold text-[#e9d4b6] leading-tight"
        style={{ fontFamily: SERIF }}
        title={card.nameVi}
      >
        {card.nameVi}
      </div>
      {reversed && (
        <div className="text-[9px] uppercase tracking-wider text-[#c8361d] font-bold">Ngược</div>
      )}
    </div>
  );
}
