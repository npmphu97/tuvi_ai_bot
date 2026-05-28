'use client';

/**
 * TarotClient — main orchestration shell for the /xem-tarot flow.
 * Steps: form → pick → submitting → result.
 * Business logic (78-card deck, AI submit, payment) unchanged.
 * UI: dark cosmic + gold casino style via CosmicBg + primitive components.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { TAROT_DECK, getCardByIdOrThrow, type DrawnCard, type TarotCard } from '@tuvi/tarot';
import { toast } from '@/components/ui/toast';
import { GoldText } from '@/components/ui/GoldText';
import { MysticCard } from '@/components/ui/MysticCard';
import { CosmicBg } from '@/components/CosmicBg';
import { formatVnd } from '@/lib/money';
import { subscribeWallet, emitOptimisticBalance } from '@/lib/wallet-sse';
import { trackPurchase } from '@/lib/track-purchase';
import { TarotIntake, type NumCards, type Field, type Gender } from '@/components/tarot/TarotIntake';
import { TarotDeck, DEAL_TOTAL_MS } from '@/components/tarot/TarotDeck';
import { TarotResult } from '@/components/tarot/TarotResult';
import { CardFace } from '@/components/tarot/CardFace';

const SERIF = "'Cormorant Garamond',serif";

// Fisher-Yates shuffle on copy
function shuffleDeck(deck: TarotCard[]): TarotCard[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface TarotApiResponse {
  ok: true;
  chartId: string;
  cards: DrawnCard[];
  field: Field;
  numCards: NumCards;
  question: string | null;
  name: string;
  gender: Gender;
  chargedVnd?: number;
  balanceVnd?: number;
  reading: {
    intro: string;
    perCard: { cardId: string; reversed: boolean; position: string; paragraph: string }[];
    overall: string;
    answer: string | null;
  };
}

type Step = 'form' | 'pick' | 'submitting' | 'result';

export default function TarotClient() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [step, setStep] = useState<Step>('form');

  // Form state
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [field, setField] = useState<Field>('general');
  const [question, setQuestion] = useState('');
  const [numCards, setNumCards] = useState<NumCards>(3);

  // Pick state
  const [shuffleKey, setShuffleKey] = useState(0);
  const shuffledDeck = useMemo(() => shuffleDeck(TAROT_DECK), [shuffleKey]);
  const [chosen, setChosen] = useState<DrawnCard[]>([]);

  // Submit / result
  const [result, setResult] = useState<TarotApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [insufficient, setInsufficient] = useState<{ balance: number; required: number } | null>(null);
  const [liveCharge, setLiveCharge] = useState<{ delta: number; balanceVnd: number } | null>(null);

  useEffect(() => {
    const unsub = subscribeWallet((event, data) => {
      if (event === 'balance' && data.reason === 'charge' && data.service === 'tarot') {
        setLiveCharge({ delta: data.delta, balanceVnd: data.balanceVnd });
      }
    });
    return unsub;
  }, []);

  useEffect(() => { setChosen([]); }, [shuffleKey]);

  // Auto-submit when enough cards picked
  useEffect(() => {
    if (step === 'pick' && chosen.length === numCards) {
      const t = setTimeout(() => void submitReading(chosen), 1200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen, numCards, step]);

  function goToPick() {
    if (!name.trim()) {
      toast.error('Vui lòng nhập họ tên trước khi bắt đầu rút bài');
      return;
    }
    if (status !== 'authenticated') {
      router.push('/dang-nhap?callbackUrl=/xem-tarot');
      return;
    }
    setShuffleKey((k) => k + 1);
    setChosen([]);
    setError(null);
    setInsufficient(null);
    setStep('pick');
  }

  const handlePick = useCallback((card: TarotCard) => {
    setChosen((prev) => {
      if (prev.length >= numCards || prev.some((c) => c.cardId === card.id)) return prev;
      return [...prev, { cardId: card.id, reversed: Math.random() < 0.5 }];
    });
  }, [numCards]);

  function handleReshuffle() {
    setShuffleKey((k) => k + 1);
    toast.info('Đã tráo lại bộ bài');
  }

  function handleUndoLast() {
    setChosen((prev) => prev.slice(0, -1));
  }

  async function submitReading(cards: DrawnCard[]) {
    setStep('submitting');
    setError(null);

    // Optimistic balance drop
    const PRICE = 5000;
    emitOptimisticBalance({
      balanceVnd: Math.max(0, (session?.user?.balanceVnd ?? 0) - PRICE),
      delta: -PRICE,
      reason: 'charge',
      service: 'tarot',
    });

    try {
      const res = await fetch('/api/tarot/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), gender, field, question: question.trim() || null, numCards, cards }),
      });
      const body = (await res.json()) as Record<string, unknown>;
      if (res.status === 401) { router.push('/dang-nhap?callbackUrl=/xem-tarot'); return; }
      if (res.status === 402 && body?.code === 'INSUFFICIENT_BALANCE') {
        emitOptimisticBalance({ balanceVnd: Number(body.balanceVnd ?? 0), delta: 0, reason: 'charge', service: 'tarot' });
        setLiveCharge(null);
        setInsufficient({ balance: Number(body.balanceVnd ?? 0), required: Number(body.requiredVnd ?? 5000) });
        setStep('form');
        toast.error('Số dư không đủ — nạp thêm để xem Tarot');
        return;
      }
      if (!res.ok || !body?.ok) {
        setLiveCharge(null);
        throw new Error((body?.error as string) ?? `HTTP ${res.status}`);
      }
      setResult(body as unknown as TarotApiResponse);
      setStep('result');
      trackPurchase('tarot', body.chartId as string);
      if (typeof body.balanceVnd === 'number') {
        emitOptimisticBalance({ balanceVnd: Number(body.balanceVnd), delta: -Number(body.chargedVnd ?? PRICE), reason: 'charge', service: 'tarot' });
      }
      toast.success(
        typeof body.chargedVnd === 'number'
          ? `Luận giải xong — trừ ${formatVnd(body.chargedVnd as number)}, còn ${formatVnd(Number(body.balanceVnd ?? 0))}`
          : 'Luận giải Tarot xong',
      );
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      setStep('pick');
      toast.error(`Lỗi luận giải: ${msg}`);
    }
  }

  function startOver() {
    setResult(null);
    setError(null);
    setChosen([]);
    setShuffleKey((k) => k + 1);
    setStep('form');
    setLiveCharge(null);
  }

  return (
    <div className="relative min-h-screen text-[#e9d4b6]">
      {/* Dark cosmic background */}
      <CosmicBg intensity="med" />

      {/* Hero */}
      <section className="pt-10 pb-6 px-6 text-center relative z-10">
        <Link href="/" className="inline-block text-[11px] tracking-[0.3em] text-[#b8a47c] hover:text-[#c89146] uppercase transition">
          ← Trang chủ
        </Link>
        <div className="mt-3 inline-flex items-center gap-3 text-[11px] tracking-[0.4em] uppercase text-[#b8a47c]">
          <span className="w-8 h-px bg-[#c89146]/40" />
          78 Lá · Rider-Waite-Smith
          <span className="w-8 h-px bg-[#c89146]/40" />
        </div>
        <h1 className="mt-3 font-serif leading-[0.95] text-[clamp(44px,6.5vw,88px)]" style={{ fontFamily: SERIF }}>
          <GoldText>🔮 LUẬN TAROT</GoldText>
        </h1>
        <p className="mt-3 max-w-lg mx-auto text-[14px] text-[#b8a47c]">
          Chọn lá theo trực giác. Khi đủ, hệ thống sẽ luận giải theo bối cảnh của bạn.
        </p>
      </section>

      {/* Step content */}
      <div className="relative z-10 px-4 pb-20 max-w-5xl mx-auto">
        {step === 'form' && (
          <TarotIntake
            name={name} setName={setName}
            gender={gender} setGender={setGender}
            field={field} setField={setField}
            question={question} setQuestion={setQuestion}
            numCards={numCards} setNumCards={setNumCards}
            onStart={goToPick}
            authStatus={status}
            insufficient={insufficient}
          />
        )}

        {step === 'pick' && (
          <TarotDeck
            deck={shuffledDeck}
            chosen={chosen}
            numCards={numCards}
            onPick={handlePick}
            onReshuffle={handleReshuffle}
            onUndoLast={handleUndoLast}
            error={error}
            shuffleKey={shuffleKey}
          />
        )}

        {step === 'submitting' && (
          <SubmittingView chosen={chosen} liveCharge={liveCharge} />
        )}

        {step === 'result' && result && (
          <TarotResult result={result} onStartOver={startOver} />
        )}
      </div>
    </div>
  );
}

