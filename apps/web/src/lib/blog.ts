import blogData from './blog-data.json';
import type { BlogCategory, BlogPost, BlogPostMeta } from './blog-shared';

export {
  CATEGORY_LABEL,
  defaultCoverForCategory,
  type BlogCategory,
  type BlogFrontmatter,
  type BlogPost,
  type BlogPostMeta,
} from './blog-shared';

// JSON pre-generated từ scripts/build-blog-data.mjs lúc build (đọc 15 .md →
// parse frontmatter + render markdown → HTML). Import statically thay vì
// fs.readFileSync runtime → tương thích CF Workers / edge runtime.
const ALL_POSTS: BlogPost[] = blogData as BlogPost[];

const POSTS_META: BlogPostMeta[] = ALL_POSTS.map(({ html, ...meta }) => meta);

export function getAllPostSlugs(): string[] {
  return ALL_POSTS.map((p) => p.slug);
}

export function getAllPosts(): BlogPostMeta[] {
  return POSTS_META;
}

export function getPostsByCategory(category: BlogCategory): BlogPostMeta[] {
  return POSTS_META.filter((p) => p.category === category);
}

export function getPostBySlug(slug: string): BlogPost | null {
  return ALL_POSTS.find((p) => p.slug === slug) ?? null;
}

export function getRelatedPosts(slug: string, limit = 3): BlogPostMeta[] {
  const current = POSTS_META.find((p) => p.slug === slug);
  if (!current) return [];
  return POSTS_META.filter(
    (p) => p.slug !== slug && p.category === current.category,
  ).slice(0, limit);
}
