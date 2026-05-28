'use client';

/**
 * TarotIntake — Step 1: question + spread selector.
 * Casino-style on dark cosmic bg. Rendered inside ScrollFrame (parchment body).
 */
import Link from 'next/link';
import { ScrollFrame } from '@/components/ui/ScrollFrame';
import { GoldButton } from '@/components/ui/GoldButton';
import { GoldText } from '@/components/ui/GoldText';
import { formatVnd } from '@/lib/money';

const SERIF = "'Cormorant Garamond',serif";

export type NumCards = 1 | 3 | 5 | 7 | 10;
export type Field = 'love' | 'career' | 'finance' | 'health' | 'general';
export type Gender = 'male' | 'female';

export const FIELD_LABEL: Record<Field, string> = {
  love: 'Tình duyên',
  career: 'Sự nghiệp',
  finance: 'Tài chính',
  health: 'Sức khỏe',
  general: 'Tổng quát',
};

const SPREAD_INFO: Record<NumCards, { desc: string; shape: string }> = {
  1:  { desc: 'Năng lượng dẫn dắt trong ngày',         shape: '[ ]' },
  3:  { desc: 'Quá khứ · Hiện tại · Tương lai',        shape: '[ ][ ][ ]' },
  5:  { desc: 'Cross — Hiện tại / Thách thức / Kết quả', shape: '⊕' },
  7:  { desc: 'Horseshoe — 7 vị trí vận trình',        shape: '⌒' },
  10: { desc: 'Celtic Cross — phân tích sâu toàn cảnh', shape: '✚' },
};

const NUM_OPTIONS: NumCards[] = [1, 3, 5, 7, 10];

interface TarotIntakeProps {
  name: string;
  setName: (v: string) => void;
  gender: Gender;
  setGender: (v: Gender) => void;
  field: Field;
  setField: (v: Field) => void;
  question: string;
  setQuestion: (v: string) => void;
  numCards: NumCards;
  setNumCards: (v: NumCards) => void;
  onStart: () => void;
  authStatus: 'authenticated' | 'unauthenticated' | 'loading';
  insufficient: { balance: number; required: number } | null;
}

