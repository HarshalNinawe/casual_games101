"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  ROAD_CONFIG,
  PLAYER_CONFIG,
  OBSTACLE_DEFS,
  SPEED_CONFIG,
  COIN_CONFIG,
  POOL_SIZES,
  RUNNER_HIGH_SCORE_KEY,
  RUNNER_SOUND_KEY,
  Lane,
  ObstacleType,
} from "./gameConfig";
import {
  EndlessRunnerProps,
  EndlessRunnerCallbacks,
  GameState,
  PooledObstacle,
  PooledCoin,
  PooledDash,
  PooledParticle,
} from "./types";
import { sound } from "./audio";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PhaserLib = any;

/**
 * Phaser 3 Scene Factory for Endless Runner
 * Browser-only execution with pseudo-3D perspective and object pooling.
 */
function createRunnerScene(
  PhaserLib: PhaserLib,
  callbacks: EndlessRunnerCallbacks,
  initialMuted: boolean
) {
  return class EndlessRunnerScene extends PhaserLib.Scene {
    // ─── Game Loop State ──────────────────────────────────────────────────────
    private gameState: GameState = "MENU";
    private score = 0;
    private distance = 0;
    private coins = 0;
    private highScore = 0;
    private currentSpeed = SPEED_CONFIG.baseZSpeed;

    // ─── Player State ─────────────────────────────────────────────────────────
    private playerLane: Lane = 1;
    private targetLane: Lane = 1;
    private currentLanePos = 1.0; // Smooth interpolated lane float (0..2)
    private isJumping = false;
    private jumpY = 0;
    private jumpVelocity = 0;
    private runTime = 0;
    private tiltAngle = 0;

    // ─── Object Pools ─────────────────────────────────────────────────────────
    private poolObstacles: PooledObstacle[] = [];
    private poolCoins: PooledCoin[] = [];
    private poolDashes: PooledDash[] = [];
    private poolParticles: PooledParticle[] = [];

    // ─── Procedural Spawning ──────────────────────────────────────────────────
    private nextSpawnZ = 1.1;

    // ─── Graphics Renderers ───────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private roadGraphics: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private playerGraphics: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private playerShadow: any = null;

    // ─── Touch Controls ───────────────────────────────────────────────────────
    private touchStartX = 0;
    private touchStartY = 0;
    private touchStartTime = 0;

    constructor() {
      super({ key: "EndlessRunnerScene" });
    }

    create() {
      sound.setMuted(initialMuted);

      // Load cached high score
      try {
        const cached = localStorage.getItem(RUNNER_HIGH_SCORE_KEY);
        this.highScore = cached ? parseInt(cached, 10) || 0 : 0;
      } catch {
        this.highScore = 0;
      }
      callbacks.onHighScoreChange(this.highScore);
      callbacks.onScoreChange(0);
      callbacks.onDistanceChange(0);
      callbacks.onCoinsChange(0);

      // Setup rendering containers
      this.roadGraphics = this.add.graphics();
      this.initObjectPools();

      // Player graphics
      this.playerShadow = this.add.graphics();
      this.playerGraphics = this.add.graphics();

      // Input listeners
      this.input.keyboard?.on("keydown", this.handleKeyDown, this);
      this.input.on("pointerdown", this.handlePointerDown, this);
      this.input.on("pointerup", this.handlePointerUp, this);
      this.scale.on("resize", this.handleResize, this);

      // Initial layout render
      this.renderStaticRoad();
      this.renderPlayer();
    }

    // ─── Pseudo-3D Perspective Projection ─────────────────────────────────────
    /**
     * Projects a 3D coordinate (lane, z, yOffset) to 2D canvas coordinates.
     * lane: 0 (Left), 1 (Center), 2 (Right) - supports smooth floats
     * z: 0.0 (Player foreground) to 1.0 (Vanishing horizon)
     */
    private getPerspective(lane: number, z: number, yOffset = 0) {
      const W = this.scale.width;
      const H = this.scale.height;

      const horizonY = H * ROAD_CONFIG.horizonYRatio;
      const groundY = H * ROAD_CONFIG.groundYRatio;

      // Perspective curve: non-linear camera height elevation
      const p = Math.max(0, 1 - z);
      const y = horizonY + (groundY - horizonY) * Math.pow(p, 1.45) + yOffset * Math.pow(p, 1.2);
      const scale = 0.15 + 0.85 * Math.pow(p, 1.5);

      // Road width at depth z
      const roadW = W * (ROAD_CONFIG.groundWidthRatio * (1 - z) + ROAD_CONFIG.horizonWidthRatio * z);
      const laneW = roadW / 3;
      const roadCenterX = W / 2;

      // Lane offset from center (-1 for Left, 0 for Center, +1 for Right)
      const x = roadCenterX + (lane - 1) * laneW;

      return { x, y, scale, laneW };
    }

    // ─── Object Pooling Initialization ────────────────────────────────────────
    private initObjectPools() {
      // 1. Road dashes (lane dividers)
      this.poolDashes = [];
      const dashCount = POOL_SIZES.dashes;
      for (let i = 0; i < dashCount; i++) {
        const laneDiv: 0 | 1 = (i % 2 === 0 ? 0 : 1);
        const z = (i / dashCount);
        this.poolDashes.push({
          laneDivider: laneDiv,
          z,
          graphics: this.add.graphics(),
        });
      }

      // 2. Obstacles pool
      this.poolObstacles = [];
      for (let i = 0; i < POOL_SIZES.obstacles; i++) {
        this.poolObstacles.push({
          active: false,
          lane: 1,
          z: 2.0,
          type: "LOW_BARRIER",
          graphics: this.add.graphics(),
          text: this.add.text(0, 0, "", {
            fontFamily: "'Orbitron','Inter',sans-serif",
            fontSize: "10px",
            fontStyle: "bold",
            color: "#ffffff",
          }).setOrigin(0.5, 0.5).setVisible(false),
        });
      }

      // 3. Coins pool
      this.poolCoins = [];
      for (let i = 0; i < POOL_SIZES.coins; i++) {
        this.poolCoins.push({
          active: false,
          lane: 1,
          z: 2.0,
          jumpArcY: 0,
          collected: false,
          rotation: Math.random() * Math.PI,
          graphics: this.add.graphics(),
        });
      }

      // 4. Particles pool
      this.poolParticles = [];
      for (let i = 0; i < POOL_SIZES.particles; i++) {
        this.poolParticles.push({
          active: false,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          alpha: 1,
          size: 4,
          color: 0xe53935,
          graphics: this.add.graphics(),
        });
      }
    }

    // ─── Procedural Fair Chunk Generation ─────────────────────────────────────
    private spawnFairChunk(atZ: number) {
      // Pick random fair pattern ensuring at least one viable escape route
      const patternType = Math.floor(Math.random() * 6);

      switch (patternType) {
        case 0: {
          // Hurdle in center lane with a jump coin arc
          this.activateObstacle("LOW_BARRIER", 1, atZ);
          this.activateCoin(1, atZ, -36);
          this.activateCoin(1, atZ + 0.08, -50);
          this.activateCoin(1, atZ + 0.16, -36);
          break;
        }
        case 1: {
          // Blocker on Left + Coins on Center + Right clear
          this.activateObstacle("LANE_BLOCKER", 0, atZ);
          this.activateCoin(1, atZ, 0);
          this.activateCoin(1, atZ + 0.08, 0);
          this.activateCoin(1, atZ + 0.16, 0);
          break;
        }
        case 2: {
          // Blocker on Right + Coins on Center + Left clear
          this.activateObstacle("LANE_BLOCKER", 2, atZ);
          this.activateCoin(1, atZ, 0);
          this.activateCoin(1, atZ + 0.08, 0);
          this.activateCoin(1, atZ + 0.16, 0);
          break;
        }
        case 3: {
          // Double Blocker (Left + Right), Center is open!
          this.activateObstacle("LANE_BLOCKER", 0, atZ);
          this.activateObstacle("LANE_BLOCKER", 2, atZ);
          this.activateCoin(1, atZ, 0);
          this.activateCoin(1, atZ + 0.08, 0);
          break;
        }
        case 4: {
          // Double Blocker (Left + Center), Right is open!
          this.activateObstacle("LANE_BLOCKER", 0, atZ);
          this.activateObstacle("LANE_BLOCKER", 1, atZ);
          this.activateCoin(2, atZ, 0);
          this.activateCoin(2, atZ + 0.08, 0);
          break;
        }
        case 5:
        default: {
          // Ground spikes in Center (jumpable or dodge to 0/2)
          this.activateObstacle("GROUND_SPIKE", 1, atZ);
          this.activateCoin(0, atZ, 0);
          this.activateCoin(2, atZ, 0);
          break;
        }
      }
    }

    private activateObstacle(type: ObstacleType, lane: Lane, z: number) {
      const obstacle = this.poolObstacles.find((o) => !o.active);
      if (!obstacle) return;
      obstacle.active = true;
      obstacle.type = type;
      obstacle.lane = lane;
      obstacle.z = z;
      obstacle.graphics.setVisible(true);
      if (obstacle.text) obstacle.text.setVisible(true);
    }

    private activateCoin(lane: Lane, z: number, jumpArcY = 0) {
      const coin = this.poolCoins.find((c) => !c.active);
      if (!coin) return;
      coin.active = true;
      coin.lane = lane;
      coin.z = z;
      coin.jumpArcY = jumpArcY;
      coin.collected = false;
      coin.graphics.setVisible(true);
    }

    private triggerParticleBurst(x: number, y: number, color = 0xf59e0b, count = 6) {
      for (let i = 0; i < count; i++) {
        const p = this.poolParticles.find((pt) => !pt.active);
        if (!p) continue;
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = (Math.random() - 0.5) * 160;
        p.vy = -Math.random() * 120 - 40;
        p.alpha = 1.0;
        p.size = Math.random() * 3 + 2;
        p.color = color;
        p.graphics.setVisible(true);
      }
    }

    // ─── Main Update Loop ─────────────────────────────────────────────────────
    update(_time: number, delta: number) {
      if (this.gameState !== "PLAYING") return;

      const dt = Math.min(delta / 1000, 0.06); // Capped delta in seconds

      this.updateSpeedAndDistance(dt);
      this.updatePlayerMovement(dt);
      this.updateRoadDashes(dt);
      this.updateObstacles(dt);
      this.updateCoins(dt);
      this.updateParticles(dt);
      this.checkCollisions();
      this.renderAll();
    }

    private updateSpeedAndDistance(dt: number) {
      // Speed increases smoothly as player travels farther
      this.currentSpeed = Math.min(
        SPEED_CONFIG.baseZSpeed + this.distance * SPEED_CONFIG.accelerationRate,
        SPEED_CONFIG.maxZSpeed
      );

      // Distance in meters
      const deltaMeters = dt * (this.currentSpeed * 48);
      this.distance += deltaMeters;
      callbacks.onDistanceChange(Math.floor(this.distance));

      // Total score = distance + coins
      this.score = Math.floor(this.distance) + this.coins * COIN_CONFIG.pointsValue;
      callbacks.onScoreChange(this.score);

      // High score tracking
      if (this.score > this.highScore) {
        this.highScore = this.score;
        callbacks.onHighScoreChange(this.highScore);
        try {
          localStorage.setItem(RUNNER_HIGH_SCORE_KEY, String(this.highScore));
        } catch {
          // noop
        }
      }

      // Procedural chunk spawn trigger
      if (this.nextSpawnZ < 1.3) {
        const gap = SPEED_CONFIG.minSpawnDistance + Math.random() * (SPEED_CONFIG.maxSpawnDistance - SPEED_CONFIG.minSpawnDistance);
        this.spawnFairChunk(this.nextSpawnZ);
        this.nextSpawnZ += gap;
      }
      this.nextSpawnZ -= this.currentSpeed * dt;
    }

    private updatePlayerMovement(dt: number) {
      // Smooth lane lerping
      const laneDiff = this.targetLane - this.currentLanePos;
      this.currentLanePos += laneDiff * PLAYER_CONFIG.laneChangeSpeed;

      // Subtle lateral banking / tilt
      const targetTilt = Math.max(-1, Math.min(1, laneDiff * 2.5)) * PLAYER_CONFIG.bankAngleMax;
      this.tiltAngle += (targetTilt - this.tiltAngle) * 0.25;

      // Jump physics
      if (this.isJumping) {
        this.jumpY += this.jumpVelocity;
        this.jumpVelocity += PLAYER_CONFIG.gravity;
        if (this.jumpY >= 0) {
          this.jumpY = 0;
          this.isJumping = false;
          this.jumpVelocity = 0;
        }
      }

      // Running bobbing cadence
      this.runTime += dt * (PLAYER_CONFIG.runBobSpeed + this.currentSpeed * 6);
    }

    private updateRoadDashes(dt: number) {
      // Dashes cycle towards player
      for (const dash of this.poolDashes) {
        dash.z -= this.currentSpeed * dt;
        if (dash.z < 0) {
          dash.z += 1.0;
        }
      }
    }

    private updateObstacles(dt: number) {
      for (const obs of this.poolObstacles) {
        if (!obs.active) continue;
        obs.z -= this.currentSpeed * dt;

        // Passed behind player -> deactivate & recycle
        if (obs.z < -0.1) {
          obs.active = false;
          obs.graphics.clear();
          obs.graphics.setVisible(false);
          if (obs.text) obs.text.setVisible(false);
        }
      }
    }

    private updateCoins(dt: number) {
      for (const coin of this.poolCoins) {
        if (!coin.active) continue;
        coin.z -= this.currentSpeed * dt;
        coin.rotation += dt * 4;

        if (coin.z < -0.1) {
          coin.active = false;
          coin.graphics.clear();
          coin.graphics.setVisible(false);
        }
      }
    }

    private updateParticles(dt: number) {
      for (const p of this.poolParticles) {
        if (!p.active) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 320 * dt; // Particle gravity
        p.alpha -= dt * 2.2;

        if (p.alpha <= 0) {
          p.active = false;
          p.graphics.clear();
          p.graphics.setVisible(false);
        }
      }
    }

    // ─── Collision Handling ───────────────────────────────────────────────────
    private checkCollisions() {
      const playerLaneIdx = Math.round(this.currentLanePos);

      // 1. Check Obstacles
      for (const obs of this.poolObstacles) {
        if (!obs.active) continue;

        // Obstacle is in collision depth threshold
        if (obs.z >= -0.04 && obs.z <= 0.06) {
          // Lane overlap check (with generous tolerance to avoid frustrating false hits)
          if (Math.abs(this.currentLanePos - obs.lane) < 0.58) {
            const def = OBSTACLE_DEFS[obs.type];

            // If it's a jumpable obstacle and player is cleared high enough in the air:
            if (def.canJumpOver && this.jumpY <= def.minJumpClearance) {
              // Dodged safely via jump!
              continue;
            }

            // Otherwise: Collision!
            this.handleCollisionCrash();
            return;
          }
        }
      }

      // 2. Check Coins
      for (const coin of this.poolCoins) {
        if (!coin.active || coin.collected) continue;

        if (coin.z >= -0.05 && coin.z <= 0.05) {
          if (Math.abs(this.currentLanePos - coin.lane) < 0.6) {
            // Check vertical jump reach
            const coinYOffset = coin.jumpArcY;
            if (Math.abs(this.jumpY - coinYOffset) < 38) {
              // Collected!
              coin.collected = true;
              coin.active = false;
              coin.graphics.clear();
              coin.graphics.setVisible(false);

              this.coins += 1;
              callbacks.onCoinsChange(this.coins);
              sound.playCoin();

              const proj = this.getPerspective(coin.lane, coin.z, coin.jumpArcY);
              this.triggerParticleBurst(proj.x, proj.y, COIN_CONFIG.color, 6);
            }
          }
        }
      }
    }

    private handleCollisionCrash() {
      this.gameState = "GAME_OVER";
      sound.playCrash();
      this.cameras.main.shake(280, 0.016);

      // Particle explosion at player
      const proj = this.getPerspective(this.currentLanePos, 0, this.jumpY);
      this.triggerParticleBurst(proj.x, proj.y, 0xe53935, 14);

      // Delayed Game Over callback
      this.time.delayedCall(450, () => {
        sound.playGameOver();
        const isNewHigh = this.score >= this.highScore && this.score > 0;
        callbacks.onGameOver({
          score: this.score,
          distance: Math.floor(this.distance),
          coins: this.coins,
          isNewHigh,
        });
        callbacks.onGameStateChange("GAME_OVER");
      });
    }

    // ─── Rendering Engine ─────────────────────────────────────────────────────
    private renderAll() {
      this.renderDynamicRoad();
      this.renderPlayer();
      this.renderObstacles();
      this.renderCoins();
      this.renderParticles();
    }

    private renderStaticRoad() {
      const W = this.scale.width;
      const H = this.scale.height;
      const horizonY = H * ROAD_CONFIG.horizonYRatio;
      const groundY = H * ROAD_CONFIG.groundYRatio;

      const horizonHalfW = (W * ROAD_CONFIG.horizonWidthRatio) / 2;
      const groundHalfW = (W * ROAD_CONFIG.groundWidthRatio) / 2;
      const cx = W / 2;

      this.roadGraphics.clear();

      // Sky gradient background
      this.roadGraphics.fillStyle(0xf8f8f8, 1);
      this.roadGraphics.fillRect(0, 0, W, horizonY);

      // Horizon skyline divider
      this.roadGraphics.lineStyle(1, 0xe5e5e5, 1);
      this.roadGraphics.lineBetween(0, horizonY, W, horizonY);

      // Distant geometric arcade hills/mountains in subtle light gray
      this.roadGraphics.fillStyle(0xf1f1f1, 1);
      this.roadGraphics.beginPath();
      this.roadGraphics.moveTo(0, horizonY);
      this.roadGraphics.lineTo(W * 0.2, horizonY - 18);
      this.roadGraphics.lineTo(W * 0.45, horizonY);
      this.roadGraphics.lineTo(W * 0.7, horizonY - 24);
      this.roadGraphics.lineTo(W, horizonY);
      this.roadGraphics.closePath();
      this.roadGraphics.fillPath();

      // Road background (White surface with clean borders)
      this.roadGraphics.fillStyle(0xffffff, 1);
      this.roadGraphics.beginPath();
      this.roadGraphics.moveTo(cx - horizonHalfW, horizonY);
      this.roadGraphics.lineTo(cx + horizonHalfW, horizonY);
      this.roadGraphics.lineTo(cx + groundHalfW, groundY);
      this.roadGraphics.lineTo(cx - groundHalfW, groundY);
      this.roadGraphics.closePath();
      this.roadGraphics.fillPath();

      // Road curbs / Clean Red borders
      const curb = ROAD_CONFIG.curbWidth;
      // Left curb
      this.roadGraphics.fillStyle(0xe53935, 1);
      this.roadGraphics.beginPath();
      this.roadGraphics.moveTo(cx - horizonHalfW - curb * 0.3, horizonY);
      this.roadGraphics.lineTo(cx - horizonHalfW, horizonY);
      this.roadGraphics.lineTo(cx - groundHalfW, groundY);
      this.roadGraphics.lineTo(cx - groundHalfW - curb, groundY);
      this.roadGraphics.closePath();
      this.roadGraphics.fillPath();

      // Right curb
      this.roadGraphics.fillStyle(0xe53935, 1);
      this.roadGraphics.beginPath();
      this.roadGraphics.moveTo(cx + horizonHalfW, horizonY);
      this.roadGraphics.lineTo(cx + horizonHalfW + curb * 0.3, horizonY);
      this.roadGraphics.lineTo(cx + groundHalfW + curb, groundY);
      this.roadGraphics.lineTo(cx + groundHalfW, groundY);
      this.roadGraphics.closePath();
      this.roadGraphics.fillPath();
    }

    private renderDynamicRoad() {
      // Re-draw dynamic lane dashes
      for (const dash of this.poolDashes) {
        dash.graphics.clear();

        // Divider position between Left/Center (0.5) or Center/Right (1.5)
        const laneXVal = dash.laneDivider === 0 ? 0.5 : 1.5;
        const p1 = this.getPerspective(laneXVal, dash.z);
        const p2 = this.getPerspective(laneXVal, Math.min(1.0, dash.z + 0.04));

        dash.graphics.lineStyle(Math.max(1, 4 * p1.scale), 0xe5e5e5, 0.9);
        dash.graphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
      }
    }

    private renderPlayer() {
      this.playerGraphics.clear();
      this.playerShadow.clear();

      const proj = this.getPerspective(this.currentLanePos, 0, this.jumpY);
      const bob = this.isJumping ? 0 : Math.sin(this.runTime) * PLAYER_CONFIG.runBobAmount;
      const py = proj.y + bob;
      const px = proj.x;

      const pw = PLAYER_CONFIG.baseWidth * proj.scale;
      const ph = PLAYER_CONFIG.baseHeight * proj.scale;

      // 1. Drop shadow on ground plane
      const shadowProj = this.getPerspective(this.currentLanePos, 0, 0);
      const shadowScale = Math.max(0.4, 1 - Math.abs(this.jumpY) / 120);
      this.playerShadow.fillStyle(0x000000, 0.14 * shadowScale);
      this.playerShadow.fillEllipse(shadowProj.x, shadowProj.y + 4, pw * 0.9 * shadowScale, 10 * proj.scale * shadowScale);

      // 2. Player Body (Clean Red Arcade runner)
      const g = this.playerGraphics;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas((this.tiltAngle * Math.PI) / 180);

      // Main torso chassis
      g.fillStyle(0xe53935, 1);
      g.fillRoundedRect(-pw / 2, -ph, pw, ph, 8 * proj.scale);

      // Crisp contrast border
      g.lineStyle(2 * proj.scale, 0xc62828, 1);
      g.strokeRoundedRect(-pw / 2, -ph, pw, ph, 8 * proj.scale);

      // Visor / cockpit (Dark with white reflect)
      const visorH = ph * 0.28;
      const visorW = pw * 0.72;
      g.fillStyle(0x171717, 1);
      g.fillRoundedRect(-visorW / 2, -ph * 0.85, visorW, visorH, 4 * proj.scale);

      // Red visor glow accent
      g.fillStyle(0xff5252, 0.85);
      g.fillRect(-visorW / 2 + 3, -ph * 0.85 + 2, visorW - 6, 2 * proj.scale);

      // Running shoes / thrusters at bottom
      const footW = pw * 0.35;
      const footH = ph * 0.2;
      g.fillStyle(0x171717, 1);
      g.fillRoundedRect(-pw / 2 + 2, -footH, footW, footH, 3 * proj.scale);
      g.fillRoundedRect(pw / 2 - footW - 2, -footH, footW, footH, 3 * proj.scale);

      g.restore();
    }

    private renderObstacles() {
      // Sort obstacles by depth z descending so farther objects render under closer ones
      const sorted = [...this.poolObstacles].filter((o) => o.active).sort((a, b) => b.z - a.z);

      for (const obs of sorted) {
        obs.graphics.clear();
        const def = OBSTACLE_DEFS[obs.type];
        const proj = this.getPerspective(obs.lane, obs.z);

        const w = (proj.laneW * 0.78);
        const h = 48 * def.heightScale * proj.scale;
        const x = proj.x - w / 2;
        const y = proj.y - h;

        // Ground shadow
        obs.graphics.fillStyle(0x000000, 0.12 * proj.scale);
        obs.graphics.fillEllipse(proj.x, proj.y, w * 0.9, 8 * proj.scale);

        // Body
        obs.graphics.fillStyle(def.color, 1);
        obs.graphics.fillRoundedRect(x, y, w, h, 6 * proj.scale);
        obs.graphics.lineStyle(1.5 * proj.scale, 0x991b1b, 1);
        obs.graphics.strokeRoundedRect(x, y, w, h, 6 * proj.scale);

        // Hazard stripes for barriers
        if (def.stripeColor) {
          obs.graphics.fillStyle(def.stripeColor, 0.85);
          const stripeW = w * 0.18;
          obs.graphics.fillRect(x + w * 0.2, y + 2, stripeW, h - 4);
          obs.graphics.fillRect(x + w * 0.6, y + 2, stripeW, h - 4);
        }

        // Center warning icon for tall blockers
        if (obs.type === "LANE_BLOCKER" && obs.text) {
          obs.text.setPosition(proj.x, y + h * 0.45);
          obs.text.setText("▲");
          obs.text.setFontSize(`${Math.max(10, Math.floor(18 * proj.scale))}px`);
        } else if (obs.text) {
          obs.text.setVisible(false);
        }
      }
    }

    private renderCoins() {
      // Sort coins by depth z descending
      const sorted = [...this.poolCoins].filter((c) => c.active && !c.collected).sort((a, b) => b.z - a.z);

      for (const coin of sorted) {
        coin.graphics.clear();
        const proj = this.getPerspective(coin.lane, coin.z, coin.jumpArcY);

        const baseR = COIN_CONFIG.radius * proj.scale;
        // Pseudo-3D spinning horizontal compression
        const spinR = Math.max(2, baseR * Math.abs(Math.cos(coin.rotation)));

        // Subtle ground shadow if not in mid-air
        if (coin.jumpArcY === 0) {
          coin.graphics.fillStyle(0x000000, 0.1 * proj.scale);
          coin.graphics.fillEllipse(proj.x, proj.y + 4, baseR * 1.6, 5 * proj.scale);
        }

        // Outer coin body
        coin.graphics.fillStyle(COIN_CONFIG.color, 1);
        coin.graphics.fillEllipse(proj.x, proj.y - baseR, spinR, baseR);
        coin.graphics.lineStyle(1.5 * proj.scale, 0xd97706, 1);
        coin.graphics.strokeEllipse(proj.x, proj.y - baseR, spinR, baseR);

        // Inner coin core
        coin.graphics.fillStyle(COIN_CONFIG.innerColor, 0.9);
        coin.graphics.fillEllipse(proj.x, proj.y - baseR, spinR * 0.55, baseR * 0.55);
      }
    }

    private renderParticles() {
      for (const p of this.poolParticles) {
        if (!p.active) continue;
        p.graphics.clear();
        p.graphics.fillStyle(p.color, p.alpha);
        p.graphics.fillCircle(p.x, p.y, p.size);
      }
    }

    // ─── Input & Touch Controls ───────────────────────────────────────────────
    private handleKeyDown(event: { key: string; preventDefault: () => void }) {
      if (this.gameState === "MENU") {
        if (event.key === " " || event.key === "Enter" || event.key === "ArrowUp" || event.key === "w") {
          event.preventDefault();
          this.startRun();
          return;
        }
      }

      if (event.key === "p" || event.key === "P" || event.key === "Escape") {
        event.preventDefault();
        this.togglePause();
        return;
      }

      if (this.gameState !== "PLAYING") return;

      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        event.preventDefault();
        this.moveLeft();
      } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        event.preventDefault();
        this.moveRight();
      } else if (event.key === "ArrowUp" || event.key === "w" || event.key === "W" || event.key === " ") {
        event.preventDefault();
        this.jump();
      }
    }

    private handlePointerDown(ptr: { x: number; y: number }) {
      this.touchStartX = ptr.x;
      this.touchStartY = ptr.y;
      this.touchStartTime = Date.now();
    }

    private handlePointerUp(ptr: { x: number; y: number }) {
      if (this.gameState === "MENU") {
        this.startRun();
        return;
      }

      if (this.gameState !== "PLAYING") return;

      const dx = ptr.x - this.touchStartX;
      const dy = ptr.y - this.touchStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = Date.now() - this.touchStartTime;

      // Tap / short press: tap left half -> move left, tap right half -> move right
      if (dist < 20 && elapsed < 350) {
        const W = this.scale.width;
        if (ptr.x < W * 0.38) this.moveLeft();
        else if (ptr.x > W * 0.62) this.moveRight();
        else this.jump();
        return;
      }

      // Swipe gesture
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) this.moveRight();
        else if (dx < -30) this.moveLeft();
      } else {
        if (dy < -30) this.jump();
      }
    }

    private handleResize() {
      this.renderStaticRoad();
      this.renderAll();
    }

    // ─── Public Actions (Called from React or Internal Input) ─────────────────
    public moveLeft() {
      if (this.gameState !== "PLAYING") return;
      if (this.targetLane > 0) {
        this.targetLane = (this.targetLane - 1) as Lane;
      }
    }

    public moveRight() {
      if (this.gameState !== "PLAYING") return;
      if (this.targetLane < 2) {
        this.targetLane = (this.targetLane + 1) as Lane;
      }
    }

    public jump() {
      if (this.gameState !== "PLAYING") return;
      if (!this.isJumping) {
        this.isJumping = true;
        this.jumpVelocity = -PLAYER_CONFIG.jumpForce;
        sound.playJump();
      }
    }

    public startRun() {
      this.score = 0;
      this.distance = 0;
      this.coins = 0;
      this.playerLane = 1;
      this.targetLane = 1;
      this.currentLanePos = 1;
      this.isJumping = false;
      this.jumpY = 0;
      this.currentSpeed = SPEED_CONFIG.baseZSpeed;
      this.nextSpawnZ = 1.1;

      // Clear pools
      for (const obs of this.poolObstacles) {
        obs.active = false;
        obs.graphics.clear();
        obs.graphics.setVisible(false);
        if (obs.text) obs.text.setVisible(false);
      }
      for (const coin of this.poolCoins) {
        coin.active = false;
        coin.graphics.clear();
        coin.graphics.setVisible(false);
      }
      for (const p of this.poolParticles) {
        p.active = false;
        p.graphics.clear();
        p.graphics.setVisible(false);
      }

      this.gameState = "PLAYING";
      callbacks.onGameStateChange("PLAYING");
      callbacks.onScoreChange(0);
      callbacks.onDistanceChange(0);
      callbacks.onCoinsChange(0);
    }

    public togglePause() {
      if (this.gameState === "PLAYING") {
        this.gameState = "PAUSED";
        callbacks.onGameStateChange("PAUSED");
      } else if (this.gameState === "PAUSED") {
        this.gameState = "PLAYING";
        callbacks.onGameStateChange("PLAYING");
      }
    }

    public restart() {
      this.startRun();
    }

    shutdown() {
      this.input.keyboard?.off("keydown", this.handleKeyDown, this);
      this.input.off("pointerdown", this.handlePointerDown, this);
      this.input.off("pointerup", this.handlePointerUp, this);
      this.scale.off("resize", this.handleResize, this);
    }
  };
}

