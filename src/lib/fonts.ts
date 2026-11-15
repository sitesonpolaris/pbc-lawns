import localFont from "next/font/local";

export const fraunces = localFont({
  src: "../fonts/fraunces-latin-wght-normal.woff2",
  variable: "--font-fraunces",
  weight: "100 900",
  display: "swap",
});

export const figtree = localFont({
  src: [
    { path: "../fonts/figtree-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/figtree-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/figtree-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/figtree-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-figtree",
  display: "swap",
});
