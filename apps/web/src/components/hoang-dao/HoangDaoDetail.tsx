'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ZodiacDetail } from '@/lib/zodiac-detail';
import { HOROSCOPE } from '@/lib/home-data';
import { useDailyHoroscope } from '@/lib/use-daily-horoscope';
import { MysticCard } from '@/components/ui/MysticCard';
import { GoldText } from '@/components/ui/GoldText';
import { GoldButton } from '@/components/ui/GoldButton';
import { ZodiacIcon } from '@/components/zodiac/ZodiacIcon';
import type { ZodiacSign } from '@/components/zodiac/ZodiacIcon';

// Per-sign element tint for hero
const ELEMENT_TINT: Record<string, string> = {
  Lửa: 'rgba(200,54,29,0.15)',
  Đất: 'rgba(138,90,31,0.15)',
  Khí: 'rgba(74,108,122,0.15)',
  Nước: 'rgba(107,144,128,0.15)',
};

function Breadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Đường dẫn" className="text-[12px] text-parchment/50 flex items-center gap-2 flex-wrap">
      <Link href="/" className="hover:text-gold transition">Trang chủ</Link>
      <span className="text-gold/50">›</span>
      <Link href="/hoang-dao" className="hover:text-gold transition">12 Cung Hoàng Đạo</Link>
      <span className="text-gold/50">›</span>
      <span className="text-gold font-medium">{current}</span>
    </nav>
  );
}

function HeroCard({ detail }: { detail: ZodiacDetail }) {
  const tint = ELEMENT_TINT[detail.el] ?? ELEMENT_TINT.Đất;
  const signKey = detail.en.toLowerCase() as ZodiacSign;

  return (
    <header
      className="relative rounded-3xl border border-gold/40 bg-cosmic-panel overflow-hidden shadow-goldGlow"
      style={{ background: `radial-gradient(ellipse 80% 80% at 50% 0%, ${tint}, transparent 60%), #0b0d14` }}
    >
      <div className="px-6 md:px-12 py-14 text-center">
        {/* Large icon with halo */}
        <div className="relative mx-auto w-fit">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(200,145,70,0.35) 0%, transparent 65%)',
              transform: 'scale(1.8)',
            }}
          />
          <ZodiacIcon
            sign={signKey}
            size={200}
            className="relative drop-shadow-[0_0_32px_rgba(200,145,70,0.6)]"
          />
        </div>
        <h1 className="mt-8 font-serif text-[clamp(44px,6vw,76px)] leading-[1]">
          <GoldText as="span">{detail.name}</GoldText>
        </h1>
        <div className="mt-2 text-[15px] tracking-[0.35em] uppercase text-parchment/50">
          {detail.en}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <span className="px-3.5 py-1.5 rounded-full border border-gold/30 bg-cosmic-raised text-[12px] text-parchment/70">
            {detail.range}
          </span>
          <span className="px-3.5 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-[12px] text-gold font-semibold tracking-[0.2em] uppercase">
            {detail.el}
          </span>
          <span className="px-3.5 py-1.5 rounded-full border border-gold/30 bg-cosmic-raised text-[12px] text-parchment/70">
            {detail.quality}
          </span>
          <span className="px-3.5 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-[12px] text-gold">
            ✦ {detail.ruler}
          </span>
        </div>
      </div>
    </header>
  );
}

function TodayLine({ name }: { name: string }) {
  const [today, setToday] = useState('');
  useEffect(() => {
    setToday(new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }));
  }, []);
  const horoscope = HOROSCOPE.find((h) => h.name === name);
  const daily = useDailyHoroscope();
  if (!horoscope) return null;
  const reading = daily?.readings[horoscope.en];

  return (
    <MysticCard tone="west" hover={false} className="p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-gold/60 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
        Hôm nay <span suppressHydrationWarning>· {today}</span>
      </div>
      {reading ? (
        <p className="mt-3 text-[15px] md:text-[16px] text-parchment leading-relaxed">{reading}</p>
      ) : (
        <div className="mt-3 inline-flex items-center gap-2 text-[14px] text-parchment/50 italic">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          Hệ thống đang luận giải vận trình hôm nay…
        </div>
      )}
    </MysticCard>
  );
}

function OverviewBlock({ detail }: { detail: ZodiacDetail }) {
  return (
    <MysticCard tone="east" hover={false} className="p-6 md:p-10">
      <div className="text-[11px] tracking-[0.4em] uppercase text-gold/50 font-semibold">Tổng quan</div>
      <h2 className="mt-2 text-3xl md:text-4xl font-serif">
        <span className="text-parchment">Tính cách </span>
        <GoldText as="em">{detail.name}</GoldText>
      </h2>
      <p className="mt-5 text-[15px] md:text-[16px] text-parchment/80 leading-[1.85] text-justify">
        {detail.overview}
      </p>
    </MysticCard>
  );
}

function TraitsGrid({ detail }: { detail: ZodiacDetail }) {
  return (
    <section className="grid md:grid-cols-2 gap-5">
      <MysticCard tone="neutral" hover={false} className="p-6">
        <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-gold/60 font-semibold">
          <span className="text-gold">✦</span> Điểm mạnh
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {detail.strengths.map((s) => (
            <li key={s} className="px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-[13px] text-gold font-medium">
              {s}
            </li>
          ))}
        </ul>
      </MysticCard>
      <MysticCard tone="neutral" hover={false} className="p-6">
        <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-brand-vermilion/70 font-semibold">
          <span>⚠</span> Điểm yếu
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {detail.weaknesses.map((w) => (
            <li key={w} className="px-3 py-1.5 rounded-full bg-brand-vermilion/10 border border-brand-vermilion/30 text-[13px] text-brand-vermilion font-medium">
              {w}
            </li>
          ))}
        </ul>
      </MysticCard>
    </section>
  );
}

