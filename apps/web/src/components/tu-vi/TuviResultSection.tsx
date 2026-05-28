'use client';

import dynamic from 'next/dynamic';
import type { AnalysisSections, ChartData, DeepReadingsData } from '@tuvi/core';
import { MysticCard } from '@/components/ui/MysticCard';
import DeepReadings, { BasicInfo } from './DeepReadings';
import VietnameseCenter from './VietnameseCenter';
import '@/styles/iztrolabe-overrides.css';
import '@/styles/iztrolabe-dark.css';

const Iztrolabe = dynamic(
  () => import('react-iztro').then((m) => ({ default: m.Iztrolabe })),
  { ssr: false },
);

const SERIF = "'Cormorant Garamond',serif";

type FormState = {
  name: string;
  year: string;
  month: string;
  day: string;
  hour: number;
  gender: 'nam' | 'nu';
  calendar: 'duong' | 'am';
  birthPlace: string;
};

type IztroSnap = {
  birthday: string;
  birthTime: number;
  gender: 'male' | 'female';
  birthdayType: 'solar' | 'lunar';
};

interface Props {
  chart: ChartData;
  iztroSnap: IztroSnap;
  form: FormState;
  analysis: AnalysisSections | null;
  deep: DeepReadingsData | null;
  aiLoading: boolean;
  deepLoading: boolean;
  aiError: string | null;
  deepError: string | null;
}

function pad2(n: number) { return String(n).padStart(2, '0'); }

export function TuviResultSection({ chart, iztroSnap, form, analysis, deep, aiLoading, deepLoading, aiError, deepError }: Props) {
  const [bd, bm, by] = chart.info.birthDate.split('/').map(Number);

  return (
    <section className="mt-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-[11px] tracking-[0.4em] text-gold/80 uppercase">紫 微 斗 數 · Tử Vi Đẩu Số</div>
          <h2 className="mt-2 text-4xl font-serif italic text-gold-light" style={{ fontFamily: SERIF }}>
            Lá số {chart.info.name}
          </h2>
        </div>

        {/* Basic info */}
        <MysticCard tone="east" hover={false}>
          <div className="p-6 md:p-8">
            <BasicInfo chart={chart} form={form} />
          </div>
        </MysticCard>

        {/* Iztrolabe chart */}
        <MysticCard tone="neutral" hover={false}>
          <div className="p-3 md:p-5 overflow-x-auto">
            <div className="min-w-[860px] relative">
              <Iztrolabe
                birthday={iztroSnap.birthday}
                birthTime={iztroSnap.birthTime}
                gender={iztroSnap.gender}
                birthdayType={iztroSnap.birthdayType}
                lang="vi-VN"
                width="100%"
                centerPalaceAlign
              />
              <VietnameseCenter chart={chart} />
            </div>
          </div>
        </MysticCard>

        {/* Deep readings */}
        <MysticCard tone="east" hover={false}>
          <div className="p-1">
            <DeepReadings
              chart={chart}
              form={form}
              deep={deep}
              deepLoading={deepLoading}
              deepError={deepError}
              analysis={analysis}
              analysisLoading={aiLoading}
              analysisError={aiError}
            />
          </div>
        </MysticCard>
      </div>
    </section>
  );
}
