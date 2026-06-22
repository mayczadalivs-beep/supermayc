export enum PowerState {
  NORMAL = "NORMAL",
  SUPER = "SUPER",
  FIRE = "FIRE"
}

export enum GameState {
  START_SCREEN = "START_SCREEN",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  GAME_OVER = "GAME_OVER",
  VICTORY = "VICTORY"
}

export enum EntityType {
  GOOMBA = "GOOMBA",
  KOOPA = "KOOPA",
  SHELL = "SHELL",
  PIRANHA_PLANT = "PIRANHA_PLANT",
  BOWSER = "BOWSER",
  FIRE_FLOWER = "FIRE_FLOWER",
  MUSHROOM = "MUSHROOM",
  STAR = "STAR",
  COIN = "COIN",
  FIREBALL = "FIREBALL",
  BOWSER_FIRE = "BOWSER_FIRE"
}

export enum TileType {
  GROUND = "GROUND",
  BRICK = "BRICK",
  BRICK_EMPTY = "BRICK_EMPTY",
  MYSTERY_MUSHROOM = "MYSTERY_MUSHROOM",
  MYSTERY_FLOWER = "MYSTERY_FLOWER",
  MYSTERY_STAR = "MYSTERY_STAR",
  MYSTERY_COIN = "MYSTERY_COIN",
  SOLID_BLOCK = "SOLID_BLOCK",
  PIPE_TOP_LEFT = "PIPE_TOP_LEFT",
  PIPE_TOP_RIGHT = "PIPE_TOP_RIGHT",
  PIPE_BODY_LEFT = "PIPE_BODY_LEFT",
  PIPE_BODY_RIGHT = "PIPE_BODY_RIGHT",
  FLAGPOLE_TOP = "FLAGPOLE_TOP",
  FLAGPOLE_SHAFT = "FLAGPOLE_SHAFT",
  CASTLE_BRICK = "CASTLE_BRICK",
  CASTLE_DOOR = "CASTLE_DOOR",
  LAVA = "LAVA"
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
  powerState: PowerState;
  starTimer: number; // Star invincible time in frames (0 = normal)
  hurtCooldown: number; // Invulnerable state after hit
  facing: "left" | "right";
  isCrouching: boolean;
  isWalking: boolean;
  walkFrame: number;
}

export interface GameEntity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: "left" | "right";
  health?: number;
  maxHealth?: number;
  isKilled?: boolean;
  killedTimer?: number;
  stateTimer?: number; // Used for plants pop up etc
  behaviorState?: number;
  color?: string;
}

export interface GameTile {
  x: number; // Grid x
  y: number; // Grid y
  type: TileType;
  solid: boolean;
  hasCoin?: boolean;
  hitTimer?: number; // Animation when bumped from below
  hitOffset?: number;
  isOriginalBrick?: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity?: boolean;
}

export interface LevelConfig {
  id: number;
  name: string;
  theme: "grass" | "underground" | "sky" | "castle";
  width: number; // Level grid width in tiles
  height: number; // Level grid height in tiles
  skyColor: string;
  groundColor: string;
  brickColor: string;
  gravity: number;
  musicTempo: number;
}
