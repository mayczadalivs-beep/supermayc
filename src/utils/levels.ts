import { LevelConfig, TileType, TileType as TT, GameTile, GameEntity, EntityType } from "../types";

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Mundo 1-1: Jardim do Mayc",
    theme: "grass",
    width: 150, // 150 grid units wide
    height: 15, // 15 grid units high
    skyColor: "#87CEEB", // Classic Sky Blue
    groundColor: "#4ade80", // Sunny Green
    brickColor: "#b45309", // Warm Orange Brick
    gravity: 0.5,
    musicTempo: 130
  },
  {
    id: 2,
    name: "Mundo 1-2: Subterrâneo Escuro",
    theme: "underground",
    width: 160,
    height: 15,
    skyColor: "#0f172a", // Obsidian dark sky
    groundColor: "#64748b", // Slate stones
    brickColor: "#312e81", // Deep Indigo Rock
    gravity: 0.52,
    musicTempo: 110
  },
  {
    id: 3,
    name: "Mundo 1-3: Fortaleza do Bowser",
    theme: "castle",
    width: 180,
    height: 15,
    skyColor: "#111827", // Dark volcanic atmosphere
    groundColor: "#475569", // Dark grey iron cast brick
    brickColor: "#991b1b", // Hard Blood Red fireproof bricks
    gravity: 0.53,
    musicTempo: 140
  }
];

