'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { subscribeWallet } from '@/lib/wallet-sse';
import { formatVnd } from '@/lib/money';

const SERIF_FONT = "'Cormorant Garamond',serif";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const ref = useRef<HTMLDivElement | null>(null);

  // Init balance from session. Updates arrive via subscribeWallet (local emit + Supabase Realtime).
  useEffect(() => {
    if (session?.user) setBalance(session.user.balanceVnd ?? 0);
  }, [session?.user?.balanceVnd]);
  useEffect(() => {
    if (!session?.user) return;
    const unsubscribe = subscribeWallet((event, data) => {
      if (event === 'balance' && typeof data.balanceVnd === 'number') {
        setBalance(data.balanceVnd);
      }
    });
    return unsubscribe;
  }, [session?.user?.id]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (status === 'loading') {
    return <div className="w-9 h-9 rounded-full bg-gold/10 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/dang-nhap"
        className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-light text-cosmic-DEFAULT text-[13px] font-semibold hover:brightness-110 transition shadow-goldGlow"
      >
        <span className="text-base leading-none">✦</span>
        <span>Đăng nhập</span>
      </Link>
    );
  }

  const u = session.user;
  const initial = (u.name ?? u.email ?? 'U').trim().charAt(0).toUpperCase();
  const isAdmin = u.role === 'admin';
  const lowBalance = balance < 5000;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-gold/30 bg-cosmic-panel hover:border-gold/55 transition"
      >
        {u.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={u.image}
            alt=""
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <span className="w-7 h-7 rounded-full bg-gold-deep text-parchment flex items-center justify-center text-[12px] font-semibold">
            {initial}
          </span>
        )}
        <span
          className={`text-[12px] tracking-[0.05em] font-bold tabular-nums ${
            lowBalance ? 'text-brand-vermilion' : 'text-gold'
          }`}
          title="Số dư ví"
        >
          {formatVnd(balance)}
        </span>
        <span
          className={`text-parchment/50 text-xs transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gold/30 bg-cosmic-panel shadow-[0_24px_60px_-20px_rgba(200,145,70,0.25)] py-2 z-50">
          <div className="px-4 py-3 border-b border-gold/15">
            <div className="text-[13px] font-semibold text-parchment truncate">
              {u.name ?? u.email}
            </div>
            <div className="text-[11px] text-parchment/50 truncate">{u.email}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] tracking-[0.25em] uppercase text-parchment/40">
                Số dư
              </span>
              <span
                className={`text-2xl font-serif italic tabular-nums ${
                  lowBalance ? 'text-brand-vermilion' : 'text-gold'
                }`}
                style={{ fontFamily: SERIF_FONT }}
              >
                {formatVnd(balance)}
              </span>
            </div>
            {lowBalance && (
              <Link
                href="/vi-cua-toi"
                onClick={() => setOpen(false)}
                className="mt-2 inline-block w-full text-center px-3 py-1.5 rounded-full bg-brand-vermilion text-parchment text-[11px] font-semibold tracking-wider uppercase hover:bg-[#a52a16] transition"
              >
                Nạp ngay
              </Link>
            )}
            {isAdmin && (
              <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-brand-vermilion text-parchment text-[9px] tracking-wider font-bold">
                ADMIN
              </span>
            )}
          </div>
          <Link
            href="/vi-cua-toi"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-parchment/70 hover:text-parchment hover:bg-cosmic-raised transition"
          >
            <span>💰</span> Ví của tôi
          </Link>
          <Link
            href="/lich-su"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-parchment/70 hover:text-parchment hover:bg-cosmic-raised transition"
          >
            <span>📜</span> Lịch sử của tôi
          </Link>
          {isAdmin && (
            <>
              <div className="my-1 border-t border-gold/10" />
              <Link
                href="/admin/users"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-brand-vermilion hover:bg-cosmic-raised font-medium transition"
              >
                <span>⚙</span> Quản lý người dùng
              </Link>
              <Link
                href="/admin/transactions"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-brand-vermilion hover:bg-cosmic-raised font-medium transition"
              >
                <span>💳</span> Duyệt giao dịch
              </Link>
              <Link
                href="/admin/thong-ke"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-brand-vermilion hover:bg-cosmic-raised font-medium transition"
              >
                <span>📊</span> Thống kê
              </Link>
            </>
          )}
          <div className="my-1 border-t border-gold/10" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: '/' });
            }}
            className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-parchment/50 hover:text-parchment hover:bg-cosmic-raised transition"
          >
            <span>↩</span> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
