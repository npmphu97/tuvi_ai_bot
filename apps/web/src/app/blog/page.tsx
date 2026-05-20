import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getAllPosts, CATEGORY_LABEL, type BlogCategory } from '@/lib/blog';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, collectionPageSchema } from '@/lib/seo-schemas';

export const metadata: Metadata = {
  title: 'Blog Tử Vi, Tarot, Hoàng Đạo, Tứ Trụ — Kiến thức huyền học',
  description:
    'Kho bài viết kiến thức về Tử Vi Đẩu Số, Tarot, 12 cung Hoàng Đạo, Tứ Trụ Bát Tự, chọn ngày tốt. Hướng dẫn xem lá số, luận giải, ý nghĩa từng lá Tarot.',
  alternates: { canonical: '/blog' },
};

const CATEGORIES: BlogCategory[] = ['tu-vi', 'tarot', 'hoang-dao', 'tu-tru', 'ngay-tot'];

const SERIF = "'Cormorant Garamond', serif";

export default function BlogIndex({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const posts = getAllPosts();
  const activeCat = (CATEGORIES as string[]).includes(searchParams.cat ?? '')
    ? (searchParams.cat as BlogCategory)
    : null;
  const filtered = activeCat ? posts.filter((p) => p.category === activeCat) : posts;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />
      <JsonLd
        data={collectionPageSchema({
          name: 'Blog Tử Vi, Tarot, Hoàng Đạo, Tứ Trụ',
          description:
            'Kho bài viết kiến thức huyền học, hướng dẫn xem lá số, luận giải Tarot, cung hoàng đạo và chọn ngày tốt.',
          path: '/blog',
          items: posts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` })),
        })}
      />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="flex items-start justify-between gap-4 mb-10">
          <div>
            <h1
              className="text-4xl sm:text-5xl text-[#0f0a08] italic leading-none"
              style={{ fontFamily: SERIF }}
            >
              Bài viết<span className="text-[#c89146]">.</span>
            </h1>
            <p className="mt-2 text-[13px] text-[#4a3a30]">
              {activeCat
                ? `${CATEGORY_LABEL[activeCat]} · ${filtered.length} bài`
                : `${posts.length} bài · Tử Vi · Tarot · Hoàng Đạo · Tứ Trụ · Ngày Tốt`}
            </p>
          </div>

          <details className="relative group">
            <summary
              className="list-none cursor-pointer h-10 w-10 rounded-full border border-[#c89146]/50 flex items-center justify-center text-[#5a3a1a] hover:bg-[#c89146]/15 transition select-none"
              aria-label="Lọc bài viết theo chủ đề"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </svg>
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#fbf3e2] border border-[#c89146]/40 shadow-lg p-2 z-20">
              <Link
                href="/blog"
                className={`block px-3 py-2 rounded-lg text-[13px] transition ${
                  !activeCat
                    ? 'bg-[#5a3a1a] text-[#fbf3e2]'
                    : 'text-[#0f0a08] hover:bg-[#c89146]/15'
                }`}
              >
                Tất cả · {posts.length}
              </Link>
              {CATEGORIES.map((cat) => {
                const count = posts.filter((p) => p.category === cat).length;
                const active = activeCat === cat;
                return (
                  <Link
                    key={cat}
                    href={`/blog?cat=${cat}`}
                    className={`block px-3 py-2 rounded-lg text-[13px] transition ${
                      active
                        ? 'bg-[#5a3a1a] text-[#fbf3e2]'
                        : 'text-[#0f0a08] hover:bg-[#c89146]/15'
                    }`}
                  >
                    {CATEGORY_LABEL[cat]} · {count}
                  </Link>
                );
              })}
            </div>
          </details>
        </header>

        <ul className="space-y-5">
          {filtered.map((post) => (
            <li key={post.slug}>
              <article className="bg-[#fbf3e2] rounded-2xl border border-[#c89146]/35 overflow-hidden shadow-sm hover:shadow-md hover:border-[#c89146]/70 transition flex flex-col sm:flex-row">
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative shrink-0 h-44 sm:h-auto sm:w-52 overflow-hidden"
                  aria-label={post.title}
                >
                  <Image
                    src={post.coverResolved}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 208px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-[0.18em] text-[#fbf3e2] bg-[#0f0a08]/55 backdrop-blur px-2 py-0.5 rounded-full">
                    {CATEGORY_LABEL[post.category]}
                  </span>
                </Link>

                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <Link href={`/blog/${post.slug}`} className="group">
                    <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#0f0a08] leading-snug group-hover:text-[#5a3a1a] transition">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="mt-2 text-[13.5px] text-[#4a3a30] leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {post.description}
                  </p>
                  <div className="mt-auto pt-4 flex items-center gap-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#5a3a1a]/60 text-[12.5px] text-[#5a3a1a] hover:bg-[#5a3a1a] hover:text-[#fbf3e2] transition"
                    >
                      Đọc tiếp
                    </Link>
                    <span className="text-[12px] text-[#4a3a30]/70">
                      {post.readingMinutes} phút đọc
                    </span>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="text-center text-[14px] text-[#4a3a30] py-12">
            Chưa có bài viết nào trong chủ đề này.
          </p>
        )}
      </main>
    </>
  );
}
