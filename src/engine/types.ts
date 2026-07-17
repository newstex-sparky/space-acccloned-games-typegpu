// ============ Core Game Types ============

export type Vec2 = { x: number; y: number };

export type TileType =
  | 'grass'
  | 'tilled'
  | 'watered'
  | 'water'
  | 'rock'
  | 'wall'
  | 'path'
  | 'crop'
  | 'floor'
  | 'forage'
  | 'decoration'
  | 'mine_rock'
  | 'mine_floor'
  | 'house_interior'
  | 'building';

// House interior furniture / tile subtypes. Stored in `Tile.decorationId`
// when the tile type is 'house_interior' so we can reuse the existing tile
// system without a parallel furniture array.
export type HouseFurnitureType =
  | 'bed'
  | 'table'
  | 'chair'
  | 'counter'
  | 'chest'
  | 'door'
  | 'lamp'
  | 'rug'
  | 'plant_pot'
  | 'shelf'
  | 'tv'
  | 'stove';

export interface Tile {
  type: TileType;
  crop?: CropData | null;
  forageId?: string | null;
  decorationId?: string | null;
  watered: boolean;
  oreType?: OreType | null;
  oreAmount?: number;
  occupied: boolean; // blocked by building/structure
}

export interface CropData {
  cropId: string;
  stage: number;       // 0 = seed, maxStage = harvestable
  maxStage: number;
  daysGrown: number;
  watered: boolean;
  dead: boolean;
  harvestable: boolean;
}

export type OreType = 'iron' | 'gold' | 'crystal' | 'stone' | 'coal';

export type Season = 'nebula' | 'aurora' | 'ember' | 'frost';

export type Tool = 'hoe' | 'watering_can' | 'pickaxe' | 'axe' | 'fishing_rod' | 'sword';

export interface ItemStack {
  itemId: string;
  quantity: number;
}

export interface InventorySlot {
  item: ItemStack | null;
}

export interface PlayerStats {
  energy: number;
  maxEnergy: number;
  health: number;
  maxHealth: number;
  money: number;
}

export interface GameTime {
  day: number;
  season: Season;
  year: number;
  minutes: number; // 0-1440 (24h * 60)
  timeString: string;
}

export type NPCId = 'orion' | 'vega' | 'nova' | 'cygnus';

export interface NPCState {
  id: NPCId;
  name: string;
  friendship: number; // 0-10 hearts (0-1000 points)
  talkedToday: boolean;
  giftedToday: boolean;
  pos: Vec2;
  homePos: Vec2;
  dialogIndex: number;
}

export type QuestStatus = 'available' | 'active' | 'completed' | 'claimed';

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  objectives: QuestObjective[];
  reward: { money?: number; items?: ItemStack[] };
  requiredNPC?: NPCId;
}

export interface QuestObjective {
  id: string;
  text: string;
  type: 'collect' | 'talk' | 'reach' | 'craft' | 'sell';
  target: string;
  amount: number;
  current: number;
  done: boolean;
}

export type GameScreen =
  | 'world'
  | 'shop'
  | 'inventory'
  | 'crafting'
  | 'quests'
  | 'dialog'
  | 'map'
  | 'seed_select'
  | 'build'
  | 'cooking'
  | 'house';

export interface Notification {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timeout: number;
}

export type FishingState = 'idle' | 'casting' | 'waiting' | 'biting' | 'reeling' | 'caught' | 'failed';

export interface FishData {
  id: string;
  name: string;
  value: number;
  difficulty: number; // 1-5
  color: string;
}

export interface DecorationDef {
  id: string;
  name: string;
  cost: number;
  color: string;
  size: number;
  category: 'plant' | 'structure' | 'light';
}

// Callback type for engine -> UI communication
export interface EngineCallbacks {
  onStateChange: () => void;
  onNotification: (n: Notification) => void;
  onScreenChange: (screen: GameScreen | null) => void;
  onDialogChange: (npcId: NPCId | null) => void;
  onFishingChange: (state: FishingState) => void;
}

export interface Recipe {
  id: string;
  name: string;
  inputs: ItemStack[];
  output: ItemStack;
  toolRequired?: Tool;
}

export interface CropDef {
  id: string;
  name: string;
  seedId: string;
  seedCost: number;
  sellValue: number;
  growthDays: number;
  stages: number; // number of visual stages (0..stages-1)
  seasons: Season[];
  color: string;
  seedColor: string;
}

// ============ Buildable Buildings ============
export type BuildingType =
  | 'coop'
  | 'barn'
  | 'well'
  | 'silo'
  | 'shed'
  | 'greenhouse';

export interface BuildingDef {
  id: BuildingType;
  name: string;
  description: string;
  cost: number;            // gold cost
  materials: ItemStack[];  // required materials
  width: number;           // tile footprint
  height: number;
  color: string;
  roofColor: string;
  emoji: string;
}

// A building instance placed on the overworld map
export interface PlacedBuilding {
  id: string;
  type: BuildingType;
  x: number;  // top-left tile
  y: number;
}

// ============ Cooking Recipes ============
export interface CookingRecipe {
  id: string;
  name: string;
  inputs: ItemStack[];
  output: ItemStack;
  energy: number;  // energy restored when eaten
  sellValue: number;
  emoji: string;
}