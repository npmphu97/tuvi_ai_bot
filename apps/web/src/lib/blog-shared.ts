// Client-safe types + constants for blog. KHÔNG import node:fs/path ở đây —
// HomeClient (use client) và blog page (server) đều dùng chung file này.
// File `lib/blog.ts` chứa fs operations chỉ chạy ở server.

export type BlogCategory = 'tu-vi' | 'tarot' | 'hoang-dao' | 'tu-tru' | 'ngay-tot';

export const CATEGORY_LABEL: Record<BlogCategory, string> = {
  'tu-vi': 'Tử Vi Đẩu Số',
  tarot: 'Tarot',
  'hoang-dao': 'Cung Hoàng Đạo',
  'tu-tru': 'Tứ Trụ Bát Tự',
  'ngay-tot': 'Ngày Tốt',
};

export interface BlogFrontmatter {
  title: string;
  description: string;
  category: BlogCategory;
  publishedAt: string;
  updatedAt?: string;
  keywords?: string[];
  cover?: string;
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
  readingMinutes: number;
  coverResolved: string;
}

export interface BlogPost extends BlogPostMeta {
  html: string;
}

export function defaultCoverForCategory(category: BlogCategory): string {
  return `/images/blog/cat-${category}.svg`;
}
