"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { BatTuChart } from "@/lib/bat-tu";
import TuTruResultView from "./TuTruResultView";
import { toast } from "@/components/ui/toast";
import { formatVnd } from "@/lib/money";
import { emitOptimisticBalance } from "@/lib/wallet-sse";
import { trackPurchase } from "@/lib/track-purchase";
import { CosmicBg } from "@/components/CosmicBg";
import { GoldText } from "@/components/ui/GoldText";
import { ScrollFrame } from "@/components/ui/ScrollFrame";
import { GoldButton } from "@/components/ui/GoldButton";

const SERIF = "'Cormorant Garamond',serif";
const CHI_TV = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];

// Parchment-context input
const INPUT = "w-full h-11 px-4 rounded-xl border border-parchment-deep/50 bg-parchment/80 text-parchment-ink placeholder:text-parchment-deep/60 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition text-[14px]";

type Gender = "male" | "female";

interface FormState { name: string; gender: Gender; year: string; month: string; day: string; hour: number; birthPlace: string; }

function FieldLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[#5a3a1a] text-[15px]">{icon}</span>
      <span className="text-[13.5px] font-semibold text-parchment-ink">{children}</span>
    </div>
  );
}

function SegChoice({ value, onChange, options }: { value: Gender; onChange: (v: Gender) => void; options: { value: Gender; label: string; icon: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={`h-[60px] rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${active ? "border-gold bg-gradient-to-br from-[#f5e3c0] to-[#e9c98a] shadow-goldGlow" : "border-parchment-deep/40 bg-parchment/70 hover:border-gold/60"}`}
          >
            <div className={`text-xl leading-none ${active ? "text-[#5a3a1a]" : "text-[#4a6c7a]"}`}>{o.icon}</div>
            <div className="text-[13px] font-semibold text-parchment-ink">{o.label}</div>
          </button>
        );
      })}
    </div>
  );
}

