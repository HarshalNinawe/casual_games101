import Header from "@/components/Header";
import Hero from "@/components/Hero";
import GameGrid from "@/components/GameGrid";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

export default function HomePage() {
  return (
    <main className="relative min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Ambient background gradient */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 15%, rgba(229,57,53,0.025) 0%, transparent 50%), radial-gradient(ellipse at 80% 85%, rgba(0,0,0,0.015) 0%, transparent 50%)",
        }}
      />

      {/* Animated particle canvas */}
      <ParticleBackground />

      {/* Site header */}
      <Header />

      {/* Page content */}
      <div className="relative z-10">
        <Hero />
        <GameGrid />
        <Footer />
      </div>
    </main>
  );
}
