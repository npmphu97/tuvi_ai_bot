'use client';

import { useState } from 'react';
import { MysticCard } from '@/components/ui/MysticCard';
import { GoldText } from '@/components/ui/GoldText';
import { ZODIAC } from '@/lib/home-data';

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-[2px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < n ? 'text-gold' : 'text-gold/20'}>★</span>
      ))}
    </span>
  );
}

const CATS = ['Tổng Quan', 'Tài Lộc', 'Tình Duyên', 'Sức Khỏe'] as const;

/**
 * AnimalsToday — EAST tone. 12 con giáp hôm nay.
 * Interactive: click animal to expand detail panel.
 */
export function AnimalsToday() {
  const [active, setActive] = useState(6); // Ngọ default
  const z = ZODIAC[active];

  return (
    <section id="congiao" className="relative py-20 px-6 bg-cosmic-panel">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-[11px] tracking-[0.4em] text-gold/60 font-semibold uppercase">
            十 二 生 肖 · Thập Nhị
          </div>
          <h2
            className="mt-3 text-[clamp(28px,4.5vw,52px)] font-serif leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            <span className="text-parchment">Vận Hôm Nay theo</span>{' '}
            <GoldText>Con Giáp</GoldText>
          </h2>
        </div>

        {/* Animal grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
          {ZODIAC.map((g, i) => {
            const isActive = i === active;
            return (
              <button
                type="button"
                key={g.name}
                onClick={() => setActive(i)}
                className={[
                  'group relative rounded-xl border transition-all duration-300 p-3 text-center',
                  isActive
                    ? 'border-gold/60 bg-cosmic-raised shadow-goldGlow'
                    : 'border-gold/20 bg-cosmic-raised/50 hover:border-gold/40 hover:bg-cosmic-raised',
                ].join(' ')}
              >
                {/* Chữ Hán faint watermark */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1 right-1 text-3xl font-serif text-gold/8 select-none leading-none"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  命
                </span>

                <div
                  className={`text-3xl sm:text-4xl leading-none transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                >
                  {g.glyph}
                </div>
                <div
                  className={`mt-1.5 text-[12px] tracking-[0.2em] font-semibold font-serif ${isActive ? 'text-gold' : 'text-parchment/70'}`}
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {g.name}
                </div>
                <div className="text-[9px] tracking-wide text-parchment/30">
                  {g.hours}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <MysticCard tone="east" hover={false} className="mt-6 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Animal info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl border border-gold/30 bg-cosmic-raised flex items-center justify-center text-4xl shrink-0 shadow-goldGlow">
                {z.glyph}
              </div>
              <div>
                <div
                  className="text-2xl font-serif text-parchment"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Tuổi <span className="text-gold">{z.name}</span>
                </div>
                <div className="text-xs text-parchment/40 tracking-wider mt-0.5">
                  {z.years}
                </div>
              </div>
            </div>

            {/* Rating grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-center">
              {CATS.map((c, ci) => (
                <div key={c}>
                  <div className="text-[10px] tracking-[0.25em] uppercase text-parchment/40 font-semibold">{c}</div>
                  <div className="mt-1.5"><Stars n={z.ratings[ci] ?? 3} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Fortune text */}
          <p className="mt-5 pt-5 border-t border-gold/15 text-parchment/75 leading-relaxed text-[14px] sm:text-[15px]">
            Hôm nay tuổi{' '}
            <span className="font-semibold text-gold">{z.name}</span>{' '}
            {z.fortune}
            <span className="text-parchment/50">
              {' '}· Màu may mắn:{' '}
              <span className="text-gold/80 font-medium">{z.lucky}</span>
              {' '}· Số cát:{' '}
              <span className="text-gold/80 font-medium">{z.num}</span>
            </span>
          </p>
        </MysticCard>
      </div>
    </section>
  );
}
