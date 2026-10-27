/**
 * Endless Runner – Configuration & Constants
 * Clean Red Arcade theme: White, Red, and Light Gray.
 */

export const LANES = [0, 1, 2] as const;
export type Lane = (typeof LANES)[number];

export const LANE_NAMES: Record<Lane, string> = {
  0: "LEFT",
  1: "CENTER",
  2: "RIGHT",
};

export const INITIAL_LANE: Lane = 1;

/** Perspective road layout parameters (ratios of viewport) */
export const ROAD_CONFIG = {
  horizonYRatio: 0.22,      // Vanishing point Y
  groundYRatio: 0.82,       // Base ground Y for player
  horizonWidthRatio: 0.20,  // Road width at horizon
  groundWidthRatio: 0.86,   // Road width at player position
  lanesCount: 3,
  curbWidth: 8,
};

/** Player movement & physics */
export const PLAYER_CONFIG = {
  laneChangeSpeed: 0.18,    // Lerp factor per frame for smooth lane switching
  jumpForce: 13.5,          // Initial upward velocity
  gravity: 0.72,            // Gravity pulling back down
  baseWidth: 42,            // Pixel width at z = 0
  baseHeight: 52,           // Pixel height at z = 0
  runBobSpeed: 14,          // Running cadence animation speed
  runBobAmount: 3.5,        // Bobbing vertical travel (pixels)
  bankAngleMax: 10,         // Max tilt degrees when moving between lanes
};

/** Obstacle types */
export type ObstacleType = "GROUND_SPIKE" | "LOW_BARRIER" | "LANE_BLOCKER";

export interface ObstacleDef {
  type: ObstacleType;
  name: string;
  canJumpOver: boolean;
  minJumpClearance: number; // Required negative jumpY to clear
  heightScale: number;      // Height relative to base
  color: number;
  stripeColor?: number;
}

export const OBSTACLE_DEFS: Record<ObstacleType, ObstacleDef> = {
  GROUND_SPIKE: {
    type: "GROUND_SPIKE",
    name: "Spike Bar",
    canJumpOver: true,
    minJumpClearance: -18,
    heightScale: 0.35,
    color: 0xd32f2f,
  },
  LOW_BARRIER: {
    type: "LOW_BARRIER",
    name: "Hurdle",
    canJumpOver: true,
    minJumpClearance: -32,
    heightScale: 0.65,
    color: 0xe53935,
    stripeColor: 0xffffff,
  },
  LANE_BLOCKER: {
    type: "LANE_BLOCKER",
    name: "Tall Wall",
    canJumpOver: false,
    minJumpClearance: -999, // Cannot jump over
    heightScale: 1.45,
    color: 0xb71c1c,
    stripeColor: 0xffffff,
  },
};

/** Game balance & speeds */
export const SPEED_CONFIG = {
  baseZSpeed: 0.35,         // Initial depth units per second (z travels 1.0 -> 0)
  maxZSpeed: 0.72,          // Maximum speed cap
  accelerationRate: 0.00012,// Speed increase per meter traveled
  minSpawnDistance: 0.38,   // Minimum Z distance between obstacle rows
  maxSpawnDistance: 0.62,   // Maximum Z distance between obstacle rows
};

/** Coin reward & placement */
export const COIN_CONFIG = {
  pointsValue: 10,
  radius: 12,
  color: 0xf59e0b,
  glowColor: 0xfbbf24,
  innerColor: 0xfef3c7,
  poolSize: 36,
};

/** Object pooling allocation limits */
export const POOL_SIZES = {
  obstacles: 20,
  coins: 36,
  particles: 30,
  dashes: 18,
};

/** LocalStorage high score key */
export const RUNNER_HIGH_SCORE_KEY = "pixelverse_endless_runner_highscore";
export const RUNNER_SOUND_KEY = "pixelverse_endless_runner_muted";