// ─── React Wrapper Component ──────────────────────────────────────────────────
export default function EndlessRunnerGame({
  onScoreChange,
  onDistanceChange,
  onCoinsChange,
  onHighScoreChange,
  onGameOver,
  onGameStateChange,
  gameState,
  restartSignal,
  isMuted,
  onActionTrigger,
}: EndlessRunnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gameRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<any>(null);

  const stableCallbacks = useRef({
    onScoreChange,
    onDistanceChange,
    onCoinsChange,
    onHighScoreChange,
    onGameOver,
    onGameStateChange,
  });
  stableCallbacks.current = {
    onScoreChange,
    onDistanceChange,
    onCoinsChange,
    onHighScoreChange,
    onGameOver,
    onGameStateChange,
  };

  const callbacks: EndlessRunnerCallbacks = {
    onScoreChange: (s) => stableCallbacks.current.onScoreChange(s),
    onDistanceChange: (d) => stableCallbacks.current.onDistanceChange(d),
    onCoinsChange: (c) => stableCallbacks.current.onCoinsChange(c),
    onHighScoreChange: (hs) => stableCallbacks.current.onHighScoreChange(hs),
    onGameOver: (stats) => stableCallbacks.current.onGameOver(stats),
    onGameStateChange: (st) => stableCallbacks.current.onGameStateChange(st),
  };

  // Sync mute setting
  useEffect(() => {
    sound.setMuted(isMuted);
    try {
      localStorage.setItem(RUNNER_SOUND_KEY, String(isMuted));
    } catch {
      // noop
    }
  }, [isMuted]);

  // Mount Phaser Game (SSR-safe dynamic import)
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const PhaserModule = await import("phaser");
      const PhaserLib = PhaserModule.default;
      if (!mounted || !containerRef.current) return;

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }

      const SceneClass = createRunnerScene(PhaserLib, callbacks, isMuted);
      const container = containerRef.current;
      const W = container.clientWidth || 460;
      const H = container.clientHeight || 580;

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
        sceneRef.current = game.scene.getScene("EndlessRunnerScene");
      });
    };

    init();

    return () => {
      mounted = false;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle external restart signal
  useEffect(() => {
    if (restartSignal === 0) return;
    sceneRef.current?.restart();
  }, [restartSignal]);

  // Handle external action triggers (e.g. mobile on-screen buttons)
  useEffect(() => {
    if (!onActionTrigger?.action || !sceneRef.current) return;
    const scene = sceneRef.current;

    switch (onActionTrigger.action) {
      case "LEFT":
        scene.moveLeft();
        break;
      case "RIGHT":
        scene.moveRight();
        break;
      case "JUMP":
        scene.jump();
        break;
      case "START":
        scene.startRun();
        break;
      case "PAUSE":
      case "RESUME":
        scene.togglePause();
        break;
      case "RESTART":
        scene.restart();
        break;
    }
  }, [onActionTrigger]);

  // Handle external pause state sync
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (gameState === "PAUSED") {
      scene.scene.pause();
    } else {
      scene.scene.resume();
    }
  }, [gameState]);

  return (
    <div
      ref={containerRef}
      id="endless-runner-canvas-container"
      className="w-full h-full select-none"
      style={{ minHeight: "440px", touchAction: "none" }}
      aria-label="Endless Runner game canvas"
    />
  );
}
