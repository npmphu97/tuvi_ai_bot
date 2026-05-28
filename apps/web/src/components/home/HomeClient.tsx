'use client';

import { CosmicBg } from '@/components/CosmicBg';
import { LunarCalendar } from '@/components/LunarCalendar';
import { type BlogPostMeta } from '@/lib/blog-shared';
import { HeroCosmic } from './HeroCosmic';
import { EightDoorsGrid } from './EightDoorsGrid';
import { ZodiacTodayGrid } from './ZodiacTodayGrid';
import { AnimalsToday } from './AnimalsToday';
import { LucDieuStrip } from './LucDieuStrip';
import { ArticlesSection } from './ArticlesSection';
import { CtaFooter } from './CtaFooter';

/**
 * HomeClient — layered scroll story home page.
 *
 * Section order:
 *  1. HeroCosmic      — unified dark + gold cosmic hero
 *  2. EightDoorsGrid  — EAST · 8 service cards
 *  3. ZodiacTodayGrid — WEST · 12 horoscope cung hôm nay
 *  4. AnimalsToday    — EAST · 12 con giáp hôm nay
 *  5. LunarCalendar   — EAST · lịch vạn niên (existing, dark-wrapped)
 *  6. LucDieuStrip    — WEST · lục diệu 6 slots
 *  7. ArticlesSection — UNIFIED · 6 blog cards
 *  8. CtaFooter       — UNIFIED CTA
 *
 * CosmicBg is rendered at page level (fixed -z-10) as global starfield base.
 */
export default function HomeClient({ featuredPosts }: { featuredPosts: BlogPostMeta[] }) {
  return (
    <div className="relative text-parchment bg-cosmic-DEFAULT">
      {/* Global cosmic starfield — low intensity to not compete with content */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-20">
        <CosmicBg intensity="low" />
      </div>

      {/* 1. HERO */}
      <HeroCosmic />

      {/* 2. EAST · Services */}
      <EightDoorsGrid />

      {/* 3. WEST · Horoscope cung */}
      <ZodiacTodayGrid />

      {/* 4. EAST · Con giáp */}
      <AnimalsToday />

      {/* 5. EAST · Lịch vạn niên — existing component, dark bg wrapper */}
      <section id="lichvannien" className="relative bg-cosmic-panel">
        <LunarCalendar />
      </section>

      {/* 6. WEST · Lục diệu */}
      <LucDieuStrip />

      {/* 7. UNIFIED · Articles */}
      <ArticlesSection posts={featuredPosts} />

      {/* 8. UNIFIED CTA */}
      <CtaFooter />
    </div>
  );
}
