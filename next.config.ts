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
