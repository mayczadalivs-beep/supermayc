import React, { useEffect, useRef, useState } from "react";
import {
  GameState,
  PowerState,
  EntityType,
  TileType,
  Player,
  GameEntity,
  GameTile,
  Particle,
  LevelConfig,
  Vector2D
} from "../types";
import { audio } from "../utils/audio";
import { LEVELS, generateLevelData } from "../utils/levels";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame } from "lucide-react";

interface GameCanvasProps {
  currentLevelId: number;
  gameState: GameState;
  onCoinCollected: (coins: number) => void;
  onLivesChanged: (lives: number) => void;
  onPowerChanged: (power: PowerState) => void;
  onProgressChanged: (progress: number) => void;
  onVictory: (stats: { coins: number; score: number; lives: number; levelName: string }) => void;
  onGameOver: (stats: { coins: number; levelName: string }) => void;
  resetTrigger: number;
  isMobileDevice?: boolean;
  selectedSkin?: string;
}

const TILE_SIZE = 32;
const VIEWPORT_WIDTH = 1200;
const VIEWPORT_HEIGHT = 480; // Standard 15 rows * 32 width = 480px

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentLevelId,
  gameState,
  onCoinCollected,
  onLivesChanged,
  onPowerChanged,
  onProgressChanged,
  onVictory,
  onGameOver,
  resetTrigger,
  isMobileDevice,
  selectedSkin = "classic"
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound States (inside state to sync with UI icons)
  const [isMuted, setIsMuted] = useState(audio.getMutedState());

  // Dynamic Level Config
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(
    LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0]
  );

  // Engine refs (using refs to prevent React hook lag inside fast requestAnimationFrame render loop)
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const playerRef = useRef<Player>({
    x: 100,
    y: 300,
    vx: 0,
    vy: 0,
    width: 24,
    height: 32,
    grounded: false,
    powerState: PowerState.NORMAL,
    starTimer: 0,
    hurtCooldown: 0,
    facing: "right",
    isCrouching: false,
    isWalking: false,
    walkFrame: 0
  });

  const levelTilesRef = useRef<GameTile[]>([]);
  const entitiesRef = useRef<GameEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const cameraXRef = useRef<number>(0);
  const coinsRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(3);
  const frameCountRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  // Trigger flagpole ending cutscene
  const isCutseneRef = useRef<boolean>(false);
  const cutseneStateRef = useRef<{ type: "slide" | "walk" | "finish"; timer: number }>({
    type: "slide",
    timer: 0
  });

  // Track if boss is active to show boss health bar
  const [bossHealth, setBossHealth] = useState<number | null>(null);

  // Re-generate Level Layout when Level ID changes or reset triggered
  useEffect(() => {
    const currentLvl = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];
    setLevelConfig(currentLvl);

    // Initial load
    const { tiles, entities } = generateLevelData(currentLvl);
    levelTilesRef.current = tiles;
    entitiesRef.current = entities;
    particlesRef.current = [];
    cameraXRef.current = 0;
    isCutseneRef.current = false;
    setBossHealth(null);

    // Reset Player coordinates
    playerRef.current = {
      x: 100,
      y: 300,
      vx: 0,
      vy: 0,
      width: 24,
      height: 32,
      grounded: false,
      powerState: PowerState.NORMAL,
      starTimer: 0,
      hurtCooldown: 0,
      facing: "right",
      isCrouching: false,
      isWalking: false,
      walkFrame: 0
    };

    // Reset temporary states
    onPowerChanged(PowerState.NORMAL);
    onProgressChanged(0);

    // Start background music if playing state matches
    if (gameState === GameState.PLAYING) {
      isPlayingRef.current = true;
      audio.startMusic(currentLvl.theme);
    } else {
      isPlayingRef.current = false;
      audio.stopMusic();
    }
  }, [currentLevelId, resetTrigger, gameState]);

  // Handle keys and mouse clicks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      keysRef.current[code] = true;

      // Prevent scrolling in iframe
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(code)) {
        e.preventDefault();
      }

      // Attack trigger: "KeyE" or "KeyX"
      if ((code === "KeyE" || code === "KeyX") && gameState === GameState.PLAYING && !isCutseneRef.current) {
        shootPlayerProjectile();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, levelConfig]);

  // Main game loop (Syncs with monitor refresh rate)
  useEffect(() => {
    let animationId: number;

    const gameLoop = () => {
      if (gameState === GameState.PLAYING && isPlayingRef.current) {
        updateGame();
      }
      renderGame();
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameState, levelConfig]);

  // Fireball attack logic
  const shootPlayerProjectile = () => {
    const player = playerRef.current;
    
    // Check if player can throw fireball.
    // If they have FIRE power, it's free. If normal/super, they can still do it by paying 5 coins!
    const isFree = player.powerState === PowerState.FIRE;
    if (!isFree && coinsRef.current < 5) return; // not enough coins

    if (!isFree) {
      coinsRef.current -= 5;
      onCoinCollected(coinsRef.current);
    }

    audio.playFireball();

    // Spawn Fireball entity
    const fireSpeed = player.facing === "right" ? 5.5 : -5.5;
    entitiesRef.current.push({
      id: `fireball-${frameCountRef.current}`,
      type: EntityType.FIREBALL,
      x: player.facing === "right" ? player.x + player.width + 2 : player.x - 12,
      y: player.y + player.height / 3,
      vx: fireSpeed,
      vy: 1.5,
      width: 12,
      height: 12,
      facing: player.facing
    });

    // Spawn sparks VFX
    for (let i = 0; i < 5; i++) {
      particlesRef.current.push({
        id: `shoot-spark-${frameCountRef.current}-${i}`,
        x: player.facing === "right" ? player.x + player.width : player.x,
        y: player.y + player.height / 3 + (Math.random() * 10 - 5),
        vx: (player.facing === "right" ? 1 : -1) * (1 + Math.random() * 2),
        vy: Math.random() * 2 - 1,
        color: "#f97316",
        size: 3 + Math.random() * 3,
        alpha: 1,
        decay: 0.05
      });
    }
  };

  // Sound Mute Toggle
  const toggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
    if (!muted && gameState === GameState.PLAYING) {
      audio.startMusic(levelConfig.theme);
    }
  };

  // Restart Dev Server placeholder helper
  const handleLevelRestart = () => {
    // Dispatch reset by triggering the reset callback (by reloading page or reset state)
    window.location.reload();
  };

  // Main game update logic (Physics, Collisions, State Changes)
  const updateGame = () => {
    frameCountRef.current++;
    const player = playerRef.current;
    const tiles = levelTilesRef.current;
    const entities = entitiesRef.current;
    const particles = particlesRef.current;

    // Handle Cutscene / Flagpole slide sequence
    if (isCutseneRef.current) {
      updateCutscene();
      return;
    }

    // Apply invincibility star timers
    if (player.starTimer > 0) {
      player.starTimer--;
    }
    if (player.hurtCooldown > 0) {
      player.hurtCooldown--;
    }

    // --- 1. KEYBOARD CONTROLS FOR PLAYER ---
    const speedMultiplier = player.starTimer > 0 ? 1.35 : 1.0;
    const accel = 0.35 * speedMultiplier;
    const friction = 0.85;
    const maxSpeed = 4.2 * speedMultiplier;
    const jumpForce = -10.2;

    player.isCrouching = keysRef.current["ArrowDown"] || keysRef.current["KeyS"] || false;

    // Left/Right Movement
    if (keysRef.current["ArrowLeft"] || keysRef.current["KeyA"]) {
      player.vx -= accel;
      player.facing = "left";
      player.isWalking = true;
      // Spawn running dust
      if (player.grounded && frameCountRef.current % 8 === 0) {
        particles.push({
          id: `dust-${frameCountRef.current}`,
          x: player.x + player.width / 2,
          y: player.y + player.height,
          vx: 0.5 + Math.random() * 0.5,
          vy: -0.2 - Math.random() * 0.3,
          color: "rgba(220,220,220,0.5)",
          size: 2 + Math.random() * 3,
          alpha: 0.8,
          decay: 0.04
        });
      }
    } else if (keysRef.current["ArrowRight"] || keysRef.current["KeyD"]) {
      player.vx += accel;
      player.facing = "right";
      player.isWalking = true;
      // Spawn running dust
      if (player.grounded && frameCountRef.current % 8 === 0) {
        particles.push({
          id: `dust-${frameCountRef.current}`,
          x: player.x + player.width / 2,
          y: player.y + player.height,
          vx: -0.5 - Math.random() * 0.5,
          vy: -0.2 - Math.random() * 0.3,
          color: "rgba(220,220,220,0.5)",
          size: 2 + Math.random() * 3,
          alpha: 0.8,
          decay: 0.04
        });
      }
    } else {
      player.vx *= friction;
      player.isWalking = false;
    }

    // Walking animation frame
    if (player.isWalking && player.grounded) {
      player.walkFrame += 0.15;
    }

    // Jump Control
    const wantsToJump = keysRef.current["Space"] || keysRef.current["ArrowUp"] || keysRef.current["KeyW"];
    if (wantsToJump && player.grounded) {
      player.vy = jumpForce;
      player.grounded = false;
      audio.playJump();
    }

    // Apply Player sizes based on state
    const targetHeight = player.powerState !== PowerState.NORMAL ? 48 : 32;
    if (player.height !== targetHeight) {
      // Adjust Y position so player does not sink into ground or float when growing/shrinking
      player.y -= (targetHeight - player.height);
      player.height = targetHeight;
    }

    // Apply Gravity and Physics Limits
    player.vy += levelConfig.gravity;
    if (player.vx > maxSpeed) player.vx = maxSpeed;
    if (player.vx < -maxSpeed) player.vx = -maxSpeed;
    // Terminal velocity
    if (player.vy > 12) player.vy = 12;

    // Crouch scaling
    if (player.isCrouching && player.grounded) {
      player.vx *= 0.5; // slow down substantially when crouched
    }

    // Move player incrementally to ensure correct solid resolution
    player.x += player.vx;
    // X-bounds
    if (player.x < 0) {
      player.x = 0;
      player.vx = 0;
    }

    // Horizontal Tile Collisions
    resolveTileCollisions(player, tiles, "horizontal");

    player.y += player.vy;
    player.grounded = false;

    // Vertical Tile Collisions
    resolveTileCollisions(player, tiles, "vertical");

    // Fall in pit death
    if (player.y > VIEWPORT_HEIGHT + 100) {
      playerHurt(true); // Instant death
    }

    // --- 2. CAMERA SCROLLING CONTROL (Classic Mario Scroll Forward ONLY) ---
    const cameraMarginLeft = VIEWPORT_WIDTH * 0.25;
    const cameraMarginRight = VIEWPORT_WIDTH * 0.5;

    if (player.x - cameraXRef.current > cameraMarginRight) {
      cameraXRef.current = Math.min(
        player.x - cameraMarginRight,
        levelConfig.width * TILE_SIZE - VIEWPORT_WIDTH
      );
    }
    // Prevent backtracking a bit as in classic NES
    if (player.x < cameraXRef.current) {
      player.x = cameraXRef.current;
    }

    // Progress percentage
    const levelLength = levelConfig.width * TILE_SIZE;
    const progress = Math.floor(Math.min(100, (player.x / (levelLength - VIEWPORT_WIDTH)) * 100));
    onProgressChanged(Math.max(0, Math.min(100, progress)));

    // --- 3. ENTITIES UPDATE ENGINE ---
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      if (entity.isKilled) {
        // Slow falling death animation for squished/hurt entities
        entity.killedTimer = (entity.killedTimer || 0) + 1;
        entity.y += 3;
        entity.x += entity.vx;
        if (entity.killedTimer > 100) {
          entities.splice(i, 1);
        }
        continue;
      }

      // Update specific entity AI behaviors
      updateEntityAI(entity, player, tiles, entities);

      // Entity-to-Tile collisions (Movement blocking)
      if (
        entity.type !== EntityType.PIRANHA_PLANT &&
        entity.type !== EntityType.FIREBALL &&
        entity.type !== EntityType.BOWSER_FIRE &&
        entity.type !== EntityType.COIN
      ) {
        entity.vy += levelConfig.gravity;
        entity.x += entity.vx;
        resolveTileCollisions(entity, tiles, "horizontal");
        entity.y += entity.vy;
        resolveTileCollisions(entity, tiles, "vertical");
      }

      // --- 4. PLAYER & ENTITY OVERLAPPING INTERACTIONS ---
      if (checkAABBCollision(player, entity)) {
        handlePlayerEntityCollision(player, entity, entities);
      }

      // Fireball to Enemy collisions
      if (entity.type === EntityType.FIREBALL) {
        // Check hitting solid block or ground
        let hitWall = false;
        const eGridX = Math.floor((entity.x + entity.width / 2) / TILE_SIZE);
        const eGridY = Math.floor((entity.y + entity.height / 2) / TILE_SIZE);
        const tileUnder = tiles.find(t => t.x === eGridX && t.y === eGridY && t.solid);
        if (tileUnder) {
          hitWall = true;
        }

        // Check hitting enemies
        for (let j = entities.length - 1; j >= 0; j--) {
          const enemy = entities[j];
          if (
            enemy.id !== entity.id &&
            !enemy.isKilled &&
            enemy.type !== EntityType.FIRE_FLOWER &&
            enemy.type !== EntityType.MUSHROOM &&
            enemy.type !== EntityType.STAR &&
            enemy.type !== EntityType.COIN &&
            enemy.type !== EntityType.FIREBALL &&
            enemy.type !== EntityType.BOWSER_FIRE
          ) {
            if (checkAABBCollision(entity, enemy)) {
              // Hurt enemy
              hurtEnemyWithFireball(enemy, entities);
              hitWall = true;
              break;
            }
          }
        }

        if (hitWall) {
          // Remove fireball and spawn dynamic sparks
          for (let s = 0; s < 4; s++) {
            particles.push({
              id: `spark-fire-${frameCountRef.current}-${s}`,
              x: entity.x + 6,
              y: entity.y + 6,
              vx: (Math.random() * 4 - 2),
              vy: (Math.random() * -3),
              color: "#ef4444",
              size: 2 + Math.random() * 3,
              alpha: 1,
              decay: 0.1
            });
          }
          entities.splice(i, 1);
        }
      }

      // Bowser Fireball to Player interactions
      if (entity.type === EntityType.BOWSER_FIRE) {
        if (checkAABBCollision(player, entity) && player.starTimer === 0 && player.hurtCooldown === 0) {
          playerHurt(false);
          entities.splice(i, 1);
        }
      }
    }

    // --- 5. PARTICLES ENGINE ---
    for (let p = particles.length - 1; p >= 0; p--) {
      const part = particles[p];
      part.alpha -= part.decay;
      if (part.gravity) {
        part.vy += 0.2; // apply simple gravity to particles like brick debris
      }
      part.x += part.vx;
      part.y += part.vy;

      if (part.alpha <= 0) {
        particles.splice(p, 1);
      }
    }

    // Update dynamic tiles bump animations
    tiles.forEach((tile) => {
      if (tile.hitTimer && tile.hitTimer > 0) {
        tile.hitTimer--;
        tile.hitOffset = Math.sin((10 - tile.hitTimer) * (Math.PI / 10)) * -8;
      } else {
        tile.hitOffset = 0;
      }
    });
  };

  // Resolve Tile block solid collisions (Standard Platformer pushout algorithm)
  const resolveTileCollisions = (
    obj: { x: number; y: number; vx: number; vy: number; width: number; height: number; grounded?: boolean },
    tiles: GameTile[],
    direction: "horizontal" | "vertical"
  ) => {
    const oLeft = obj.x;
    const oRight = obj.x + obj.width;
    const oTop = obj.y;
    const oBottom = obj.y + obj.height;

    // Check tiles intersecting with obj bounding box
    const startX = Math.floor(oLeft / TILE_SIZE);
    const endX = Math.floor(oRight / TILE_SIZE);
    const startY = Math.floor(oTop / TILE_SIZE);
    const endY = Math.floor(oBottom / TILE_SIZE);

    for (let tx = startX; tx <= endX; tx++) {
      for (let ty = startY; ty <= endY; ty++) {
        const tile = tiles.find((t) => t.x === tx && t.y === ty);
        if (!tile || !tile.solid) continue;

        const tileLeft = tile.x * TILE_SIZE;
        const tileRight = (tile.x + 1) * TILE_SIZE;
        const tileTop = tile.y * TILE_SIZE;
        const tileBottom = (tile.y + 1) * TILE_SIZE;

        // Bounding check
        if (
          oRight > tileLeft &&
          oLeft < tileRight &&
          oBottom > tileTop &&
          oTop < tileBottom
        ) {
          if (direction === "horizontal") {
            if (obj.vx > 0) {
              const overlap = oRight - tileLeft;
              obj.x -= overlap;
              obj.vx = 0;
            } else if (obj.vx < 0) {
              const overlap = tileRight - oLeft;
              obj.x += overlap;
              obj.vx = 0;
            }
          } else {
            // vertical
            if (obj.vy > 0) {
              const overlap = oBottom - tileTop;
              obj.y -= overlap;
              obj.vy = 0;
              if ("grounded" in obj) obj.grounded = true;
            } else if (obj.vy < 0) {
              const overlap = tileBottom - oTop;
              obj.y += overlap;
              obj.vy = 0;

              // Check if player hit block from below!
              if ("powerState" in obj) {
                handleBlockBelowBump(tile, tileLeft, tileTop);
              }
            }
          }
        }
      }
    }
  };

  // Block bumped from underneath
  const handleBlockBelowBump = (tile: GameTile, tileX: number, tileY: number) => {
    if (tile.hitTimer && tile.hitTimer > 0) return; // already in bump animation

    const player = playerRef.current;
    
    // Check brick block smashing
    if (tile.type === TileType.BRICK && player.powerState !== PowerState.NORMAL) {
      // Bricks break under heavy force!
      audio.playBrickBreak();

      // Spawn falling brick particles
      for (let i = 0; i < 4; i++) {
        particlesRef.current.push({
          id: `brick-${frameCountRef.current}-${i}`,
          x: tileX + 16,
          y: tileY + 16,
          vx: (i % 2 === 0 ? -1.8 : 1.8) * (1 + Math.random() * 0.5),
          vy: -4 - Math.random() * 3,
          color: levelConfig.brickColor,
          size: 6 + Math.random() * 4,
          alpha: 1,
          decay: 0.02,
          gravity: true
        });
      }

      // Remove the brick tile from our game database
      const idx = levelTilesRef.current.indexOf(tile);
      if (idx !== -1) {
        levelTilesRef.current.splice(idx, 1);
      }
      return;
    }

    // Trigger bump animation on ANY block
    tile.hitTimer = 10; // 10 animation frames

    // Sound cue
    if (tile.type === TileType.MYSTERY_COIN || tile.type === TileType.MYSTERY_MUSHROOM || tile.type === TileType.MYSTERY_FLOWER || tile.type === TileType.MYSTERY_STAR) {
      audio.playPowerUp();
    } else {
      audio.playBrickBreak(); // small kick
    }

    // Spawn item pop out dynamically based on type!
    if (tile.type === TileType.MYSTERY_COIN) {
      // Coin pops up and disappears with score count
      coinsRef.current += 1;
      scoreRef.current += 200;
      onCoinCollected(coinsRef.current);
      audio.playCoin();

      // Spawn jumping gold coin particle
      particlesRef.current.push({
        id: `coin-bump-${frameCountRef.current}`,
        x: tileX + 8,
        y: tileY - 16,
        vx: 0,
        vy: -4,
        color: "#fbbf24", // Yellow Gold
        size: 8,
        alpha: 1,
        decay: 0.04,
        gravity: true
      });

      // Change mystery block to a solid dead slab
      tile.type = TileType.BRICK_EMPTY;
    } else if (tile.type === TileType.MYSTERY_MUSHROOM) {
      // Mushroom pops upwards
      spawnEntityUpwards(EntityType.MUSHROOM, tileX, tileY - 32, "#ef4444");
      tile.type = TileType.BRICK_EMPTY;
    } else if (tile.type === TileType.MYSTERY_FLOWER) {
      spawnEntityUpwards(EntityType.FIRE_FLOWER, tileX, tileY - 32, "#f43f5e");
      tile.type = TileType.BRICK_EMPTY;
    } else if (tile.type === TileType.MYSTERY_STAR) {
      spawnEntityUpwards(EntityType.STAR, tileX, tileY - 32, "#fbbf24");
      tile.type = TileType.BRICK_EMPTY;
    }
  };

  // Spawn dynamic Power-up sliding upwards out of block
  const spawnEntityUpwards = (type: EntityType, x: number, y: number, color: string) => {
    entitiesRef.current.push({
      id: `${type}-${frameCountRef.current}`,
      type,
      x: x,
      y: y + 16, // offset inside block slightly
      vx: type === EntityType.STAR ? 1.5 : (type === EntityType.MUSHROOM ? 1.2 : 0),
      vy: -2, // rise upward!
      width: 32,
      height: 32,
      facing: "right",
      color
    });
  };

  // Dynamic AI Movement
  const updateEntityAI = (
    entity: GameEntity,
    player: Player,
    tiles: GameTile[],
    entities: GameEntity[]
  ) => {
    if (entity.type === EntityType.GOOMBA) {
      // Basic patrol, turns back when bumped, handled by resolveTileCollisions.
      // If Goomba is stuck with vx = 0, nudge it back
      if (Math.abs(entity.vx) < 0.1) {
        entity.vx = entity.facing === "right" ? -1.2 : 1.2;
      }
      entity.facing = entity.vx > 0 ? "right" : "left";
    }

    if (entity.type === EntityType.KOOPA) {
      if (Math.abs(entity.vx) < 0.1) {
        entity.vx = entity.facing === "right" ? -1.0 : 1.0;
      }
      entity.facing = entity.vx > 0 ? "right" : "left";
    }

    if (entity.type === EntityType.SHELL) {
      // Static shell until kicked. If kicked, flies at speed.
    }

    if (entity.type === EntityType.MUSHROOM) {
      // Walks standard like Goomba
      if (Math.abs(entity.vx) < 0.1) {
        entity.vx = entity.facing === "right" ? -1.2 : 1.2;
      }
      entity.facing = entity.vx > 0 ? "right" : "left";
    }

    if (entity.type === EntityType.STAR) {
      // Star jumps periodically when grounded!
      if (entity.vy === 0) {
        entity.vy = -5.0; // bouncy star!
      }
      if (Math.abs(entity.vx) < 0.1) {
        entity.vx = entity.facing === "right" ? -1.5 : 1.5;
      }
    }

    if (entity.type === EntityType.PIRANHA_PLANT) {
      // Cycles going inside and outside the Pipe dynamically
      entity.stateTimer = (entity.stateTimer || 0) + 1;
      const cycle = entity.stateTimer % 220;

      // Base Y was initialized, let's offset Y depending on state
      const pipeBaseY = Math.floor(entity.y / TILE_SIZE) * TILE_SIZE;

      if (cycle < 60) {
        // rising up
        entity.y -= 0.6;
      } else if (cycle >= 60 && cycle < 140) {
        // fully out biting
      } else if (cycle >= 140 && cycle < 200) {
        // retreating back
        entity.y += 0.6;
      } else {
        // hidden in pipe, safe
      }
    }

    if (entity.type === EntityType.BOWSER) {
      // Bowser Boss fight custom mechanics!
      entity.stateTimer = (entity.stateTimer || 0) + 1;
      setBossHealth(entity.health || 0);

      // Random jump and charge
      if (entity.stateTimer % 180 === 0 && entity.vy === 0) {
        entity.vy = -6.5; // jumps heavily!
      }

      // Spit fireball sequence
      if (entity.stateTimer % 90 === 0) {
        // Boss spits fiery projectile at the player!
        const dx = player.x - entity.x;
        const fireDir = dx < 0 ? -1 : 1;
        
        entitiesRef.current.push({
          id: `bowserfire-${frameCountRef.current}`,
          type: EntityType.BOWSER_FIRE,
          x: entity.x + (fireDir < 0 ? -20 : 60),
          y: entity.y + 20,
          vx: fireDir * 3.5,
          vy: Math.sin(entity.stateTimer) * 1.5, // wavy trajectory!
          width: 24,
          height: 18,
          facing: fireDir < 0 ? "left" : "right"
        });

        audio.playFireball();
      }

      // Keep pacing left and right within the bridge bounds (column 142 to 154)
      const leftBoundX = 142 * TILE_SIZE;
      const rightBoundX = 153 * TILE_SIZE;

      if (entity.x < leftBoundX) {
        entity.vx = 0.8;
        entity.facing = "right";
      } else if (entity.x > rightBoundX) {
        entity.vx = -0.8;
        entity.facing = "left";
      }

      entity.x += entity.vx;
    }
  };

  // Flagpole slide and castle walk custom ending sequence
  const startFlagpoleCutscene = () => {
    isCutseneRef.current = true;
    cutseneStateRef.current = {
      type: "slide",
      timer: 0
    };
    audio.playLevelSuccess();
    audio.stopMusic();
    
    // Stop velocities
    playerRef.current.vx = 0;
    playerRef.current.vy = 1.0; // slide slowly down
  };

  const updateCutscene = () => {
    const player = playerRef.current;
    const cut = cutseneStateRef.current;
    cut.timer++;

    if (cut.type === "slide") {
      // Slide down Y axis until grounded
      player.vx = 0;
      player.y += 1.5;
      
      // Check if grounded on flag block Base
      const playerFootY = player.y + player.height;
      const flagpoleBaseY = (levelConfig.height - 3) * TILE_SIZE;
      if (playerFootY >= flagpoleBaseY) {
        player.y = flagpoleBaseY - player.height;
        cut.type = "walk";
        cut.timer = 0;
      }
    } else if (cut.type === "walk") {
      // Walk right into the castle door
      player.vx = 1.8;
      player.x += player.vx;
      player.facing = "right";

      // Animate walk swing
      player.walkFrame += 0.15;

      // Spawns fireworks sparkle particles for grand exit
      if (cut.timer % 15 === 0) {
        audio.playCoin();
        for (let s = 0; s < 12; s++) {
          particlesRef.current.push({
            id: `firework-${frameCountRef.current}-${s}`,
            x: player.x + 100 + (Math.random() * 80 - 40),
            y: 100 + (Math.random() * 80 - 40),
            vx: Math.cos((s * Math.PI) / 6) * (1.5 + Math.random() * 2),
            vy: Math.sin((s * Math.PI) / 6) * (1.5 + Math.random() * 2),
            color: ["#f43f5e", "#fbbf24", "#60a5fa", "#34d399"][s % 4],
            size: 4 + Math.random() * 4,
            alpha: 1,
            decay: 0.03
          });
        }
      }

      // Find castle door distance
      const levelLength = levelConfig.width * TILE_SIZE;
      const doorX = levelLength - 5.5 * TILE_SIZE;
      if (player.x >= doorX) {
        player.vx = 0;
        player.alpha = 0; // fade out inside castle
        cut.type = "finish";
        cut.timer = 0;
      }
    } else if (cut.type === "finish") {
      if (cut.timer > 80) {
        // Complete Level!
        isPlayingRef.current = false;
        onVictory({
          coins: coinsRef.current,
          score: scoreRef.current,
          lives: livesRef.current,
          levelName: levelConfig.name
        });
      }
    }
  };

  // Handle player collisions with monsters or items
  const handlePlayerEntityCollision = (
    player: Player,
    entity: GameEntity,
    entities: GameEntity[]
  ) => {
    // Collectibles & Powerups
    if (entity.type === EntityType.COIN) {
      audio.playCoin();
      coinsRef.current += 1;
      scoreRef.current += 200;
      onCoinCollected(coinsRef.current);
      // Remove coin instantly from entities list
      const idx = entities.indexOf(entity);
      if (idx !== -1) entities.splice(idx, 1);
      return;
    }

    if (entity.type === EntityType.MUSHROOM) {
      audio.playPowerUp();
      scoreRef.current += 1000;
      player.powerState = PowerState.SUPER;
      onPowerChanged(PowerState.SUPER);
      const idx = entities.indexOf(entity);
      if (idx !== -1) entities.splice(idx, 1);
      return;
    }

    if (entity.type === EntityType.FIRE_FLOWER) {
      audio.playPowerUp();
      scoreRef.current += 1000;
      player.powerState = PowerState.FIRE;
      onPowerChanged(PowerState.FIRE);
      const idx = entities.indexOf(entity);
      if (idx !== -1) entities.splice(idx, 1);
      return;
    }

    if (entity.type === EntityType.STAR) {
      audio.playPowerUp();
      scoreRef.current += 1000;
      player.starTimer = 600; // 10 seconds of flash invincibility!
      const idx = entities.indexOf(entity);
      if (idx !== -1) entities.splice(idx, 1);
      return;
    }

    // --- MONSTERS & BOSS COLLISIONS ---
    const isStandardMonster =
      entity.type === EntityType.GOOMBA ||
      entity.type === EntityType.KOOPA ||
      entity.type === EntityType.SHELL;

    if (isStandardMonster || entity.type === EntityType.PIRANHA_PLANT || entity.type === EntityType.BOWSER) {
      // Star power instant kill!
      if (player.starTimer > 0) {
        if (entity.type === EntityType.BOWSER) {
          // dealing massive damage to boss on crash contact
          entity.health = (entity.health || 0) - 20;
          if (entity.health <= 0) {
            defeatBoss(entity);
          }
          // Bounce back player
          player.vx *= -1.5;
          player.vy = -4.5;
        } else {
          killEnemyFlying(entity);
        }
        return;
      }

      // Check stomping from above
      // Stomp is valid if player is falling down and falls directly onto the monster's head
      const playerBottom = player.y + player.height;
      const isFalling = player.vy > 0;
      const monsterHeadY = entity.y;

      if (isFalling && playerBottom <= monsterHeadY + 14 && entity.type !== EntityType.PIRANHA_PLANT) {
        audio.playStomp();
        
        // Bounce player back up
        player.vy = -7.5;
        scoreRef.current += 500;

        if (entity.type === EntityType.GOOMBA) {
          entity.isKilled = true;
          entity.killedTimer = 0;
          entity.vx = 0;
          entity.vy = 0;
        } else if (entity.type === EntityType.KOOPA) {
          // Koopa turns into Shell
          entity.type = EntityType.SHELL;
          entity.height = 22; // shell height is smaller
          entity.y += 10;
          entity.vx = 0;
        } else if (entity.type === EntityType.SHELL) {
          // If shell is stationary, kick it!
          if (entity.vx === 0) {
            entity.vx = player.facing === "right" ? 6.5 : -6.5;
          } else {
            // Stop shell
            entity.vx = 0;
          }
        } else if (entity.type === EntityType.BOWSER) {
          // Bowser stomp subtracts health
          entity.health = (entity.health || 0) - 30; // takes 4 stomps
          if (entity.health <= 0) {
            defeatBoss(entity);
          } else {
            // Stomp bounce, Bowser sparkles angrily!
            for (let f = 0; f < 8; f++) {
              particlesRef.current.push({
                id: `boss-stomp-${frameCountRef.current}-${f}`,
                x: entity.x + 40,
                y: entity.y + 40,
                vx: Math.random() * 4 - 2,
                vy: Math.random() * -3 - 1,
                color: "#f59e0b",
                size: 4 + Math.random() * 4,
                alpha: 1,
                decay: 0.05
              });
            }
          }
        }
        return;
      }

      // Otherwise, player gets hit!
      if (player.hurtCooldown === 0) {
        if (entity.type === EntityType.SHELL && Math.abs(entity.vx) < 0.1) {
          // Player easily kicks motionless shell with no damage!
          entity.vx = player.facing === "right" ? 6.5 : -6.5;
          audio.playStomp();
        } else {
          playerHurt(false);
        }
      }
    }
  };

  const killEnemyFlying = (entity: GameEntity) => {
    audio.playStomp();
    entity.isKilled = true;
    entity.killedTimer = 0;
    entity.vx = 1.0;
    entity.vy = -4.5; // fly upwards and fall off screen on kill!
    scoreRef.current += 1000;
  };

  const hurtEnemyWithFireball = (entity: GameEntity, entities: GameEntity[]) => {
    audio.playStomp();
    for (let i = 0; i < 8; i++) {
       particlesRef.current.push({
         id: `splash-fire-${frameCountRef.current}-${i}`,
         x: entity.x + entity.width/2,
         y: entity.y + entity.height/2,
         vx: Math.random()*4-2,
         vy: Math.random()*4-2,
         color: "#fb923c",
         size: 3+Math.random()*4,
         alpha: 1,
         decay: 0.08
       });
    }

    if (entity.type === EntityType.BOWSER) {
      entity.health = (entity.health || 0) - 10; // Bowser takes 12 fireball hits
      if (entity.health <= 0) {
        defeatBoss(entity);
      }
    } else {
      // Normal enemies die instantly from fireball!
      killEnemyFlying(entity);
    }
  };

  const defeatBoss = (bowser: GameEntity) => {
    audio.playVictory();
    bowser.isKilled = true;
    bowser.killedTimer = 0;
    bowser.vx = 0;
    bowser.vy = 2.0; // falls into lava
    setBossHealth(null);
    scoreRef.current += 10000; // Grand Boss Bonus!

    // Clear all Bowser flames on screen instantly
    entitiesRef.current = entitiesRef.current.filter(e => e.type !== EntityType.BOWSER_FIRE);

    // Create explosion cascade
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        id: `boss-death-${frameCountRef.current}-${i}`,
        x: bowser.x + 40 + (Math.random() * 40 - 20),
        y: bowser.y + 40 + (Math.random() * 40 - 20),
        vx: Math.cos(i) * (2 + Math.random() * 4),
        vy: Math.sin(i) * (2 + Math.random() * 4),
        color: "#f97316",
        size: 5 + Math.random() * 6,
        alpha: 1,
        decay: 0.02
      });
    }

    // Replace bridge brick tiles with empty tiles, sending Bowser plunging down!
    // This is the classic retro bridge drop sequence!
    setTimeout(() => {
      levelTilesRef.current.forEach((t) => {
        if (t.x >= 142 && t.x <= 156 && t.type === TileType.BRICK) {
          // Dissolve brick bridge
          t.solid = false;
          t.type = TileType.LAVA;
        }
      });
    }, 1200);
  };

  // Hurting/Dying workflow
  const playerHurt = (forceKill = false) => {
    const player = playerRef.current;

    if (!forceKill && player.powerState === PowerState.FIRE) {
      audio.playHurt();
      player.powerState = PowerState.SUPER;
      onPowerChanged(PowerState.SUPER);
      player.hurtCooldown = 120; // 2 seconds invulnerability blink
    } else if (!forceKill && player.powerState === PowerState.SUPER) {
      audio.playHurt();
      player.powerState = PowerState.NORMAL;
      onPowerChanged(PowerState.NORMAL);
      player.hurtCooldown = 120;
    } else {
      // Small/naked player dies
      livesRef.current -= 1;
      onLivesChanged(livesRef.current);
      audio.playHurt();
      
      isPlayingRef.current = false;
      audio.stopMusic();

      // Trigger Game Over screen if 0 lives
      if (livesRef.current <= 0) {
        audio.playGameOver();
        onGameOver({
          coins: coinsRef.current,
          levelName: levelConfig.name
        });
      } else {
        // Respawn sequence
        setTimeout(() => {
          player.x = 100;
          player.y = 200;
          player.vx = 0;
          player.vy = 0;
          player.powerState = PowerState.NORMAL;
          onPowerChanged(PowerState.NORMAL);
          cameraXRef.current = 0;
          isPlayingRef.current = true;
          audio.startMusic(levelConfig.theme);
        }, 1500);
      }
    }
  };

  // Helper AABB Collision
  const checkAABBCollision = (
    r1: { x: number; y: number; width: number; height: number },
    r2: { x: number; y: number; width: number; height: number }
  ) => {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  };

  // --- RENDER GAME (HTML5 HTML Canvas Painting) ---
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tiles = levelTilesRef.current;
    const entities = entitiesRef.current;
    const particles = particlesRef.current;
    const player = playerRef.current;
    const camX = cameraXRef.current;

    // --- 1. SKY GRADIENT / UNDERGROUND CAVERN ---
    if (levelConfig.theme === "grass") {
      const gradient = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
      gradient.addColorStop(0, "#38bdf8"); // Celestial Blue
      gradient.addColorStop(0.7, "#bae6fd"); // Light Horizon
      gradient.addColorStop(1, "#f3f4f6"); // Off-white ground blur
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      // Draw floating clouds (Parallax effects)
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 350 - camX * 0.3) % (VIEWPORT_WIDTH + 150)) - 100;
        const cy = 60 + (i % 2) * 50;
        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.arc(cx + 20, cy - 10, 30, 0, Math.PI * 2);
        ctx.arc(cx + 40, cy, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw green rolling hills (Middle Parallax)
      ctx.fillStyle = "rgba(34, 197, 94, 0.25)";
      for (let i = 0; i < 4; i++) {
        const hx = ((i * 500 - camX * 0.45) % (VIEWPORT_WIDTH + 400)) - 200;
        ctx.beginPath();
        ctx.moveTo(hx, VIEWPORT_HEIGHT);
        ctx.quadraticCurveTo(hx + 200, 220, hx + 400, VIEWPORT_HEIGHT);
        ctx.fill();
      }
    } else if (levelConfig.theme === "underground") {
      ctx.fillStyle = "#0f172a"; // Deep obsidian dark slate
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      // Stone stalactites texture patterns
      ctx.fillStyle = "#1e293b";
      for (let i = 0; i < VIEWPORT_WIDTH; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 40, 60 + (i % 3) * 15);
        ctx.lineTo(i + 80, 0);
        ctx.fill();
      }
    } else {
      // Volcanic Bowser Castle Theme
      ctx.fillStyle = "#111827"; // Pitch black
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      // Red lava glow on the background
      ctx.fillStyle = "rgba(220, 38, 38, 0.08)";
      ctx.fillRect(0, VIEWPORT_HEIGHT - 120, VIEWPORT_WIDTH, 120);

      // Draw hanging iron chains and castle pillars
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 3;
      for (let x = 120; x < VIEWPORT_WIDTH; x += 180) {
        ctx.beginPath();
        const chainScroll = (camX * 0.1) % 180;
        ctx.moveTo(x - chainScroll, 0);
        ctx.lineTo(x - chainScroll, VIEWPORT_HEIGHT - 80);
        ctx.stroke();
      }
    }

    // --- 2. GRID BLOCKS / TILES DRAWING ---
    tiles.forEach((tile) => {
      const tileX = tile.x * TILE_SIZE - camX;
      // Only render visible tiles to maximize canvas frame performance
      if (tileX < -32 || tileX > VIEWPORT_WIDTH + 32) return;

      const tileY = tile.y * TILE_SIZE + (tile.hitOffset || 0);

      if (tile.type === TileType.GROUND) {
        // Sunny grass top
        ctx.fillStyle = levelConfig.groundColor;
        ctx.fillRect(tileX, tileY, TILE_SIZE, 8);
        ctx.fillStyle = "#78350f"; // dirt underneath
        ctx.fillRect(tileX, tileY + 8, TILE_SIZE, TILE_SIZE - 8);
        // Small green speckles
        ctx.fillStyle = "#166534";
        ctx.fillRect(tileX + 4, tileY + 12, 4, 4);
        ctx.fillRect(tileX + 22, tileY + 20, 3, 3);
      } else if (tile.type === TileType.BRICK) {
        // Red Brick
        ctx.fillStyle = levelConfig.brickColor;
        ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        // Interior brick lines
        ctx.beginPath();
        ctx.moveTo(tileX, tileY + 10);
        ctx.lineTo(tileX + TILE_SIZE, tileY + 10);
        ctx.moveTo(tileX, tileY + 20);
        ctx.lineTo(tileX + TILE_SIZE, tileY + 20);
        // Vertical lines
        ctx.moveTo(tileX + 10, tileY);
        ctx.lineTo(tileX + 10, tileY + 10);
        ctx.moveTo(tileX + 22, tileY + 10);
        ctx.lineTo(tileX + 22, tileY + 20);
        ctx.moveTo(tileX + 12, tileY + 20);
        ctx.lineTo(tileX + 12, tileY + 32);
        ctx.stroke();
      } else if (tile.type === TileType.SOLID_BLOCK) {
        // Unbreakable Steel Grey Block
        ctx.fillStyle = "#64748b";
        ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#334155";
        ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(tileX + 4, tileY + 4, 4, 4); // shine bolt
      } else if (tile.type === TileType.BRICK_EMPTY) {
        // Hit empty box
        ctx.fillStyle = "#4b5563";
        ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#1f2937";
        ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        // Bullet center
        ctx.fillStyle = "#374151";
        ctx.beginPath();
        ctx.arc(tileX + 16, tileY + 16, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (
        tile.type === TileType.MYSTERY_COIN ||
        tile.type === TileType.MYSTERY_MUSHROOM ||
        tile.type === TileType.MYSTERY_FLOWER ||
        tile.type === TileType.MYSTERY_STAR
      ) {
        // Glowing flashing Golden Mystery Block
        const pulse = Math.floor(frameCountRef.current / 8) % 4;
        const pColors = ["#f59e0b", "#fbbf24", "#fef08a", "#fbbf24"];
        ctx.fillStyle = pColors[pulse];
        ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#b45309";
        ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);

        // draw center "?" text
        ctx.fillStyle = "#78350f";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", tileX + 16, tileY + 16);
      } else if (tile.type === TileType.PIPE_TOP_LEFT) {
        ctx.fillStyle = "#15803d"; // Shaded dark sewer green
        ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#4ade80"; // Bright highlights
        ctx.fillRect(tileX + 4, tileY, 6, TILE_SIZE);
        ctx.strokeStyle = "#14532d";
        ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
      } else if (tile.type === TileType.PIPE_TOP_RIGHT) {
        ctx.fillStyle = "#166534";
        ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#14532d";
        ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
      } else if (tile.type === TileType.PIPE_BODY_LEFT) {
        ctx.fillStyle = "#16a34a"; // mid-shade green
        ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#86efac";
        ctx.fillRect(tileX + 6, tileY, 4, TILE_SIZE);
        ctx.strokeStyle = "#14532d";
        ctx.beginPath();
        ctx.moveTo(tileX, tileY);
        ctx.lineTo(tileX, tileY + TILE_SIZE);
        ctx.stroke();
      } else if (tile.type === TileType.PIPE_BODY_RIGHT) {
        ctx.fillStyle = "#15803d";
        ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#14532d";
        ctx.beginPath();
        ctx.moveTo(tileX + TILE_SIZE, tileY);
        ctx.lineTo(tileX + TILE_SIZE, tileY + TILE_SIZE);
        ctx.stroke();
      } else if (tile.type === TileType.FLAGPOLE_TOP) {
        // Golden Flagpole Ball
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(tileX + 16, tileY + 16, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ca8a04";
        ctx.stroke();
      } else if (tile.type === TileType.FLAGPOLE_SHAFT) {
        // Metallic grey shaft
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(tileX + 14, tileY, 4, TILE_SIZE);
      } else if (tile.type === TileType.CASTLE_BRICK) {
        // Castle Blocks
        ctx.fillStyle = levelConfig.theme === "castle" ? "#1e293b" : "#475569";
        ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
        // Cracks
        ctx.strokeStyle = "#0f172a";
        ctx.beginPath();
        ctx.moveTo(tileX, tileY + 16);
        ctx.lineTo(tileX + TILE_SIZE, tileY + 16);
        ctx.stroke();
      } else if (tile.type === TileType.CASTLE_DOOR) {
        // Dark door
        ctx.fillStyle = "#0c0a09"; // Stone black
        ctx.fillRect(tileX + 2, tileY, TILE_SIZE - 4, TILE_SIZE);
      } else if (tile.type === TileType.LAVA) {
        // Bubbling bright orange/red lava tiles
        const wave = Math.sin((frameCountRef.current / 10) + tile.x) * 4;
        ctx.fillStyle = "#f97316"; // Bright Volcano safety orange
        ctx.fillRect(tileX, tileY + 6 + wave, TILE_SIZE, TILE_SIZE - (6 + wave));
        ctx.fillStyle = "#ef4444"; // Deep Lava Red
        ctx.fillRect(tileX, tileY + 12 + wave, TILE_SIZE, TILE_SIZE - (12 + wave));
        // Yellow hot bubbles rising
        if (frameCountRef.current % 12 === 0) {
          ctx.fillStyle = "#fef08a";
          ctx.beginPath();
          ctx.arc(tileX + 8 + (tile.x % 16), tileY + 16, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Draw Flagpole banner if flag exists on screen
    const poleTopTile = tiles.find(t => t.type === TileType.FLAGPOLE_TOP);
    if (poleTopTile) {
      // Draw flying green checkered flag
      const flagX = poleTopTile.x * TILE_SIZE - camX;
      // Flags slide down Y on cutscene trigger
      const flagSlide = isCutseneRef.current ? Math.min(220, cutseneStateRef.current.timer * 2.5) : 0;
      const flagY = poleTopTile.y * TILE_SIZE + 40 + flagSlide;

      ctx.fillStyle = "#22c55e"; // Mayc signature green flag!
      ctx.beginPath();
      ctx.moveTo(flagX + 16, flagY);
      ctx.lineTo(flagX - 32, flagY + 14);
      ctx.lineTo(flagX + 16, flagY + 28);
      ctx.closePath();
      ctx.fill();
      
      // Black letters "M" for Mayc on flag!
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.fillText("M", flagX - 5, flagY + 16);
    }

    // --- 3. ENTITIES DRAWING ENGINE ---
    entities.forEach((entity) => {
      const eX = entity.x - camX;
      if (eX < -150 || eX > VIEWPORT_WIDTH + 100) return; // view bounds culling

      // --- 3A. MUSHROOM POWERUP ---
      if (entity.type === EntityType.MUSHROOM) {
        // Red cute Mario mushroom
        ctx.fillStyle = "#ef4444"; // cap red
        ctx.beginPath();
        ctx.arc(eX + 16, entity.y + 16, 14, Math.PI, 0, false);
        ctx.lineTo(eX + 30, entity.y + 24);
        ctx.lineTo(eX + 2, entity.y + 24);
        ctx.closePath();
        ctx.fill();

        // White spots on cap
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(eX + 10, entity.y + 10, 3, 0, Math.PI * 2);
        ctx.arc(eX + 22, entity.y + 12, 4, 0, Math.PI * 2);
        ctx.fill();

        // Body stem
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(eX + 10, entity.y + 22, 12, 10);
        // Small eyes
        ctx.fillStyle = "#000000";
        ctx.fillRect(eX + 12, entity.y + 24, 2, 4);
        ctx.fillRect(eX + 18, entity.y + 24, 2, 4);
      }

      // --- 3B. FIRE FLOWER ---
      else if (entity.type === EntityType.FIRE_FLOWER) {
        // Outer petals
        const pulse = (frameCountRef.current / 4) % 2;
        ctx.fillStyle = pulse === 0 ? "#f43f5e" : "#fb7185";
        ctx.beginPath();
        ctx.arc(eX + 16, entity.y + 12, 12, 0, Math.PI * 2);
        ctx.fill();

        // Inner white/yellow core
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(eX + 16, entity.y + 12, 8, 0, Math.PI * 2);
        ctx.fill();

        // Green leaf eyes
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(eX + 14, entity.y + 18, 4, 14);
        ctx.beginPath();
        ctx.arc(eX + 16, entity.y + 28, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 3C. STAR OF HERO ---
      else if (entity.type === EntityType.STAR) {
        // Flashing beautiful gold star star shape
        const hue = (frameCountRef.current * 10) % 360;
        ctx.fillStyle = `hsl(${hue}, 90%, 55%)`; // rainbow shine!
        
        ctx.beginPath();
        // Star points coordinates
        ctx.moveTo(eX + 16, entity.y + 2);
        ctx.lineTo(eX + 20, entity.y + 12);
        ctx.lineTo(eX + 30, entity.y + 12);
        ctx.lineTo(eX + 22, entity.y + 18);
        ctx.lineTo(eX + 26, entity.y + 28);
        ctx.lineTo(eX + 16, entity.y + 22);
        ctx.lineTo(eX + 6, entity.y + 28);
        ctx.lineTo(eX + 10, entity.y + 18);
        ctx.lineTo(eX + 2, entity.y + 12);
        ctx.lineTo(eX + 12, entity.y + 12);
        ctx.closePath();
        ctx.fill();

        // Star eyes
        ctx.fillStyle = "#000000";
        ctx.fillRect(eX + 13, entity.y + 13, 2, 4);
        ctx.fillRect(eX + 17, entity.y + 13, 2, 4);
      }

      // --- 3D. AMBIENT COLLECTIBLE COIN ---
      else if (entity.type === EntityType.COIN) {
        const spin = Math.abs(Math.sin(frameCountRef.current * 0.1));
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.ellipse(eX + 16, entity.y + 16, 12 * spin, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#ffffff"; // inner shine
        ctx.beginPath();
        ctx.ellipse(eX + 16, entity.y + 16, 4 * spin, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 3E. GOOMBA ENEMY ---
      else if (entity.type === EntityType.GOOMBA) {
        // Squished flatness
        if (entity.isKilled && entity.killedTimer && entity.killedTimer > 0) {
          ctx.fillStyle = "#7c2d12"; // flat brown mush
          ctx.fillRect(eX, entity.y + 24, 32, 8);
          // eyes
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(eX + 6, entity.y + 25, 4, 4);
          ctx.fillRect(eX + 22, entity.y + 25, 4, 4);
        } else {
          // Goomba Body (Brown mushroom shape)
          ctx.fillStyle = "#9a3412"; // dark orange brown cap
          ctx.beginPath();
          ctx.ellipse(eX + 16, entity.y + 12, 16, 12, 0, 0, Math.PI * 2);
          ctx.fill();

          // Angry Eyes & Eyebrows
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(eX + 6, entity.y + 8, 8, 8);
          ctx.fillRect(eX + 18, entity.y + 8, 8, 8);
          ctx.fillStyle = "#000000";
          ctx.fillRect(eX + 9, entity.y + 10, 3, 4);
          ctx.fillRect(eX + 20, entity.y + 10, 3, 4);

          // Diagonal black angry eyebrows
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(eX + 4, entity.y + 4);
          ctx.lineTo(eX + 13, entity.y + 9);
          ctx.moveTo(eX + 28, entity.y + 4);
          ctx.lineTo(eX + 19, entity.y + 9);
          ctx.stroke();

          // Body stem core
          ctx.fillStyle = "#fdba74";
          ctx.fillRect(eX + 8, entity.y + 20, 16, 8);

          // Moving black shoes
          const step = Math.floor(frameCountRef.current / 10) % 2;
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(eX + 4, entity.y + 28, 10, 4); // left foot
          ctx.fillRect(eX + 18, entity.y + 28, 10, 4); // right foot
        }
      }

      // --- 3F. KOOPA TURTLE ---
      else if (entity.type === EntityType.KOOPA) {
        // Green round turtle shell
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(eX + 16, entity.y + 14, 12, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#14532d";
        ctx.stroke();

        // Yellow body
        ctx.fillStyle = "#facc15";
        ctx.fillRect(eX + 10, entity.y + 14, 12, 14);

        // Cute yellow poke-out head with black eyes
        if (entity.facing === "left") {
          ctx.fillRect(eX + 4, entity.y + 6, 8, 10);
          ctx.fillStyle = "#000000";
          ctx.fillRect(eX + 6, entity.y + 8, 2, 4);
        } else {
          ctx.fillRect(eX + 20, entity.y + 6, 8, 10);
          ctx.fillStyle = "#000000";
          ctx.fillRect(eX + 24, entity.y + 8, 2, 4);
        }

        // Running little yellow feet
        ctx.fillStyle = "#eab308";
        ctx.fillRect(eX + 8, entity.y + 28, 6, 4);
        ctx.fillRect(eX + 18, entity.y + 28, 6, 4);
      }

      // --- 3G. KOOPA SHELL ---
      else if (entity.type === EntityType.SHELL) {
        // Just the rotating/bouncing green shell with white highlights
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(eX + 16, entity.y + 11, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        // shell rings
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.arc(eX + 16, entity.y + 11, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 3H. PIRANHA PLANT ---
      else if (entity.type === EntityType.PIRANHA_PLANT) {
        // Red angry head with white spots and big white open teeth!
        const bite = Math.floor(frameCountRef.current / 6) % 2;
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(eX + 16, entity.y + 16, 16, 0, Math.PI * 2);
        ctx.fill();

        // White spots
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(eX + 8, entity.y + 10, 3, 0, Math.PI * 2);
        ctx.arc(eX + 24, entity.y + 12, 4, 0, Math.PI * 2);
        ctx.arc(eX + 16, entity.y + 22, 3, 0, Math.PI * 2);
        ctx.fill();

        // Huge green stem
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(eX + 12, entity.y + 24, 8, 24);

        // Open biting jaws
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.fillStyle = "#000000"; // dark cavity
        if (bite === 0) {
          // Open jaw line
          ctx.beginPath();
          ctx.moveTo(eX + 4, entity.y + 14);
          ctx.lineTo(eX + 28, entity.y + 14);
          ctx.stroke();
        } else {
          // Wide open mouth box
          ctx.fillRect(eX + 6, entity.y + 10, 20, 8);
          // sharp triangle teeth
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(eX + 8, entity.y + 10);
          ctx.lineTo(eX + 11, entity.y + 14);
          ctx.lineTo(eX + 14, entity.y + 10);
          ctx.fill();
        }
      }

      // --- 3I. THE GRAND BOSS: BOWSER ---
      else if (entity.type === EntityType.BOWSER) {
        // Giant terrifying spike shell monster!
        ctx.fillStyle = "#15803d"; // hard heavy green spiky shell
        ctx.beginPath();
        ctx.arc(eX + 40, entity.y + 40, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f59e0b"; // golden border
        ctx.lineWidth = 4;
        ctx.stroke();

        // Spikes (small white triangles)
        ctx.fillStyle = "#ffffff";
        for (let s = 0; s < 5; s++) {
          const sy = entity.y + 15 + s * 13;
          ctx.beginPath();
          ctx.moveTo(eX + 25, sy);
          ctx.lineTo(eX + 15, sy + 5);
          ctx.lineTo(eX + 25, sy + 10);
          ctx.fill();
        }

        // Orange dragon body
        ctx.fillStyle = "#d97706";
        ctx.fillRect(eX + 38, entity.y + 25, 30, 48);

        // Red Hair & Angry yellow eyebrows
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(eX + 50, entity.y + 2, 25, 25);

        // Huge scowling yellow head
        ctx.fillStyle = "#ea580c";
        ctx.fillRect(eX + 55, entity.y + 18, 22, 22);

        // Snarling white teeth
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(eX + 65, entity.y + 30, 12, 6);

        // Dangerous claws
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(eX + 68, entity.y + 65, 8, 8);
      }

      // --- 3J. PROJECTILE / FIREBALL ---
      else if (entity.type === EntityType.FIREBALL) {
        const bouncePulse = (frameCountRef.current * 20) % 360;
        ctx.fillStyle = `hsl(${bouncePulse}, 95%, 50%)`; // Orange fireball
        ctx.beginPath();
        ctx.arc(eX + 6, entity.y + 6, 6, 0, Math.PI * 2);
        ctx.fill();

        // flame tail
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(eX + (entity.facing === "right" ? -4 : 12), entity.y + 6, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 3K. BOWSER FIREBALL (LARGE WAVY) ---
      else if (entity.type === EntityType.BOWSER_FIRE) {
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.ellipse(eX + 12, entity.y + 9, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hot burning yellow center
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.ellipse(eX + 12, entity.y + 9, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flame sparks trailing
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(eX + (entity.facing === "right" ? -12 : 24), entity.y + 6, 6, 6);
      }
    });

    // --- 4. PLAYER (MAYC) DRAWING ENGINE ---
    if (player.hurtCooldown === 0 || Math.floor(frameCountRef.current / 4) % 2 === 0) {
      const pX = player.x - camX;
      
      // Compute bounding draw box
      const pY = player.y;

      // Invulnerable rainbow Star effect blinking colors
      const starActive = player.starTimer > 0;
      // Determine skin custom colors
      let capShirtColor = "#dc2626"; // default classic red
      let overallsColor = "#15803d"; // default classic green overalls

      if (selectedSkin === "bieber") {
        capShirtColor = player.powerState === PowerState.FIRE ? "#ffffff" : "#fbbf24"; // golden cap
        overallsColor = "#7e22ce"; // purple overalls
      } else if (selectedSkin === "fire") {
        capShirtColor = "#ffffff"; // white cap/shirt
        overallsColor = "#dc2626"; // red overalls
      } else if (selectedSkin === "shadow") {
        capShirtColor = player.powerState === PowerState.FIRE ? "#ef4444" : "#1e293b"; // dark slate cap
        overallsColor = "#22c55e"; // neon green overalls
      } else {
        // classic
        capShirtColor = player.powerState === PowerState.FIRE ? "#ffffff" : "#dc2626";
        overallsColor = "#15803d";
      }

      const shadowColor = starActive
        ? `hsl(${(frameCountRef.current * 15) % 360}, 100%, 65%)`
        : (player.powerState === PowerState.FIRE ? "#ef4444" : (selectedSkin === "bieber" ? "#fbbf24" : (selectedSkin === "shadow" ? "#22c55e" : "#2563eb")));

      // Draw shadow trail if star is pulsing
      if (starActive && frameCountRef.current % 3 === 0) {
        particles.push({
          id: `shadow-trail-${frameCountRef.current}`,
          x: player.x,
          y: player.y,
          vx: 0,
          vy: 0,
          color: shadowColor,
          size: player.height === 48 ? 16 : 12,
          alpha: 0.5,
          decay: 0.05
        });
      }

      // Add custom trails when player is running/walking
      if (player.isWalking && player.grounded && frameCountRef.current % 5 === 0) {
        let trailColor = "rgba(255, 255, 255, 0.4)";
        let trailSize = 3;
        if (selectedSkin === "bieber") {
          trailColor = `rgba(250, 204, 21, ${0.4 + Math.random() * 0.4})`; // Golden sparks!
          trailSize = 4;
        } else if (selectedSkin === "fire") {
          trailColor = `rgba(239, 68, 68, ${0.4 + Math.random() * 0.4})`; // Fire sparks!
          trailSize = 4;
        } else if (selectedSkin === "shadow") {
          trailColor = `rgba(34, 197, 94, ${0.4 + Math.random() * 0.4})`; // Neon green sparks!
          trailSize = 3.5;
        }
        particles.push({
          id: `skin-trail-${frameCountRef.current}`,
          x: player.facing === "right" ? player.x - 2 : player.x + player.width + 2,
          y: player.y + player.height - 6,
          vx: (player.facing === "right" ? -1 : 1) * (1 + Math.random() * 1.5),
          vy: -Math.random() * 0.5,
          color: trailColor,
          size: trailSize,
          alpha: 0.8,
          decay: 0.08
        });
      }

      // CAP / HAT (Red signature custom cap)
      ctx.fillStyle = capShirtColor;
      ctx.fillRect(pX + 2, pY, player.width - 4, 6);
      // cap brim visor
      ctx.fillRect(pX + (player.facing === "right" ? 6 : -4), pY + 2, player.width - 2, 3);

      // CUTE RETRO HEAD (Beige tone skin)
      ctx.fillStyle = "#ffedd5";
      ctx.fillRect(pX + 4, pY + 6, player.width - 8, 10);

      // SIGNATURE MOUSTACHE & EYE
      ctx.fillStyle = "#292524"; // Charcoal dark
      if (player.facing === "right") {
        ctx.fillRect(pX + player.width - 8, pY + 11, 6, 3); // moustache
        ctx.fillRect(pX + player.width - 10, pY + 8, 2.5, 4); // eye
      } else {
        ctx.fillRect(pX + 2, pY + 11, 6, 3); // moustache
        ctx.fillRect(pX + 7, pY + 8, 2.5, 4); // eye
      }

      // RETRO SHIRT (Red)
      ctx.fillStyle = capShirtColor;
      ctx.fillRect(pX + 4, pY + 16, player.width - 8, player.height - 24);

      // OVERALLS (Mayc Signature Green Overalls!)
      ctx.fillStyle = overallsColor;
      ctx.fillRect(pX + 3, pY + 20, player.width - 6, player.height - 24);
      // straps
      ctx.fillRect(pX + 4, pY + 16, 3, 5);
      ctx.fillRect(pX + player.width - 7, pY + 16, 3, 5);

      // RUNNING Animation foot swings
      const walkCycle = Math.floor(player.walkFrame) % 3;
      ctx.fillStyle = "#78350f"; // brown boots
      if (!player.grounded) {
        // Jumping pose (arms up and feet dangling!)
        ctx.fillRect(pX + 1, pY + player.height - 6, 7, 6);
        ctx.fillRect(pX + player.width - 8, pY + player.height - 6, 7, 6);
      } else if (player.isWalking) {
        if (walkCycle === 0) {
          ctx.fillRect(pX - 1, pY + player.height - 4, 8, 4);
          ctx.fillRect(pX + player.width - 6, pY + player.height - 4, 7, 4);
        } else if (walkCycle === 1) {
          ctx.fillRect(pX + 1, pY + player.height - 4, 6, 4);
          ctx.fillRect(pX + player.width - 4, pY + player.height - 4, 8, 4);
        } else {
          ctx.fillRect(pX + 2, pY + player.height - 4, 7, 4);
          ctx.fillRect(pX + player.width - 9, pY + player.height - 4, 7, 4);
        }
      } else {
        // standing flat
        ctx.fillRect(pX + 2, pY + player.height - 4, 8, 4);
        ctx.fillRect(pX + player.width - 10, pY + player.height - 4, 8, 4);
      }
    }

    // --- 5. PARTICLES RENDER ---
    particles.forEach((part) => {
      ctx.fillStyle = part.color;
      ctx.globalAlpha = part.alpha;
      ctx.fillRect(part.x - camX, part.y, part.size, part.size);
    });
    ctx.globalAlpha = 1.0; // reset
  };

  return (
    <div className={`flex flex-col w-full h-full ${isMobileDevice ? "justify-center" : "justify-between"} items-center bg-black relative overflow-hidden`} id="canvasFrame">
      
      {/* BOSS HEALTH BAR */}
      {bossHealth !== null && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-96 max-w-sm bg-black/80 p-3 rounded-lg border-2 border-red-500 shadow-lg flex flex-col justify-center items-center gap-1 z-50 animate-pulse">
          <div className="text-red-500 font-bold font-mono text-xs flex items-center gap-1">
            👹 CHEFE: BOWSER DO MAL ({bossHealth} HP)
          </div>
          <div className="w-full h-4 bg-slate-800 rounded overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-linear-to-r from-orange-600 to-red-500 transition-all duration-150"
              style={{ width: `${Math.max(0, (bossHealth / 120) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* CANVAS VIEWPORT */}
      <div className="relative w-full h-full flex justify-center items-center bg-black overflow-hidden">
        <canvas
          ref={canvasRef}
          width={VIEWPORT_WIDTH}
          height={VIEWPORT_HEIGHT}
          className="w-full h-full block brightness-105"
          style={{
            objectFit: "contain",
            imageRendering: "pixelated"
          }}
        />
      </div>

      {/* FOOTER GAMEPLAY CONTROL PANELS (MUTE, PAUSE, TIPS) */}
      {!isMobileDevice && (
        <div className="w-full bg-slate-800 border-t-2 border-slate-700 flex justify-between items-center px-6 py-3 shrink-0 gap-4">
          
          {/* Keys Cue */}
          <div className="hidden md:flex items-center gap-3 text-slate-300 text-xs font-mono">
            <span className="bg-slate-700 text-white px-2 py-1 rounded select-none">A/S/D/W</span>
            <span>ou</span>
            <span className="bg-slate-700 text-white px-2 py-1 rounded select-none">←/↓/→/↑</span>
            <span>Andar/Pular/Abaixar</span>
            <span className="text-emerald-400">|</span>
            <span className="bg-orange-600 text-white px-2 py-1 rounded select-none">E</span>
            <span>Atacar (Gasta 5🪙 sem Flor/Grátis com 🌹)</span>
          </div>

          {/* Buttons Controls Panels */}
          <div className="flex items-center gap-2">
            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
              title="Ativar/Desativar Música"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>

            {/* Level restart */}
            <button
              onClick={handleLevelRestart}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
              title="Reiniciar Servidor / Fase"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
