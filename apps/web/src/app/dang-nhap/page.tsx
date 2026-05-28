import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LoginClient from './LoginClient';

const SERIF_FONT = "'Cormorant Garamond',serif";

export const metadata = {
  title: 'Đăng nhập · Vận Mệnh',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  if (session?.user) redirect(searchParams.callbackUrl ?? '/');

  const callbackUrl = searchParams.callbackUrl ?? '/';
  const hasGoogle = !!process.env.GOOGLE_CLIENT_ID;
  const hasEmail = !!process.env.EMAIL_SERVER_HOST;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md rounded-3xl border border-gold/30 bg-cosmic-panel p-8 md:p-10 shadow-[0_30px_80px_-30px_rgba(200,145,70,0.2)]">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="text-[11px] tracking-[0.3em] text-gold/70 hover:text-gold uppercase transition"
          >
            ← Trang chủ
          </Link>
          <h1
            className="mt-3 text-4xl font-serif text-parchment"
            style={{ fontFamily: SERIF_FONT }}
          >
            Đăng <em className="text-gold">nhập</em>
          </h1>
          <p className="mt-2 text-[14px] text-parchment/60">
            Lưu lại các lá số của bạn, nạp tiền và xem lịch sử
          </p>
        </div>

        <LoginClient
          callbackUrl={callbackUrl}
          hasGoogle={hasGoogle}
          hasEmail={hasEmail}
          errorParam={searchParams.error}
        />

        <p className="mt-6 text-center text-[12px] text-parchment/40 leading-relaxed">
          Bằng việc đăng nhập, bạn đồng ý với điều khoản sử dụng và chính sách
          bảo mật của Vận Mệnh.
        </p>
      </div>
    </div>
  );
}
