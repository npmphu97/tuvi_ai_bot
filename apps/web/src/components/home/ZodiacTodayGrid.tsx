'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MysticCard } from '@/components/ui/MysticCard';
import { ZodiacIcon } from '@/components/zodiac/ZodiacIcon';
import { GoldText } from '@/components/ui/GoldText';
import { HOROSCOPE } from '@/lib/home-data';
import { useDailyHoroscope } from '@/lib/use-daily-horoscope';
import { getSignToday } from '@/lib/horoscope-lib';
import type { ZodiacSign } from '@/components/zodiac/ZodiacIcon';

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-[2px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < n ? 'text-gold' : 'text-gold/20'}>
          ★
        </span>
      ))}
    </span>
  );
}

const SIGN_RATINGS: Record<string, number> = {
  aries: 4, taurus: 3, gemini: 5, cancer: 4,
  leo: 5, virgo: 3, libra: 4, scorpio: 3,
  sagittarius: 5, capricorn: 4, aquarius: 3, pisces: 4,
};

/**
 * ZodiacTodayGrid — WEST tone section. 12 horoscope cung hôm nay.
 * Uses ZodiacIcon + useDailyHoroscope for daily readings.
 */
export function ZodiacTodayGrid() {
  const [today, setToday] = useState('');
  const [todaySignEn, setTodaySignEn] = useState<string | null>(null);
  const daily = useDailyHoroscope();

  useEffect(() => {
    const now = new Date();
    setToday(
      now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    );
    setTodaySignEn(getSignToday(now)?.en?.toLowerCase() ?? null);
  }, []);

  return (
    <section id="cung" className="relative py-20 px-6 bg-cosmic-DEFAULT">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-[11px] tracking-[0.4em] text-gold/60 font-semibold uppercase">
              十 二 星 座 · Tinh Tọa
            </div>
            <h2
              className="mt-3 text-[clamp(28px,4.5vw,52px)] font-serif leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              <span className="text-parchment">12 Cung Hoàng Đạo</span>{' '}
              <GoldText>Hôm Nay</GoldText>
            </h2>
            <p className="mt-2 text-parchment/55 text-[14px]">
              Luận giải vận trình miễn phí — cập nhật mỗi ngày
            </p>
          </div>
          <Link
            href="/hoang-dao"
            className="text-gold/70 hover:text-gold text-sm transition-colors flex items-center gap-1"
          >
            Xem tất cả <span>→</span>
          </Link>
        </div>

        {/* Today sign banner */}
        {todaySignEn && (() => {
          const sign = HOROSCOPE.find((h) => h.en.toLowerCase() === todaySignEn);
          if (!sign) return null;
          return (
            <div
              suppressHydrationWarning
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-cosmic-raised/70 px-5 py-2 text-[13px] text-parchment"
            >
              <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-bold">Hôm nay</span>
              <span className="w-px h-3.5 bg-gold/30" />
              <span>
                Mặt Trời chiếu cung{' '}
                <strong className="text-gold">{sign.name} {sign.sym}</strong>
              </span>
            </div>
          );
        })()}

        {/* 12-sign grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HOROSCOPE.map((h) => {
            const signKey = h.en.toLowerCase() as ZodiacSign;
            const rating = SIGN_RATINGS[signKey] ?? 3;
            const isToday = h.en.toLowerCase() === todaySignEn;

            return (
              <MysticCard
                key={h.name}
                tone="west"
                hover
                className={`p-5 ${isToday ? 'border-gold/60 shadow-goldGlow' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="shrink-0">
                    <ZodiacIcon sign={signKey} size={44} withFrame={false} className="opacity-90" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div
                          className="text-[17px] font-serif text-parchment leading-none"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {h.name}{' '}
                          <span className="text-gold">{h.sym}</span>
                        </div>
                        <div className="text-[10px] tracking-widest uppercase text-parchment/40 mt-0.5">
                          {h.range}
                        </div>
                      </div>
                      <Stars n={rating} />
                    </div>

                    {/* Reading text */}
                    <div className="mt-2.5">
                      {daily?.readings[h.en] ? (
                        <p className="text-[13px] text-parchment/70 leading-relaxed line-clamp-3">
                          <span suppressHydrationWarning className="text-parchment/40 mr-1">
                            {today ? `${today}:` : ''}
                          </span>
                          {daily.readings[h.en]}
                        </p>
                      ) : (
                        <div className="inline-flex items-center gap-2 text-[12px] text-gold/50 italic">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                          Đang luận giải…
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </MysticCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
