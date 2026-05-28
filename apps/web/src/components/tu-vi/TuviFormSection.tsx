'use client';

import { Dispatch, SetStateAction } from 'react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { ScrollFrame } from '@/components/ui/ScrollFrame';
import { GoldButton } from '@/components/ui/GoldButton';
import { formatVnd } from '@/lib/money';

const SERIF = "'Cormorant Garamond',serif";

const CHI_TV = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

// Parchment-context input base class
const INPUT = 'w-full h-11 px-4 rounded-xl border border-parchment-deep/50 bg-parchment/80 text-parchment-ink placeholder:text-parchment-deep/60 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition text-[14px]';
const INPUT_CENTER = INPUT + ' text-center';

type Gender = 'nam' | 'nu';
type Calendar = 'duong' | 'am';

export type TuviFormState = {
  name: string;
  year: string;
  month: string;
  day: string;
  hour: number;
  gender: Gender;
  calendar: Calendar;
  birthPlace: string;
};

interface Props {
  form: TuviFormState;
  setForm: Dispatch<SetStateAction<TuviFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  insufficient: { balance: number; required: number } | null;
  session: Session | null;
}

function FieldLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2" style={{ fontFamily: SERIF }}>
      <span className="text-[#5a3a1a] text-[15px]">{icon}</span>
      <span className="text-[13.5px] font-semibold text-parchment-ink">{children}</span>
    </div>
  );
}

function SegChoice<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`h-[60px] rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
              active
                ? 'border-gold bg-gradient-to-br from-[#f5e3c0] to-[#e9c98a] shadow-goldGlow'
                : 'border-parchment-deep/40 bg-parchment/70 hover:border-gold/60'
            }`}
          >
            <div className={`text-xl leading-none ${active ? 'text-[#5a3a1a]' : 'text-[#4a6c7a]'}`}>
              {o.icon}
            </div>
            <div className="text-[13px] font-semibold text-parchment-ink">{o.label}</div>
          </button>
        );
      })}
    </div>
  );
}

export function TuviFormSection({ form, setForm, onSubmit, loading, error, insufficient, session }: Props) {
  const up = (patch: Partial<TuviFormState>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <ScrollFrame title="✦ Tạo Lá Số Tử Vi" className="max-w-xl mx-auto">
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <FieldLabel icon="👤">Họ và tên</FieldLabel>
          <input value={form.name} onChange={(e) => up({ name: e.target.value })} placeholder="Nhập tên của bạn" className={INPUT} />
        </div>

        <div>
          <FieldLabel icon="📍">Nơi sinh (không bắt buộc)</FieldLabel>
          <input value={form.birthPlace} onChange={(e) => up({ birthPlace: e.target.value })} placeholder="VD: TP. Hồ Chí Minh" className={INPUT} />
        </div>

        <div>
          <FieldLabel icon="⚥">Giới tính</FieldLabel>
          <SegChoice<Gender> value={form.gender} onChange={(v) => up({ gender: v })} options={[
            { value: 'nam', label: 'Nam', icon: '♂' },
            { value: 'nu', label: 'Nữ', icon: '♀' },
          ]} />
        </div>

        <div>
          <FieldLabel icon="🗓">Loại lịch</FieldLabel>
          <SegChoice<Calendar> value={form.calendar} onChange={(v) => up({ calendar: v })} options={[
            { value: 'duong', label: 'Dương lịch', icon: '☀' },
            { value: 'am', label: 'Âm lịch', icon: '☾' },
          ]} />
        </div>

        <div>
          <FieldLabel icon="📅">Ngày / Tháng / Năm & Giờ sinh</FieldLabel>
          <div className="grid grid-cols-3 sm:grid-cols-[1fr_1fr_1fr_1.6fr] gap-2.5">
            <input type="number" min="1" max="31" value={form.day} onChange={(e) => up({ day: e.target.value })} placeholder="Ngày" className={INPUT_CENTER} />
            <input type="number" min="1" max="12" value={form.month} onChange={(e) => up({ month: e.target.value })} placeholder="Tháng" className={INPUT_CENTER} />
            <input type="number" min="1900" max="2100" value={form.year} onChange={(e) => up({ year: e.target.value })} placeholder="Năm" className={INPUT_CENTER + ' border-gold/60'} />
            <select
              value={form.hour}
              onChange={(e) => up({ hour: +e.target.value })}
              className={`col-span-3 sm:col-span-1 h-11 px-4 rounded-xl border border-parchment-deep/50 bg-parchment/80 text-parchment-ink focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition appearance-none`}
              style={{
                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='none' stroke='%235a3a1a' stroke-width='1.5' d='M1 1.5l5 5 5-5'/></svg>\")",
                backgroundPosition: 'right 14px center',
                backgroundRepeat: 'no-repeat',
                paddingRight: '36px',
              }}
            >
              {CHI_TV.map((c, i) => {
                const s = String((23 + i * 2) % 24).padStart(2, '0');
                const e2 = String((1 + i * 2) % 24).padStart(2, '0');
                return <option key={i} value={i}>Giờ {c} ({s}:00 – {e2}:00)</option>;
              })}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-[#c8361d]/40 bg-[#c8361d]/10 px-4 py-3 text-[#c8361d] text-[13px]">⚠ {error}</div>
        )}

        {insufficient && (
          <div className="rounded-xl border border-gold/55 bg-[#f5e3c0]/50 px-4 py-3 text-parchment-ink text-[13px] space-y-2">
            <div>⚠ <strong>Số dư không đủ.</strong> Cần <strong>{formatVnd(insufficient.required)}</strong>, bạn còn <strong>{formatVnd(insufficient.balance)}</strong>.</div>
            <Link href="/vi-cua-toi" className="inline-block px-4 py-1.5 rounded-full bg-[#5a3a1a] text-parchment text-[12px] font-semibold hover:bg-[#4a6c7a]">
              Nạp tiền vào ví →
            </Link>
          </div>
        )}

        <div className="rounded-xl border border-gold/40 bg-parchment/60 px-4 py-3 text-[12.5px] text-parchment-ink flex items-center justify-between flex-wrap gap-2">
          <span>Phí: <strong>{formatVnd(5_000)}</strong> / lần lập lá số</span>
          <span className="font-serif italic text-[#5a3a1a] text-lg" style={{ fontFamily: SERIF }}>{formatVnd(5_000)}/lần</span>
        </div>

        <GoldButton type="submit" loading={loading} size="lg" className="w-full justify-center">
          <span className="mr-2">✦</span>
          {session?.user ? 'Lập Lá Số Tử Vi' : 'Đăng nhập để lập lá số'}
        </GoldButton>
      </form>
    </ScrollFrame>
  );
}