function MetaGrid({ detail }: { detail: ZodiacDetail }) {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Sao chiếu mệnh', value: detail.ruler },
    { label: 'Nguyên tố', value: detail.el },
    { label: 'Phân loại', value: detail.quality },
    { label: 'Màu may mắn', value: detail.luckyColor },
    { label: 'Số may mắn', value: detail.luckyNumber },
    { label: 'Cung hợp nhất', value: detail.compatible.join(', ') },
  ];
  return (
    <MysticCard tone="neutral" hover={false} className="p-6 md:p-8">
      <div className="text-[11px] tracking-[0.3em] uppercase text-gold/50 font-semibold">Thông tin cung</div>
      <dl className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-gold/10 py-2">
            <dt className="text-[13px] text-parchment/50">{r.label}</dt>
            <dd className="text-[14px] text-parchment font-medium text-right">{r.value}</dd>
          </div>
        ))}
      </dl>
    </MysticCard>
  );
}

function PersonalizeCta({ detail }: { detail: ZodiacDetail }) {
  return (
    <MysticCard tone="west" hover={false} className="p-6 md:p-8 text-center">
      <div className="text-[11px] tracking-[0.3em] uppercase text-gold/50 font-semibold mb-3">Luận giải cá nhân</div>
      <p className="text-[14px] text-parchment/70 mb-5">
        Nhận luận giải sâu về vận trình cung{' '}
        <strong className="text-gold">{detail.name}</strong> dựa trên ngày sinh và bối cảnh của bạn.
      </p>
      <Link href={`/hoang-dao/luan-giai?sign=${detail.en}`}>
        <GoldButton variant="primary" size="md">
          ✦ Xem luận giải cá nhân
        </GoldButton>
      </Link>
    </MysticCard>
  );
}

function NavButtons({ neighbors }: { neighbors: { prev: ZodiacDetail; next: ZodiacDetail } }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <Link
        href={`/hoang-dao/${neighbors.prev.slug}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/30 bg-cosmic-raised text-parchment/70 hover:border-gold/60 hover:text-gold text-sm font-medium transition"
      >
        <span aria-hidden>←</span>
        <span className="hidden sm:inline">Trang trước ·</span>{' '}
        {neighbors.prev.name}
      </Link>
      <Link
        href="/hoang-dao"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-metal text-cosmic-DEFAULT shadow-goldGlow text-sm font-semibold hover:brightness-110 transition"
      >
        ✦ 12 Cung Hoàng Đạo
      </Link>
      <Link
        href={`/hoang-dao/${neighbors.next.slug}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/30 bg-cosmic-raised text-parchment/70 hover:border-gold/60 hover:text-gold text-sm font-medium transition"
      >
        {neighbors.next.name}{' '}
        <span className="hidden sm:inline">· Trang sau</span>
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}

function RelatedSection({ related }: { related: ZodiacDetail[] }) {
  const daily = useDailyHoroscope();
  const dailyReadings = daily?.readings ?? {};
  return (
    <section className="pt-2">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-[11px] tracking-[0.4em] uppercase text-gold/50 font-semibold">Luận giải hôm nay</div>
          <h2 className="mt-2 text-2xl md:text-3xl font-serif">
            <span className="text-parchment">Các cung </span>
            <GoldText as="em">hợp nhất</GoldText>
          </h2>
        </div>
        <Link href="/hoang-dao" className="text-gold/60 hover:text-gold text-sm transition">Xem tất cả →</Link>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {related.map((r) => {
          const signKey = r.en.toLowerCase() as ZodiacSign;
          const horoscope = HOROSCOPE.find((h) => h.name === r.name);
          return (
            <Link key={r.slug} href={`/hoang-dao/${r.slug}`} className="block group">
              <MysticCard tone="west" hover className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <ZodiacIcon sign={signKey} size={48} className="drop-shadow-[0_0_8px_rgba(200,145,70,0.4)]" />
                  <div>
                    <GoldText as="div" className="text-lg font-serif">{r.name}</GoldText>
                    <div className="text-[10px] tracking-[0.18em] uppercase text-parchment/40">
                      {r.en} · {r.range}
                    </div>
                  </div>
                </div>
                {horoscope && dailyReadings[horoscope.en] && (
                  <p className="text-[13px] text-parchment/60 leading-relaxed line-clamp-3">
                    {dailyReadings[horoscope.en]}
                  </p>
                )}
                <div className="mt-4 text-[12px] text-gold/50 group-hover:text-gold font-medium transition">
                  Xem chi tiết →
                </div>
              </MysticCard>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function HoangDaoDetail({
  detail,
  neighbors,
  related,
}: {
  detail: ZodiacDetail;
  neighbors: { prev: ZodiacDetail; next: ZodiacDetail };
  related: ZodiacDetail[];
}) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
      <Breadcrumb current={detail.name} />
      <div className="mt-6 space-y-6 md:space-y-8">
        <HeroCard detail={detail} />
        <TodayLine name={detail.name} />
        <OverviewBlock detail={detail} />
        <TraitsGrid detail={detail} />
        <MetaGrid detail={detail} />
        <PersonalizeCta detail={detail} />
        <NavButtons neighbors={neighbors} />
        <RelatedSection related={related} />
      </div>
    </div>
  );
}
