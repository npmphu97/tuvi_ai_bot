import Link from 'next/link';

const SERIF_FONT = "'Cormorant Garamond',serif";

export default function NotFound() {
  return (
    <section className="relative px-6 py-24">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#4a6c7a] font-semibold">
          404 · Không tìm thấy
        </div>
        <h1
          className="mt-4 text-5xl font-serif text-[#f4ecd6]"
          style={{ fontFamily: SERIF_FONT }}
        >
          Cung hoàng đạo <em className="text-[#c89146]">không tồn tại</em>
        </h1>
        <p className="mt-4 text-[#b8a47c]">
          Đường dẫn bạn truy cập không khớp với 12 cung Tây Phương. Quay lại
          danh sách để chọn cung khác.
        </p>
        <Link
          href="/hoang-dao"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-metal text-[#05060a] hover:brightness-110 transition"
        >
          ← Xem 12 Cung Hoàng Đạo
        </Link>
      </div>
    </section>
  );
}
