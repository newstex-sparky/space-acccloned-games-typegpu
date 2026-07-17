import type { Tile, TileType, Vec2, Season, OreType, PlacedBuilding, BuildingType, HouseFurnitureType } from './types';
import { CROPS, BUILDINGS } from './items';

export const WORLD_W = 48;
export const WORLD_H = 48;
export const TILE_SIZE = 32;

const FARM_AREA = { x: 8, y: 8, w: 16, h: 16 };

// House position on the overworld map (must match generateWorld)
export const HOUSE_POS = { x: 10, y: 4 };

export class World {
  tiles: Tile[][];
  width: number;
  height: number;

  // Mine level
  mineLevel = 0;
  mineTiles: Tile[][] | null = null;
  mineW = 24;
  mineH = 24;

  // House interior
  houseLevel = 0;
  houseTiles: Tile[][] | null = null;
  houseW = 14;
  houseH = 12;

  // Player position inside the house, restored on exit
  houseExitPos: Vec2 = { x: HOUSE_POS.x, y: HOUSE_POS.y + 1 };

  // Placed buildings on the overworld
  buildings: PlacedBuilding[] = [];

  // Forage spawn tracking
  forageSpawned: Vec2[] = [];

  constructor() {
    this.width = WORLD_W;
    this.height = WORLD_H;
    this.tiles = this.generateWorld();
    this.spawnForage(8);
  }

  private generateWorld(): Tile[][] {
    const tiles: Tile[][] = [];
    for (let y = 0; y < this.height; y++) {
      tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        tiles[y][x] = this.makeTile('grass');
      }
    }

    // Outer walls
    for (let x = 0; x < this.width; x++) {
      tiles[0][x] = this.makeTile('wall');
      tiles[this.height - 1][x] = this.makeTile('wall');
    }
    for (let y = 0; y < this.height; y++) {
      tiles[y][0] = this.makeTile('wall');
      tiles[y][this.width - 1] = this.makeTile('wall');
    }

