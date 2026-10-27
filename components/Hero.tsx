"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center pt-40 pb-28 px-4"
      style={{ minHeight: "100vh" }}
    >
      {/* Very subtle ambient red orbs */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(229,57,53,0.05) 0%, rgba(255,82,82,0.02) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute right-1/4 bottom-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(229,57,53,0.04) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Badge */}
      <div
        className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold tracking-widest uppercase"
        style={{
          background: "#fff5f5",
          border: "1px solid rgba(229, 57, 53, 0.2)",
          color: "#e53935",
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }}
        />
        Cube 2048 Now Available
      </div>

      {/* Main heading */}
      <h1
        className="animate-fade-in-up delay-100 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        <span style={{ color: "#171717" }}>PLAY.</span>{" "}
        <span style={{ color: "#e53935" }}>MERGE.</span>
        <br />
        <span
          style={{
            background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          CONQUER.
        </span>
      </h1>

      {/* Subtitle */}
      <p
        className="animate-fade-in-up delay-200 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10"
        style={{ color: "#666666" }}
      >
        Pixelverse is a collection of{" "}
        <span style={{ color: "#e53935", fontWeight: 600 }}>simple, addictive browser games</span>.{" "}
        No downloads. No accounts. Just pure gameplay.
      </p>

      {/* CTA buttons */}
      <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 items-center">
        <Link
          href="/games/cube-2048"
          id="hero-play-now"
          className="btn-red relative px-8 py-4 rounded-xl text-base font-bold tracking-wide"
        >
          ▶ PLAY CUBE 2048
        </Link>

        <a
          href="#games"
          id="hero-explore-games"
          className="px-8 py-4 rounded-xl text-base font-semibold tracking-wide transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: "#ffffff",
            border: "1px solid #e5e5e5",
            color: "#666666",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#f8f8f8";
            (e.currentTarget as HTMLElement).style.color = "#171717";
            (e.currentTarget as HTMLElement).style.borderColor = "#bdbdbd";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#ffffff";
            (e.currentTarget as HTMLElement).style.color = "#666666";
            (e.currentTarget as HTMLElement).style.borderColor = "#e5e5e5";
          }}
        >
          EXPLORE GAMES
        </a>
      </div>

      {/* Scroll indicator */}
      <div
        className="animate-bounce-subtle absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "#bdbdbd" }}
        aria-hidden="true"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <rect x="5" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="6" r="2" fill="currentColor" />
          <path d="M4 18l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
