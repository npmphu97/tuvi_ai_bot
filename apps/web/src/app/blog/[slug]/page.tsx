import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllPostSlugs,
  getPostBySlug,
  getRelatedPosts,
  CATEGORY_LABEL,
} from '@/lib/blog';
import { JsonLd } from '@/components/seo/JsonLd';
import { articleSchema, breadcrumbSchema } from '@/lib/seo-schemas';

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Không tìm thấy bài viết' };
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();
  const related = getRelatedPosts(params.slug, 3);
  const publishedDate = new Date(post.publishedAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <>
      <JsonLd
        data={articleSchema({
          title: post.title,
          description: post.description,
          path: `/blog/${post.slug}`,
          image: post.coverResolved,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt ?? post.publishedAt,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: CATEGORY_LABEL[post.category], path: `/blog#cat-${post.category}` },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <nav className="text-[12px] text-[#5a3a1a] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Trang chủ</Link>
          <span className="mx-2 text-[#c89146]">/</span>
          <Link href="/blog" className="hover:underline">Blog</Link>
          <span className="mx-2 text-[#c89146]">/</span>
          <Link href={`/blog#cat-${post.category}`} className="hover:underline">
            {CATEGORY_LABEL[post.category]}
          </Link>
        </nav>

        <header className="mb-10">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#5a3a1a]">
            {CATEGORY_LABEL[post.category]} · {publishedDate} · {post.readingMinutes} phút đọc
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-[#0f0a08] leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-[15.5px] text-[#4a3a30] leading-relaxed">
            {post.description}
          </p>
        </header>

        <article
          className="blog-prose text-[#0f0a08] leading-[1.85] text-[16px]"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {related.length > 0 && (
          <aside className="mt-14 pt-8 border-t border-[#c89146]/35">
            <h2 className="text-lg font-semibold text-[#5a3a1a] mb-4">Bài viết liên quan</h2>
            <ul className="grid md:grid-cols-3 gap-4">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/blog/${r.slug}`}
                    className="block p-4 rounded-lg bg-[#fbf3e2] border border-[#c89146]/40 hover:border-[#5a3a1a] transition"
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#5a3a1a]/80">
                      {CATEGORY_LABEL[r.category]}
                    </p>
                    <p className="mt-1 font-medium text-[14px] text-[#0f0a08] line-clamp-3">
                      {r.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-[#0f0a08] via-[#2a1c14] to-[#5a3a1a] text-[#fbf3e2]">
          <h2 className="text-xl font-semibold text-[#e9d4b6]">
            Lập lá số ngay với AI
          </h2>
          <p className="mt-2 text-[14px] text-[#e9d4b6]/85">
            Trải nghiệm luận giải Tử Vi, Tarot, Tứ Trụ và 12 cung Hoàng Đạo cá nhân hóa bằng AI Deepseek.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/xem-tu-vi"
              className="px-4 py-2 rounded-full bg-[#c89146] text-[#0f0a08] font-semibold text-[13px] hover:bg-[#e9d4b6] transition"
            >
              Xem Tử Vi · 40k
            </Link>
            <Link
              href="/xem-tarot"
              className="px-4 py-2 rounded-full border border-[#c89146]/70 text-[#e9d4b6] font-medium text-[13px] hover:bg-[#c89146]/20 transition"
            >
              Bói Tarot · 5k
            </Link>
            <Link
              href="/tu-tru-bat-tu"
              className="px-4 py-2 rounded-full border border-[#c89146]/70 text-[#e9d4b6] font-medium text-[13px] hover:bg-[#c89146]/20 transition"
            >
              Tứ Trụ · 40k
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