    // Lake area (water)
    const lake = { x: 32, y: 20, w: 10, h: 8 };
    for (let y = lake.y; y < lake.y + lake.h; y++) {
      for (let x = lake.x; x < lake.x + lake.w; x++) {
        // Make it organic
        const cx = lake.x + lake.w / 2;
        const cy = lake.y + lake.h / 2;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist < lake.w / 2 + 0.5) {
          tiles[y][x] = this.makeTile('water');
        }
      }
    }

    // Paths
    for (let x = 2; x < this.width - 2; x++) {
      tiles[24][x] = this.makeTile('path');
    }
    for (let y = 2; y < this.height - 2; y++) {
      tiles[y][24] = this.makeTile('path');
    }

    // Rock formations
    const rocks: Vec2[] = [
      { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 4 },
      { x: 44, y: 40 }, { x: 45, y: 40 }, { x: 44, y: 41 }, { x: 45, y: 41 },
      { x: 40, y: 3 }, { x: 41, y: 3 }, { x: 42, y: 3 },
    ];
    for (const r of rocks) {
      if (r.y < this.height && r.x < this.width) {
        tiles[r.y][r.x] = this.makeTile('rock');
      }
    }

    // Farm area floor
    for (let y = FARM_AREA.y; y < FARM_AREA.y + FARM_AREA.h; y++) {
      for (let x = FARM_AREA.x; x < FARM_AREA.x + FARM_AREA.w; x++) {
        if (tiles[y][x].type === 'grass') {
          tiles[y][x] = this.makeTile('floor');
        }
      }
    }

    // Mine entrance (a special rock tile)
    const mineEntrance = { x: 44, y: 44 };
    if (mineEntrance.y < this.height && mineEntrance.x < this.width) {
      tiles[mineEntrance.y][mineEntrance.x] = this.makeTile('rock');
      tiles[mineEntrance.y][mineEntrance.x].decorationId = 'mine_entrance';
    }

    // Shop building
    const shopPos = { x: 36, y: 6 };
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        tiles[shopPos.y + dy][shopPos.x + dx] = this.makeTile('floor');
        tiles[shopPos.y + dy][shopPos.x + dx].decorationId = dy === 0 && dx === 0 ? 'shop' : null;
        tiles[shopPos.y + dy][shopPos.x + dx].occupied = true;
      }
    }

    // House
    const housePos = { x: 10, y: 4 };
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        tiles[housePos.y + dy][housePos.x + dx] = this.makeTile('floor');
        tiles[housePos.y + dy][housePos.x + dx].decorationId = dy === 0 && dx === 0 ? 'house' : null;
        tiles[housePos.y + dy][housePos.x + dx].occupied = true;
      }
    }

    return tiles;
  }

  private makeTile(type: TileType): Tile {
    return {
      type,
      watered: false,
      occupied: type === 'wall' || type === 'water' || type === 'rock',
      crop: null,
      forageId: null,
      decorationId: null,
      oreType: null,
      oreAmount: 0,
    };
  }

  getTile(x: number, y: number): Tile | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    return this.tiles[y][x];
  }

  isWalkable(x: number, y: number): boolean {
    // Use the currently active tile set (overworld / mine / house)
    let t: Tile | null;
    if (this.isInMine()) {
      t = this.getMineTile(x, y);
    } else if (this.isInHouse()) {
      t = this.getHouseTile(x, y);
    } else {
      t = this.getTile(x, y);
    }
    if (!t) return false;
    if (t.occupied) return false;
    if (t.type === 'water' || t.type === 'wall' || t.type === 'rock') return false;
    if (t.type === 'mine_rock') return false;
    if (t.type === 'building') return false;
    return true;
  }

  tillTile(x: number, y: number): boolean {
    const t = this.getTile(x, y);
    if (!t) return false;
    if (t.type === 'grass' || t.type === 'floor') {
      t.type = 'tilled';
      return true;
    }
    return false;
  }

  waterTile(x: number, y: number): boolean {
    const t = this.getTile(x, y);
    if (!t) return false;
    if (t.type === 'tilled' || t.type === 'crop') {
      t.watered = true;
      if (t.crop) t.crop.watered = true;
      return true;
    }
    return false;
  }

  plantCrop(x: number, y: number, cropId: string, season: Season): boolean {
    const t = this.getTile(x, y);
    if (!t) return false;
    if (t.type !== 'tilled') return false;
    // Check season compatibility via crop def
    const cropDef = CROPS[cropId];
    if (!cropDef) return false;
    if (!cropDef.seasons.includes(season)) return false;
    t.crop = {
      cropId,
      stage: 0,
      maxStage: cropDef.stages - 1,
      daysGrown: 0,
      watered: false,
      dead: false,
      harvestable: false,
    };
    t.type = 'crop';
    return true;
  }

  harvestCrop(x: number, y: number): string | null {
    const t = this.getTile(x, y);
    if (!t || !t.crop) return null;
    if (!t.crop.harvestable) return null;
    const cropId = t.crop.cropId;
    t.crop = null;
    t.type = 'tilled';
    return cropId;
  }

  isAdjacentToWater(x: number, y: number): boolean {
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dx, dy] of dirs) {
      const t = this.getTile(x + dx, y + dy);
      if (t && t.type === 'water') return true;
    }
    return false;
  }

  spawnForage(count: number): void {
    const forageItems = ['space_mushroom', 'star_fruit', 'moon_flower', 'comet_pearl'];
    let spawned = 0;
    let attempts = 0;
    while (spawned < count && attempts < 200) {
      attempts++;
      const x = 2 + Math.floor(Math.random() * (this.width - 4));
      const y = 2 + Math.floor(Math.random() * (this.height - 4));
      const t = this.getTile(x, y);
      if (t && t.type === 'grass' && !t.forageId && !t.occupied) {
        // Don't spawn on farm area
        if (x >= FARM_AREA.x && x < FARM_AREA.x + FARM_AREA.w && y >= FARM_AREA.y && y < FARM_AREA.y + FARM_AREA.h) continue;
        t.forageId = forageItems[Math.floor(Math.random() * forageItems.length)];
        this.forageSpawned.push({ x, y });
        spawned++;
      }
    }
  }

  collectForage(x: number, y: number): string | null {
    const t = this.getTile(x, y);
    if (!t || !t.forageId) return null;
    const id = t.forageId;
    t.forageId = null;
    // Remove from spawned list
    this.forageSpawned = this.forageSpawned.filter(f => f.x !== x || f.y !== y);
    return id;
  }

  placeDecoration(x: number, y: number, decorationId: string): boolean {
    const t = this.getTile(x, y);
    if (!t) return false;
    if (t.type === 'grass' || t.type === 'floor') {
      if (t.occupied) return false;
      t.decorationId = decorationId;
      t.occupied = true;
      return true;
    }
    return false;
  }

  // ============ Mining ============
  enterMine(): void {
    this.mineLevel = 1;
    this.mineTiles = this.generateMine();
  }

  exitMine(): void {
    this.mineLevel = 0;
    this.mineTiles = null;
  }

  private generateMine(): Tile[][] {
    const tiles: Tile[][] = [];
    for (let y = 0; y < this.mineH; y++) {
      tiles[y] = [];
      for (let x = 0; x < this.mineW; x++) {
        tiles[y][x] = this.makeTile('mine_floor');
      }
    }
    // Walls
    for (let x = 0; x < this.mineW; x++) {
      tiles[0][x] = this.makeTile('wall');
      tiles[this.mineH - 1][x] = this.makeTile('wall');
    }
    for (let y = 0; y < this.mineH; y++) {
      tiles[y][0] = this.makeTile('wall');
      tiles[y][this.mineW - 1] = this.makeTile('wall');
    }

    // Scatter mine rocks with ores
    const oreTypes: OreType[] = ['stone', 'iron', 'gold', 'crystal', 'coal'];
    const oreWeights = [0.35, 0.25, 0.15, 0.05, 0.20];
    for (let i = 0; i < 60; i++) {
      const x = 2 + Math.floor(Math.random() * (this.mineW - 4));
      const y = 2 + Math.floor(Math.random() * (this.mineH - 4));
      const t = tiles[y][x];
      if (t.type === 'mine_floor') {
        t.type = 'mine_rock';
        t.occupied = true;
        const r = Math.random();
        let cum = 0;
        for (let j = 0; j < oreTypes.length; j++) {
          cum += oreWeights[j];
          if (r < cum) {
            t.oreType = oreTypes[j];
            t.oreAmount = 1 + Math.floor(Math.random() * 3);
            break;
          }
        }
      }
    }

    // Exit ladder
    tiles[1][1] = this.makeTile('mine_floor');
    tiles[1][1].decorationId = 'mine_exit';

    return tiles;
  }

  getMineTile(x: number, y: number): Tile | null {
    if (!this.mineTiles) return null;
    if (x < 0 || x >= this.mineW || y < 0 || y >= this.mineH) return null;
    return this.mineTiles[y][x];
  }

  mineRock(x: number, y: number): { oreType: OreType; amount: number } | null {
    const t = this.getMineTile(x, y);
    if (!t || t.type !== 'mine_rock') return null;
    const result = { oreType: t.oreType || 'stone', amount: t.oreAmount || 1 };
    t.type = 'mine_floor';
    t.occupied = false;
    t.oreType = null;
    t.oreAmount = 0;
    return result;
  }

  isInMine(): boolean {
    return this.mineLevel > 0;
  }

  isInHouse(): boolean {
    return this.houseLevel > 0;
  }

  // ============ House Interior ============
  enterHouse(): void {
    this.houseLevel = 1;
    if (!this.houseTiles) {
      this.houseTiles = this.generateHouseInterior();
    }
  }

  exitHouse(): void {
    this.houseLevel = 0;
  }

  getHouseTile(x: number, y: number): Tile | null {
    if (!this.houseTiles) return null;
    if (x < 0 || x >= this.houseW || y < 0 || y >= this.houseH) return null;
    return this.houseTiles[y][x];
  }

  private generateHouseInterior(): Tile[][] {
    const tiles: Tile[][] = [];
    const W = this.houseW;
    const H = this.houseH;

    // Fill with interior floor
    for (let y = 0; y < H; y++) {
      tiles[y] = [];
      for (let x = 0; x < W; x++) {
        tiles[y][x] = this.makeTile('house_interior');
        // Interior floor is walkable by default
        tiles[y][x].occupied = false;
      }
    }

    // Walls around the edge
    for (let x = 0; x < W; x++) {
      tiles[0][x] = this.makeTile('wall');
      tiles[H - 1][x] = this.makeTile('wall');
    }
    for (let y = 0; y < H; y++) {
      tiles[y][0] = this.makeTile('wall');
      tiles[y][W - 1] = this.makeTile('wall');
    }

    // Place furniture using decorationId on interior tiles
    const place = (x: number, y: number, type: HouseFurnitureType) => {
      if (y >= 0 && y < H && x >= 0 && x < W) {
        tiles[y][x].decorationId = type;
        tiles[y][x].occupied = true;
      }
    };

    // Bed (top-left corner)
    place(2, 1, 'bed');
    place(3, 1, 'bed');

    // Table and chairs (center)
    place(6, 5, 'table');
    place(5, 5, 'chair');
    place(7, 5, 'chair');
    place(6, 4, 'chair');

    // Storage chest (right side)
    place(11, 2, 'chest');

    // Kitchen counter + stove (right side, bottom)
    place(11, 6, 'counter');
    place(11, 7, 'stove');
    place(10, 7, 'counter');

    // A rug near the table
    place(6, 6, 'rug');
    // Re-mark rug as walkable decoration (visual only)
    tiles[6][6].occupied = false;

    // Lamp near the door
    place(1, 1, 'lamp');

    // Door at bottom-center to exit to overworld
    tiles[H - 1][Math.floor(W / 2)] = this.makeTile('house_interior');
    tiles[H - 1][Math.floor(W / 2)].decorationId = 'door';
    tiles[H - 1][Math.floor(W / 2)].occupied = false; // walkable so we can stand on it

    return tiles;
  }

  // Place a piece of furniture/decoration inside the house interior on a floor tile
  placeHouseDecoration(x: number, y: number, decorationId: string): boolean {
    const t = this.getHouseTile(x, y);
    if (!t) return false;
    if (t.type !== 'house_interior') return false;
    if (t.occupied) return false;
    if (t.decorationId) return false;
    t.decorationId = decorationId;
    // Rugs remain walkable; other furniture blocks the tile
    if (decorationId !== 'rug') {
      t.occupied = true;
    }
    return true;
  }

  // ============ Buildings ============
  placeBuilding(x: number, y: number, buildingType: BuildingType): boolean {
    const def = BUILDINGS[buildingType];
    const w = def?.width ?? 1;
    const h = def?.height ?? 1;

    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const t = this.getTile(x + dx, y + dy);
        if (!t) return false;
        if (t.occupied) return false;
        if (t.type !== 'grass' && t.type !== 'floor') return false;
      }
    }

    // Place building
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const t = this.getTile(x + dx, y + dy)!;
        t.type = 'building';
        t.occupied = true;
        t.decorationId = null;
      }
    }
    const id = `${buildingType}_${this.buildings.length}`;
    this.buildings.push({ id, type: buildingType, x, y });
    return true;
  }

  // Check whether a building can be placed at (x, y)
  canPlaceBuilding(x: number, y: number, buildingType: BuildingType): boolean {
    const def = BUILDINGS[buildingType];
    if (!def) return false;
    for (let dy = 0; dy < def.height; dy++) {
      for (let dx = 0; dx < def.width; dx++) {
        const t = this.getTile(x + dx, y + dy);
        if (!t) return false;
        if (t.occupied) return false;
        if (t.type !== 'grass' && t.type !== 'floor') return false;
      }
    }
    return true;
  }

  getActiveTiles(): Tile[][] {
    if (this.isInMine() && this.mineTiles) return this.mineTiles;
    if (this.isInHouse() && this.houseTiles) return this.houseTiles;
    return this.tiles;
  }

  getActiveWidth(): number {
    if (this.isInMine()) return this.mineW;
    if (this.isInHouse()) return this.houseW;
    return this.width;
  }

  getActiveHeight(): number {
    if (this.isInMine()) return this.mineH;
    if (this.isInHouse()) return this.houseH;
    return this.height;
  }
}