"use client";

import Link from "next/link";
import { useState } from "react";

export interface GameCardData {
  id: string;
  name: string;
  description: string;
  status: "available" | "coming_soon";
  href?: string;
  /** SVG path data for the game icon */
  iconColor: string;
  iconBg: string;
  tagline?: string;
}

interface Props {
  game: GameCardData;
  index: number;
  onLockedClick?: (gameName: string) => void;
}

/** Individual game card with hover animations and locked state */
export default function GameCard({ game, index, onLockedClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const isAvailable = game.status === "available";

  const cardStyle: React.CSSProperties = {
    background: hovered
      ? isAvailable
        ? "#ffffff"
        : "#fafafa"
      : "#ffffff",
    border: isAvailable
      ? hovered
        ? "1px solid rgba(229,57,53,0.4)"
        : "1px solid #e5e5e5"
      : "1px solid #e5e5e5",
    borderRadius: "20px",
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: hovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
    boxShadow: hovered
      ? isAvailable
        ? "0 16px 48px rgba(229,57,53,0.12), 0 4px 16px rgba(0,0,0,0.04)"
        : "0 12px 32px rgba(0,0,0,0.06)"
      : "0 2px 12px rgba(0,0,0,0.04)",
    opacity: isAvailable ? 1 : 0.8,
    animationDelay: `${index * 100}ms`,
  };

  const CardContent = () => (
    <div
      style={cardStyle}
      className="animate-fade-in-up relative flex flex-col p-6 h-full cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Red top accent border for available card */}
      {isAvailable && (
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px]"
          style={{
            background: "linear-gradient(90deg, #e53935, #ff5252)",
            opacity: hovered ? 1 : 0.7,
            transition: "opacity 0.3s",
          }}
        />
      )}

      {/* Status badge */}
      <div className="flex items-start justify-between mb-5">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isAvailable
              ? `linear-gradient(135deg, ${game.iconBg})`
              : "#f1f1f1",
            boxShadow: isAvailable ? `0 4px 12px ${game.iconColor}25` : "none",
            transition: "all 0.3s",
          }}
        >
          <GameIcon gameId={game.id} color={isAvailable ? game.iconColor : "#bdbdbd"} />
        </div>

        {/* Badge */}
        {isAvailable ? (
          <span
            className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{
              background: "#fff5f5",
              border: "1px solid rgba(229, 57, 53, 0.25)",
              color: "#e53935",
            }}
          >
            ● Available
          </span>
        ) : (
          <span
            className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{
              background: "#f1f1f1",
              border: "1px solid #e5e5e5",
              color: "#999999",
            }}
          >
            Coming Soon
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 mb-6">
        <h3
          className="text-xl font-bold mb-2"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            color: isAvailable ? "#171717" : "#bdbdbd",
          }}
        >
          {game.name}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: isAvailable ? "#666666" : "#bdbdbd" }}>
          {game.description}
        </p>
      </div>

      {/* Button */}
      <div
        className="w-full py-3 rounded-xl text-sm font-bold tracking-wide text-center transition-all duration-200"
        style={
          isAvailable
            ? {
                background: hovered ? "#e53935" : "#fff5f5",
                border: "1px solid rgba(229,57,53,0.3)",
                color: hovered ? "#ffffff" : "#e53935",
                boxShadow: hovered ? "0 4px 16px rgba(229,57,53,0.25)" : "none",
              }
            : {
                background: "#f8f8f8",
                border: "1px solid #e5e5e5",
                color: "#bdbdbd",
                cursor: "not-allowed",
              }
        }
      >
        {isAvailable ? "▶ PLAY NOW" : "COMING SOON"}
      </div>

      {/* Lock icon for locked games */}
      {!isAvailable && (
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full"
            style={{ background: "#f1f1f1", border: "1px solid #e5e5e5" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="5" width="8" height="6" rx="1" stroke="#bdbdbd" strokeWidth="1.2" />
              <path d="M4 5V4a2 2 0 0 1 4 0v1" stroke="#bdbdbd" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );

  if (isAvailable && game.href) {
    return (
      <Link
        href={game.href}
        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-[20px]"
        aria-label={`Play ${game.name}`}
      >
        <CardContent />
      </Link>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${game.name} — ${game.status === "coming_soon" ? "Coming Soon" : "Play"}`}
      className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-[20px]"
      onClick={() => onLockedClick?.(game.name)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onLockedClick?.(game.name);
        }
      }}
    >
      <CardContent />
    </div>
  );
}

/** Unique SVG icons per game */
function GameIcon({ gameId, color }: { gameId: string; color: string }) {
  if (gameId === "cube-2048") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="9" height="9" rx="2" fill={color} opacity="0.9" />
        <rect x="16" y="3" width="9" height="9" rx="2" fill={color} opacity="0.7" />
        <rect x="3" y="16" width="9" height="9" rx="2" fill={color} opacity="0.7" />
        <rect x="16" y="16" width="9" height="9" rx="2" fill={color} opacity="0.5" />
        <text x="6" y="10" fill="white" fontSize="5" fontWeight="bold">2</text>
        <text x="19" y="10" fill="white" fontSize="5" fontWeight="bold">4</text>
        <text x="6" y="23" fill="white" fontSize="5" fontWeight="bold">4</text>
        <text x="17" y="23" fill="white" fontSize="4" fontWeight="bold">16</text>
      </svg>
    );
  }
  if (gameId === "endless-runner" || gameId === "jungle-rush") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        {/* Head */}
        <circle cx="16" cy="6" r="3" fill={color} />
        {/* Torso */}
        <path d="M14 9 L11 16 L17 14 L14 9 Z" fill={color} opacity="0.9" />
        {/* Arms */}
        <path d="M13 11 L8 14 L5 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 11 L19 13 L23 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Legs */}
        <path d="M11 16 L7 20 L5 24" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 14 L20 18 L24 17" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Speed motion lines */}
        <line x1="3" y1="8" x2="8" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <line x1="2" y1="17" x2="6" y2="17" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      </svg>
    );
  }
  if (gameId === "hill-climb") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M3 22 Q8 10 14 8 Q20 6 25 14" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
        <circle cx="20" cy="18" r="4" fill={color} opacity="0.7" />
        <circle cx="20" cy="18" r="2" fill="white" opacity="0.5" />
        <path d="M16 17 L20 14 L24 17" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }
  if (gameId === "long-shot") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="22" cy="14" r="5" stroke={color} strokeWidth="1.5" opacity="0.8" />
        <circle cx="22" cy="14" r="2.5" stroke={color} strokeWidth="1.5" opacity="0.6" />
        <circle cx="22" cy="14" r="0.8" fill={color} />
        <line x1="4" y1="14" x2="16" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" opacity="0.7" />
        <circle cx="6" cy="14" r="2" fill={color} opacity="0.8" />
      </svg>
    );
  }
  return null;
}
