"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import the game — Phaser uses browser APIs and must not run on the server
const Cube2048Game = dynamic(() => import("@/games/cube2048/Cube2048Game"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ minHeight: "360px" }}
    >
      <div className="text-center">
        <div
          className="mx-auto mb-4 w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "rgba(229,57,53,0.2)", borderTopColor: "#e53935" }}
        />
        <p style={{ color: "#666666", fontSize: "14px" }}>Loading game…</p>
      </div>
    </div>
  ),
});

export default function Cube2048Page() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [restartSignal, setRestartSignal] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleScoreChange = useCallback((s: number) => setScore(s), []);
  const handleHighScoreChange = useCallback((hs: number) => setHighScore(hs), []);
  const handleGameOver = useCallback((s: number) => {
    setFinalScore(s);
    setGameOver(true);
  }, []);
  const handlePauseChange = useCallback((p: boolean) => setIsPaused(p), []);

  const handleRestart = () => {
    setGameOver(false);
    setScore(0);
    setRestartSignal((n) => n + 1);
  };

  const handleTogglePause = () => {
    setIsPaused((p) => !p);
  };

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "#ffffff" }}
    >
      {/* Ambient faint red and gray gradient */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(229,57,53,0.025) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.015) 0%, transparent 55%)",
        }}
      />

      {/* Top bar */}
      <header
        className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-4"
        style={{ borderBottom: "1px solid #e5e5e5", background: "rgba(255, 255, 255, 0.95)" }}
      >
        <Link
          href="/"
          id="back-to-home"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "#ffffff",
            border: "1px solid #e5e5e5",
            color: "#666666",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Home
        </Link>

        <div className="flex items-center gap-2">
          <span
            className="text-base font-black tracking-widest hidden sm:block"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: "#171717",
            }}
          >
            PIXEL<span style={{ color: "#e53935" }}>VERSE</span>
          </span>
        </div>

        <button
          id="instructions-toggle"
          onClick={() => setShowInstructions((s) => !s)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: "#ffffff",
            border: "1px solid #e5e5e5",
            color: "#666666",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
          }}
          aria-expanded={showInstructions}
          aria-controls="instructions-panel"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 7v5M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          How to Play
        </button>
      </header>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-0 lg:gap-6 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Left panel: game info + controls */}
        <aside className="lg:w-64 flex flex-col gap-4 mb-6 lg:mb-0">
          {/* Game title */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#e53935" }}>
              Now Playing
            </p>
            <h1
              className="text-2xl font-black"
              style={{ fontFamily: "'Orbitron', sans-serif", color: "#171717" }}
            >
              Cube 2048
            </h1>
            <p className="text-sm mt-1" style={{ color: "#666666" }}>
              Merge cubes to reach 2048!
            </p>
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <ScoreCard label="Score" value={score} color="#e53935" />
            <ScoreCard label="Best" value={highScore} color="#c62828" />
          </div>

          {/* Controls */}
          <div className="flex lg:flex-col gap-3">
            <button
              id="game-restart-btn"
              onClick={handleRestart}
              className="btn-red flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7a5 5 0 1 0 1-2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M2 4v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Restart
            </button>

            <button
              id="game-pause-btn"
              onClick={handleTogglePause}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isPaused ? "#fff5f5" : "#ffffff",
                border: isPaused ? "1px solid rgba(229,57,53,0.3)" : "1px solid #e5e5e5",
                color: isPaused ? "#e53935" : "#666666",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {isPaused ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M4 3l7 4-7 4V3z" fill="currentColor" />
                  </svg>
                  Resume
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="3" height="8" rx="1" fill="currentColor" />
                    <rect x="8" y="3" width="3" height="8" rx="1" fill="currentColor" />
                  </svg>
                  Pause
                </>
              )}
            </button>
          </div>

          {/* Instructions panel */}
          {showInstructions && (
            <div
              id="instructions-panel"
              className="rounded-xl p-4 text-sm"
              style={{
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <h2 className="font-bold mb-3" style={{ color: "#171717", fontFamily: "'Orbitron', sans-serif", fontSize: "13px" }}>
                How to Play
              </h2>
              <ul className="space-y-2" style={{ color: "#666666" }}>
                <li>🎮 Use <strong style={{ color: "#171717" }}>Arrow Keys</strong> or <strong style={{ color: "#171717" }}>WASD</strong> to slide tiles</li>
                <li>👆 <strong style={{ color: "#171717" }}>Swipe</strong> on touch screens</li>
                <li>🔢 Matching tiles <strong style={{ color: "#e53935" }}>merge</strong> and double in value</li>
                <li>🏆 Reach <strong style={{ color: "#e53935" }}>2048</strong> to win!</li>
                <li>💀 Game over when no moves remain</li>
              </ul>
            </div>
          )}
        </aside>

        {/* Game canvas area */}
        <div className="flex-1 flex flex-col items-center">
          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)",
              maxWidth: "520px",
              aspectRatio: "1/1",
            }}
          >
            <Cube2048Game
              onScoreChange={handleScoreChange}
              onHighScoreChange={handleHighScoreChange}
              onGameOver={handleGameOver}
              onPauseChange={handlePauseChange}
              isPaused={isPaused}
              restartSignal={restartSignal}
            />

            {/* Pause overlay */}
            {isPaused && !gameOver && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: "rgba(255, 255, 255, 0.92)", backdropFilter: "blur(6px)" }}
                aria-live="polite"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "#fff5f5", border: "1px solid rgba(229, 57, 53, 0.25)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <rect x="6" y="6" width="6" height="16" rx="2" fill="#e53935" />
                    <rect x="16" y="6" width="6" height="16" rx="2" fill="#e53935" />
                  </svg>
                </div>
                <p className="text-xl font-bold mb-1" style={{ fontFamily: "'Orbitron', sans-serif", color: "#171717" }}>
                  Paused
                </p>
                <p className="text-sm mb-6" style={{ color: "#666666" }}>Game is paused</p>
                <button
                  onClick={handleTogglePause}
                  className="btn-red px-6 py-3 rounded-xl font-bold text-sm transition-all"
                >
                  ▶ Resume
                </button>
              </div>
            )}

            {/* Game over overlay */}
            {gameOver && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(8px)" }}
                role="alertdialog"
                aria-labelledby="gameover-title"
                aria-live="assertive"
              >
                <p className="text-4xl mb-2" aria-hidden="true">💀</p>
                <h2
                  id="gameover-title"
                  className="text-2xl font-black mb-1"
                  style={{ fontFamily: "'Orbitron', sans-serif", color: "#171717" }}
                >
                  Game Over
                </h2>
                <p className="text-sm mb-1" style={{ color: "#666666" }}>No more moves available</p>
                <p className="text-3xl font-black mb-1" style={{ color: "#e53935" }}>
                  {finalScore.toLocaleString()}
                </p>
                <p className="text-xs mb-6" style={{ color: "#999999" }}>
                  Best: {highScore.toLocaleString()}
                </p>
                <button
                  id="gameover-restart-btn"
                  onClick={handleRestart}
                  autoFocus
                  className="btn-red px-6 py-3 rounded-xl font-bold text-sm transition-all"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Mobile control hint */}
          <p className="mt-4 text-xs text-center" style={{ color: "#999999" }}>
            Arrow Keys / WASD · Swipe on mobile
          </p>
        </div>
      </div>
    </main>
  );
}

/** Score display card */
function ScoreCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#666666" }}>
        {label}
      </p>
      <p className="text-2xl font-black" style={{ color, fontFamily: "'Orbitron', sans-serif" }}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
