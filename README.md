# PIXELVERSE

A modern, browser-based casual gaming portal delivering lightweight, instant-play games directly in the browser with zero downloads, installations, or account creation.

Built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and **Phaser 3**, PIXELVERSE features a **Clean Red Arcade** aesthetic—a crisp white and light-gray palette energized with vivid red accents for a minimal, modern, and playful gaming experience.

---

## 🎮 Game Library

| Game | Status | Type | Route / Details |
| :--- | :--- | :--- | :--- |
| **Cube 2048** | **Available** | Sliding-Tile Merge Puzzle | `/games/cube-2048` |
| **Endless Runner** | **Available** | 3-Lane Pseudo-3D Arcade Runner | `/games/endless-runner` |
| **Hill Climb** | *Coming Soon* | Physics / Driving | In development |
| **Long-Range Shooter** | *Coming Soon* | Aim & Precision | In development |

### Available Games

#### 1. Cube 2048
Slide matching number cubes together on a 4×4 grid to combine them, double their values, and chase the elusive 2048 cube and beyond.
- **Controls**: Full keyboard support (`Arrow Keys` / `WASD`) and touch swipe gestures for mobile screens.
- **Scoring**: Real-time score tracking with automatic high score persistence saved locally in browser storage.
- **Session Controls**: Instant pause, resume, and restart controls.
- **Visuals & Feedback**: Smooth 120ms tile entry animations, subtle merge burst effects, floating score popups, and distinctive styling for milestone tiles (1024, 2048, and 4096+).

#### 2. Endless Runner
A fast-paced 3-lane pseudo-3D endless speedway runner inspired by arcade classics, rendered with Phaser 2D perspective math.
- **Controls**: Lane switching (`A / D` or `← / →`), Ground jumping (`W / ↑ / Space`), mobile swipe gestures, and on-screen touch buttons.
- **3 Obstacle Types**:
  - *Floor Spikes*: Low ground obstacles (jump over or switch lanes).
  - *Hurdles*: Low barriers with hazard stripes (jump over or switch lanes).
  - *Tall Walls*: Solid lane blockers that cannot be jumped over (must switch lanes).
- **Procedural Track**: Infinite fair chunk generation with guaranteed safe pathways.
- **Coins & Power**: Collect coins (+10 points) placed in straight lines and jump arcs.
- **Dynamic Speed**: Automatically accelerates with distance traveled.
- **Audio**: Built-in Web Audio API sound synthesizer for jump, coin chime, collision, and game over sounds (with instant mute toggle).

---

## ✨ Features

- **Instant Play**: 100% client-side execution—no sign-ups, no wait times, and zero server latency.
- **Phaser 3 Canvas Integration**: Embedded Phaser 3 game loop with dynamic SSR-safe browser loading to avoid Next.js hydration issues.
- **Responsive Layout**: Designed and optimized for seamless play across desktop, tablet, and mobile browsers.
- **Clean Red Theme**: A light, modern aesthetic featuring white surfaces, light-gray borders, soft drop shadows, and high-contrast red accents.
- **Local Persistence**: Saves personal best records locally via browser `localStorage`.
- **Coming Soon Modal System**: Interactive dialogs for unreleased games allowing users to preview planned titles.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Game Engine**: [Phaser 3](https://phaser.io/) (client-side only via dynamic imports)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS custom design tokens
- **Typography**: Google Fonts (*Orbitron* for arcade headers, *Inter* for interface text)
- **State & Storage**: React state hooks (`useState`, `useCallback`, `useRef`) + Browser `localStorage`
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📌 Current Project Status

- **Implemented**:
  - Full landing page (Hero, Game Grid, Header, and Footer).
  - Clean Red Arcade visual design system.
  - Fully playable **Cube 2048** sliding puzzle game.
  - Fully playable **Endless Runner** 3-lane pseudo-3D game.
  - Touch swipe and keyboard input handlers + mobile on-screen buttons.
  - Web Audio API sound effects with mute toggle.
  - Local high score persistence via `localStorage`.
  - "Coming Soon" modal notification for remaining unreleased games.
- **Not Currently Implemented** (by design for this phase):
  - No backend server, database, or cloud infrastructure.
  - No user accounts, authentication, or login system.
  - No global or multiplayer leaderboards (scores are strictly local).
  - Remaining 2 games (Hill Climb, Long-Range Shooter) are in development.

---

## 📁 Project Structure

```
casual_games101/
├── app/
│   ├── layout.tsx              # Root HTML shell, fonts, and metadata
│   ├── page.tsx                # Homepage layout (Hero, GameGrid, Header, Footer)
│   ├── globals.css             # Theme design tokens, utilities, and animations
│   └── games/
│       ├── cube-2048/
│       │   └── page.tsx        # Cube 2048 page, score UI, and game canvas wrapper
│       └── endless-runner/
│           └── page.tsx        # Endless Runner page, stats, overlays, and controls
│
├── components/
│   ├── Header.tsx              # Fixed navigation bar with mobile menu
│   ├── Hero.tsx                # Clean hero section with call-to-action buttons
│   ├── GameGrid.tsx            # Game catalog grid and modal state coordinator
│   ├── GameCard.tsx            # Game card component with status badges and lock states
│   ├── ComingSoonModal.tsx     # Light modal dialog for unreleased games
│   ├── ParticleBackground.tsx  # Canvas background with subtle floating particles
│   └── Footer.tsx              # Minimal light footer with branding
│
├── games/
│   ├── cube2048/
│   │   ├── Cube2048Game.tsx    # Cube 2048 Phaser 3 scene factory and React wrapper
│   │   └── gameConfig.ts       # Tile color progression, grid size, and storage keys
│   └── endlessRunner/
│       ├── EndlessRunnerGame.tsx # Endless Runner Phaser 3 scene and React wrapper
│       ├── gameConfig.ts       # Track parameters, speeds, obstacles, and keys
│       ├── audio.ts            # Web Audio API sound synthesizer
│       └── types.ts            # Object pools, callbacks, and game states
│
├── public/                     # Static icons and assets
├── next.config.ts              # Next.js build configuration
├── tsconfig.json               # TypeScript compiler configuration
└── package.json                # Project dependencies and npm scripts
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
- **Node.js**: `18.x` or higher
- **npm**: `9.x` or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HarshalNinawe/casual_games101.git
   cd casual_games101
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Creating a Production Build

To test and compile the production build:
```bash
npm run build
npm run start
```

---

## ☁️ Deployment

The project is optimized for deployment on **[Vercel](https://vercel.com/)**:

1. Push your code to GitHub.
2. In the Vercel dashboard, click **Add New Project** and import the repository (`casual_games101`).
3. Vercel will automatically detect **Next.js** and apply the default build command (`npm run build`).
4. Click **Deploy**.

No environment variables or external database configurations are required.

---

## 🗺 Future Improvements & Roadmap

- [x] **Cube 2048**: Tile merging puzzle with responsive canvas, local high scores, and clean animations.
- [x] **Endless Runner**: 3-lane pseudo-3D arcade runner with procedural generation, fair chunk patterns, jump mechanics, and object pooling.
- [x] **Procedural Audio**: Web Audio API synthesizer for sound effects (jump, coins, crash, game over) with instant mute toggle.
- [ ] Implement **Hill Climb** (2D terrain physics & momentum driving game).
- [ ] Implement **Long-Range Shooter** (Trajectory & distance aiming arcade game).
- [ ] Extend optional sound effects to Cube 2048.
- [ ] Optional backend integration for global multiplayer leaderboards.
- [ ] Player achievement badges and daily gameplay streak trackers.
