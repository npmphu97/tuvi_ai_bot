import Link from 'next/link';
import { GoldButton } from '@/components/ui/GoldButton';
import { GoldText } from '@/components/ui/GoldText';
import { SunMoon } from '@/components/emblems/SunMoon';

/**
 * CtaFooter — UNIFIED. Full-width cosmic solid section with radial gold glow.
 * "Hôm nay xem được gì?" + big GoldButton CTA.
 */
export function CtaFooter() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden py-24 px-6 text-center bg-cosmic-DEFAULT"
    >
      {/* Radial glow layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(200,145,70,0.14) 0%, transparent 65%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 40% 40% at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 55%)',
        }}
      />

      {/* Constellation faint lines */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.05]"
        viewBox="0 0 1200 500"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <circle cx="150" cy="100" r="2" fill="#c89146" />
        <circle cx="350" cy="220" r="2" fill="#c89146" />
        <circle cx="600" cy="80" r="2" fill="#c89146" />
        <circle cx="850" cy="200" r="2" fill="#c89146" />
        <circle cx="1050" cy="120" r="2" fill="#c89146" />
        <polyline points="150,100 350,220 600,80 850,200 1050,120" stroke="#c89146" strokeWidth="0.8" />
        <circle cx="250" cy="400" r="2" fill="#c89146" />
        <circle cx="500" cy="350" r="2" fill="#c89146" />
        <circle cx="750" cy="420" r="2" fill="#c89146" />
        <circle cx="950" cy="380" r="2" fill="#c89146" />
        <polyline points="250,400 500,350 750,420 950,380" stroke="#c89146" strokeWidth="0.8" />
      </svg>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* SunMoon emblem */}
        <div
          className="inline-flex items-center justify-center"
          style={{ filter: 'drop-shadow(0 0 16px rgba(212,175,55,0.5))' }}
        >
          <SunMoon size={72} />
        </div>

        {/* Headline */}
        <h2
          className="mt-6 text-[clamp(32px,5vw,64px)] font-serif leading-[0.95]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          <span className="text-parchment">Hôm nay</span>{' '}
          <GoldText>xem được gì?</GoldText>
        </h2>

        {/* Sub */}
        <p className="mt-5 text-parchment/60 text-[16px] leading-relaxed max-w-lg mx-auto">
          Từ lá số Tử Vi đến Tarot, từ ngày tốt đến Tứ Trụ — mọi câu hỏi về vận
          mệnh đều có câu trả lời tại đây.
        </p>

        {/* CTA group */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/xem-tu-vi">
            <GoldButton size="lg" variant="primary">
              Bắt đầu ngay
            </GoldButton>
          </Link>
          <Link href="/xem-tarot">
            <GoldButton size="lg" variant="outline">
              Rút bài Tarot
            </GoldButton>
          </Link>
        </div>

        {/* Tagline */}
        <p className="mt-8 text-[11px] tracking-[0.35em] uppercase text-gold/35">
          運 命 · Vận Mệnh · Destiny
        </p>
      </div>
    </section>
  );
}
