import type { Metadata, Viewport } from "next";
import { fraunces, figtree } from "@/lib/fonts";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "PBC Lawn Service | Lawn Care in Charlotte, NC",
    template: "%s | PBC Lawn Service",
  },
  description:
    "Perfection by Cooper: affordable lawn care in the Charlotte area. Mowing, edging, fertilization and weed control, mulch, planting, cleanups and pressure washing. Free quotes: (704) 219-0676.",
  openGraph: {
    type: "website",
    siteName: site.name,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "A freshly striped lawn by PBC Lawn Service" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#10291b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${figtree.variable} antialiased`}>
      <head>
        <script
          // Marks JS as available so reveal animations only hide content when they can show it again.
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
