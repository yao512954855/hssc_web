import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/generated-images/:path*",
        destination: "/api/public-files/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/generated-images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0" },
          // 明确声明内容类型，避免优化器在内部抓取时得到空 content-type
          { key: "Content-Type", value: "image/png" },
        ],
      },
    ];
  },
};

export default nextConfig;
