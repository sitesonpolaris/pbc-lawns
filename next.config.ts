import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
  async redirects() {
    // Old Wix URLs from pbclawns.com
    return [
      { source: "/copy-of-services", destination: "/work", permanent: true },
      { source: "/book-online", destination: "/quote", permanent: true },
      { source: "/booking-calendar/:slug*", destination: "/quote", permanent: true },
      { source: "/service-page/:slug*", destination: "/services", permanent: true },
      { source: "/members-area/:path*", destination: "/portal", permanent: true },
      { source: "/account/:path*", destination: "/portal", permanent: true },
    ];
  },
};

export default nextConfig;
