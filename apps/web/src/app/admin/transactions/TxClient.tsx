'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { formatVnd } from '@/lib/money';
import { toast } from '@/components/ui/toast';
import Pagination from '@/components/Pagination';

type AdminTx = {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  type: string;
  status: string;
  amountVnd: number;
  bankRef: string | null;
  note: string | null;
  createdAt: string;
  completedAt: string | null;
};

type StatusFilter = 'pending' | 'completed' | 'rejected' | 'cancelled' | 'all';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ duyệt',
  completed: 'Hoàn tất',
  rejected: 'Từ chối',
  cancelled: 'Huỷ',
};

const TYPE_LABEL: Record<string, string> = {
  topup: 'Nạp tiền',
  charge: 'Trừ phí',
  refund: 'Hoàn tiền',
  admin_credit: 'Admin cộng',
  subscription: 'Mua gói PRO (cũ)',
  admin_extend: 'Admin gia hạn (cũ)',
};

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'completed', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'all', label: 'Tất cả' },
];

export default function TxClient({
  initial,
  page,
  pageSize,
  total,
  status,
}: {
  initial: AdminTx[];
  page: number;
  pageSize: number;
  total: number;
  status: StatusFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [rows, setRows] = useState(initial);
  useEffect(() => setRows(initial), [initial]);

  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const setStatus = (s: StatusFilter) => {
    if (s === status) return;
    const np = new URLSearchParams(params);
    np.set('status', s);
    np.set('page', '1');
    startTransition(() => router.push(`${pathname}?${np.toString()}`));
  };

  const approve = async (id: string) => {
    setBusy(id);
    setErr(null);
    try {
      const res = await fetch('/api/admin/transactions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: 'completed', completedAt: new Date().toISOString() }
            : r,
        ),
      );
      toast.success('Đã duyệt giao dịch thành công');
      router.refresh();
    } catch (e) {
      const msg = (e as Error).message;
      setErr(msg);
      toast.error(`Duyệt thất bại: ${msg}`);
    } finally {
      setBusy(null);
    }
  };

  const reject = async (id: string) => {
    setBusy(id);
    setErr(null);
    try {
      const res = await fetch('/api/admin/transactions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)),
      );
      toast.success('Đã từ chối giao dịch');
      router.refresh();
    } catch (e) {
      const msg = (e as Error).message;
      setErr(msg);
      toast.error(`Từ chối thất bại: ${msg}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-3xl border border-gold/25 bg-cosmic-panel p-5 md:p-7">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-xl font-semibold text-parchment">
          Giao dịch <span className="text-parchment/50 font-normal text-[14px]">({total})</span>
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition ${
                status === f.value
                  ? 'bg-gold text-cosmic-DEFAULT'
                  : 'border border-gold/25 text-parchment/60 hover:border-gold/50 hover:text-parchment'
              }`}
            >
              {f.label}
            </button>
          ))}
          {isPending && (
            <span className="inline-block w-3 h-3 rounded-full bg-gold animate-pulse" />
          )}
        </div>
      </div>

      {err && (
        <div className="mb-3 rounded-xl border border-brand-vermilion/40 bg-brand-vermilion/10 px-3 py-2 text-brand-vermilion text-[13px]">
          ⚠ {err}
        </div>
      )}

      <div className={`overflow-x-auto transition-opacity ${isPending ? 'opacity-60' : ''}`}>
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-gold/15 text-left text-parchment/40 uppercase tracking-[0.15em] text-[10px]">
              <th className="py-2 pr-3">Bank Ref</th>
              <th className="py-2 pr-3">User</th>
              <th className="py-2 pr-3">Loại</th>
              <th className="py-2 pr-3 text-right">Số tiền</th>
              <th className="py-2 pr-3">Trạng thái</th>
              <th className="py-2 pr-3">Tạo lúc</th>
              <th className="py-2 pr-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gold/10 hover:bg-cosmic-raised/50 transition">
                <td className="py-2.5 pr-3 font-mono text-[12px] text-gold/80">
                  {r.bankRef ?? '—'}
                </td>
                <td className="py-2.5 pr-3">
                  <div className="text-parchment font-medium">{r.userName ?? '—'}</div>
                  <div className="text-[11px] text-parchment/50">{r.userEmail}</div>
                </td>
                <td className="py-2.5 pr-3 text-parchment/60">
                  {TYPE_LABEL[r.type] ?? r.type}
                </td>
                <td
                  className={`py-2.5 pr-3 text-right font-semibold tabular-nums ${
                    r.amountVnd > 0 ? 'text-[#3a8a5e]' : 'text-brand-vermilion'
                  }`}
                >
                  {r.amountVnd > 0 ? '+' : ''}
                  {formatVnd(r.amountVnd)}
                </td>
                <td className="py-2.5 pr-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="py-2.5 pr-3 text-[12px] text-parchment/50">
                  {new Date(r.createdAt).toLocaleString('vi-VN')}
                </td>
                <td className="py-2.5 pr-3 text-right whitespace-nowrap">
                  {r.status === 'pending' && (r.type === 'topup' || r.type === 'subscription') ? (
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => approve(r.id)}
                        disabled={busy === r.id}
                        className="px-3 py-1.5 rounded-full bg-[#3a8a5e] text-parchment text-[12px] font-semibold hover:bg-[#2a6e48] transition disabled:opacity-50"
                      >
                        {busy === r.id ? '…' : 'Duyệt'}
                      </button>
                      <button
                        type="button"
                        onClick={() => reject(r.id)}
                        disabled={busy === r.id}
                        className="px-3 py-1.5 rounded-full border border-brand-vermilion/45 text-brand-vermilion text-[12px] font-semibold hover:bg-brand-vermilion/10 disabled:opacity-50"
                      >
                        Từ chối
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-parchment/30">—</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-parchment/40 italic">
                  Không có giao dịch{status !== 'all' ? ` ở trạng thái "${STATUS_LABEL[status] ?? status}"` : ''}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={pageSize} total={total} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c: Record<string, string> = {
    pending: '#c89146',
    completed: '#3a8a5e',
    rejected: '#c8361d',
    cancelled: '#4a6c7a',
  };
  const color = c[status] ?? '#4a6c7a';
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold"
      style={{ background: color + '18', color, border: `1px solid ${color}55` }}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
