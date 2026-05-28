'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type {
  AnalysisSections,
  ChartData,
  DeepReadingsData,
} from '@tuvi/core';
import DeepReadings, { BasicInfo } from './DeepReadings';
import VietnameseCenter from './VietnameseCenter';
import { MysticCard } from '@/components/ui/MysticCard';
import { GoldText } from '@/components/ui/GoldText';
import { CosmicBg } from '@/components/CosmicBg';
import { toast } from '@/components/ui/toast';
import '@/styles/iztrolabe-overrides.css';
import '@/styles/iztrolabe-dark.css';

const Iztrolabe = dynamic(
  () => import('react-iztro').then((m) => ({ default: m.Iztrolabe })),
  { ssr: false },
);

const SERIF_FONT = "'Cormorant Garamond',serif";

type FormState = {
  name: string;
  year: string;
  month: string;
  day: string;
  hour: number;
  gender: 'nam' | 'nu';
  calendar: 'duong' | 'am';
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formStateFromChart(chart: ChartData, name: string, lunarMode: boolean): FormState {
  const [d, m, y] = chart.info.birthDate.split('/').map(Number);
  return {
    name,
    year: String(y),
    month: String(m),
    day: String(d),
    hour: chart.info.timeIndex,
    gender: chart.info.gender === 'male' ? 'nam' : 'nu',
    calendar: lunarMode ? 'am' : 'duong',
  };
}

export default function ChartDetailClient({
  chartId,
  chart,
  initialAnalysis,
  initialDeep,
  lunarMode,
  createdAt,
}: {
  chartId: string;
  chart: ChartData;
  initialAnalysis: AnalysisSections | null;
  initialDeep: DeepReadingsData | null;
  lunarMode: boolean;
  createdAt: string;
}) {
  const [analysis, setAnalysis] = useState<AnalysisSections | null>(initialAnalysis);
  const [deep, setDeep] = useState<DeepReadingsData | null>(initialDeep);
  const [aiLoading, setAiLoading] = useState(false);
  const [deepLoading, setDeepLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [deepError, setDeepError] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const form = formStateFromChart(chart, chart.info.name, lunarMode);

  const [bd, bm, by] = chart.info.birthDate.split('/').map(Number);
  const iztroSnap = {
    birthday: `${by}-${pad2(bm)}-${pad2(bd)}`,
    birthTime: chart.info.timeIndex,
    gender: chart.info.gender,
    birthdayType: 'solar' as const,
  };

  useEffect(() => {
    if (!analysis && !aiLoading) {
      setAiLoading(true);
      fetch(`/api/tuvi/${chartId}/analyze`, { method: 'POST' })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok || !data?.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
          setAnalysis(data.analysis as AnalysisSections);
          toast.success('Luận giải Tử Vi xong');
        })
        .catch((err: Error) => {
          setAiError(err.message);
          toast.error(`Lỗi luận Tử Vi: ${err.message}`);
        })
        .finally(() => setAiLoading(false));
    }
    if (!deep && !deepLoading) {
      setDeepLoading(true);
      fetch(`/api/tuvi/${chartId}/deep-readings`, { method: 'POST' })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok || !data?.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
          setDeep(data.deep as DeepReadingsData);
          toast.success('Luận đại hạn + 12 cung xong');
        })
        .catch((err: Error) => {
          setDeepError(err.message);
          toast.error(`Lỗi luận chi tiết: ${err.message}`);
        })
        .finally(() => setDeepLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId]);

  const downloadPdf = async () => {
    setPdfBusy(true);
    setPdfError(null);
    try {
      const res = await fetch(`/api/tuvi/${chartId}/pdf`);
      if (!res.ok) {
        const text = await res.text();
        let msg = `HTTP ${res.status}`;
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `la-so-${chart.info.name.replace(/\s+/g, '-')}-${by}${pad2(bm)}${pad2(bd)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setPdfError((e as Error).message);
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <CosmicBg intensity="low" />
      <section className="pt-12 pb-4 px-6 text-center">
        <Link href="/lich-su" className="inline-block text-[11px] tracking-[0.3em] text-gold/70 hover:text-gold uppercase">← Lịch sử của tôi</Link>
        <GoldText as="h1" className="mt-3 font-serif leading-[0.95] text-[clamp(40px,6vw,80px)] block">
          Lá số {chart.info.name}
        </GoldText>
        <p className="mt-3 text-[13px] text-gold-light/60">
          Lập ngày{' '}
          {new Date(createdAt).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={downloadPdf}
            disabled={pdfBusy || !analysis}
            title={!analysis ? 'Đang chờ luận giải xong mới tải được PDF' : 'Tải bản PDF'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-metal text-cosmic-DEFAULT font-semibold text-[13.5px] hover:brightness-110 transition shadow-goldGlow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>📄</span>
            <span>{pdfBusy ? 'Đang tạo PDF…' : 'Tải PDF'}</span>
          </button>
          <Link href="/xem-tu-vi" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/40 text-gold-light font-semibold text-[13.5px] hover:border-gold transition">
            ↻ Lập lá số khác
          </Link>
        </div>
        {pdfError && (
          <div className="mt-3 inline-block rounded-xl border border-[#c8361d]/40 bg-[#c8361d]/10 px-4 py-2 text-[#c8361d] text-[13px]">⚠ {pdfError}</div>
        )}
      </section>

      <section className="mt-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center">
            <div className="text-[11px] tracking-[0.4em] text-gold/70 uppercase">紫 微 斗 數 · Tử Vi Đẩu Số</div>
          </div>

          <MysticCard tone="east" hover={false}>
            <div className="p-6 md:p-8"><BasicInfo chart={chart} form={form} /></div>
          </MysticCard>

          <MysticCard tone="neutral" hover={false}>
            <div className="p-3 md:p-5 overflow-x-auto">
              <div className="min-w-[860px] relative">
                <Iztrolabe
                  birthday={iztroSnap.birthday} birthTime={iztroSnap.birthTime}
                  gender={iztroSnap.gender} birthdayType={iztroSnap.birthdayType}
                  lang="vi-VN" width="100%" centerPalaceAlign
                />
                <VietnameseCenter chart={chart} />
              </div>
            </div>
          </MysticCard>

          <MysticCard tone="east" hover={false}>
            <div className="p-1">
              <DeepReadings chart={chart} form={form} deep={deep} deepLoading={deepLoading} deepError={deepError} analysis={analysis} analysisLoading={aiLoading} analysisError={aiError} />
            </div>
          </MysticCard>
        </div>
      </section>
    </div>
  );
}
