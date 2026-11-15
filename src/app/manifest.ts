import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PBC Lawn Service",
    short_name: "PBC Lawns",
    description: "Perfection by Cooper: lawn care in the Charlotte area, plus your customer portal.",
    start_url: "/portal",
    display: "standalone",
    background_color: "#f3f5ef",
    theme_color: "#10291b",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
