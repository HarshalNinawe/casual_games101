import { Lane, ObstacleType } from "./gameConfig";

export type GameState = "MENU" | "PLAYING" | "PAUSED" | "GAME_OVER";

export interface GameOverStats {
  score: number;
  distance: number;
  coins: number;
  isNewHigh: boolean;
}

export interface EndlessRunnerCallbacks {
  onScoreChange: (score: number) => void;
  onDistanceChange: (distance: number) => void;
  onCoinsChange: (coins: number) => void;
  onHighScoreChange: (highScore: number) => void;
  onGameOver: (stats: GameOverStats) => void;
  onGameStateChange: (state: GameState) => void;
  onSpeedChange?: (speed: number) => void;
}

export interface EndlessRunnerProps {
  onScoreChange: (score: number) => void;
  onDistanceChange: (distance: number) => void;
  onCoinsChange: (coins: number) => void;
  onHighScoreChange: (highScore: number) => void;
  onGameOver: (stats: GameOverStats) => void;
  onGameStateChange: (state: GameState) => void;
  gameState: GameState;
  restartSignal: number;
  isMuted: boolean;
  onActionTrigger?: {
    action: "LEFT" | "RIGHT" | "JUMP" | "START" | "PAUSE" | "RESUME" | "RESTART" | null;
    timestamp: number;
  };
}

/** Pooled Obstacle Object */
export interface PooledObstacle {
  active: boolean;
  lane: Lane;
  z: number;
  type: ObstacleType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphics: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text?: any;
}

/** Pooled Coin Object */
export interface PooledCoin {
  active: boolean;
  lane: Lane;
  z: number;
  jumpArcY: number; // Vertical offset for jump arc coin patterns
  collected: boolean;
  rotation: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphics: any;
}

/** Pooled Road Stripe Dash */
export interface PooledDash {
  laneDivider: 0 | 1; // 0 between Left and Center, 1 between Center and Right
  z: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphics: any;
}

/** Floating Score Text or Particle */
export interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphics: any;
}
