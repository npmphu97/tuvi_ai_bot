'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginClient({
  callbackUrl,
  hasGoogle,
  hasEmail,
  errorParam,
}: {
  callbackUrl: string;
  hasGoogle: boolean;
  hasEmail: boolean;
  errorParam?: string;
}) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <>
      {errorParam && (
        <div className="rounded-xl border border-brand-vermilion/40 bg-brand-vermilion/10 px-4 py-3 mb-5 text-brand-vermilion text-[13.5px]">
          ⚠ Đăng nhập thất bại: {errorParam}
        </div>
      )}

      <div className="space-y-3">
        {hasGoogle && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => {
              setBusy('google');
              signIn('google', { callbackUrl });
            }}
            className="w-full h-12 rounded-full border-2 border-gold/30 bg-cosmic-raised hover:bg-cosmic-veil flex items-center justify-center gap-3 transition disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.96 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 009 0 9 9 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"
              />
            </svg>
            <span className="text-[14px] font-semibold text-parchment">
              {busy === 'google' ? 'Đang chuyển hướng…' : 'Đăng nhập với Google'}
            </span>
          </button>
        )}

        {hasEmail && (
          <>
            {hasGoogle && (
              <div className="relative my-2 text-center">
                <div className="absolute left-0 right-0 top-1/2 border-t border-gold/20" />
                <span className="relative bg-cosmic-panel px-3 text-[11px] tracking-[0.25em] uppercase text-parchment/50">
                  hoặc
                </span>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setBusy('email');
                signIn('nodemailer', { email, callbackUrl });
              }}
              className="space-y-3"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@cua-ban.com"
                disabled={busy !== null}
                className="w-full h-12 px-4 rounded-2xl border border-gold/25 bg-cosmic-raised text-parchment placeholder:text-parchment/35 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15 transition"
              />
              <button
                type="submit"
                disabled={busy !== null}
                className="w-full h-12 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-light text-cosmic-DEFAULT font-semibold tracking-wide hover:brightness-110 transition disabled:opacity-60"
              >
                {busy === 'email' ? 'Đang gửi…' : 'Gửi link đăng nhập'}
              </button>
            </form>
          </>
        )}

        {!hasGoogle && !hasEmail && (
          <div className="rounded-xl border border-gold/30 bg-cosmic-raised px-4 py-3 text-parchment/70 text-[13.5px]">
            ⚠ Chưa cấu hình provider. Cần set{' '}
            <code className="font-mono text-gold">GOOGLE_CLIENT_ID</code> hoặc{' '}
            <code className="font-mono text-gold">EMAIL_SERVER_HOST</code> trong{' '}
            <code className="font-mono text-gold">.env</code>.
          </div>
        )}
      </div>
    </>
  );
}
