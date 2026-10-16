/** @type {import('next').NextConfig} */
// Static export for Cloudflare Pages: `next build` writes the site to ./out
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
