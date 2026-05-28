import Link from 'next/link';

const SERIF_FONT = "'Cormorant Garamond',serif";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1
        className="font-serif text-4xl text-[#f4ecd6]"
        style={{ fontFamily: SERIF_FONT }}
      >
        Không tìm thấy <em className="text-[#4a6c7a]">lá số</em>
      </h1>
      <p className="mt-3 text-[#b8a47c]">
        Đường dẫn không hợp lệ, lá số chưa tồn tại, hoặc bạn không có quyền xem.
      </p>
      <div className="mt-6 flex gap-3 justify-center flex-wrap">
        <Link
          href="/lich-su"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#c89146]/30 bg-[#14121a] text-[#f4ecd6] font-semibold text-[13.5px] hover:border-[#c89146]/60 transition-colors"
        >
          ← Lịch sử của tôi
        </Link>
        <Link
          href="/xem-tu-vi"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#c89146] to-[#f4d57a] text-[#05060a] font-semibold text-[13.5px] hover:brightness-110 transition-all"
        >
          ✦ Lập lá số mới
        </Link>
      </div>
    </section>
  );
}
