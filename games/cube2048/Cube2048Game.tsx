"use client";

import { useEffect, useRef, useCallback } from "react";
import { GRID_SIZE, TILE_COLORS, DEFAULT_TILE_COLOR, HIGH_SCORE_KEY } from "./gameConfig";

interface Props {
  onScoreChange: (score: number) => void;
  onHighScoreChange: (hs: number) => void;
  onGameOver: (score: number) => void;
  onPauseChange: (paused: boolean) => void;
  isPaused: boolean;
  restartSignal: number;
}

// ─── Pure game logic ──────────────────────────────────────────────────────────

type Grid = number[][];
type Direction = "left" | "right" | "up" | "down";

function emptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function cloneGrid(g: Grid): Grid {
  return g.map((r) => [...r]);
}

function getEmptyCells(g: Grid): { r: number; c: number }[] {
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      if (g[r][c] === 0) cells.push({ r, c });
  return cells;
}

function spawnTile(g: Grid): Grid {
  const empty = getEmptyCells(g);
  if (!empty.length) return g;
  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  const ng = cloneGrid(g);
  ng[r][c] = Math.random() < 0.85 ? 2 : 4;
  return ng;
}

function slideRowLeft(row: number[]): { row: number[]; score: number } {
  const filtered = row.filter((v) => v !== 0);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < GRID_SIZE) merged.push(0);
  return { row: merged, score };
}

function rotateCW(m: Grid): Grid {
  return Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (__, c) => m[GRID_SIZE - 1 - c][r])
  );
}

function flipH(m: Grid): Grid {
  return m.map((row) => [...row].reverse());
}

function moveGrid(g: Grid, dir: Direction): { grid: Grid; score: number; moved: boolean } {
  let grid = cloneGrid(g);
  let totalScore = 0;
  let moved = false;

  if (dir === "right") grid = flipH(grid);
  else if (dir === "up") { for (let i = 0; i < 3; i++) grid = rotateCW(grid); }
  else if (dir === "down") grid = rotateCW(grid);

  const newGrid = grid.map((row) => {
    const { row: nr, score } = slideRowLeft(row);
    totalScore += score;
    if (nr.some((v, i) => v !== row[i])) moved = true;
    return nr;
  });
  grid = newGrid;

  if (dir === "right") grid = flipH(grid);
  else if (dir === "up") grid = rotateCW(grid);
  else if (dir === "down") { for (let i = 0; i < 3; i++) grid = rotateCW(grid); }

  return { grid, score: totalScore, moved };
}

function canMove(g: Grid): boolean {
  if (getEmptyCells(g).length > 0) return true;
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++) {
      if (c + 1 < GRID_SIZE && g[r][c] === g[r][c + 1]) return true;
      if (r + 1 < GRID_SIZE && g[r][c] === g[r + 1][c]) return true;
    }
  return false;
}

// ─── Phaser game factory ──────────────────────────────────────────────────────
// We build the Phaser Scene class INSIDE an async factory so that it is only
// ever executed in a browser context (Phaser is never imported at module level).

interface GameCallbacks {
  onScoreChange: (s: number) => void;
  onHighScoreChange: (hs: number) => void;
  onGameOver: (s: number) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PhaserLib = any;

function createScene(PhaserLib: PhaserLib, callbacks: GameCallbacks) {
  return class Cube2048Scene extends PhaserLib.Scene {
    private grid: Grid = emptyGrid();
    private score = 0;
    private highScore = 0;
    private gameOverFlag = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private tileGraphics: (any | null)[][] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private tileTexts: (any | null)[][] = [];
    private touchStartX = 0;
    private touchStartY = 0;
    private boardX = 0;
    private boardY = 0;
    private tileSize = 0;
    private gap = 8;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private boardBg: any = null;

    constructor() {
      super({ key: "Cube2048Scene" });
    }

    preload() {}

    create() {
      this.computeLayout();

      try {
        this.highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) ?? "0", 10) || 0;
      } catch {
        this.highScore = 0;
      }
      callbacks.onHighScoreChange(this.highScore);
      callbacks.onScoreChange(0);

      this.drawBoardBg();
      this.initTileArrays();

      this.grid = spawnTile(spawnTile(emptyGrid()));
      this.renderGrid(false);

      this.input.keyboard?.on("keydown", this.handleKey, this);

      this.input.on("pointerdown", (ptr: { x: number; y: number }) => {
        this.touchStartX = ptr.x;
        this.touchStartY = ptr.y;
      });
      this.input.on("pointerup", (ptr: { x: number; y: number }) => {
        const dx = ptr.x - this.touchStartX;
        const dy = ptr.y - this.touchStartY;
        if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
        this.handleMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
      });

      this.scale.on("resize", this.onResize, this);
    }

