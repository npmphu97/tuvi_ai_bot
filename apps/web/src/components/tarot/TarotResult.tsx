'use client';

/**
 * TarotResult — Step 3: reading result layout.
 * Dark cosmic bg, gold-framed cards per spread shape, MysticCard per-card reading.
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCardByIdOrThrow, type DrawnCard } from '@tuvi/tarot';
import { MysticCard } from '@/components/ui/MysticCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { GoldText } from '@/components/ui/GoldText';
import { formatVnd } from '@/lib/money';
import { CardFace, MiniCardBack, PositionChip, CardNameLabel } from './CardFace';
import { FIELD_LABEL, type Field } from './TarotIntake';

const SERIF = "'Cormorant Garamond',serif";

interface PerCardReading {
  cardId: string;
  reversed: boolean;
  position: string;
  paragraph: string;
}

interface TarotApiResponse {
  ok: true;
  chartId: string;
  cards: DrawnCard[];
  field: Field;
  numCards: 1 | 3 | 5 | 7 | 10;
  question: string | null;
  name: string;
  gender: 'male' | 'female';
  chargedVnd?: number;
  balanceVnd?: number;
  reading: {
    intro: string;
    perCard: PerCardReading[];
    overall: string;
    answer: string | null;
  };
}

interface TarotResultProps {
  result: TarotApiResponse;
  onStartOver: () => void;
}

function spreadGridClass(n: number): string {
  if (n === 1)  return 'grid-cols-1 max-w-[180px]';
  if (n === 3)  return 'grid-cols-3';
  if (n === 5)  return 'grid-cols-2 md:grid-cols-5';
  if (n === 7)  return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-7';
  return 'grid-cols-2 sm:grid-cols-5';
}

export function TarotResult({ result, onStartOver }: TarotResultProps) {
  const { reading, cards, field, question, numCards, chargedVnd, balanceVnd } = result;
  const [flippedCount, setFlippedCount] = useState(0);
  const allFlipped = flippedCount >= numCards;

  useEffect(() => {
    if (flippedCount >= numCards) return;
    const t = setTimeout(() => setFlippedCount((c) => c + 1), 450);
    return () => clearTimeout(t);
  }, [flippedCount, numCards]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <MysticCard tone="neutral" hover={false} className="p-5 md:p-7 text-center">
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#b8a47c] font-semibold">
          Trải bài {numCards} lá · {FIELD_LABEL[field]}
        </div>
        {question && (
          <p className="mt-2 text-[15px] italic text-[#e9d4b6]" style={{ fontFamily: SERIF }}>
            "{question}"
          </p>
        )}
        {typeof chargedVnd === 'number' && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14121a] border border-[#3a8a5e]/40 text-[12px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3a8a5e]" />
            <span className="text-[#5aaa7e] font-semibold tabular-nums">
              Đã thanh toán {formatVnd(chargedVnd)}
            </span>
            {typeof balanceVnd === 'number' && (
              <span className="text-[#b8a47c] tabular-nums">· Còn {formatVnd(balanceVnd)}</span>
            )}
          </div>
        )}
      </MysticCard>

      {/* Spread grid — flippable cards */}
      <MysticCard tone="west" hover={false} className="p-5 md:p-7">
        <div className={`grid gap-3 md:gap-4 justify-items-center mx-auto ${spreadGridClass(numCards)}`}>
          {cards.map((drawn, i) => {
            const card = getCardByIdOrThrow(drawn.cardId);
            const flipped = i < flippedCount;
            const position = reading.perCard[i]?.position ?? `Vị trí ${i + 1}`;
            return (
              <div key={`${drawn.cardId}-${i}`} className="flex flex-col items-center">
                <div
                  className="relative w-[100px] h-[164px] md:w-[120px] md:h-[196px]"
                  style={{ perspective: 1000 }}
                >
                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-out"
                    style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                  >
                    {/* Back */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden border-2 border-[#c89146]/60" style={{ backfaceVisibility: 'hidden' }}>
                      <MiniCardBack />
                    </div>
                    {/* Front */}
                    <div
                      className="absolute inset-0 rounded-lg overflow-hidden border-2 border-[#c89146] shadow-goldGlow"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <CardFace card={card} reversed={drawn.reversed} className="w-full h-full" />
                    </div>
                  </div>
                </div>
                <PositionChip label={position} idx={i} />
                {flipped && <CardNameLabel card={card} reversed={drawn.reversed} />}
              </div>
            );
          })}
        </div>
      </MysticCard>

      {/* Reading body — fades in after all flipped */}
      <div className={`space-y-4 transition-opacity duration-700 ${allFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Intro */}
        <MysticCard tone="neutral" hover={false} className="p-5 md:p-7">
          <p className="text-[16px] md:text-[17px] italic leading-[1.8] text-[#e9d4b6]" style={{ fontFamily: SERIF }}>
            {reading.intro}
          </p>
        </MysticCard>

        {/* Per-card readings */}
        {reading.perCard.map((p, i) => {
          const card = getCardByIdOrThrow(p.cardId);
          return (
            <MysticCard key={`${p.cardId}-${i}`} tone="west" hover={false} className="p-4 md:p-6 grid md:grid-cols-[96px_1fr] gap-4 items-start">
              <div className="flex flex-col items-center">
                <CardFace card={card} reversed={p.reversed} className="w-[88px] h-[144px]" />
                <div className="mt-2 text-center">
                  <div className="text-[13px] font-bold text-[#e9d4b6]" style={{ fontFamily: SERIF }}>{card.nameVi}</div>
                  <div className="text-[10px] uppercase tracking-wider">
                    {p.reversed ? <span className="text-[#c8361d]">Ngược</span> : <span className="text-[#b8a47c]">Xuôi</span>}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#c89146] mb-2">{p.position}</div>
                <p className="text-[14px] leading-[1.8] text-[#d4c8b4] whitespace-pre-wrap">{p.paragraph}</p>
              </div>
            </MysticCard>
          );
        })}

        {/* Overall */}
        <MysticCard tone="east" hover={false} className="p-5 md:p-7">
          <GoldText as="h3" className="text-[18px] md:text-[20px] font-serif italic block border-b border-[#c89146]/30 pb-2 mb-3" style={{ fontFamily: SERIF }}>
            Tổng luận
          </GoldText>
          <p className="text-[14px] leading-[1.85] text-[#d4c8b4] whitespace-pre-wrap">{reading.overall}</p>
        </MysticCard>

        {/* Answer */}
        {reading.answer && (
          <MysticCard tone="neutral" hover={false} className="p-5 md:p-7">
            <GoldText as="h3" className="text-[18px] md:text-[20px] font-serif italic block border-b border-[#c89146]/30 pb-2 mb-3" style={{ fontFamily: SERIF }}>
              Dành riêng cho bạn
            </GoldText>
            <p className="text-[14px] leading-[1.85] text-[#d4c8b4] whitespace-pre-wrap">{reading.answer}</p>
          </MysticCard>
        )}

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
          <GoldButton size="md" onClick={onStartOver}>↻ Rút trải bài mới</GoldButton>
          <Link href="/lich-su">
            <GoldButton variant="outline" size="md">Lịch sử Tarot →</GoldButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
