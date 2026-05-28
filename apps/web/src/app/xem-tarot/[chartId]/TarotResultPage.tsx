'use client';

/**
 * TarotResultPage — loads a saved tarot chart from /api/tarot/:chartId
 * and renders it on dark cosmic bg (history / permalink view).
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCardByIdOrThrow, getImageUrl, type DrawnCard, type TarotCard } from '@tuvi/tarot';
import { toast } from '@/components/ui/toast';
import { MysticCard } from '@/components/ui/MysticCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { GoldText } from '@/components/ui/GoldText';
import { CosmicBg } from '@/components/CosmicBg';
import { CardFace, PositionChip, CardNameLabel } from '@/components/tarot/CardFace';

const SERIF = "'Cormorant Garamond',serif";

type Field = 'love' | 'career' | 'finance' | 'health' | 'general';
const FIELD_LABEL: Record<Field, string> = {
  love: 'Tình duyên', career: 'Sự nghiệp', finance: 'Tài chính',
  health: 'Sức khỏe', general: 'Tổng quát',
};

interface PerCardReading { cardId: string; reversed: boolean; position: string; paragraph: string; }
interface TarotApiResponse {
  ok: true; chartId: string; cards: DrawnCard[]; field: Field;
  numCards: 1 | 3 | 5 | 7 | 10; question: string | null; name: string;
  gender: 'male' | 'female';
  reading: { intro: string; perCard: PerCardReading[]; overall: string; answer: string | null; };
}

function spreadGridClass(n: number): string {
  if (n === 1) return 'grid-cols-1 max-w-[180px]';
  if (n === 3) return 'grid-cols-3';
  if (n === 5) return 'grid-cols-2 md:grid-cols-5';
  if (n === 7) return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-7';
  return 'grid-cols-2 sm:grid-cols-5';
}

export default function TarotResultPage({ chartId }: { chartId: string }) {
  const router = useRouter();
  const [data, setData] = useState<TarotApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    setLoading(true);
    setError(null);
    fetch(`/api/tarot/${encodeURIComponent(chartId)}`)
      .then(async (res) => {
        const body = await res.json();
        if (aborted) return;
        if (res.status === 401) { router.push(`/dang-nhap?callbackUrl=${encodeURIComponent(`/xem-tarot/${chartId}`)}`); return; }
        if (res.status === 404) { setError('Không tìm thấy trải bài (hoặc không thuộc tài khoản của bạn).'); return; }
        if (!res.ok || !body?.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
        setData(body as TarotApiResponse);
      })
      .catch((e: Error) => {
        if (aborted) return;
        setError(e.message);
        toast.error(`Lỗi: ${e.message}`);
      })
      .finally(() => { if (!aborted) setLoading(false); });
    return () => { aborted = true; };
  }, [chartId, router]);

  return (
    <div className="relative min-h-screen text-[#e9d4b6]">
      <CosmicBg intensity="low" />
      <div className="relative z-10 px-4 py-10 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-[12px] text-[#b8a47c] mb-5">
          <Link href="/" className="hover:text-[#c89146] transition">Trang chủ</Link>
          <span className="mx-2 text-[#c89146]">›</span>
          <Link href="/lich-su" className="hover:text-[#c89146] transition">Lịch sử</Link>
          <span className="mx-2 text-[#c89146]">›</span>
          <span className="text-[#e9d4b6] font-medium">Tarot</span>
        </div>

        {loading && (
          <MysticCard tone="neutral" hover={false} className="p-10 text-center">
            <span className="inline-flex items-center gap-2 text-[#b8a47c]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#c89146] animate-pulse" />
              Đang tải trải bài…
            </span>
          </MysticCard>
        )}

        {error && (
          <MysticCard tone="neutral" hover={false} className="p-6 border-[#c8361d]/40">
            <p className="text-[#c8361d]">⚠ {error}</p>
            <div className="mt-4">
              <Link href="/xem-tarot">
                <GoldButton size="sm">Rút trải bài mới →</GoldButton>
              </Link>
            </div>
          </MysticCard>
        )}

        {data && <ResultDisplay data={data} />}
      </div>
    </div>
  );
}

function ResultDisplay({ data }: { data: TarotApiResponse }) {
  const { reading, cards, field, question, numCards } = data;
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
      </MysticCard>

      {/* Spread grid */}
      <MysticCard tone="west" hover={false} className="p-5 md:p-7">
        <div className={`grid gap-3 md:gap-4 justify-items-center mx-auto ${spreadGridClass(numCards)}`}>
          {cards.map((drawn, i) => {
            const card = getCardByIdOrThrow(drawn.cardId);
            const position = reading.perCard[i]?.position ?? `Vị trí ${i + 1}`;
            return (
              <div key={`${drawn.cardId}-${i}`} className="flex flex-col items-center">
                <CardFace card={card} reversed={drawn.reversed} className="w-[100px] h-[164px] md:w-[120px] md:h-[196px]" />
                <PositionChip label={position} idx={i} />
                <CardNameLabel card={card} reversed={drawn.reversed} />
              </div>
            );
          })}
        </div>
      </MysticCard>

      {/* Intro */}
      <MysticCard tone="neutral" hover={false} className="p-5 md:p-7">
        <p className="text-[16px] italic leading-[1.8] text-[#e9d4b6]" style={{ fontFamily: SERIF }}>{reading.intro}</p>
      </MysticCard>

      {/* Per-card */}
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
        <GoldText as="h3" className="text-[18px] font-serif italic block border-b border-[#c89146]/30 pb-2 mb-3" style={{ fontFamily: SERIF }}>
          Tổng luận
        </GoldText>
        <p className="text-[14px] leading-[1.85] text-[#d4c8b4] whitespace-pre-wrap">{reading.overall}</p>
      </MysticCard>

      {reading.answer && (
        <MysticCard tone="neutral" hover={false} className="p-5 md:p-7">
          <GoldText as="h3" className="text-[18px] font-serif italic block border-b border-[#c89146]/30 pb-2 mb-3" style={{ fontFamily: SERIF }}>
            Dành riêng cho bạn
          </GoldText>
          <p className="text-[14px] leading-[1.85] text-[#d4c8b4] whitespace-pre-wrap">{reading.answer}</p>
        </MysticCard>
      )}

      <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
        <Link href="/xem-tarot"><GoldButton size="md">↻ Rút trải bài mới</GoldButton></Link>
        <Link href="/lich-su"><GoldButton variant="outline" size="md">← Lịch sử</GoldButton></Link>
      </div>
    </div>
  );
}
