import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PIXELVERSE – Play. Merge. Conquer.",
  description:
    "Pixelverse is a collection of simple, addictive browser games. Play Cube 2048, Jungle Rush, Hill Climb, and Long Shot — all free, no download required.",
  keywords: ["casual games", "browser games", "2048", "cube merge", "pixelverse", "free games"],
  openGraph: {
    title: "PIXELVERSE – Play. Merge. Conquer.",
    description: "Simple, addictive browser games. Free. No download.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Orbitron:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
