"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import UserMenu from "./UserMenu";
import { SunMoon } from "@/components/emblems/SunMoon";

type NavLink = { label: string; href: string };

const NAV_LINKS: NavLink[] = [
  { label: "Trang Chủ", href: "/#top" },
  { label: "Xem Tử Vi", href: "/xem-tu-vi" },
  { label: "Tứ Trụ", href: "/tu-tru-bat-tu" },
  { label: "Xem Ngày Tốt", href: "/ngay-tot" },
  { label: "Hoàng Đạo", href: "/hoang-dao" },
  { label: "Tarot", href: "/xem-tarot" },
  { label: "Blog", href: "/blog" },
];

function isActive(href: string, pathname: string): boolean {
  const base = href.split("#")[0] || "/";
  if (base === "/") return false;
  return pathname === base || pathname.startsWith(`${base}/`);
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-cosmic-panel/80 border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0"
          aria-label="Vận Mệnh · Trang chủ"
        >
          <SunMoon size={30} />
          <span
            className="text-xl font-serif italic bg-clip-text text-transparent bg-gold-metal tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Vận Mệnh
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] text-parchment tracking-wide">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={[
                  "relative hover:text-gold-light transition",
                  active ? "text-gold font-medium" : "text-parchment/80",
                  "after:content-[''] after:absolute after:left-0 after:bottom-[-6px] after:h-px after:bg-gold-metal after:transition-all",
                  active ? "after:w-full" : "after:w-0 hover:after:w-full",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <UserMenu />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="lg:hidden text-gold text-2xl leading-none"
            aria-label="Mở menu"
            aria-expanded={open}
          >
            ≡
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-gold/20 bg-cosmic-panel/95 px-6 py-4 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-parchment/80 hover:text-gold-light transition"
            >
              {link.label}
            </Link>
          ))}
          <div className="my-1 border-t border-gold/15" />
          {session?.user ? (
            <>
              <Link
                href="/vi-cua-toi"
                onClick={() => setOpen(false)}
                className="text-parchment/80 hover:text-gold-light"
              >
                💰 Ví của tôi
              </Link>
              <Link
                href="/lich-su"
                onClick={() => setOpen(false)}
                className="text-parchment/80 hover:text-gold-light"
              >
                📜 Lịch sử của tôi
              </Link>
              {session.user.role === "admin" && (
                <>
                  <Link href="/admin/users" onClick={() => setOpen(false)} className="text-[#c8361d] hover:text-gold font-medium">⚙ Admin · Người dùng</Link>
                  <Link href="/admin/transactions" onClick={() => setOpen(false)} className="text-[#c8361d] hover:text-gold font-medium">💳 Admin · Giao dịch</Link>
                  <Link href="/admin/thong-ke" onClick={() => setOpen(false)} className="text-[#c8361d] hover:text-gold font-medium">📊 Admin · Thống kê</Link>
                </>
              )}
              <button
                type="button"
                onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                className="text-left text-parchment/60 hover:text-parchment"
              >
                ↩ Đăng xuất
              </button>
            </>
          ) : (
            <Link
              href="/dang-nhap"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gold-metal text-cosmic-DEFAULT font-semibold text-[13px] w-fit"
            >
              ✦ Đăng nhập
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
