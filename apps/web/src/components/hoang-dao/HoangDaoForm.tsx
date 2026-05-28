'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { getSignFromDate } from '@/lib/horoscope-lib';
import { formatVnd } from '@/lib/money';
import { MysticCard } from '@/components/ui/MysticCard';
import { GoldText } from '@/components/ui/GoldText';
import { GoldButton } from '@/components/ui/GoldButton';

type Gender = 'male' | 'female';
type Status = 'single' | 'dating' | 'married' | 'divorced';
type Goal = 'career' | 'love' | 'wealth' | 'health' | 'study' | 'family';

interface FormState {
  day: string;
  month: string;
  year: string;
  gender: Gender;
  status: Status;
  goal: Goal;
}

const STATUS_OPTIONS: { value: Status; label: string; icon: string }[] = [
  { value: 'single', label: 'Độc thân', icon: '✦' },
  { value: 'dating', label: 'Đang yêu', icon: '♡' },
  { value: 'married', label: 'Đã kết hôn', icon: '⚭' },
  { value: 'divorced', label: 'Ly hôn / Goá', icon: '◐' },
];

const GOAL_OPTIONS: { value: Goal; label: string; icon: string }[] = [
  { value: 'career', label: 'Sự nghiệp', icon: '⚔' },
  { value: 'love', label: 'Tình cảm', icon: '♥' },
  { value: 'wealth', label: 'Tài chính', icon: '◈' },
  { value: 'health', label: 'Sức khỏe', icon: '☯' },
  { value: 'study', label: 'Học hành', icon: '✎' },
  { value: 'family', label: 'Gia đình', icon: '⌂' },
];

function SegmentChoice<T extends string>({
  value,
  onChange,
  options,
  cols = 2,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon: string }[];
  cols?: 2 | 3;
}) {
  const gridCls = cols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2';
  return (
    <div className={`grid ${gridCls} gap-2.5`}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`h-[60px] rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
              active
                ? 'border-gold bg-gold/10'
                : 'border-gold/20 bg-cosmic-raised hover:border-gold/40'
            }`}
          >
            <div className={`text-xl leading-none ${active ? 'text-gold' : 'text-parchment/50'}`}>
              {o.icon}
            </div>
            <div className={`text-[12px] font-semibold ${active ? 'text-gold' : 'text-parchment/70'}`}>
              {o.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface HoangDaoFormProps {
  onSignChange: (signEn: string | null) => void;
}

const INPUT_CLS =
  'h-11 px-3 rounded-xl border border-gold/20 bg-cosmic-raised text-parchment text-center placeholder:text-parchment/30 focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/10 transition';

export function HoangDaoForm({ onSignChange }: HoangDaoFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [form, setForm] = useState<FormState>({
    day: '', month: '', year: '',
    gender: 'male', status: 'single', goal: 'career',
  });
  const [error, setError] = useState<string | null>(null);
  const [lowBalance, setLowBalance] = useState(false);

  const balance = session?.user?.balanceVnd ?? 0;
  const hasFunds = balance >= 5000;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLowBalance(false);
    const d = +form.day, m = +form.month, y = +form.year;
    if (!d || !m || !y) { setError('Vui lòng nhập đầy đủ Ngày / Tháng / Năm sinh.'); return; }
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > new Date().getFullYear()) {
      setError('Ngày sinh không hợp lệ.'); return;
    }
    const sign = getSignFromDate(m, d);
    if (!sign) { setError('Không xác định được cung — kiểm tra lại ngày / tháng.'); return; }
    onSignChange(sign.en);
    if (!session?.user) {
      router.push(`/dang-nhap?callbackUrl=${encodeURIComponent('/hoang-dao')}`); return;
    }
    if (!hasFunds) { setLowBalance(true); return; }
    const qs = new URLSearchParams({ sign: sign.en, gender: form.gender, status: form.status, goal: form.goal }).toString();
    router.push(`/hoang-dao/luan-giai?${qs}`);
  };

  return (
    <section id="hoang-dao-form" className="relative px-6 pt-8 pb-12">
      <div className="max-w-2xl mx-auto">
        <MysticCard tone="west" hover={false} className="p-6 md:p-9">
          <div className="text-center mb-6">
            <div className="text-[11px] tracking-[0.35em] uppercase text-gold/50 font-semibold">Luận giải cá nhân</div>
            <h2 className="mt-2 text-3xl font-serif">
              <span className="text-parchment">Cung Hoàng Đạo </span>
              <GoldText as="em">của bạn</GoldText>
            </h2>
            <p className="mt-2 text-[13px] text-parchment/50">
              Nhập thông tin để hệ thống luận giải bám sát cung + bối cảnh hiện tại.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2 text-parchment/70">
                <span className="text-gold text-[14px]">📅</span>
                <span className="text-[13.5px] font-medium">Ngày / Tháng / Năm sinh (dương lịch)</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" min="1" max="31" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} placeholder="Ngày" className={INPUT_CLS} />
                <input type="number" min="1" max="12" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} placeholder="Tháng" className={INPUT_CLS} />
                <input type="number" min="1900" max="2100" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Năm" className={INPUT_CLS} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 text-parchment/70">
                <span className="text-gold text-[14px]">⚥</span>
                <span className="text-[13.5px] font-medium">Giới tính</span>
              </div>
              <SegmentChoice<Gender> value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={[{ value: 'male', label: 'Nam', icon: '♂' }, { value: 'female', label: 'Nữ', icon: '♀' }]} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 text-parchment/70">
                <span className="text-gold text-[14px]">♡</span>
                <span className="text-[13.5px] font-medium">Trạng thái tình cảm</span>
              </div>
              <SegmentChoice<Status> value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={STATUS_OPTIONS} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 text-parchment/70">
                <span className="text-gold text-[14px]">✦</span>
                <span className="text-[13.5px] font-medium">Mục tiêu quan tâm hiện tại</span>
              </div>
              <SegmentChoice<Goal> value={form.goal} onChange={(v) => setForm({ ...form, goal: v })} options={GOAL_OPTIONS} cols={3} />
            </div>
            {error && (
              <div className="rounded-xl border border-brand-vermilion/40 bg-brand-vermilion/10 px-4 py-3 text-brand-vermilion text-[13px]">⚠ {error}</div>
            )}
            {lowBalance && (
              <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-parchment/80 text-[13px] space-y-2">
                <div>⚠ <strong>Số dư không đủ.</strong> Cần {formatVnd(5_000)}, còn <strong>{formatVnd(balance)}</strong>.</div>
                <Link href="/vi-cua-toi" className="inline-block px-4 py-1.5 rounded-full bg-gold-metal text-cosmic-DEFAULT text-[12px] font-semibold">Nạp tiền vào ví →</Link>
              </div>
            )}
            <div className="rounded-xl border border-gold/20 bg-cosmic-raised px-4 py-3 text-[12.5px] text-parchment/60 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-gold/60">Phí dịch vụ</span>
                <div>Trừ <strong className="text-parchment/80">{formatVnd(5_000)}</strong> mỗi lần luận giải</div>
              </div>
              <GoldText as="span" className="text-2xl font-serif italic">{formatVnd(5_000)}/lần</GoldText>
            </div>
            <GoldButton type="submit" size="lg" variant="primary" className="w-full">
              <span className="text-lg">✦</span>
              <span>
                {!session?.user
                  ? 'Đăng nhập để xem luận giải'
                  : hasFunds ? `Xem luận giải (${formatVnd(5_000)})` : 'Xem luận giải (cần nạp tiền)'}
              </span>
            </GoldButton>
          </form>
        </MysticCard>
      </div>
    </section>
  );
}
