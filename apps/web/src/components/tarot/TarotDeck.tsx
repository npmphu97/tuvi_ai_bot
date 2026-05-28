'use client';

/**
 * TarotDeck — Step 2: casino-style deck pick.
 * 78 cards face-down, gold filigree back, deal-in animation, click to pick.
 * All animation logic preserved from original TarotClient.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TAROT_DECK, type DrawnCard, type TarotCard } from '@tuvi/tarot';
import { GoldButton } from '@/components/ui/GoldButton';
import { MysticCard } from '@/components/ui/MysticCard';
import { MiniCardBack, CardFace, CardNameLabel } from './CardFace';
import { getCardByIdOrThrow } from '@tuvi/tarot';

const DEAL_STAGGER_MS = 28;
const DEAL_DURATION_MS = 550;
export const DEAL_TOTAL_MS = TAROT_DECK.length * DEAL_STAGGER_MS + DEAL_DURATION_MS;

interface TarotDeckProps {
  deck: TarotCard[];
  chosen: DrawnCard[];
  numCards: number;
  onPick: (card: TarotCard) => void;
  onReshuffle: () => void;
  onUndoLast: () => void;
  error: string | null;
  shuffleKey: number;
}

export function TarotDeck({
  deck, chosen, numCards, onPick, onReshuffle, onUndoLast, error, shuffleKey,
}: TarotDeckProps) {
  const chosenIds = useMemo(() => new Set(chosen.map((c) => c.cardId)), [chosen]);
  const full = chosen.length >= numCards;

  const [dealing, setDealing] = useState(true);
  useEffect(() => {
    setDealing(true);
    const t = setTimeout(() => setDealing(false), DEAL_TOTAL_MS);
    return () => clearTimeout(t);
  }, [shuffleKey]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2
          className="text-2xl md:text-3xl font-serif italic text-[#e9d4b6]"
          style={{ fontFamily: "'Cormorant Garamond',serif" }}
        >
          Bước 2 · Chọn{' '}
          <span className="text-[#c89146]">{numCards}</span> lá từ bộ bài
        </h2>
        <p className="mt-1 text-[13px] text-[#b8a47c]">
          {dealing ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#c89146] animate-pulse" />
              Đang chia bài… hít một hơi sâu.
            </span>
          ) : (
            'Để trực giác dẫn ngón tay — lá đã chọn sẽ bay lên khay.'
          )}
        </p>
      </div>

      {/* Chosen tray */}
      <MysticCard tone="west" hover={false} className="p-4 md:p-5">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#c89146] font-bold text-center mb-3">
          Lá đã chọn · {chosen.length} / {numCards}
        </div>
        <div className="flex items-end justify-center gap-2 md:gap-3 flex-wrap min-h-[140px]">
          {Array.from({ length: numCards }).map((_, i) => {
            const drawn = chosen[i];
            if (!drawn) return <EmptySlot key={i} idx={i} />;
            const card = getCardByIdOrThrow(drawn.cardId);
            return (
              <TrayCard key={`${drawn.cardId}-${i}`} card={card} reversed={drawn.reversed} idx={i} />
            );
          })}
        </div>
      </MysticCard>

      {error && (
        <div className="rounded-xl border border-[#c8361d]/40 bg-[#c8361d]/10 p-3 text-[#c8361d] text-[13px] text-center">
          ⚠ {error}
        </div>
      )}

      {/* 78-card grid */}
      <div
        key={shuffleKey}
        className="grid gap-1 sm:gap-1.5 justify-center"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(46px, 1fr))', maxWidth: 900, margin: '0 auto' }}
      >
        {deck.map((card, i) => (
          <DeckCard
            key={`${shuffleKey}-${card.id}`}
            card={card} idx={i}
            chosen={chosenIds.has(card.id)}
            disabled={dealing || full || chosenIds.has(card.id)}
            onPick={onPick}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
        <GoldButton variant="outline" size="sm" onClick={onReshuffle}>⟲ Tráo lại</GoldButton>
        {chosen.length > 0 && !full && (
          <button
            type="button" onClick={onUndoLast}
            className="px-5 py-2 rounded-full border border-[#c8361d]/40 text-[#c8361d] text-[13px] font-semibold hover:bg-[#c8361d]/10 transition"
          >
            ← Bỏ lá cuối
          </button>
        )}
      </div>

      {/* CSS animation keyframes */}
      <style jsx global>{`
        @keyframes deck-deal-in {
          0%   { opacity:0; transform:translate(-140px,-220px) rotate(-32deg) scale(.55); }
          55%  { opacity:1; transform:translate(8px,-10px) rotate(4deg) scale(1.08); }
          80%  { transform:translate(-2px,2px) rotate(-1.5deg) scale(.98); }
          100% { opacity:1; transform:translate(0,0) rotate(0) scale(1); }
        }
        @keyframes deck-fly-up {
          0%   { transform:translateY(0) scale(1) rotateY(0); opacity:1; }
          60%  { opacity:1; }
          100% { transform:translateY(-160px) scale(.85) rotateY(180deg); opacity:0; }
        }
        @keyframes tray-flip-in {
          0%   { transform:rotateY(180deg) scale(.7) translateY(-40px); opacity:0; }
          50%  { opacity:1; }
          100% { transform:rotateY(0deg) scale(1) translateY(0); opacity:1; }
        }
        .deck-card { animation:deck-deal-in ${DEAL_DURATION_MS}ms cubic-bezier(.25,.95,.35,1.05) backwards; will-change:transform,opacity; transform-origin:center; }
        .deck-card.flying { animation:deck-fly-up .55s ease-out forwards; pointer-events:none; }
        .deck-card.gone   { visibility:hidden; }
        .tray-card-anim   { animation:tray-flip-in .7s ease-out backwards; }
      `}</style>
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function DeckCard({ card, idx, chosen, disabled, onPick }: {
  card: TarotCard; idx: number; chosen: boolean; disabled: boolean; onPick: (c: TarotCard) => void;
}) {
  const [flying, setFlying] = useState(false);

  useEffect(() => {
    if (chosen && !flying) setFlying(true);
    if (!chosen && flying) setFlying(false);
  }, [chosen, flying]);

  const stage = chosen ? (flying ? 'flying' : 'gone') : 'idle';

  return (
    <button
      type="button"
      onClick={() => { if (!disabled) onPick(card); }}
      disabled={disabled}
      aria-label={`Lá thứ ${idx + 1}`}
      className={`deck-card ${stage === 'flying' ? 'flying' : ''} ${stage === 'gone' ? 'gone' : ''} block aspect-[2/3] rounded-md overflow-hidden ${
        disabled ? '' : 'hover:scale-110 hover:-translate-y-1.5 hover:z-10 hover:ring-2 hover:ring-[#c89146]/70 transition-transform cursor-pointer'
      }`}
      style={{ animationDelay: stage === 'idle' || stage === 'gone' ? `${idx * DEAL_STAGGER_MS}ms` : undefined }}
    >
      <MiniCardBack />
    </button>
  );
}

function EmptySlot({ idx }: { idx: number }) {
  return (
    <div className="flex flex-col items-center w-[70px] md:w-[80px]">
      <div className="w-[70px] h-[110px] md:w-[80px] md:h-[128px] rounded-lg border-2 border-dashed border-[#c89146]/25 flex items-center justify-center">
        <span className="text-[#c89146]/30 text-[10px] tracking-widest">#{idx + 1}</span>
      </div>
    </div>
  );
}

function TrayCard({ card, reversed, idx }: { card: TarotCard; reversed: boolean; idx: number }) {
  void idx;
  return (
    <div className="tray-card-anim flex flex-col items-center w-[70px] md:w-[80px]">
      <CardFace card={card} reversed={reversed} className="w-[70px] h-[110px] md:w-[80px] md:h-[128px]" />
      <CardNameLabel card={card} reversed={reversed} />
    </div>
  );
}
