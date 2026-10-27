"use client";

import { useState, useEffect } from "react";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      className="relative z-10 border-t"
      style={{ borderColor: "#e5e5e5", background: "#f8f8f8" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-black tracking-widest"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: "#171717",
            }}
          >
            PIXEL<span style={{ color: "#e53935" }}>VERSE</span>
          </span>
        </div>
        <p className="text-sm" style={{ color: "#666666" }}>
          {year !== null ? `© ${year} Pixelverse. Built for fun.` : "© Pixelverse. Built for fun."}
        </p>
        <div className="flex gap-4 text-sm" style={{ color: "#999999" }}>
          <span>All games client-side</span>
          <span aria-hidden="true">·</span>
          <span>No tracking</span>
        </div>
      </div>
    </footer>
  );
}
