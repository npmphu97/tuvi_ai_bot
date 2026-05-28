'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HOROSCOPE } from '@/lib/home-data';
import { ZODIAC_DETAILS } from '@/lib/zodiac-detail';
import { getSignToday } from '@/lib/horoscope-lib';
import { useDailyHoroscope } from '@/lib/use-daily-horoscope';
import { MysticCard } from '@/components/ui/MysticCard';
import { GoldText } from '@/components/ui/GoldText';
import { ZodiacIcon } from '@/components/zodiac/ZodiacIcon';
import type { ZodiacSign } from '@/components/zodiac/ZodiacIcon';
import { HoangDaoForm } from '@/components/hoang-dao/HoangDaoForm';

// Per-sign element tint for card overlay (dark+gold palette — no chromatic explosion)
const ELEMENT_TINT: Record<string, string> = {
  Lửa: 'rgba(200,54,29,0.12)',
  Đất: 'rgba(138,90,31,0.12)',
  Khí: 'rgba(74,108,122,0.12)',
  Nước: 'rgba(107,144,128,0.12)',
};

function Hero() {
  const [todayLabel, setTodayLabel] = useState('');
  const [todaySignEn, setTodaySignEn] = useState<string | null>(null);
  useEffect(() => {
    const now = new Date();
    setTodayLabel(
      now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    );
    setTodaySignEn(getSignToday(now)?.en ?? null);
  }, []);

  const todaySign = todaySignEn ? HOROSCOPE.find((h) => h.en === todaySignEn) : null;

  return (
    <section className="relative pt-16 pb-12 px-6 text-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(200,145,70,0.12) 0%, transparent 70%)' }}
      />
      <Link href="/" className="inline-block text-[11px] tracking-[0.3em] text-gold/60 hover:text-gold uppercase transition">
        ← Trang chủ
      </Link>
      <div className="mt-5 inline-flex items-center gap-3 text-[11px] tracking-[0.4em] uppercase text-gold/50">
        <span className="w-8 h-px bg-gold/30" />
        十 二 星 座 · Tinh Tọa
        <span className="w-8 h-px bg-gold/30" />
      </div>
      <h1 className="mt-5 font-serif text-[clamp(48px,7vw,96px)] leading-[0.95]">
        <GoldText as="span">12 Cung</GoldText>{' '}
        <span className="text-parchment">Hoàng Đạo</span>
      </h1>
      <p className="mt-5 max-w-2xl mx-auto text-[15px] text-parchment/60 leading-relaxed">
        Mỗi cung mang một nguyên tố — Lửa, Đất, Khí, Nước — định hình tính cách, vận trình, tình duyên và sự nghiệp.
      </p>
      {todayLabel && (
        <div
          className="mt-7 inline-flex flex-wrap items-center justify-center gap-4 px-5 py-2.5 rounded-full border border-gold/30 bg-cosmic-panel/80 text-[12px] text-parchment/70"
          suppressHydrationWarning
        >
          <span className="text-gold font-semibold tracking-wide uppercase text-[10px]">Hôm nay</span>
          <span className="w-px h-3.5 bg-gold/30" />
          <span>{todayLabel}</span>
          {todaySign && (
            <>
              <span className="w-px h-3.5 bg-gold/30" />
              <span>
                Mặt Trời chiếu cung{' '}
                <strong className="text-gold">{todaySign.name} {todaySign.sym}</strong>
              </span>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function ZodiacCard({
  detail,
  highlight,
  dailyText,
}: {
  detail: (typeof ZODIAC_DETAILS)[number];
  highlight?: boolean;
  dailyText?: string;
}) {
  const tint = ELEMENT_TINT[detail.el] ?? ELEMENT_TINT.Đất;
  const signKey = detail.en.toLowerCase() as ZodiacSign;

  return (
    <Link href={`/hoang-dao/${detail.slug}`} className="block group">
      <MysticCard
        tone="west"
        hover
        className={`relative p-5 flex flex-col items-center text-center ${
          highlight ? 'border-gold/70 shadow-goldGlow' : ''
        }`}
        style={{ background: `linear-gradient(160deg, ${tint}, transparent 65%)` } as React.CSSProperties}
      >
        {highlight && (
          <span className="absolute -top-2 left-4 px-2.5 py-0.5 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold text-cosmic-DEFAULT bg-gold-metal shadow-md">
            Cung của bạn
          </span>
        )}
        {/* Icon with radial glow halo */}
        <div className="relative mb-4">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(200,145,70,0.25) 0%, transparent 70%)', transform: 'scale(1.5)' }}
          />
          <ZodiacIcon sign={signKey} size={96} className="relative drop-shadow-[0_0_12px_rgba(200,145,70,0.5)]" />
        </div>
        <GoldText as="h3" className="font-serif text-xl leading-tight">{detail.name}</GoldText>
        <div className="mt-1 text-[10px] tracking-[0.2em] uppercase text-parchment/50">{detail.en}</div>
        <div className="mt-1.5 text-[11px] text-gold/70">{detail.range}</div>
        {dailyText && (
          <p className="mt-3 text-[12px] text-parchment/60 leading-relaxed line-clamp-2">{dailyText}</p>
        )}
        <div className="mt-3 text-[11px] tracking-[0.15em] uppercase text-gold/50 group-hover:text-gold transition">
          {detail.el}
        </div>
      </MysticCard>
    </Link>
  );
}

function Grid({ userSignEn }: { userSignEn: string | null }) {
  const daily = useDailyHoroscope();
  return (
    <section className="relative py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <div className="text-[11px] tracking-[0.4em] text-gold/50 font-semibold uppercase">黃 道 · Hoàng Đạo</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-serif">
            <GoldText as="span">12 cung</GoldText>{' '}
            <span className="text-parchment/80">hoàng đạo</span>
          </h2>
          <p className="mt-3 text-[14px] text-parchment/50 max-w-xl mx-auto">
            Luận giải vận trình hôm nay — tình duyên, sự nghiệp, tài lộc. Cập nhật mỗi ngày.
          </p>
        </div>
        {/* 3-col mobile, 4-col tablet, 6-col desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {ZODIAC_DETAILS.map((detail) => (
            <ZodiacCard
              key={detail.slug}
              detail={detail}
              highlight={userSignEn !== null && userSignEn.toLowerCase() === detail.en.toLowerCase()}
              dailyText={daily?.readings[detail.en]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HoangDaoClient() {
  const [userSignEn, setUserSignEn] = useState<string | null>(null);
  return (
    <>
      <Hero />
      <HoangDaoForm onSignChange={setUserSignEn} />
      <Grid userSignEn={userSignEn} />
    </>
  );
}
