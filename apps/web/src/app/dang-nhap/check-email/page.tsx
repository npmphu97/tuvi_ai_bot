import Link from 'next/link';

const SERIF_FONT = "'Cormorant Garamond',serif";

export const metadata = { title: 'Kiểm tra email · Vận Mệnh' };

export default function CheckEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md rounded-3xl border border-gold/30 bg-cosmic-panel p-8 md:p-10 text-center shadow-[0_30px_80px_-30px_rgba(200,145,70,0.2)]">
        <div className="text-5xl">📨</div>
        <h1
          className="mt-4 text-3xl font-serif text-parchment"
          style={{ fontFamily: SERIF_FONT }}
        >
          Kiểm tra email
        </h1>
        <p className="mt-3 text-parchment/60 leading-relaxed">
          Một link đăng nhập đã được gửi tới email của bạn. Mở email và bấm
          link để hoàn tất đăng nhập. Link có hiệu lực trong 24 giờ.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-[12px] tracking-[0.25em] uppercase text-gold/70 hover:text-gold transition"
        >
          ← Trang chủ
        </Link>
      </div>
    </div>
  );
}
