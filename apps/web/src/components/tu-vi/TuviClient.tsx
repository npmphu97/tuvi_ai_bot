'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { solarToLunar } from '@tuvi/lichvannien';
import type { AnalysisSections, ChartData, DeepReadingsData } from '@tuvi/core';
import { formatVnd } from '@/lib/money';
import { emitOptimisticBalance } from '@/lib/wallet-sse';
import { trackPurchase } from '@/lib/track-purchase';
import { CosmicBg } from '@/components/CosmicBg';
import { GoldText } from '@/components/ui/GoldText';
import { toast } from '@/components/ui/toast';
import { TuviFormSection, type TuviFormState } from './TuviFormSection';
import { TuviResultSection } from './TuviResultSection';

const SERIF = "'Cormorant Garamond',serif";

type IztroSnap = { birthday: string; birthTime: number; gender: 'male' | 'female'; birthdayType: 'solar' | 'lunar' };

function pad2(n: number) { return String(n).padStart(2, '0'); }

function lunarToSolar(ld: number, lm: number, ly: number) {
  const base = new Date(ly, lm - 1, ld);
  if (Number.isNaN(base.getTime())) return null;
  for (let off = -10; off <= 60; off++) {
    const t = new Date(base); t.setDate(base.getDate() + off);
    const ts = solarToLunar(t.getDate(), t.getMonth() + 1, t.getFullYear());
    if (ts.day === ld && ts.month === lm && ts.year === ly && ts.leap === 0)
      return { d: t.getDate(), m: t.getMonth() + 1, y: t.getFullYear() };
  }
  return null;
}

