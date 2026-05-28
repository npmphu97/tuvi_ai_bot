import Link from 'next/link';

const SERIF_FONT = "'Cormorant Garamond',serif";

export const metadata = {
  title: 'Xóa dữ liệu · Vận Mệnh',
  description: 'Cách yêu cầu xóa toàn bộ dữ liệu cá nhân khỏi hệ thống.',
};

export default function DataDeletion() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 leading-[1.85]">
      <Link
        href="/"
        className="text-[11px] tracking-[0.3em] text-gold/70 hover:text-gold uppercase transition"
      >
        ← Trang chủ
      </Link>
      <h1
        className="mt-4 text-4xl md:text-5xl font-serif italic text-parchment"
        style={{ fontFamily: SERIF_FONT }}
      >
        Xóa dữ liệu cá nhân
      </h1>
      <p className="mt-2 text-[13px] text-parchment/50">
        Hướng dẫn yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan.
      </p>

      <section className="mt-8 space-y-5 text-[15px] text-parchment/80">
        <h2
          className="text-2xl font-semibold text-gold mt-8"
          style={{ fontFamily: SERIF_FONT }}
        >
          Cách tự xóa tài khoản (đang phát triển)
        </h2>
        <p>
          Tính năng tự xóa tài khoản qua giao diện đang được phát triển. Trong
          thời gian này, vui lòng yêu cầu xóa qua email.
        </p>

        <h2
          className="text-2xl font-semibold text-gold mt-8"
          style={{ fontFamily: SERIF_FONT }}
        >
          Yêu cầu xóa qua email
        </h2>
        <p>Gửi email tới <strong className="text-parchment">tuanmanh97x@gmail.com</strong> với nội dung:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Tiêu đề: <strong className="text-parchment">Yêu cầu xóa dữ liệu cá nhân</strong></li>
          <li>Email đăng ký tài khoản</li>
          <li>Lý do (tuỳ chọn)</li>
        </ul>
        <p>
          Chúng tôi sẽ xác nhận và xóa toàn bộ dữ liệu trong vòng{' '}
          <strong className="text-parchment">7 ngày làm việc</strong>:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Tài khoản đăng nhập (Google / Email link)</li>
          <li>Tất cả lá số tử vi đã lập</li>
          <li>Lịch sử giao dịch và số dư còn lại (sẽ hoàn lại nếu &gt; 0)</li>
          <li>Session và cookie</li>
        </ul>

        <h2
          className="text-2xl font-semibold text-gold mt-8"
          style={{ fontFamily: SERIF_FONT }}
        >
          Dữ liệu giữ lại theo nghĩa vụ pháp lý
        </h2>
        <p>
          Chỉ giữ lại các bản ghi giao dịch tài chính (anonymized — không kèm
          email/tên) theo quy định kế toán và thuế của Việt Nam (5 năm).
        </p>

        <h2
          className="text-2xl font-semibold text-gold mt-8"
          style={{ fontFamily: SERIF_FONT }}
        >
          Yêu cầu xóa quyền truy cập từ Google
        </h2>
        <p>
          Nếu bạn đăng nhập bằng Google và muốn xóa quyền truy cập của Vận Mệnh:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            Vào{' '}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/80 underline hover:text-gold transition"
            >
              myaccount.google.com/permissions
            </a>{' '}
            → chọn Vận Mệnh → Remove access.
          </li>
        </ul>
        <p>
          Việc xoá ở Google chỉ rút quyền OAuth — KHÔNG xoá dữ liệu trong hệ
          thống của chúng tôi. Phải gửi email để xoá hoàn toàn.
        </p>
      </section>
    </article>
  );
}