    private computeLayout() {
      const W = this.scale.width;
      const H = this.scale.height;
      const maxBoard = Math.min(W - 24, H - 24, 400);
      this.tileSize = Math.floor((maxBoard - this.gap * (GRID_SIZE + 1)) / GRID_SIZE);
      const boardW = this.tileSize * GRID_SIZE + this.gap * (GRID_SIZE + 1);
      this.boardX = Math.floor((W - boardW) / 2);
      this.boardY = Math.floor((H - boardW) / 2);
    }

    private initTileArrays() {
      this.tileGraphics = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
      this.tileTexts = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    }

    private onResize() {
      this.computeLayout();
      this.children.removeAll(true);
      this.boardBg = null;
      this.drawBoardBg();
      this.initTileArrays();
      this.renderGrid(false);
    }

    private drawBoardBg() {
      const boardW = this.tileSize * GRID_SIZE + this.gap * (GRID_SIZE + 1);
      const bg = this.add.graphics();
      bg.fillStyle(0xf8f8f8, 1);
      bg.fillRoundedRect(this.boardX, this.boardY, boardW, boardW, 16);
      bg.lineStyle(1, 0xe5e5e5, 1);
      bg.strokeRoundedRect(this.boardX, this.boardY, boardW, boardW, 16);

      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const x = this.boardX + this.gap + c * (this.tileSize + this.gap);
          const y = this.boardY + this.gap + r * (this.tileSize + this.gap);
          bg.fillStyle(0xe5e5e5, 1);
          bg.fillRoundedRect(x, y, this.tileSize, this.tileSize, 10);
        }
      }
      this.boardBg = bg;
    }

    private getTilePos(r: number, c: number) {
      return {
        x: this.boardX + this.gap + c * (this.tileSize + this.gap),
        y: this.boardY + this.gap + r * (this.tileSize + this.gap),
      };
    }

    private renderGrid(animate: boolean) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (this.tileGraphics[r]?.[c]) { this.tileGraphics[r][c].destroy(); this.tileGraphics[r][c] = null; }
          if (this.tileTexts[r]?.[c]) { this.tileTexts[r][c].destroy(); this.tileTexts[r][c] = null; }

          const val = this.grid[r][c];
          if (!val) continue;

          const { x, y } = this.getTilePos(r, c);
          const cx = x + this.tileSize / 2;
          const cy = y + this.tileSize / 2;
          const colors = TILE_COLORS[val] ?? DEFAULT_TILE_COLOR;
          const bgColor = parseInt(colors.bg.replace("#", ""), 16);

          const g = this.add.graphics();

          // Subtle shadow under tile
          g.fillStyle(0x000000, 0.04);
          g.fillRoundedRect(x, y + 2, this.tileSize, this.tileSize, 10);

          // Tile background
          g.fillStyle(bgColor, 1);
          g.fillRoundedRect(x, y, this.tileSize, this.tileSize, 10);

          // Tile border treatment (special strong red border for 2048)
          if (colors.is2048) {
            g.lineStyle(3, 0xe53935, 1);
            g.strokeRoundedRect(x, y, this.tileSize, this.tileSize, 10);
          } else if (colors.border) {
            const borderColor = parseInt(colors.border.replace("#", ""), 16);
            g.lineStyle(colors.strokeWidth ?? 1, borderColor, 0.85);
            g.strokeRoundedRect(x, y, this.tileSize, this.tileSize, 10);
          } else {
            g.lineStyle(1, 0xe5e5e5, 0.8);
            g.strokeRoundedRect(x, y, this.tileSize, this.tileSize, 10);
          }

          this.tileGraphics[r][c] = g;

          const fontSize = val >= 1000 ? Math.max(12, this.tileSize * 0.22) : Math.max(16, this.tileSize * 0.3);
          const txt = this.add.text(cx, cy, String(val), {
            fontFamily: "'Orbitron','Inter',sans-serif",
            fontSize: `${Math.floor(fontSize)}px`,
            color: colors.text,
            fontStyle: "bold",
          });
          txt.setOrigin(0.5, 0.5);
          this.tileTexts[r][c] = txt;

          if (animate) {
            g.setScale(0.7);
            txt.setScale(0.7);
            this.tweens.add({ targets: [g, txt], scaleX: 1, scaleY: 1, duration: 120, ease: "Back.easeOut" });
          }
        }
      }
    }

    private handleKey(event: { key: string; preventDefault: () => void }) {
      if (this.gameOverFlag) return;
      const dirMap: Record<string, Direction> = {
        ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
        a: "left", d: "right", w: "up", s: "down",
      };
      const dir = dirMap[event.key];
      if (dir) { event.preventDefault(); this.handleMove(dir); }
    }

    handleMove(dir: Direction) {
      if (this.gameOverFlag) return;
      const { grid, score, moved } = moveGrid(this.grid, dir);
      if (!moved) return;

      this.score += score;
      this.grid = spawnTile(grid);

      if (this.score > this.highScore) {
        this.highScore = this.score;
        try { localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore)); } catch { /* noop */ }
        callbacks.onHighScoreChange(this.highScore);
      }

      callbacks.onScoreChange(this.score);
      this.renderGrid(true);

      if (score > 0) {
        this.showMergeJuice(score);
      }

      if (!canMove(this.grid)) {
        this.gameOverFlag = true;
        this.time.delayedCall(400, () => callbacks.onGameOver(this.score));
      }
    }

    private showMergeJuice(points: number) {
      const boardW = this.tileSize * GRID_SIZE + this.gap * (GRID_SIZE + 1);
      const popupX = this.boardX + boardW / 2;
      const popupY = this.boardY - 4;

      const popup = this.add.text(popupX, popupY, `+${points}`, {
        fontFamily: "'Orbitron','Inter',sans-serif",
        fontSize: "15px",
        color: "#e53935",
        fontStyle: "bold",
      });
      popup.setOrigin(0.5, 1);
      this.tweens.add({
        targets: popup,
        y: popupY - 18,
        alpha: 0,
        duration: 500,
        ease: "Cubic.easeOut",
        onComplete: () => popup.destroy(),
      });

      // Subtle red merge burst particles
      for (let i = 0; i < 4; i++) {
        const px = popupX + (Math.random() - 0.5) * (boardW * 0.4);
        const py = this.boardY + (Math.random() * 0.6 + 0.2) * boardW;
        const p = this.add.circle(px, py, 2.5, 0xe53935, 0.6);
        this.tweens.add({
          targets: p,
          scaleX: 0.2,
          scaleY: 0.2,
          alpha: 0,
          duration: 350,
          onComplete: () => p.destroy(),
        });
      }
    }

    restart() {
      this.score = 0;
      this.gameOverFlag = false;
      callbacks.onScoreChange(0);
      this.children.removeAll(true);
      this.boardBg = null;
      this.drawBoardBg();
      this.initTileArrays();
      this.grid = spawnTile(spawnTile(emptyGrid()));
      this.renderGrid(false);
    }

    shutdown() {
      this.input.keyboard?.off("keydown", this.handleKey, this);
      this.scale.off("resize", this.onResize, this);
    }
  };
}