export function generateLevelData(
  level: LevelConfig
): { tiles: GameTile[]; entities: GameEntity[] } {
  const tiles: GameTile[] = [];
  const entities: GameEntity[] = [];
  const TILE_SIZE = 32;

  let idCounter = 1;

  // Level grid bounds
  const cols = level.width;
  const rows = level.height;

  // Helper to add entity
  const addEnemy = (type: EntityType, col: number, rowRow: number, health = 1) => {
    entities.push({
      id: `${type}-${idCounter++}`,
      type,
      x: col * TILE_SIZE,
      y: (rows - rowRow - 1) * TILE_SIZE,
      vx: type === EntityType.SHELL ? 0 : -1.2,
      vy: 0,
      width: type === EntityType.BOWSER ? 80 : 32,
      height: type === EntityType.BOWSER ? 80 : (type === EntityType.PIRANHA_PLANT ? 48 : 32),
      facing: "left",
      health,
      maxHealth: health
    });
  };

  // Build Layout column by column
  for (let c = 0; c < cols; c++) {
    // Determine pit falls depending on level to create exciting platformer hurdles
    let isPit = false;
    if (level.theme === "grass") {
      // Small pits at col 40-42, 70-71, 95-97
      if ((c >= 45 && c <= 47) || (c >= 82 && c <= 84) || (c >= 115 && c <= 117)) {
        isPit = true;
      }
    } else if (level.theme === "underground") {
      // More risky platforming
      if ((c >= 30 && c <= 33) || (c >= 60 && c <= 64) || (c >= 90 && c <= 94) || (c >= 120 && c <= 123)) {
        isPit = true;
      }
    } else if (level.theme === "castle") {
      // Intense lava pits almost everywhere
      if (
        (c >= 25 && c <= 28) || 
        (c >= 45 && c <= 48) || 
        (c >= 70 && c <= 75) || 
        (c >= 95 && c <= 100) || 
        (c >= 120 && c <= 125) ||
        (c >= 145 && c <= 152)
      ) {
        isPit = true;
      }
    }

    // Flagpole is near the end (cols - 10)
    const isFlagArea = c === cols - 11;
    const isCastleArea = c >= cols - 8;

    // Draw Ground
    if (!isPit) {
      if (isCastleArea) {
        // Draw elegant castle floor
        tiles.push({ x: c, y: rows - 1, type: TileType.CASTLE_BRICK, solid: true });
        tiles.push({ x: c, y: rows - 2, type: TileType.CASTLE_BRICK, solid: true });
      } else {
        tiles.push({ x: c, y: rows - 1, type: TileType.GROUND, solid: true });
        tiles.push({ x: c, y: rows - 2, type: TileType.GROUND, solid: true });
      }
    } else {
      // In Castles, pits are FILLED WITH LAVA!
      if (level.theme === "castle") {
        tiles.push({ x: c, y: rows - 1, type: TileType.LAVA, solid: false });
        tiles.push({ x: c, y: rows - 2, type: TileType.LAVA, solid: false });
      }
    }

    // --- LEVEL 1: GRASSLAND DESIGN ---
    if (level.theme === "grass") {
      // Starting blocks
      if (c === 8) {
        tiles.push({ x: c, y: rows - 5, type: TileType.MYSTERY_COIN, solid: true });
      }
      if (c === 12 || c === 14 || c === 16) {
        tiles.push({ x: c, y: rows - 5, type: c === 14 ? TileType.MYSTERY_MUSHROOM : TileType.BRICK, solid: true, isOriginalBrick: c !== 14 });
      }
      // Floating blocks near col 20-25
      if (c >= 22 && c <= 26) {
        if (c === 24) {
          tiles.push({ x: c, y: rows - 9, type: TileType.MYSTERY_FLOWER, solid: true });
        } else {
          tiles.push({ x: c, y: rows - 9, type: TileType.BRICK, solid: true, isOriginalBrick: true });
        }
      }

      // Small Green Pipe
      if (c === 32) {
        tiles.push({ x: c, y: rows - 3, type: TileType.PIPE_TOP_LEFT, solid: true });
        tiles.push({ x: c + 1, y: rows - 3, type: TileType.PIPE_TOP_RIGHT, solid: true });
        tiles.push({ x: c, y: rows - 4, type: TileType.PIPE_TOP_LEFT, solid: true }); // top
        tiles.push({ x: c + 1, y: rows - 4, type: TileType.PIPE_TOP_RIGHT, solid: true });
      }
      if (c === 32 || c === 33) {
        tiles.push({ x: c, y: rows - 3, type: TileType.PIPE_BODY_LEFT, solid: true });
      }
      if (c === 33) {
        // Add a piranha plant
        addEnemy(EntityType.PIRANHA_PLANT, 32.5, 3);
      }

      // Goomba on the ground
      if (c === 15 || c === 28 || c === 52) {
        addEnemy(EntityType.GOOMBA, c, 2);
      }
      if (c === 60) {
        addEnemy(EntityType.KOOPA, c, 2);
      }

      // Medium Pipe
      if (c === 55) {
        tiles.push({ x: c, y: rows - 3, type: TileType.PIPE_BODY_LEFT, solid: true });
        tiles.push({ x: c + 1, y: rows - 3, type: TileType.PIPE_BODY_RIGHT, solid: true });
        tiles.push({ x: c, y: rows - 4, type: TileType.PIPE_BODY_LEFT, solid: true });
        tiles.push({ x: c + 1, y: rows - 4, type: TileType.PIPE_BODY_RIGHT, solid: true });
        tiles.push({ x: c, y: rows - 5, type: TileType.PIPE_TOP_LEFT, solid: true });
        tiles.push({ x: c + 1, y: rows - 5, type: TileType.PIPE_TOP_RIGHT, solid: true });
        addEnemy(EntityType.PIRANHA_PLANT, 55.5, 4);
      }

      // Stair pyramid at 65-70
      if (c >= 64 && c <= 68) {
        const height = c - 63; // 1 to 5
        for (let h = 1; h <= height; h++) {
          tiles.push({ x: c, y: rows - 2 - h, type: TileType.SOLID_BLOCK, solid: true });
        }
      }
      if (c >= 69 && c <= 72) {
        const height = 73 - c; // 4 to 1
        for (let h = 1; h <= height; h++) {
          tiles.push({ x: c, y: rows - 2 - h, type: TileType.SOLID_BLOCK, solid: true });
        }
      }

      // Blocks above pit
      if (c === 81 || c === 85) {
        tiles.push({ x: c, y: rows - 6, type: TileType.MYSTERY_COIN, solid: true });
      }

      // High mystery block with STAR invincibility!
      if (c === 90) {
        tiles.push({ x: c, y: rows - 10, type: TileType.MYSTERY_STAR, solid: true });
        addEnemy(EntityType.GOOMBA, c - 2, 2);
        addEnemy(EntityType.GOOMBA, c + 2, 2);
        addEnemy(EntityType.GOOMBA, c + 3, 2);
      }

      // Massive coin cache block row
      if (c >= 100 && c <= 108) {
        if (c % 2 === 0) {
          tiles.push({ x: c, y: rows - 6, type: TileType.MYSTERY_COIN, solid: true });
        } else {
          tiles.push({ x: c, y: rows - 6, type: TileType.BRICK, solid: true, isOriginalBrick: true });
        }
      }

      // Ending flagpole staircase
      if (c >= 128 && c <= 135) {
        const height = c - 127;
        for (let h = 1; h <= height; h++) {
          tiles.push({ x: c, y: rows - 2 - h, type: TileType.SOLID_BLOCK, solid: true });
        }
      }
    }

    // --- LEVEL 2: UNDERGROUND DESIGN ---
    if (level.theme === "underground") {
      // Dark rock pillars on top
      if (c % 12 === 0 && c > 5 && c < cols - 20) {
        // Ceiling stalactites
        tiles.push({ x: c, y: 0, type: TileType.BRICK, solid: true, isOriginalBrick: true });
        tiles.push({ x: c, y: 1, type: TileType.BRICK, solid: true, isOriginalBrick: true });
        tiles.push({ x: c, y: 2, type: TileType.BRICK, solid: true, isOriginalBrick: true });
      }

      // Floating puzzle bricks
      if (c === 10 || c === 12 || c === 14) {
        tiles.push({ x: c, y: rows - 5, type: c === 12 ? TileType.MYSTERY_MUSHROOM : TileType.BRICK, solid: true, isOriginalBrick: c !== 12 });
      }

      // Goombas & Koopas
      if (c === 16 || c === 24 || c === 48 || c === 72 || c === 96) {
        addEnemy(EntityType.GOOMBA, c, 2);
        addEnemy(EntityType.KOOPA, c + 2, 2);
      }

      // Wide pipe obstacle
      if (c === 35) {
        tiles.push({ x: c, y: rows - 3, type: TileType.PIPE_BODY_LEFT, solid: true });
        tiles.push({ x: c + 1, y: rows - 3, type: TileType.PIPE_BODY_RIGHT, solid: true });
        tiles.push({ x: c, y: rows - 4, type: TileType.PIPE_BODY_LEFT, solid: true });
        tiles.push({ x: c + 1, y: rows - 4, type: TileType.PIPE_BODY_RIGHT, solid: true });
        tiles.push({ x: c, y: rows - 5, type: TileType.PIPE_TOP_LEFT, solid: true });
        tiles.push({ x: c + 1, y: rows - 5, type: TileType.PIPE_TOP_RIGHT, solid: true });
        addEnemy(EntityType.PIRANHA_PLANT, 35.5, 4);
      }

      // Star block in a risky cavern
      if (c === 52) {
        tiles.push({ x: c, y: rows - 8, type: TileType.MYSTERY_STAR, solid: true });
      }

      // Brick platforms suspending over pits
      if (c >= 58 && c <= 66) {
        if (c % 2 === 0) {
          tiles.push({ x: c, y: rows - 6, type: TileType.BRICK, solid: true, isOriginalBrick: true });
        }
      }

      // Hidden coin vault
      if (c >= 78 && c <= 85) {
        tiles.push({ x: c, y: rows - 10, type: TileType.BRICK, solid: true, isOriginalBrick: true });
        // Place coins below
        addEnemy(EntityType.COIN, c, 5);
      }

      // Stairway
      if (c >= 105 && c <= 110) {
        const h = c - 104;
        for (let y = 1; y <= h; y++) {
          tiles.push({ x: c, y: rows - 2 - y, type: TileType.SOLID_BLOCK, solid: true });
        }
      }
      if (c >= 111 && c <= 114) {
        const h = 115 - c;
        for (let y = 1; y <= h; y++) {
          tiles.push({ x: c, y: rows - 2 - y, type: TileType.SOLID_BLOCK, solid: true });
        }
      }
    }

    // --- LEVEL 3: BOWSER CASTLE DESIGN ---
    if (level.theme === "castle") {
      // Lava sparks and fireballs
      if (c % 15 === 0 && c > 10 && c < dColsToBowser(cols)) {
        // We'll spawn flying flame particles dynamically in the engine, but let's place enemies too
        addEnemy(EntityType.GOOMBA, c, 2);
      }

      // Sturdy Castle Bricks
      if (c === 8 || c === 10 || c === 12) {
        tiles.push({ x: c, y: rows - 5, type: TileType.CASTLE_BRICK, solid: true });
        if (c === 10) {
          tiles.push({ x: c, y: rows - 5, type: TileType.MYSTERY_FLOWER, solid: true });
        }
      }

      // Floating Castle Blocks requiring high jumps
      if (c >= 18 && c <= 22) {
        tiles.push({ x: c, y: rows - 7, type: TileType.CASTLE_BRICK, solid: true });
      }

      // Safe ground between lava lakes with powerups
      if (c === 35) {
        tiles.push({ x: c, y: rows - 5, type: TileType.MYSTERY_MUSHROOM, solid: true });
      }
      if (c === 39) {
        tiles.push({ x: c, y: rows - 5, type: TileType.MYSTERY_STAR, solid: true });
      }

      // Extreme platform columns
      if (c === 52 || c === 57 || c === 62) {
        tiles.push({ x: c, y: rows - 3, type: TileType.SOLID_BLOCK, solid: true });
        tiles.push({ x: c, y: rows - 4, type: TileType.SOLID_BLOCK, solid: true });
      }

      // Pipes with Piranha plants spitting fire
      if (c === 82) {
        tiles.push({ x: c, y: rows - 3, type: TileType.PIPE_BODY_LEFT, solid: true });
        tiles.push({ x: c + 1, y: rows - 3, type: TileType.PIPE_BODY_RIGHT, solid: true });
        tiles.push({ x: c, y: rows - 4, type: TileType.PIPE_TOP_LEFT, solid: true });
        tiles.push({ x: c + 1, y: rows - 4, type: TileType.PIPE_TOP_RIGHT, solid: true });
        addEnemy(EntityType.PIRANHA_PLANT, 82.5, 3);
      }

      // Iron castle walls
      if (c === 110) {
        // High pillar
        for (let y = 1; y <= 6; y++) {
          tiles.push({ x: c, y: rows - 2 - y, type: TileType.SOLID_BLOCK, solid: true });
        }
      }

      // --- THE BOSS: BOWSER'S LAIR ---
      // Bowser starts around cell 150-160
      if (c === 140) {
        // Place the epic Bowser boss! He has high health (e.g. 5 lives/hits or 100 HP)
        const bowserCol = 145;
        // Boss spawn
        entities.push({
          id: `bowser-boss`,
          type: EntityType.BOWSER,
          x: bowserCol * TILE_SIZE,
          y: (rows - 6) * TILE_SIZE, // elevated or on the solid platform
          vx: -0.8,
          vy: 0,
          width: 80,
          height: 80,
          facing: "left",
          health: 120, // 120 HP!
          maxHealth: 120,
          behaviorState: 0, // patrol & shoot
          stateTimer: 0
        });

        // Lava pit under Bowser, with a solid bridge of Breakable Castle Bricks!
        // This resembles original Mario where you can smash the bridge!
      }

      // The Bridge for Bowser Arena (cols 142 to 154)
      if (c >= 142 && c <= 156) {
        // Replace ground with thin solid bricks simulating the bridge
        const tileIdx1 = tiles.findIndex(t => t.x === c && t.y === rows - 1);
        if (tileIdx1 !== -1) tiles.splice(tileIdx1, 1);
        const tileIdx2 = tiles.findIndex(t => t.x === c && t.y === rows - 2);
        if (tileIdx2 !== -1) tiles.splice(tileIdx2, 1);

        tiles.push({ x: c, y: rows - 3, type: TileType.BRICK, solid: true }); // thin bridge
        // Beneath the bridge is burning lava!
        tiles.push({ x: c, y: rows - 2, type: TileType.LAVA, solid: false });
        tiles.push({ x: c, y: rows - 1, type: TileType.LAVA, solid: false });
      }

      // Place Princess Peach's Cage or Victory Lock block behind the bridge
      if (c === 160) {
        tiles.push({ x: c, y: rows - 3, type: TileType.SOLID_BLOCK, solid: true });
        tiles.push({ x: c, y: rows - 4, type: TileType.SOLID_BLOCK, solid: true });
        tiles.push({ x: c, y: rows - 5, type: TileType.SOLID_BLOCK, solid: true });
      }
    }

    // --- FINISH LINE FLAGPOLE & CASTLE (Common for all levels) ---
    // Beautiful Flagpole structure at cols - 11
    if (isFlagArea) {
      // Bottom solid flag base
      tiles.push({ x: c, y: rows - 3, type: TileType.SOLID_BLOCK, solid: true });
      // Flag shaft going high up
      for (let sy = 4; sy <= 12; sy++) {
        tiles.push({ x: c, y: rows - sy, type: sy === 12 ? TileType.FLAGPOLE_TOP : TileType.FLAGPOLE_SHAFT, solid: false });
      }
    }

    // Gorgeous Ending Castle at the very end
    if (isCastleArea) {
      // Draw a brick castle facade
      for (let cy = 3; cy <= 7; cy++) {
        tiles.push({ x: c, y: rows - cy, type: TileType.CASTLE_BRICK, solid: true });
      }
      // Leave a door
      if (c === cols - 5) {
        // Castle door tile
        tiles.push({ x: c, y: rows - 3, type: TileType.CASTLE_DOOR, solid: false });
        tiles.push({ x: c, y: rows - 4, type: TileType.CASTLE_DOOR, solid: false });
      }
    }
  }

  // Populate floating collectibles (ambient coins) in empty slots where there are no solids
  for (let c = 15; c < cols - 20; c++) {
    // Avoid putting coins close to major platforms, distribute beautifully
    if (c % 7 === 0 && level.theme !== "castle") {
      const cy = level.theme === "underground" ? rows - 6 : rows - 5;
      const coinAlreadyExists = tiles.some(t => t.x === c && t.y === cy);
      if (!coinAlreadyExists) {
        entities.push({
          id: `coin-air-${c}`,
          type: EntityType.COIN,
          x: c * TILE_SIZE + 6,
          y: cy * TILE_SIZE + 6,
          vx: 0,
          vy: 0,
          width: 20,
          height: 20,
          facing: "left"
        });
      }
    }
  }

  return { tiles, entities };
}

function dColsToBowser(totalCols: number) {
  return totalCols - 35;
}
