// Pre-build: đọc 15 .md trong src/content/blog/ → output 1 JSON file
// src/lib/blog-data.json. Code import JSON statically, KHÔNG cần fs.readFileSync
// ở runtime → tương thích CF Workers / edge runtime.
//
// Chạy tự động trước `next build` qua chain trong package.json.
// Khi thêm/sửa .md, regenerate bằng: pnpm --filter @tuvi/web run build-blog

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(APP_ROOT, 'src', 'content', 'blog');
const OUT = path.join(APP_ROOT, 'src', 'lib', 'blog-data.json');

marked.setOptions({ gfm: true, breaks: false });

function estimateReadingMinutes(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function defaultCoverForCategory(category) {
  return `/images/blog/cat-${category}.svg`;
}

const files = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.md'))
  .sort();

const posts = files.map((f) => {
  const slug = f.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf8');
  const { data, content } = matter(raw);
  const html = marked.parse(content);
  return {
    ...data,
    slug,
    html,
    readingMinutes: estimateReadingMinutes(content),
    coverResolved: data.cover ?? defaultCoverForCategory(data.category),
  };
});

// Sort by publishedAt DESC
posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

fs.writeFileSync(OUT, JSON.stringify(posts, null, 2), 'utf8');
console.log(`[build-blog-data] wrote ${posts.length} posts → src/lib/blog-data.json`);