export default function TuviClient() {
  const { data: session } = useSession();
  const router = useRouter();

  const [form, setForm] = useState<TuviFormState>({
    name: '', year: '', month: '', day: '', hour: 6, gender: 'nam', calendar: 'duong', birthPlace: '',
  });
  const [chart, setChart] = useState<ChartData | null>(null);
  const [iztroSnap, setIztroSnap] = useState<IztroSnap | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisSections | null>(null);
  const [deep, setDeep] = useState<DeepReadingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [deepLoading, setDeepLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [deepError, setDeepError] = useState<string | null>(null);
  const [insufficient, setInsufficient] = useState<{ balance: number; required: number } | null>(null);

  const fetchAnalysis = (chartId: string) => {
    setAiLoading(true); setAnalysis(null); setAiError(null);
    fetch(`/api/tuvi/${chartId}/analyze`, { method: 'POST' })
      .then(async (res) => { const d = await res.json(); if (!res.ok || !d?.ok) throw new Error(d?.error ?? `HTTP ${res.status}`); setAnalysis(d.analysis as AnalysisSections); toast.success('Luận giải Tử Vi xong'); })
      .catch((err: Error) => { setAiError(err.message); toast.error(`Lỗi luận Tử Vi: ${err.message}`); })
      .finally(() => setAiLoading(false));
  };

  const fetchDeep = (chartId: string) => {
    setDeepLoading(true); setDeep(null); setDeepError(null);
    fetch(`/api/tuvi/${chartId}/deep-readings`, { method: 'POST' })
      .then(async (res) => { const d = await res.json(); if (!res.ok || !d?.ok) throw new Error(d?.error ?? `HTTP ${res.status}`); setDeep(d.deep as DeepReadingsData); toast.success('Luận đại hạn + 12 cung xong'); })
      .catch((err: Error) => { setDeepError(err.message); toast.error(`Lỗi luận chi tiết: ${err.message}`); })
      .finally(() => setDeepLoading(false));
  };

  const generate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setAiError(null); setDeepError(null); setInsufficient(null);
    if (!session?.user) { router.push('/dang-nhap?callbackUrl=/xem-tu-vi'); return; }

    const name = form.name.trim();
    if (!name) { setError('Vui lòng nhập họ và tên.'); return; }
    const yi = +form.year, mi = +form.month, di = +form.day;
    if (!yi || !mi || !di) { setError('Vui lòng nhập đầy đủ Ngày / Tháng / Năm sinh.'); return; }
    if (yi < 1900 || yi > 2100) { setError('Năm sinh ngoài khoảng 1900–2100.'); return; }

    let y = yi, m = mi, d = di;
    if (form.calendar === 'am') {
      const solar = lunarToSolar(d, m, y);
      if (!solar) { setError('Không tìm được dương lịch tương ứng — kiểm tra lại ngày âm.'); return; }
      y = solar.y; m = solar.m; d = solar.d;
    }

    const info = { name, gender: (form.gender === 'nam' ? 'male' : 'female') as 'male' | 'female', birthDate: `${pad2(d)}/${pad2(m)}/${y}`, timeIndex: form.hour, birthPlace: form.birthPlace.trim() };
    setIztroSnap({ birthday: `${y}-${pad2(m)}-${pad2(d)}`, birthTime: info.timeIndex, gender: info.gender, birthdayType: 'solar' });

    setLoading(true); setChart(null); setAnalysis(null); setDeep(null);
    const PRICE = 5000;
    emitOptimisticBalance({ balanceVnd: Math.max(0, (session?.user?.balanceVnd ?? 0) - PRICE), delta: -PRICE, reason: 'charge', service: 'tu-vi' });

    try {
      const res = await fetch('/api/tuvi/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(info) });
      const data = await res.json();
      if (res.status === 402 && data?.code === 'INSUFFICIENT_BALANCE') {
        emitOptimisticBalance({ balanceVnd: Number(data.balanceVnd ?? 0), delta: 0, reason: 'charge', service: 'tu-vi' });
        setInsufficient({ balance: Number(data.balanceVnd ?? 0), required: Number(data.requiredVnd ?? 5000) });
        setIztroSnap(null); toast.error('Số dư không đủ — nạp thêm để lập lá số'); return;
      }
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      setChart(data.chart as ChartData);
      if (typeof data.balanceVnd === 'number') emitOptimisticBalance({ balanceVnd: data.balanceVnd, delta: -(data.chargedVnd ?? PRICE), reason: 'charge', service: 'tu-vi' });
      trackPurchase('tu-vi', data.chartId as string);
      toast.success(typeof data.chargedVnd === 'number' ? `Đã lập lá số — trừ ${formatVnd(data.chargedVnd)}, còn ${formatVnd(data.balanceVnd ?? 0)}` : 'Đã lập lá số Tử Vi');
      fetchAnalysis(data.chartId as string);
      fetchDeep(data.chartId as string);
    } catch (err) {
      const msg = (err as Error).message;
      setError(`Không lập được lá số: ${msg}`); toast.error(`Lập lá số thất bại: ${msg}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen">
      <CosmicBg intensity="low" />

      {/* Hero */}
      <section className="pt-14 pb-8 px-6 text-center">
        <Link href="/" className="inline-block text-[11px] tracking-[0.3em] text-gold/70 hover:text-gold uppercase mb-4">← Trang chủ</Link>
        <div className="text-[11px] tracking-[0.45em] uppercase text-gold/60 mb-3">紫 微 斗 數 · Tử Vi Đẩu Số</div>
        <GoldText as="h1" className="mb-3 font-serif text-[clamp(48px,7vw,90px)] leading-[0.95] block">Xem Tử Vi</GoldText>
        <p className="max-w-xl mx-auto text-gold-light/70 text-[15px]">
          Lập lá số tử vi 14 chính tinh — luận giải 12 cung, sự nghiệp, tình duyên, tài lộc.
        </p>
      </section>

      {/* Form in ScrollFrame */}
      <section className="px-4 md:px-6">
        <TuviFormSection form={form} setForm={setForm} onSubmit={generate} loading={loading} error={error} insufficient={insufficient} session={session} />
      </section>

      {/* Quote when no chart */}
      {!chart && !loading && (
        <section className="px-6 py-16 text-center">
          <p className="font-serif italic text-gold-light/50 text-xl max-w-xl mx-auto" style={{ fontFamily: SERIF }}>
            &quot;Số mệnh là một cuốn sách viết bằng sao trời — tử vi giúp ta đọc được vài dòng đầu.&quot;
          </p>
        </section>
      )}

      {/* Result */}
      {chart && iztroSnap && (
        <TuviResultSection
          chart={chart} iztroSnap={iztroSnap} form={form}
          analysis={analysis} deep={deep}
          aiLoading={aiLoading} deepLoading={deepLoading}
          aiError={aiError} deepError={deepError}
        />
      )}
    </div>
  );
}