export function TarotIntake({
  name, setName, gender, setGender, field, setField,
  question, setQuestion, numCards, setNumCards,
  onStart, authStatus, insufficient,
}: TarotIntakeProps) {
  const valid = name.trim().length > 0;

  return (
    <ScrollFrame title="✦ Bước 1 · Đặt câu hỏi cho bộ bài">
      <div className="space-y-5 max-w-xl mx-auto">

        {insufficient && (
          <div className="rounded-xl border border-[#c89146]/40 bg-[#14121a] p-4 text-[13px] space-y-2">
            <div className="text-[#e9d4b6]">
              ⚠ <strong>Số dư không đủ.</strong> Cần{' '}
              <strong className="text-[#c89146]">{formatVnd(insufficient.required)}</strong> — bạn còn{' '}
              <strong>{formatVnd(insufficient.balance)}</strong>.
            </div>
            <Link
              href="/vi-cua-toi"
              className="inline-block px-4 py-1.5 rounded-full bg-gold-metal text-[#05060a] text-[12px] font-bold"
            >
              Nạp tiền →
            </Link>
          </div>
        )}

        {/* Fee chip */}
        <div className="flex items-center justify-between rounded-xl border border-[#c89146]/30 bg-[#0b0d14] px-4 py-3">
          <div className="text-[12px] text-[#b8a47c]">Phí dịch vụ · mỗi lần xem</div>
          <GoldText className="text-xl font-serif italic" style={{ fontFamily: SERIF }}>
            {formatVnd(5_000)}
          </GoldText>
        </div>

        {/* Name */}
        <div>
          <label className="block text-[12px] tracking-[0.2em] uppercase text-[#b8a47c] mb-1.5">
            👤 Họ và tên <span className="text-[#c8361d]">*</span>
          </label>
          <input
            type="text" value={name} maxLength={80}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên của bạn"
            className="w-full h-11 px-4 rounded-xl border border-[#c89146]/30 bg-[#0b0d14] text-[#e9d4b6] placeholder:text-[#4a3a30] focus:outline-none focus:border-[#c89146] focus:ring-1 focus:ring-[#c89146]/30 transition"
          />
        </div>

        {/* Gender */}
        <div>
          <div className="text-[12px] tracking-[0.2em] uppercase text-[#b8a47c] mb-1.5">⚥ Giới tính</div>
          <div className="grid grid-cols-2 gap-3">
            {(['male', 'female'] as const).map((g) => (
              <button key={g} type="button" onClick={() => setGender(g)}
                className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                  gender === g
                    ? 'border-[#c89146] bg-[#14121a] shadow-goldGlow'
                    : 'border-[#c89146]/20 bg-[#0b0d14] hover:border-[#c89146]/50'
                }`}>
                <div className={`text-2xl ${gender === g ? 'text-[#c89146]' : 'text-[#b8a47c]'}`}>
                  {g === 'male' ? '♂' : '♀'}
                </div>
                <div className="text-[13px] font-semibold text-[#e9d4b6]">{g === 'male' ? 'Nam' : 'Nữ'}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Field */}
        <div>
          <div className="text-[12px] tracking-[0.2em] uppercase text-[#b8a47c] mb-1.5">✦ Lĩnh vực</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(Object.keys(FIELD_LABEL) as Field[]).map((f) => (
              <button key={f} type="button" onClick={() => setField(f)}
                className={`px-3 py-2 rounded-lg border text-[12px] font-semibold transition ${
                  field === f
                    ? 'border-[#c89146] bg-[#14121a] text-[#c89146]'
                    : 'border-[#c89146]/20 bg-[#0b0d14] text-[#b8a47c] hover:border-[#c89146]/40 hover:text-[#e9d4b6]'
                }`}>
                {FIELD_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Question */}
        <div>
          <label className="block text-[12px] tracking-[0.2em] uppercase text-[#b8a47c] mb-1.5">
            💭 Câu hỏi <span className="text-[#4a3a30] font-normal">(không bắt buộc)</span>
          </label>
          <textarea
            value={question} rows={3} maxLength={500}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='"Liệu công việc hiện tại có nên tiếp tục đến cuối năm?"'
            className="w-full px-4 py-3 rounded-xl border border-[#c89146]/30 bg-[#0b0d14] text-[#e9d4b6] placeholder:text-[#4a3a30] focus:outline-none focus:border-[#c89146] focus:ring-1 focus:ring-[#c89146]/30 transition resize-none"
          />
          <div className="mt-1 text-[11px] text-[#4a3a30] text-right">{question.length}/500</div>
        </div>

        {/* Spread selector */}
        <div>
          <div className="text-[12px] tracking-[0.2em] uppercase text-[#b8a47c] mb-1.5">🃏 Trải bài</div>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {NUM_OPTIONS.map((n) => (
              <button key={n} type="button" onClick={() => setNumCards(n)}
                className={`py-3 rounded-lg border-2 text-[15px] font-bold transition ${
                  numCards === n
                    ? 'border-[#c89146] bg-[#14121a] text-[#c89146] shadow-goldGlow'
                    : 'border-[#c89146]/20 bg-[#0b0d14] text-[#b8a47c] hover:border-[#c89146]/40'
                }`}>
                {n}
              </button>
            ))}
          </div>
          <div className="text-center text-[12px] text-[#b8a47c] italic">
            <span className="font-mono text-[#c89146] mr-2">{SPREAD_INFO[numCards].shape}</span>
            {SPREAD_INFO[numCards].desc}
          </div>
        </div>

        <GoldButton size="lg" className="w-full mt-1" onClick={onStart} disabled={!valid}>
          ✦ Bắt đầu rút bài →
        </GoldButton>

        {authStatus === 'unauthenticated' && (
          <p className="text-center text-[12px] text-[#b8a47c]">
            Cần đăng nhập để xem Tarot.{' '}
            <Link href="/dang-nhap?callbackUrl=/xem-tarot" className="text-[#c89146] underline">
              Đăng nhập →
            </Link>
          </p>
        )}
      </div>
    </ScrollFrame>
  );
}