// ─── Submitting view ───────────────────────────────────────────────────────────

function SubmittingView({
  chosen,
  liveCharge,
}: {
  chosen: DrawnCard[];
  liveCharge: { delta: number; balanceVnd: number } | null;
}) {
  return (
    <MysticCard tone="neutral" hover={false} className="p-8 md:p-10 text-center">
      <div className="inline-flex items-center gap-3 text-[#e9d4b6]">
        <span className="inline-block w-3 h-3 rounded-full bg-[#c89146] animate-pulse" />
        <span className="text-[16px]">Đang luận giải trải bài…</span>
      </div>
      <p className="mt-3 text-[12.5px] text-[#b8a47c]">
        Hệ thống đang đọc {chosen.length} lá theo bối cảnh của bạn. Mất khoảng 15–30 giây.
      </p>
      {liveCharge && (
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14121a] border border-[#3a8a5e]/35 text-[12.5px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3a8a5e] animate-pulse" />
          <span className="text-[#5aaa7e] font-semibold tabular-nums">
            Đã trừ {formatVnd(Math.abs(liveCharge.delta))}
          </span>
          <span className="text-[#b8a47c] tabular-nums">
            · Số dư còn {formatVnd(liveCharge.balanceVnd)}
          </span>
        </div>
      )}
      <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
        {chosen.map((c, i) => {
          const card = getCardByIdOrThrow(c.cardId);
          return (
            <CardFace
              key={`${c.cardId}-${i}`}
              card={card}
              reversed={c.reversed}
              className="w-[56px] h-[88px] md:w-[64px] md:h-[100px] opacity-80"
            />
          );
        })}
      </div>
    </MysticCard>
  );
}
