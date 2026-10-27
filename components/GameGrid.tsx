"use client";

import { useState } from "react";
import GameCard, { GameCardData } from "./GameCard";
import ComingSoonModal from "./ComingSoonModal";

const GAMES: GameCardData[] = [
  {
    id: "cube-2048",
    name: "Cube 2048",
    description: "Merge cubes, build bigger numbers, and chase your highest score.",
    status: "available",
    href: "/games/cube-2048",
    iconColor: "#e53935",
    iconBg: "rgba(229,57,53,0.18), rgba(198,40,40,0.10)",
    tagline: "Think fast. Merge smart.",
  },
  {
    id: "jungle-rush",
    name: "Jungle Rush",
    description: "Run, dodge, and survive the endless jungle.",
    status: "coming_soon",
    iconColor: "#bdbdbd",
    iconBg: "rgba(189,189,189,0.15), rgba(158,158,158,0.08)",
  },
  {
    id: "hill-climb",
    name: "Hill Climb",
    description: "Drive across dangerous terrain and see how far you can climb.",
    status: "coming_soon",
    iconColor: "#bdbdbd",
    iconBg: "rgba(189,189,189,0.15), rgba(158,158,158,0.08)",
  },
  {
    id: "long-shot",
    name: "Long Shot",
    description: "Take the shot. Judge the distance. Hit your target.",
    status: "coming_soon",
    iconColor: "#bdbdbd",
    iconBg: "rgba(189,189,189,0.15), rgba(158,158,158,0.08)",
  },
];

/** Responsive games grid with Coming Soon modal integration */
export default function GameGrid() {
  const [modalState, setModalState] = useState<{ open: boolean; gameName: string }>({
    open: false,
    gameName: "",
  });

  const handleLockedClick = (gameName: string) => {
    setModalState({ open: true, gameName });
  };

  const handleModalClose = () => {
    setModalState((s) => ({ ...s, open: false }));
  };

  return (
    <>
      <section
        id="games"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24"
        aria-labelledby="games-section-title"
      >
        {/* Section header */}
        <div className="text-center mb-14">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#e53935" }}
          >
            Game Library
          </p>
          <h2
            id="games-section-title"
            className="text-4xl sm:text-5xl font-black mb-4"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: "#171717",
            }}
          >
            Choose Your Game
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#666666" }}>
            One game is live and ready to play. More are being forged in the lab.
          </p>
        </div>

        {/* Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          role="list"
          aria-label="Available games"
        >
          {GAMES.map((game, i) => (
            <div key={game.id} role="listitem">
              <GameCard
                game={game}
                index={i}
                onLockedClick={handleLockedClick}
              />
            </div>
          ))}
        </div>
      </section>

      <ComingSoonModal
        isOpen={modalState.open}
        gameName={modalState.gameName}
        onClose={handleModalClose}
      />
    </>
  );
}