// ─── React wrapper ────────────────────────────────────────────────────────────

export default function Cube2048Game({
  onScoreChange,
  onHighScoreChange,
  onGameOver,
  onPauseChange,
  isPaused,
  restartSignal,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gameRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<any>(null);

  const stableCallbacks = useRef({ onScoreChange, onHighScoreChange, onGameOver });
  stableCallbacks.current = { onScoreChange, onHighScoreChange, onGameOver };

  const callbacks: GameCallbacks = {
    onScoreChange: (s) => stableCallbacks.current.onScoreChange(s),
    onHighScoreChange: (hs) => stableCallbacks.current.onHighScoreChange(hs),
    onGameOver: (s) => stableCallbacks.current.onGameOver(s),
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const PhaserModule = await import("phaser");
      const PhaserLib = PhaserModule.default;
      if (!mounted || !containerRef.current) return;

      if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null; }

      const SceneClass = createScene(PhaserLib, callbacks);
      const container = containerRef.current;
      const W = container.clientWidth || 400;
      const H = container.clientHeight || 400;

      const game = new PhaserLib.Game({
        type: PhaserLib.AUTO,
        width: W,
        height: H,
        backgroundColor: "#ffffff",
        parent: container,
        scale: {
          mode: PhaserLib.Scale.RESIZE,
          autoCenter: PhaserLib.Scale.CENTER_BOTH,
        },
        scene: SceneClass,
        input: { touch: true },
        render: { antialias: true, pixelArt: false },
        banner: false,
      });

      gameRef.current = game;

      game.events.once("ready", () => {
        if (!mounted) return;
        sceneRef.current = game.scene.getScene("Cube2048Scene");
      });
    };

    init();

    return () => {
      mounted = false;
      if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restart signal
  useEffect(() => {
    if (restartSignal === 0) return;
    sceneRef.current?.restart();
  }, [restartSignal]);

  // Pause/resume
  const stablePauseChange = useCallback(onPauseChange, [onPauseChange]);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (isPaused) scene.scene.pause();
    else scene.scene.resume();
    stablePauseChange(isPaused);
  }, [isPaused, stablePauseChange]);

  return (
    <div
      ref={containerRef}
      id="cube2048-canvas-container"
      className="w-full h-full"
      style={{ minHeight: "360px" }}
      aria-label="Cube 2048 game canvas"
    />
  );
}
