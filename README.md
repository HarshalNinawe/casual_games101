# PIXELVERSE 🎮

> A modern casual gaming portal — Play. Merge. Conquer.

A collection of simple, addictive browser games built with Next.js, React, TypeScript, and Tailwind CSS.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

The build compiles fully static — no server required.

---

## ☁️ Deploy to Vercel

### Option 1 — Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2 — GitHub Integration

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Vercel will auto-detect Next.js and configure the build
4. Click **Deploy**

No environment variables are required.

---

## 🎮 Games

| Game | Status | Route |
|------|--------|-------|
| Cube 2048 | ✅ Available | `/games/cube-2048` |
| Jungle Rush | 🔒 Coming Soon | — |
| Hill Climb | 🔒 Coming Soon | — |
| Long Shot | 🔒 Coming Soon | — |

### How to Add a New Game

1. **Create the game directory:**

```
games/
  your-game-name/
    YourGame.tsx       ← Phaser 3 component (use Cube2048Game.tsx as reference)
    gameConfig.ts      ← constants, colors, config
```

2. **Add the game page:**

```
app/
  games/
    your-game-name/
      page.tsx         ← Route page (use cube-2048/page.tsx as reference)
```

3. **Register the game in `components/GameGrid.tsx`:**

```tsx
const GAMES: GameCardData[] = [
  // ... existing games ...
  {
    id: "your-game-name",
    name: "Your Game",
    description: "Short description.",
    status: "available",           // Change from "coming_soon"
    href: "/games/your-game-name",
    iconColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.15), rgba(217,119,6,0.1)",
  },
];
```

4. **Add the game icon** in the `GameIcon` component inside `GameCard.tsx`.

---

## 📁 Project Structure

```
casual_games101/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Design system (CSS vars, animations)
│   └── games/
│       └── cube-2048/
│           └── page.tsx        # Cube 2048 game route
│
├── components/
│   ├── Header.tsx              # Site navigation
│   ├── Hero.tsx                # Landing hero section
│   ├── GameCard.tsx            # Individual game card
│   ├── GameGrid.tsx            # 4-game grid + Coming Soon modal
│   ├── ComingSoonModal.tsx     # Modal for locked games
│   ├── ParticleBackground.tsx  # Animated canvas particles
│   └── Footer.tsx              # Site footer
│
├── games/
│   └── cube2048/
│       ├── Cube2048Game.tsx    # Phaser 3 game (React wrapper)
│       └── gameConfig.ts       # Tile colors, grid config, localStorage key
│
├── public/                     # Static assets
├── next.config.ts              # Next.js config (Phaser SSR exclusion)
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + custom CSS design system
- **Game Engine**: Phaser 3 (client-side only via dynamic import)
- **State**: React hooks + localStorage for high scores
- **Fonts**: Inter + Orbitron (Google Fonts)
- **Deployment**: Vercel (static export compatible)

---

## 🎯 Cube 2048 — How to Play

- Use **Arrow Keys** or **WASD** to slide tiles
- **Swipe** on touch/mobile screens
- Matching tiles **merge** and double in value
- Score points with every merge
- Reach **2048** to win!
- High score is saved automatically in your browser

---

## 📝 Notes

- No backend, no database, no authentication
- All game state lives client-side (localStorage for persistence)
- Phaser is dynamically imported to prevent SSR errors
- `npm run build` generates a fully static site

---

*Built with ❤️ for casual gaming fun.*
