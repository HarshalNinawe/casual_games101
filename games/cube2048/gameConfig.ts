/**
 * Cube 2048 – Phaser 3 Game Configuration
 * A sliding-merge puzzle game inspired by 2048.
 * Grid is 4x4; player uses arrow keys or swipe to slide tiles.
 */

export const GRID_SIZE = 4;

/** Maps tile value → display color, border, and styling */
export const TILE_COLORS: Record<
  number,
  { bg: string; text: string; border?: string; strokeWidth?: number; is2048?: boolean }
> = {
  2: { bg: "#FFF5F5", text: "#171717", border: "#FFCDD2" },
  4: { bg: "#FFEBEE", text: "#171717", border: "#EF9A9A" },
  8: { bg: "#FFCDD2", text: "#171717", border: "#E57373" },
  16: { bg: "#EF9A9A", text: "#171717", border: "#EF5350" },
  32: { bg: "#E57373", text: "#FFFFFF", border: "#E53935" },
  64: { bg: "#EF5350", text: "#FFFFFF", border: "#D32F2F" },
  128: { bg: "#E53935", text: "#FFFFFF", border: "#C62828" },
  256: { bg: "#D32F2F", text: "#FFFFFF", border: "#B71C1C" },
  512: { bg: "#C62828", text: "#FFFFFF", border: "#8E0000" },
  1024: { bg: "#B71C1C", text: "#FFFFFF", border: "#7F0000" },
  2048: {
    bg: "#FFFFFF",
    text: "#E53935",
    border: "#E53935",
    strokeWidth: 3,
    is2048: true,
  },
};

/** Special white/red fallback for 4096+ */
export const DEFAULT_TILE_COLOR = {
  bg: "#FFF5F5",
  text: "#B71C1C",
  border: "#C62828",
  strokeWidth: 2,
};

export const HIGH_SCORE_KEY = "pixelverse_cube2048_highscore";
