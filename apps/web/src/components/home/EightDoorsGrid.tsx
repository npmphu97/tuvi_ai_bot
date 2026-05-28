import Link from 'next/link';
import { MysticCard } from '@/components/ui/MysticCard';
import { GoldText } from '@/components/ui/GoldText';
import { SERVICES } from '@/lib/home-data';

/**
 * EightDoorsGrid — EAST tone section. 8 services in 2-col/4-col grid.
 * Each card: chữ Hán glyph watermark, gold border, art preview via glyph.
 */
export function EightDoorsGrid() {
  return (
    <section id="services" className="relative py-20 px-6 bg-cosmic-panel">
      {/* Section header */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] tracking-[0.4em] text-gold/60 font-semibold uppercase">
            百 術 · Bách Thuật
          </div>
          <h2
            className="mt-3 text-[clamp(32px,5vw,56px)] font-serif leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            <GoldText>Tám cánh cửa</GoldText>{' '}
            <span className="text-parchment">Huyền Học</span>
          </h2>
          <p className="mt-3 text-parchment/60 text-[15px] max-w-xl mx-auto">
            Chọn môn huyền thuật phù hợp — mỗi cửa là một ngôn ngữ của vận mệnh
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {SERVICES.map((s, i) => {
            const cardInner = (
              <>
                {/* Index */}
                <div className="text-[10px] tracking-[0.35em] uppercase text-gold/50 font-semibold">
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Large glyph display */}
                <div
                  className="mt-3 text-[36px] sm:text-[44px] leading-none font-serif text-gold/70 transition-all duration-300 group-hover:text-gold group-hover:scale-105"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  aria-hidden
                >
                  {s.glyph}
                </div>

                {/* Title */}
                <h3
                  className="mt-3 text-[17px] sm:text-xl font-serif text-parchment leading-snug"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {s.title}
                </h3>

                {/* Sub */}
                <p className="mt-1.5 text-[12px] sm:text-[13px] text-parchment/55 leading-relaxed min-h-[2.5rem]">
                  {s.sub}
                </p>

                {/* Status badge / CTA */}
                {s.comingSoon ? (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold/60 text-[11px] font-semibold tracking-wide">
                    ⚙ Đang triển khai
                  </div>
                ) : (
                  <div className="mt-4 inline-flex items-center gap-1.5 text-gold text-[13px] group-hover:gap-3 transition-all">
                    Xem ngay <span>→</span>
                  </div>
                )}
              </>
            );

            if (s.comingSoon || !s.href) {
              return (
                <MysticCard
                  key={s.key}
                  tone="east"
                  hover={false}
                  className="p-5 sm:p-6 opacity-60 cursor-not-allowed"
                  aria-disabled="true"
                  title="Đang triển khai"
                >
                  {cardInner}
                </MysticCard>
              );
            }

            return (
              <Link key={s.key} href={s.href} className="group block">
                <MysticCard tone="east" className="p-5 sm:p-6 h-full">
                  {cardInner}
                </MysticCard>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
