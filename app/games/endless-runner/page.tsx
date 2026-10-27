"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { GameState, GameOverStats } from "@/games/endlessRunner/types";
import { RUNNER_SOUND_KEY } from "@/games/endlessRunner/gameConfig";

// Dynamically import the Phaser runner game (strictly browser-only)
const EndlessRunnerGame = dynamic(
  () => import("@/games/endlessRunner/EndlessRunnerGame"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ minHeight: "440px" }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "rgba(229,57,53,0.2)", borderTopColor: "#e53935" }}
          />
          <p style={{ color: "#666666", fontSize: "14px" }}>Loading Endless Runner…</p>
        </div>
      </div>
    ),
  }
);

export default function EndlessRunnerPage() {
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("MENU");
  const [gameOverStats, setGameOverStats] = useState<GameOverStats | null>(null);
  const [restartSignal, setRestartSignal] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // External action trigger passed to Phaser (for on-screen mobile buttons)
  const [actionTrigger, setActionTrigger] = useState<{
    action: "LEFT" | "RIGHT" | "JUMP" | "START" | "PAUSE" | "RESUME" | "RESTART" | null;
    timestamp: number;
  }>({ action: null, timestamp: 0 });

  // Load sound mute preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RUNNER_SOUND_KEY);
      if (saved !== null) {
        setIsMuted(saved === "true");
      }
    } catch {
      // noop
    }
  }, []);

  const handleScoreChange = useCallback((s: number) => setScore(s), []);
  const handleDistanceChange = useCallback((d: number) => setDistance(d), []);
  const handleCoinsChange = useCallback((c: number) => setCoins(c), []);
  const handleHighScoreChange = useCallback((hs: number) => setHighScore(hs), []);
  const handleGameStateChange = useCallback((st: GameState) => setGameState(st), []);

  const handleGameOver = useCallback((stats: GameOverStats) => {
    setGameOverStats(stats);
    setGameState("GAME_OVER");
  }, []);

  const handleStartGame = () => {
    setGameOverStats(null);
    setGameState("PLAYING");
    setActionTrigger({ action: "START", timestamp: Date.now() });
  };

  const handleRestart = () => {
    setGameOverStats(null);
    setScore(0);
    setDistance(0);
    setCoins(0);
    setGameState("PLAYING");
    setRestartSignal((n) => n + 1);
  };

  const handleTogglePause = () => {
    if (gameState === "PLAYING") {
      setGameState("PAUSED");
      setActionTrigger({ action: "PAUSE", timestamp: Date.now() });
    } else if (gameState === "PAUSED") {
      setGameState("PLAYING");
      setActionTrigger({ action: "RESUME", timestamp: Date.now() });
    }
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const sendAction = (action: "LEFT" | "RIGHT" | "JUMP") => {
    if (gameState === "MENU") {
      handleStartGame();
      return;
    }
    setActionTrigger({ action, timestamp: Date.now() });
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#ffffff" }}>
      {/* Ambient faint red and gray gradient */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 15%, rgba(229,57,53,0.025) 0%, transparent 55%), radial-gradient(ellipse at 70% 85%, rgba(0,0,0,0.015) 0%, transparent 55%)",
        }}
      />

      {/* Top Header */}
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

        {/* Logo */}
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

        {/* Right utility buttons */}
        <div className="flex items-center gap-2">
          {/* Audio toggle button */}
          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            className="p-2.5 rounded-lg text-sm transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              color: isMuted ? "#999999" : "#e53935",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            {isMuted ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 6h2l3-3v10l-3-3H3V6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <line x1="11" y1="5" x2="15" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="15" y1="5" x2="11" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 6h2l3-3v10l-3-3H3V6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M12 5a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M13.5 3a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            )}
          </button>

          {/* Instructions toggle */}
          <button
            id="instructions-toggle"
            onClick={() => setShowInstructions((s) => !s)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
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
            <span className="hidden sm:inline">How to Play</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-0 lg:gap-6 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Left Side Panel: Info & Stats */}
        <aside className="lg:w-64 flex flex-col gap-4 mb-6 lg:mb-0">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#e53935" }}>
              Now Playing
            </p>
            <h1 className="text-2xl font-black" style={{ fontFamily: "'Orbitron', sans-serif", color: "#171717" }}>
              Endless Runner
            </h1>
            <p className="text-sm mt-1" style={{ color: "#666666" }}>
              3-lane high-speed arcade run!
            </p>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2.5">
            <StatCard label="Distance" value={`${distance} m`} color="#e53935" />
            <StatCard label="Coins" value={String(coins)} color="#d97706" />
            <StatCard label="Score" value={score.toLocaleString()} color="#171717" />
            <StatCard label="Best" value={highScore.toLocaleString()} color="#c62828" />
          </div>

          {/* Action buttons */}
          <div className="flex lg:flex-col gap-3">
            {gameState === "MENU" ? (
              <button
                id="start-run-btn"
                onClick={handleStartGame}
                className="btn-red flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold tracking-wider transition-all duration-200"
              >
                ▶ START RUN
              </button>
            ) : (
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
            )}

            <button
              id="game-pause-btn"
              onClick={handleTogglePause}
              disabled={gameState === "MENU" || gameState === "GAME_OVER"}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: gameState === "PAUSED" ? "#fff5f5" : "#ffffff",
                border: gameState === "PAUSED" ? "1px solid rgba(229,57,53,0.3)" : "1px solid #e5e5e5",
                color: gameState === "PAUSED" ? "#e53935" : "#666666",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {gameState === "PAUSED" ? (
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

          {/* Instructions dropdown */}
          {showInstructions && (
            <div
              id="instructions-panel"
              className="rounded-xl p-4 text-sm animate-fade-in"
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
                <li>
                  🎮 <strong style={{ color: "#171717" }}>A / D</strong> or <strong style={{ color: "#171717" }}>← / →</strong> to change lanes
                </li>
                <li>
                  ⬆ <strong style={{ color: "#171717" }}>W / ↑ / Space</strong> to jump over floor spikes &amp; low hurdles
                </li>
                <li>
                  🛑 <strong style={{ color: "#e53935" }}>Tall Walls</strong> cannot be jumped over—dodge them!
                </li>
                <li>
                  🪙 Collect <strong style={{ color: "#d97706" }}>Coins</strong> for +10 score each
                </li>
                <li>
                  ⚡ Speed accelerates automatically over distance
                </li>
              </ul>
            </div>
          )}
        </aside>

        {/* Center Canvas Area */}
        <div className="flex-1 flex flex-col items-center">
          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)",
              maxWidth: "460px",
              aspectRatio: "3/4",
              minHeight: "460px",
            }}
          >
            <EndlessRunnerGame
              onScoreChange={handleScoreChange}
              onDistanceChange={handleDistanceChange}
              onCoinsChange={handleCoinsChange}
              onHighScoreChange={handleHighScoreChange}
              onGameOver={handleGameOver}
              onGameStateChange={handleGameStateChange}
              gameState={gameState}
              restartSignal={restartSignal}
              isMuted={isMuted}
              onActionTrigger={actionTrigger}
            />

            {/* Menu / Ready Overlay */}
            {gameState === "MENU" && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fade-in"
                style={{ background: "rgba(255, 255, 255, 0.90)", backdropFilter: "blur(6px)" }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: "#fff5f5",
                    border: "1px solid rgba(229, 57, 53, 0.25)",
                    boxShadow: "0 4px 16px rgba(229, 57, 53, 0.15)",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                      stroke="#e53935"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-black mb-1"
                  style={{ fontFamily: "'Orbitron', sans-serif", color: "#171717" }}
                >
                  READY TO RUN?
                </h2>
                <p className="text-sm max-w-xs mb-6" style={{ color: "#666666" }}>
                  Switch lanes, jump over hurdles, and survive the endless speedway!
                </p>
                <button
                  id="menu-start-btn"
                  onClick={handleStartGame}
                  className="btn-red px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider"
                >
                  ▶ START RUN
                </button>
                <p className="mt-4 text-xs" style={{ color: "#999999" }}>
                  Press Space or Tap to start
                </p>
              </div>
            )}

            {/* Pause Overlay */}
            {gameState === "PAUSED" && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fade-in"
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
                  Run Paused
                </p>
                <p className="text-sm mb-6" style={{ color: "#666666" }}>Take a breather</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleTogglePause}
                    className="btn-red px-6 py-3 rounded-xl font-bold text-sm"
                  >
                    ▶ Resume
                  </button>
                  <button
                    onClick={handleRestart}
                    className="px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e5e5",
                      color: "#666666",
                    }}
                  >
                    Restart
                  </button>
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            {gameState === "GAME_OVER" && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-scale-pop"
                style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(8px)" }}
                role="alertdialog"
                aria-labelledby="runner-gameover-title"
                aria-live="assertive"
              >
                <p className="text-4xl mb-2" aria-hidden="true">💥</p>
                <h2
                  id="runner-gameover-title"
                  className="text-2xl font-black mb-1"
                  style={{ fontFamily: "'Orbitron', sans-serif", color: "#171717" }}
                >
                  GAME OVER
                </h2>

                {gameOverStats?.isNewHigh && (
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ background: "#fff5f5", color: "#e53935", border: "1px solid rgba(229,57,53,0.3)" }}
                  >
                    ★ New High Score!
                  </span>
                )}

                {/* Results Score Box */}
                <div
                  className="w-full max-w-xs rounded-xl p-4 my-4"
                  style={{ background: "#f8f8f8", border: "1px solid #e5e5e5" }}
                >
                  <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#666666" }}>
                    Final Score
                  </p>
                  <p className="text-3xl font-black mb-3" style={{ color: "#e53935", fontFamily: "'Orbitron', sans-serif" }}>
                    {(gameOverStats?.score ?? score).toLocaleString()}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t" style={{ borderColor: "#e5e5e5" }}>
                    <div>
                      <p className="text-[11px]" style={{ color: "#999999" }}>Distance</p>
                      <p className="text-sm font-bold" style={{ color: "#171717" }}>
                        {gameOverStats?.distance ?? distance} m
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px]" style={{ color: "#999999" }}>Coins</p>
                      <p className="text-sm font-bold" style={{ color: "#d97706" }}>
                        {gameOverStats?.coins ?? coins}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px]" style={{ color: "#999999" }}>Best</p>
                      <p className="text-sm font-bold" style={{ color: "#c62828" }}>
                        {highScore.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  id="runner-playagain-btn"
                  onClick={handleRestart}
                  autoFocus
                  className="btn-red px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider"
                >
                  ▶ PLAY AGAIN
                </button>
              </div>
            )}
          </div>

          {/* On-Screen Mobile Action Buttons for Easy Touch Play */}
          <div className="w-full max-w-[460px] grid grid-cols-3 gap-2.5 mt-3">
            <button
              onClick={() => sendAction("LEFT")}
              aria-label="Move left"
              className="py-3 rounded-xl font-bold text-sm transition-all duration-150 active:scale-95"
              style={{
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                color: "#171717",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              ◀ LEFT
            </button>
            <button
              onClick={() => sendAction("JUMP")}
              aria-label="Jump"
              className="py-3 rounded-xl font-bold text-sm transition-all duration-150 active:scale-95 btn-red"
            >
              ▲ JUMP
            </button>
            <button
              onClick={() => sendAction("RIGHT")}
              aria-label="Move right"
              className="py-3 rounded-xl font-bold text-sm transition-all duration-150 active:scale-95"
              style={{
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                color: "#171717",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              RIGHT ▶
            </button>
          </div>

          <p className="mt-3 text-xs text-center" style={{ color: "#999999" }}>
            Keyboard: A/D or Arrows to move · W/Space to jump · Touch buttons or swipe
          </p>
        </div>
      </div>
    </main>
  );
}

/** Stat display card */
function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <p className="text-[11px] font-bold tracking-widest uppercase mb-0.5" style={{ color: "#666666" }}>
        {label}
      </p>
      <p className="text-xl font-black truncate" style={{ color, fontFamily: "'Orbitron', sans-serif" }}>
        {value}
      </p>
    </div>
  );
}
