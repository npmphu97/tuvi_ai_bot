// Load root .env trước khi Next khởi tạo — tránh phải duplicate biến môi trường
// vào apps/web/.env.local. Next vẫn sẽ override bằng .env.local nếu có file đó.
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@tuvi/core',
    '@tuvi/lichvannien',
    '@tuvi/db',
    '@tuvi/ai',
    '@tuvi/astrology',
    '@tuvi/pdf',
    '@tuvi/tarot',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/metabismuth/tarot-json/**',
      },
    ],
    // Cho phép local SVG (blog covers ở /public/images/blog/*.svg). Chỉ self-hosted,
    // không nhận SVG từ user upload → safe. CSP đính kèm chặn inline scripts trong SVG.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Force Next include 15 .md blog posts vào file tracing output cho các route
  // dùng getAllPosts()/getPostBySlug(). Không có dòng này, Next chỉ trace import,
  // không trace dynamic fs.readdirSync → CF Workers runtime không thấy .md → empty.
  outputFileTracingIncludes: {
    '/sitemap.xml': ['./src/content/blog/**/*.md'],
    '/blog': ['./src/content/blog/**/*.md'],
    '/blog/**': ['./src/content/blog/**/*.md'],
    '/': ['./src/content/blog/**/*.md'],
  },
  // Monorepo: trỏ Next tracing root về repo root để bao luôn package symlinks.
  outputFileTracingRoot: require('path').resolve(__dirname, '../..'),
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    return config;
  },
};

module.exports = nextConfig;
