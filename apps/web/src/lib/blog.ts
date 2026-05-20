import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import {
  defaultCoverForCategory,
  type BlogFrontmatter,
  type BlogPost,
  type BlogPostMeta,
  type BlogCategory,
} from './blog-shared';

export {
  CATEGORY_LABEL,
  defaultCoverForCategory,
  type BlogCategory,
  type BlogFrontmatter,
  type BlogPost,
  type BlogPostMeta,
} from './blog-shared';

// Resolve robust để hoạt động cả khi build chạy từ apps/web (local) lẫn từ monorepo
// root (CF Workers Build). CF Build invokes `pnpm cf:build` từ repo root → process.cwd()
// = repo root → path.join(cwd, 'src/content/blog') sai → empty getAllPosts() → sitemap
// thiếu blog routes + /blog/[slug] 404.
function resolveBlogDir(): string {
  const candidates = [
    path.join(process.cwd(), 'src', 'content', 'blog'),
    path.join(process.cwd(), 'apps', 'web', 'src', 'content', 'blog'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

const BLOG_DIR = resolveBlogDir();

marked.setOptions({ gfm: true, breaks: false });

function readPostFile(slug: string): { fm: BlogFrontmatter; raw: string } | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const file = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(file);
  return { fm: data as BlogFrontmatter, raw: content };
}

function estimateReadingMinutes(text: string): number {
  // ~200 từ/phút cho tiếng Việt, làm tròn lên
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getAllPosts(): BlogPostMeta[] {
  return getAllPostSlugs()
    .map((slug) => {
      const data = readPostFile(slug);
      if (!data) return null;
      return {
        ...data.fm,
        slug,
        readingMinutes: estimateReadingMinutes(data.raw),
        coverResolved: data.fm.cover ?? defaultCoverForCategory(data.fm.category),
      } satisfies BlogPostMeta;
    })
    .filter((p): p is BlogPostMeta => p !== null)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getPostsByCategory(category: BlogCategory): BlogPostMeta[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getPostBySlug(slug: string): BlogPost | null {
  const data = readPostFile(slug);
  if (!data) return null;
  const html = marked.parse(data.raw) as string;
  return {
    ...data.fm,
    slug,
    html,
    readingMinutes: estimateReadingMinutes(data.raw),
    coverResolved: data.fm.cover ?? defaultCoverForCategory(data.fm.category),
  };
}

export function getRelatedPosts(slug: string, limit = 3): BlogPostMeta[] {
  const all = getAllPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current) return [];
  return all
    .filter((p) => p.slug !== slug && p.category === current.category)
    .slice(0, limit);
}
