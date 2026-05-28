import Image from 'next/image';
import Link from 'next/link';
import { MysticCard } from '@/components/ui/MysticCard';
import { GoldText } from '@/components/ui/GoldText';
import { CATEGORY_LABEL, type BlogPostMeta } from '@/lib/blog-shared';

/**
 * ArticlesSection — UNIFIED tone. 6 blog cards, dark + gold border.
 */
export function ArticlesSection({ posts }: { posts: BlogPostMeta[] }) {
  return (
    <section id="articles" className="relative py-20 px-6 bg-cosmic-panel">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-[11px] tracking-[0.4em] text-gold/60 font-semibold uppercase">
              古 學 · Cổ Học
            </div>
            <h2
              className="mt-3 text-[clamp(28px,4.5vw,52px)] font-serif leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              <span className="text-parchment">Bài viết</span>{' '}
              <GoldText>tuyển chọn</GoldText>
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-gold/70 hover:text-gold text-sm transition-colors flex items-center gap-1"
          >
            Tất cả bài viết <span>→</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <MysticCard tone="neutral" className="overflow-hidden flex flex-col h-full">
                {/* Cover image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.coverResolved}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                  />
                  {/* Dark overlay for readability */}
                  <div className="absolute inset-0 bg-cosmic-DEFAULT/30" />
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="px-2.5 py-1 rounded-full bg-gold/15 border border-gold/25 text-gold/80 tracking-wider">
                      {CATEGORY_LABEL[post.category]}
                    </span>
                    <span className="text-parchment/30">·</span>
                    <span className="text-parchment/40">{post.readingMinutes} phút đọc</span>
                  </div>

                  <h3
                    className="mt-4 text-[18px] font-serif text-parchment leading-snug group-hover:text-gold transition-colors"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {post.title}
                  </h3>

                  <div className="mt-auto pt-5 inline-flex items-center gap-2 text-gold/60 group-hover:text-gold text-sm transition-colors">
                    Đọc tiếp{' '}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </MysticCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
