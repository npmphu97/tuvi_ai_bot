'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TuviDisc } from '@/components/emblems/TuviDisc';

export default function Footer() {
  const [year, setYear] = useState('');
  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  return (
    <footer className="relative mt-10 border-t border-gold/20 bg-cosmic-panel text-parchment/70">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <TuviDisc size={38} />
            <div>
              <div className="text-[11px] tracking-[0.35em] text-gold uppercase">Mệnh Lý</div>
              <div
                className="text-xl font-serif italic bg-clip-text text-transparent bg-gold-metal"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Vận Mệnh
              </div>
            </div>
          </div>
          <p className="mt-5 text-parchment/50 max-w-md leading-relaxed text-sm">
            Một quyển sách số mệnh cổ truyền, được dịch và mở rộng cho người
            hiện đại. Tử vi · Tứ trụ · Bói bài · Phong thủy · Gieo quẻ.
          </p>
        </div>

        {/* Explore */}
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">Khám phá</div>
          <ul className="space-y-2 text-sm text-parchment/60">
            <li><Link href="/#tarot" className="hover:text-gold-light transition">Bói Bài Tarot</Link></li>
            <li><Link href="/ngay-tot" className="hover:text-gold-light transition">Xem Ngày Tốt</Link></li>
            <li><Link href="/#zodiac" className="hover:text-gold-light transition">12 Con Giáp</Link></li>
            <li><Link href="/blog" className="hover:text-gold-light transition">Blog Kiến Thức</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">Liên hệ</div>
          <ul className="space-y-2 text-sm text-parchment/60">
            <li>Email · tuanmanh97x@gmail.com</li>
            <li>Hotline · 0963 590 255</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-parchment/10 px-6 py-5 text-center text-xs text-parchment/35">
        © <span suppressHydrationWarning>{year}</span> Vận Mệnh · Khoa Chiêm Tinh &amp; Huyền Học Á Đông
      </div>
    </footer>
  );
}