export default function TuTruClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [form, setForm] = useState<FormState>({ name: "", gender: "male", year: "", month: "", day: "", hour: 6, birthPlace: "" });
  const [chart, setChart] = useState<BatTuChart | null>(null);
  const [chartId, setChartId] = useState<string | null>(null);
  const [chartMeta, setChartMeta] = useState<{ name: string; gender: Gender } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insufficient, setInsufficient] = useState<{ balance: number; required: number } | null>(null);

  const up = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setInsufficient(null);
    if (!session?.user) { router.push("/dang-nhap?callbackUrl=/tu-tru-bat-tu"); return; }
    const name = form.name.trim();
    if (!name) { setError("Vui lòng nhập họ và tên."); return; }
    const y = +form.year, m = +form.month, d = +form.day;
    if (!y || !m || !d) { setError("Vui lòng nhập đầy đủ Ngày / Tháng / Năm sinh."); return; }

    setLoading(true); setChart(null); setChartId(null);
    const PRICE = 5000;
    emitOptimisticBalance({ balanceVnd: Math.max(0, (session?.user?.balanceVnd ?? 0) - PRICE), delta: -PRICE, reason: "charge", service: "tu-tru" });

    try {
      const res = await fetch("/api/tu-tru/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gender: form.gender, year: y, month: m, day: d, hour: form.hour * 2, minute: 0, birthPlace: form.birthPlace.trim() }),
      });
      const body = await res.json();
      if (res.status === 402 && body?.code === "INSUFFICIENT_BALANCE") {
        emitOptimisticBalance({ balanceVnd: Number(body.balanceVnd ?? 0), delta: 0, reason: "charge", service: "tu-tru" });
        setInsufficient({ balance: Number(body.balanceVnd ?? 0), required: Number(body.requiredVnd ?? 5000) });
        toast.error("Số dư không đủ — nạp thêm để xem Tứ Trụ"); return;
      }
      if (!res.ok || !body?.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      setChart(body.chart as BatTuChart); setChartId(body.chartId); setChartMeta({ name: body.name, gender: body.gender });
      if (typeof body.balanceVnd === "number") emitOptimisticBalance({ balanceVnd: body.balanceVnd, delta: -(body.chargedVnd ?? PRICE), reason: "charge", service: "tu-tru" });
      trackPurchase("tu-tru", body.chartId as string);
      toast.success(typeof body.chargedVnd === "number" ? `Đã lập Tứ Trụ — trừ ${formatVnd(body.chargedVnd)}, còn ${formatVnd(body.balanceVnd ?? 0)}` : "Đã lập Tứ Trụ Bát Tự");
    } catch (err) {
      const msg = (err as Error).message; setError(`Không lập được Tứ Trụ: ${msg}`); toast.error(`Lập Tứ Trụ thất bại: ${msg}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen">
      <CosmicBg intensity="low" />

      {/* Hero */}
      <section className="pt-14 pb-8 px-6 text-center">
        <Link href="/" className="inline-block text-[11px] tracking-[0.3em] text-gold/70 hover:text-gold uppercase mb-4">← Trang chủ</Link>
        <div className="text-[11px] tracking-[0.45em] uppercase text-gold/60 mb-3">四 柱 八 字 · Bát Tự</div>
        <GoldText as="h1" className="mb-3 font-serif text-[clamp(48px,7vw,90px)] leading-[0.95] block">Tứ Trụ Bát Tự</GoldText>
        <p className="max-w-2xl mx-auto text-gold-light/70 text-[15px]">
          Lập 4 trụ Năm – Tháng – Ngày – Giờ theo Can Chi. Luận giải Nhật chủ, dụng thần, sự nghiệp, tài lộc, tình duyên.
        </p>
      </section>

      {/* Form in ScrollFrame */}
      <section className="px-4 md:px-6">
        <ScrollFrame title="✦ Nhập Thông Tin Ngày Sinh" className="max-w-xl mx-auto">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <FieldLabel icon="👤">Họ và tên</FieldLabel>
              <input value={form.name} onChange={(e) => up({ name: e.target.value })} placeholder="Nhập tên của bạn" className={INPUT} />
            </div>
            <div>
              <FieldLabel icon="📍">Nơi sinh (không bắt buộc)</FieldLabel>
              <input value={form.birthPlace} onChange={(e) => up({ birthPlace: e.target.value })} placeholder="VD: TP. Hồ Chí Minh" className={INPUT} />
            </div>
            <div>
              <FieldLabel icon="⚥">Giới tính</FieldLabel>
              <SegChoice value={form.gender} onChange={(v) => up({ gender: v })} options={[{ value: "male", label: "Nam", icon: "♂" }, { value: "female", label: "Nữ", icon: "♀" }]} />
            </div>
            <div>
              <FieldLabel icon="📅">Ngày / Tháng / Năm & Giờ sinh (dương lịch)</FieldLabel>
              <div className="grid grid-cols-3 sm:grid-cols-[1fr_1fr_1fr_1.6fr] gap-2.5">
                <input type="number" min="1" max="31" value={form.day} onChange={(e) => up({ day: e.target.value })} placeholder="Ngày" className={INPUT + " text-center"} />
                <input type="number" min="1" max="12" value={form.month} onChange={(e) => up({ month: e.target.value })} placeholder="Tháng" className={INPUT + " text-center"} />
                <input type="number" min="1900" max="2100" value={form.year} onChange={(e) => up({ year: e.target.value })} placeholder="Năm" className={INPUT + " text-center border-gold/60"} />
                <select value={form.hour} onChange={(e) => up({ hour: +e.target.value })}
                  className="col-span-3 sm:col-span-1 h-11 px-4 rounded-xl border border-parchment-deep/50 bg-parchment/80 text-parchment-ink focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition appearance-none"
                  style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='none' stroke='%235a3a1a' stroke-width='1.5' d='M1 1.5l5 5 5-5'/></svg>\")", backgroundPosition: "right 14px center", backgroundRepeat: "no-repeat", paddingRight: "36px" }}
                >
                  {CHI_TV.map((c, i) => { const s = String((23 + i * 2) % 24).padStart(2, "0"); const e2 = String((1 + i * 2) % 24).padStart(2, "0"); return <option key={i} value={i}>Giờ {c} ({s}:00 – {e2}:00)</option>; })}
                </select>
              </div>
            </div>

            {error && <div className="rounded-xl border border-[#c8361d]/40 bg-[#c8361d]/10 px-4 py-3 text-[#c8361d] text-[13px]">⚠ {error}</div>}

            {insufficient && (
              <div className="rounded-xl border border-gold/55 bg-[#f5e3c0]/50 px-4 py-3 text-parchment-ink text-[13px] space-y-2">
                <div>⚠ <strong>Số dư không đủ.</strong> Cần <strong>{formatVnd(insufficient.required)}</strong>, bạn còn <strong>{formatVnd(insufficient.balance)}</strong>.</div>
                <Link href="/vi-cua-toi" className="inline-block px-4 py-1.5 rounded-full bg-[#5a3a1a] text-parchment text-[12px] font-semibold hover:bg-[#4a6c7a]">Nạp tiền vào ví →</Link>
              </div>
            )}

            <div className="rounded-xl border border-gold/40 bg-parchment/60 px-4 py-3 text-[12.5px] text-parchment-ink flex items-center justify-between flex-wrap gap-2">
              <span>Phí: <strong>{formatVnd(5_000)}</strong> / lần xem Tứ Trụ Bát Tự</span>
              <span className="font-serif italic text-[#5a3a1a] text-lg" style={{ fontFamily: SERIF }}>{formatVnd(5_000)}/lần</span>
            </div>

            <GoldButton type="submit" loading={loading} size="lg" className="w-full justify-center">
              <span className="mr-2">✦</span>
              {session?.user ? "Xem Tứ Trụ Bát Tự" : "Đăng nhập để xem Tứ Trụ"}
            </GoldButton>
          </form>
        </ScrollFrame>
      </section>

      {/* Result */}
      {chart && chartId && chartMeta && (
        <section className="mt-12 px-4 md:px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4 flex items-center justify-end">
              <Link href="/lich-su" className="inline-flex items-center gap-1.5 text-[12px] text-gold/70 hover:text-gold">📜 Đã lưu vào lịch sử</Link>
            </div>
            <TuTruResultView chartId={chartId} chart={chart} name={chartMeta.name} gender={chartMeta.gender} />
          </div>
        </section>
      )}
    </div>
  );
}
