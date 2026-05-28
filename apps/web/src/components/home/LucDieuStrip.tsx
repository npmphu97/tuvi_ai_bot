'use client';

import { useEffect, useState } from 'react';
import { MysticCard } from '@/components/ui/MysticCard';
import { GoldText } from '@/components/ui/GoldText';
import { LUC_DIEU, LUC_DIEU_TONE } from '@/lib/home-data';

/**
 * LucDieuStrip — WEST tone. 6 lục diệu cards in a horizontal strip.
 * Highlights current hour slot. Horizontal scroll on mobile.
 */
export function LucDieuStrip() {
  const [today, setToday] = useState('');
  const [idxNow, setIdxNow] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday(
      now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    );
    const h = now.getHours();
    if (h === 23 || h === 0) {
      setIdxNow(0);
    } else {
      setIdxNow(Math.floor((h + 1) / 2));
    }
  }, []);

  return (
    <section id="lucdieu" className="relative py-20 px-6 bg-cosmic-DEFAULT">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-[11px] tracking-[0.4em] text-gold/60 font-semibold uppercase">
              六 曜 · Cát Hung
            </div>
            <h2
              className="mt-3 text-[clamp(28px,4.5vw,52px)] font-serif leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              <span className="text-parchment">Lục Diệu</span>{' '}
              <GoldText>Theo Giờ</GoldText>
            </h2>
            <p className="mt-2 text-parchment/55 text-[14px]">
              Chọn giờ xuất hành — hành động theo diệu tốt trong ngày
            </p>
          </div>
          <div className="px-4 py-2 rounded-full border border-gold/25 bg-cosmic-raised text-sm text-parchment/70">
            Hôm nay:{' '}
            <span className="font-medium text-gold" suppressHydrationWarning>
              {today}
            </span>
          </div>
        </div>

        {/* Scrollable strip */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div className="flex gap-3 min-w-max sm:min-w-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {LUC_DIEU.map((l, i) => {
              const tone = LUC_DIEU_TONE[l.name] ?? { fg: '#c89146', bg: '#c891460d' };
              const isNow = i === idxNow;

              return (
                <MysticCard
                  key={i}
                  tone="west"
                  hover={false}
                  className={[
                    'p-4 text-center relative w-[160px] sm:w-auto',
                    isNow ? 'border-gold/60 shadow-goldGlow' : '',
                  ].join(' ')}
                >
                  {isNow && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gold text-cosmic-DEFAULT text-[10px] tracking-wider font-bold whitespace-nowrap shadow-goldGlow">
                      Giờ này
                    </span>
                  )}

                  {/* Icon */}
                  <div className="text-2xl mb-1.5" style={{ color: tone.fg }}>
                    {l.icon}
                  </div>

                  {/* Hour range */}
                  <div className="text-[10px] text-parchment/40 tracking-wider">{l.hour}</div>

                  {/* Chi name */}
                  <div
                    className="mt-1 text-[14px] font-serif text-parchment/80"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {l.chi}
                  </div>

                  {/* Diệu name */}
                  <div className="mt-0.5 text-[13px] font-semibold" style={{ color: tone.fg }}>
                    {l.name}
                  </div>

                  {/* Short description */}
                  <div className="mt-1 text-[11px] text-parchment/50 leading-snug">{l.short}</div>
                </MysticCard>
              );
            })}
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-parchment/30">
          Tính theo ngày âm lịch · Cập nhật mỗi ngày lúc 00:00
        </p>
      </div>
    </section>
  );
}
