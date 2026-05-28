'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatVnd } from '@/lib/money';
import { toast } from '@/components/ui/toast';
import { subscribeWallet } from '@/lib/wallet-sse';
import Pagination from '@/components/Pagination';
import type { BankConfig } from '@tuvi/db';

const SERIF_FONT = "'Cormorant Garamond',serif";

type Tx = {
  id: string;
  type: string;
  status: string;
  amountVnd: number;
  bankRef: string | null;
  metadata?: any;
  note?: string | null;
  createdAt: string;
};

const QUICK_AMOUNTS = [20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000];

export default function WalletClient({
  initialBalance,
  bank,
  userName,
  userEmail,
  minTopup,
  readingPrice,
}: {
  initialBalance: number;
  bank: BankConfig | null;
  userName: string;
  userEmail: string;
  minTopup: number;
  readingPrice: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [balance, setBalance] = useState<number>(initialBalance);
  const [amountInput, setAmountInput] = useState<string>(String(minTopup));
  const [pending, setPending] = useState<Tx | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Tx[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);

  const page = Math.max(1, parseInt(params.get('page') ?? '1') || 1);
  const size = clamp(parseInt(params.get('size') ?? '10') || 10, 10, 100);

  const ckContent = (ref: string | null) =>
    [ref, userEmail].filter(Boolean).join(' ').trim();

  const amountVnd = useMemo(() => {
    const n = Number(amountInput.replace(/\D/g, ''));
    return Number.isFinite(n) ? n : 0;
  }, [amountInput]);

  const amountValid = amountVnd >= minTopup;
  const readingsCovered = Math.floor(amountVnd / readingPrice);
  const balanceReadings = Math.floor(balance / readingPrice);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/wallet/transactions?page=${page}&size=${size}`);
      const data = await res.json();
      if (data.ok) {
        setHistory(data.transactions);
        setHistoryTotal(data.total ?? 0);
      }
    } catch {}
  }, [page, size]);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      fetch('/api/wallet/balance')
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled && typeof d?.balanceVnd === 'number') setBalance(d.balanceVnd);
        })
        .catch(() => {});
    };
    refresh();
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeWallet((event, data) => {
      if (event === 'balance') {
        setBalance(data.balanceVnd);
        if (data.reason === 'topup' && data.delta > 0) {
          toast.success(`Đã nạp ${formatVnd(data.delta)} vào ví`);
        } else if (data.reason === 'admin_credit' && data.delta > 0) {
          toast.success(`Admin tặng ${formatVnd(data.delta)} vào ví`);
        } else if (data.reason === 'refund' && data.delta > 0) {
          toast.success(`Hoàn ${formatVnd(data.delta)} về ví`);
        }
        if (page !== 1) {
          const np = new URLSearchParams(params);
          np.set('page', '1');
          router.push(`${pathname}?${np.toString()}`);
        } else {
          loadHistory();
        }
      } else {
        loadHistory();
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, loadHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const requestTopup = async () => {
    if (!amountValid) {
      setError(`Số tiền tối thiểu ${formatVnd(minTopup)}`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/wallet/topup-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountVnd }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setPending(data.transaction);
      loadHistory();
      toast.success('Đã tạo lệnh nạp — chuyển khoản theo thông tin bên dưới');
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(`Tạo lệnh nạp thất bại: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-4xl md:text-5xl font-serif italic text-parchment"
          style={{ fontFamily: SERIF_FONT }}
        >
          Ví của tôi
        </h1>
        <p className="mt-2 text-[14px] text-parchment/50">
          Nạp tối thiểu {formatVnd(minTopup)} · Mỗi lần luận giải{' '}
          <strong className="text-parchment">{formatVnd(readingPrice)}</strong>
        </p>

        {/* Balance card */}
        <div className="mt-6 rounded-3xl p-6 md:p-8 border border-gold/40 bg-gradient-to-br from-gold-deep/30 to-cosmic-panel shadow-goldGlow">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <div className="text-[10px] tracking-[0.3em] uppercase text-parchment/50 font-semibold">
                Số dư ví
              </div>
              <div
                className="mt-1 text-5xl md:text-6xl font-serif italic text-gold"
                style={{ fontFamily: SERIF_FONT }}
              >
                {formatVnd(balance)}
              </div>
              <div className="mt-2 text-[14px] text-parchment">{userName}</div>
              <div className="mt-1 text-[13px] text-parchment/50">
                Tương đương <strong className="text-gold">{balanceReadings}</strong>{' '}
                lần luận giải
                {balance > 0 && balance % readingPrice > 0
                  ? ` (dư ${formatVnd(balance % readingPrice)})`
                  : ''}
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3a8a5e]/15 border border-[#3a8a5e]/40">
              <span className="w-2 h-2 rounded-full bg-[#3a8a5e] animate-pulse" />
              <span className="text-[11px] tracking-[0.2em] font-bold uppercase text-[#3a8a5e]">
                Realtime
              </span>
            </div>
          </div>

          {balance < readingPrice && (
            <div className="mt-4 rounded-xl border border-brand-vermilion/40 bg-brand-vermilion/10 px-4 py-2.5 text-brand-vermilion text-[13.5px]">
              ⚠ Số dư không đủ cho 1 lần luận giải. Nạp ngay để dùng.
            </div>
          )}
        </div>

        {/* Topup form */}
        {!pending && (
          <div className="mt-6 rounded-3xl border border-gold/25 bg-cosmic-panel p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl text-gold">✦</span>
              <h2
                className="text-2xl font-serif text-parchment"
                style={{ fontFamily: SERIF_FONT }}
              >
                Nạp tiền vào ví
              </h2>
            </div>

            <p className="text-[13.5px] text-parchment/55 leading-relaxed mb-5">
              Nhập số tiền muốn nạp (tối thiểu{' '}
              <strong className="text-parchment">{formatVnd(minTopup)}</strong>). Mỗi lần luận giải{' '}
              <strong className="text-parchment">{formatVnd(readingPrice)}</strong>, trừ ngay khi xem. Không
              có giới hạn thời gian, tiêu hết thì nạp tiếp.
            </p>

            <label className="block text-[11px] tracking-[0.2em] uppercase text-parchment/50 font-semibold mb-2">
              Số tiền (VND)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmountInput(String(a))}
                  className={`px-2 py-2 rounded-xl text-[12.5px] font-semibold border-2 transition ${
                    amountVnd === a
                      ? 'border-gold bg-gold/20 text-gold'
                      : 'border-gold/20 bg-cosmic-raised text-parchment/60 hover:border-gold/45 hover:text-parchment'
                  }`}
                >
                  {formatVnd(a)}
                </button>
              ))}
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value.replace(/\D/g, ''))}
              placeholder={`Tối thiểu ${minTopup}`}
              className="w-full h-12 px-4 rounded-2xl border border-gold/20 bg-cosmic-raised text-parchment text-lg font-mono placeholder:text-parchment/30 focus:outline-none focus:border-gold/55 focus:ring-2 focus:ring-gold/15 transition"
            />

            {amountVnd > 0 && (
              <div className="mt-2 text-[12.5px] text-parchment/55">
                {amountValid ? (
                  <>
                    Sau khi nạp:{' '}
                    <strong className="text-[#3a8a5e]">
                      {formatVnd(balance + amountVnd)}
                    </strong>{' '}
                    · đủ cho{' '}
                    <strong className="text-gold">
                      {Math.floor((balance + amountVnd) / readingPrice)} lần
                    </strong>{' '}
                    luận giải (riêng đợt nạp này {readingsCovered} lần).
                  </>
                ) : (
                  <span className="text-brand-vermilion">
                    Tối thiểu {formatVnd(minTopup)}.
                  </span>
                )}
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-xl border border-brand-vermilion/40 bg-brand-vermilion/10 px-4 py-2.5 text-brand-vermilion text-[13.5px]">
                ⚠ {error}
              </div>
            )}

            <button
              type="button"
              onClick={requestTopup}
              disabled={!amountValid || submitting}
              className="mt-4 w-full h-12 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-light text-cosmic-DEFAULT font-semibold tracking-wide hover:brightness-110 transition shadow-goldGlow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? 'Đang tạo lệnh nạp…'
                : `Tạo lệnh nạp ${amountValid ? formatVnd(amountVnd) : ''}`}
            </button>

            <p className="mt-3 text-[12px] text-parchment/40 leading-relaxed">
              Sau khi bấm, hệ thống sinh mã chuyển khoản. Bạn chuyển khoản với
              nội dung CK đúng mã → admin xác nhận → số dư cộng vào ví{' '}
              <strong className="text-parchment/70">tức thời</strong> (realtime).
            </p>
          </div>
        )}

        {/* Pending instructions */}
        {pending && (
          <div className="mt-6 rounded-3xl border border-gold/25 bg-cosmic-panel p-6 md:p-8">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏦</span>
                <h2
                  className="text-2xl font-serif text-parchment"
                  style={{ fontFamily: SERIF_FONT }}
                >
                  Chuyển khoản theo thông tin
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="text-[12px] text-gold/60 hover:text-gold underline transition"
              >
                Tạo lệnh khác
              </button>
            </div>

            <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 mb-5 text-parchment text-[13.5px]">
              Đang chờ nạp: <strong className="text-gold">{formatVnd(pending.amountVnd)}</strong> ·
              tương đương{' '}
              <strong className="text-gold">{Math.floor(pending.amountVnd / readingPrice)} lần luận giải</strong>
            </div>

            <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
              <div className="flex flex-col items-center gap-2">
                {bank?.qrImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bank.qrImageUrl}
                    alt="QR chuyển khoản"
                    className="w-48 h-48 rounded-xl border border-gold/30 bg-white p-2 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-xl border-2 border-dashed border-gold/35 flex items-center justify-center text-center text-[12px] text-parchment/40 p-3">
                    Admin chưa cấu hình QR
                  </div>
                )}
                <div className="text-[11px] tracking-[0.2em] uppercase text-parchment/40">
                  Quét QR
                </div>
              </div>

              <div className="space-y-3 text-[14px]">
                <Row label="Ngân hàng" value={bank?.bankName || '—'} />
                <Row label="Số tài khoản" value={bank?.accountNumber || '—'} copy />
                <Row label="Chủ TK" value={bank?.accountHolder || '—'} />
                <Row label="Số tiền" value={formatVnd(pending.amountVnd)} copy bold />
                <Row label="Nội dung CK" value={ckContent(pending.bankRef)} copy bold highlight />
                <p className="mt-3 text-[12.5px] leading-relaxed text-parchment/55 border-l-2 border-gold pl-3">
                  <strong className="text-parchment">QUAN TRỌNG:</strong> Ghi đúng nội dung CK{' '}
                  <code className="font-mono text-brand-vermilion">
                    {ckContent(pending.bankRef)}
                  </code>
                  . Sau khi admin xác nhận, số dư sẽ cộng tức thời vào ví của bạn.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="mt-6 rounded-3xl border border-gold/25 bg-cosmic-panel p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📜</span>
              <h2
                className="text-2xl font-serif text-parchment"
                style={{ fontFamily: SERIF_FONT }}
              >
                Lịch sử giao dịch
              </h2>
            </div>
            {historyTotal > 0 && (
              <span className="text-[12px] text-parchment/40">
                Tổng <strong className="text-gold tabular-nums">{historyTotal}</strong> giao dịch
              </span>
            )}
          </div>
          {historyTotal === 0 ? (
            <p className="text-[14px] text-parchment/50 italic">
              Chưa có giao dịch nào.{' '}
              <Link href="/xem-tu-vi" className="text-gold/70 hover:text-gold underline transition">
                Bắt đầu xem Tử Vi
              </Link>
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {history.map((tx) => (
                  <TxRow key={tx.id} tx={tx} />
                ))}
              </div>
              <Pagination page={page} pageSize={size} total={historyTotal} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function Row({
  label,
  value,
  copy,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  copy?: boolean;
  bold?: boolean;
  highlight?: boolean;
}) {
  const onCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
  };
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${
        highlight
          ? 'bg-gold/15 border border-gold/35'
          : 'bg-cosmic-raised border border-gold/15'
      }`}
    >
      <div className="text-[11px] tracking-[0.2em] uppercase text-parchment/40 font-semibold">
        {label}
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`truncate font-mono ${bold ? 'text-[15px] font-bold text-gold' : 'text-[13.5px] text-parchment'}`}
        >
          {value}
        </span>
        {copy && (
          <button
            type="button"
            onClick={onCopy}
            title="Copy"
            className="px-2 py-0.5 rounded text-[11px] tracking-wider uppercase font-semibold text-gold/70 hover:text-gold border border-gold/25 hover:border-gold/55 transition"
          >
            Copy
          </button>
        )}
      </div>
    </div>
  );
}

const SERVICE_VN: Record<string, string> = {
  'tu-vi': 'Tử Vi',
  'tu-tru': 'Tứ Trụ',
  tarot: 'Tarot',
  'hoang-dao': 'Hoàng Đạo',
};

function chargeLabel(meta: any): string {
  const service = meta?.service;
  if (typeof service === 'string' && SERVICE_VN[service]) {
    return `Luận giải ${SERVICE_VN[service]}`;
  }
  return 'Luận giải';
}

function TxRow({ tx }: { tx: Tx }) {
  const isCharge = tx.type === 'charge';

  const typeLabel: Record<string, string> = {
    topup: 'Nạp tiền',
    charge: chargeLabel(tx.metadata),
    refund: 'Hoàn tiền',
    admin_credit: tx.amountVnd > 0 ? 'Admin cộng tiền' : 'Admin trừ tiền',
    subscription: 'Mua gói PRO (cũ)',
    admin_extend: 'Admin gia hạn (cũ)',
  };
  const statusLabel: Record<string, string> = {
    pending: 'Chờ duyệt',
    completed: 'Hoàn tất',
    rejected: 'Bị từ chối',
    cancelled: 'Đã huỷ',
  };
  const statusColor: Record<string, string> = {
    pending: '#c89146',
    completed: '#3a8a5e',
    rejected: '#c8361d',
    cancelled: '#4a6c7a',
  };
  const c = statusColor[tx.status] ?? '#4a6c7a';

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/15 bg-cosmic-raised px-4 py-3 hover:border-gold/30 transition">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold text-parchment">
            {typeLabel[tx.type] ?? tx.type}
          </span>
          {tx.bankRef && (
            <code className="text-[11px] text-parchment/40 font-mono">
              {tx.bankRef}
            </code>
          )}
        </div>
        <div className="text-[12px] text-parchment/40">
          {new Date(tx.createdAt).toLocaleString('vi-VN')}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="px-2.5 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold"
          style={{
            background: c + '18',
            color: c,
            border: `1px solid ${c}55`,
          }}
        >
          {statusLabel[tx.status] ?? tx.status}
        </span>
        <span
          className={`text-[15px] font-bold ${
            isCharge || tx.amountVnd < 0 ? 'text-brand-vermilion' : 'text-[#3a8a5e]'
          }`}
        >
          {isCharge || tx.amountVnd < 0 ? '' : '+'}
          {formatVnd(tx.amountVnd)}
        </span>
      </div>
    </div>
  );
}
