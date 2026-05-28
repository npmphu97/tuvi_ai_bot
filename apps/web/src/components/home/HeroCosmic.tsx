'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SunMoon } from '@/components/emblems/SunMoon';
import { GoldButton } from '@/components/ui/GoldButton';
import { GoldText } from '@/components/ui/GoldText';
import { CosmicBg } from '@/components/CosmicBg';

function TodayBadge() {
  const [solarLabel, setSolarLabel] = useState('');
  const [lunarLabel, setLunarLabel] = useState('Quý Mão · Tháng Đinh Tỵ');

  useEffect(() => {
    const now = new Date();
    setSolarLabel(
      now.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    );
    // Static lunar label — actual dynamic value via LunarCalendar
    const y = now.getFullYear();
    setLunarLabel(`Năm Bính Ngọ ${y}`);
  }, []);

  return (
    <div
      suppressHydrationWarning
      className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-10 px-6 py-2.5 rounded-full border border-gold/30 bg-cosmic-raised/80 text-[13px] text-parchment"
    >
      <span className="text-gold font-semibold tracking-wider">今日</span>
      <span className="w-px h-3.5 bg-gold/30 hidden sm:block" />
      <span suppressHydrationWarning>{solarLabel}</span>
      <span className="w-px h-3.5 bg-gold/30 hidden sm:block" />
      <span className="text-parchment/70 italic" suppressHydrationWarning>{lunarLabel}</span>
    </div>
  );
}

/**
 * HeroCosmic — full viewport hero with CosmicBg, SunMoon emblem,
 * gold headline 運命, today date strip, and dual CTA buttons.
 */
export function HeroCosmic() {
  return (
    <section
      id="top"
      className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center overflow-hidden"
    >
      {/* Cosmic background restricted to hero only */}
      <div className="absolute inset-0 -z-10 bg-cosmic-DEFAULT">
        <CosmicBg intensity="med" />
        {/* Extra radial gold glow center */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(200,145,70,0.12) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Eyebrow */}
      <div className="inline-flex items-center gap-3 text-[11px] tracking-[0.45em] uppercase text-gold/70">
        <span className="w-8 h-px bg-gold/40" />
        運 命 · Huyền Học Á Đông
        <span className="w-8 h-px bg-gold/40" />
      </div>

      {/* SunMoon emblem */}
      <div className="mt-8 flex items-center justify-center">
        <div
          className="relative"
          style={{ filter: 'drop-shadow(0 0 18px rgba(212,175,55,0.55))' }}
        >
          <SunMoon size={96} />
        </div>
      </div>

      {/* Main headline */}
      <h1
        className="mt-6 font-serif leading-[0.92] text-[clamp(60px,10vw,136px)]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        <GoldText>Vận Mệnh</GoldText>
      </h1>

      {/* Sub headline */}
      <p className="mt-5 max-w-xl mx-auto text-parchment/80 text-[17px] leading-relaxed">
        Nơi hội tụ tinh hoa của khoa Chiêm Tinh và Huyền Học Á Đông — giải mã{' '}
        <em className="text-parchment">quá khứ, hiện tại, vị lai</em> qua từng lá
        số, từng ngôi sao, từng quẻ Dịch.
      </p>

      {/* CTA buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/xem-tu-vi">
          <GoldButton size="lg" variant="primary">
            Lập Lá Số Tử Vi
          </GoldButton>
        </Link>
        <Link href="/xem-tarot">
          <GoldButton size="lg" variant="outline">
            Khám Tarot
          </GoldButton>
        </Link>
      </div>

      {/* Today date badge */}
      <TodayBadge />

      {/* Scroll indicator */}
      <a
        href="#services"
        aria-label="Cuộn xuống"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gold/50 hover:text-gold transition-colors"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase">Khám phá</span>
        <span className="text-lg animate-bounce">↓</span>
      </a>
    </section>
  );
}
