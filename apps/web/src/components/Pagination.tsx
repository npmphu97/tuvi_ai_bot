'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

/**
 * Pagination control cho admin tables. State lưu ở URL search params (`page`,
 * `size`) — refresh / share link giữ nguyên vị trí. router.push trigger Next.js
 * re-fetch server component → table tự update.
 *
 * `useTransition` để xử lý pending state khi điều hướng (giữ UI cũ + dim cho user
 * biết đang load), tránh flash empty state.
 */
export default function Pagination({
  page,
  pageSize,
  total,
  pageSizeOptions = [10, 20, 50, 100],
}: {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIdx = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(total, safePage * pageSize);

  const navigate = (next: URLSearchParams) => {
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  };

  const go = (p: number) => {
    if (p < 1 || p > totalPages || p === safePage) return;
    const np = new URLSearchParams(params);
    np.set('page', String(p));
    navigate(np);
  };

  const setSize = (s: number) => {
    if (s === pageSize) return;
    const np = new URLSearchParams(params);
    np.set('size', String(s));
    np.set('page', '1');
    navigate(np);
  };

  const pageNumbers = computePages(safePage, totalPages);

  return (
    <div
      className={`mt-4 flex items-center justify-between gap-3 flex-wrap text-[12.5px] transition-opacity ${
        isPending ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      <div className="text-[#b8a47c]">
        {total === 0 ? (
          'Không có dòng nào.'
        ) : (
          <>
            <strong className="text-[#c89146] tabular-nums">{startIdx}</strong>
            {' – '}
            <strong className="text-[#c89146] tabular-nums">{endIdx}</strong>{' '}
            trong tổng <strong className="text-[#c89146] tabular-nums">{total}</strong>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="inline-flex items-center gap-1.5 text-[#b8a47c]">
          <span className="text-[11px] tracking-[0.2em] uppercase">Hàng/trang</span>
          <select
            value={pageSize}
            onChange={(e) => setSize(Number(e.target.value))}
            className="h-8 px-2 rounded-full border border-[#c89146]/30 bg-[#14121a] text-[#f4ecd6] text-[12.5px] focus:outline-none focus:border-[#c89146]"
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <nav className="inline-flex items-center gap-1">
          <PageButton onClick={() => go(1)} disabled={safePage <= 1} title="Trang đầu">
            «
          </PageButton>
          <PageButton onClick={() => go(safePage - 1)} disabled={safePage <= 1} title="Trang trước">
            ‹
          </PageButton>

          {pageNumbers.map((n, i) =>
            n === '…' ? (
              <span key={`gap-${i}`} className="px-2 text-[#b8a47c] tabular-nums">
                …
              </span>
            ) : (
              <PageButton
                key={n}
                onClick={() => go(n)}
                active={n === safePage}
              >
                {n}
              </PageButton>
            ),
          )}

          <PageButton
            onClick={() => go(safePage + 1)}
            disabled={safePage >= totalPages}
            title="Trang sau"
          >
            ›
          </PageButton>
          <PageButton
            onClick={() => go(totalPages)}
            disabled={safePage >= totalPages}
            title="Trang cuối"
          >
            »
          </PageButton>
        </nav>
      </div>
    </div>
  );
}

function PageButton({
  onClick,
  disabled,
  active,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`min-w-[32px] h-8 px-2.5 rounded-full text-[12.5px] font-semibold tabular-nums transition border ${
        active
          ? 'bg-gold-metal text-[#05060a] border-transparent'
          : 'bg-[#14121a] text-[#f4ecd6] border-[#c89146]/30 hover:border-[#c89146]/60 hover:bg-[#1c1a24]'
      } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#c89146]/30 disabled:hover:bg-[#14121a]`}
    >
      {children}
    </button>
  );
}

/**
 * Sinh dãy page numbers cho thanh điều hướng. Mục tiêu: tối đa ~7 entry, có '…'
 * ở giữa nếu cách xa. Format: 1 … 4 5 [6] 7 8 … 99
 */
function computePages(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | '…'> = [1];
  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);

  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);

  return pages;
}
