import type { CropDef, Recipe, FishData, DecorationDef, ItemStack } from './types';

// ============ Crop Definitions ============
export const CROPS: Record<string, CropDef> = {
  astro_carrot: {
    id: 'astro_carrot',
    name: 'Astro Carrot',
    seedId: 'astro_carrot_seed',
    seedCost: 10,
    sellValue: 35,
    growthDays: 3,
    stages: 4,
    seasons: ['nebula', 'aurora', 'ember', 'frost'],
    color: '#ff8800',
    seedColor: '#ffcc66',
  },
  lunar_potato: {
    id: 'lunar_potato',
    name: 'Lunar Potato',
    seedId: 'lunar_potato_seed',
    seedCost: 15,
    sellValue: 50,
    growthDays: 4,
    stages: 4,
    seasons: ['nebula', 'aurora', 'frost'],
    color: '#ddccaa',
    seedColor: '#bbaa88',
  },
  star_tomato: {
    id: 'star_tomato',
    name: 'Star Tomato',
    seedId: 'star_tomato_seed',
    seedCost: 20,
    sellValue: 60,
    growthDays: 5,
    stages: 5,
    seasons: ['aurora', 'ember'],
    color: '#ff4444',
    seedColor: '#88aa44',
  },
  cosmic_corn: {
    id: 'cosmic_corn',
    name: 'Cosmic Corn',
    seedId: 'cosmic_corn_seed',
    seedCost: 25,
    sellValue: 80,
    growthDays: 6,
    stages: 5,
    seasons: ['aurora', 'ember'],
    color: '#ffee44',
    seedColor: '#aacc22',
  },
  nebula_berry: {
    id: 'nebula_berry',
    name: 'Nebula Berry',
    seedId: 'nebula_berry_seed',
    seedCost: 30,
    sellValue: 100,
    growthDays: 7,
    stages: 5,
    seasons: ['ember', 'frost'],
    color: '#cc44ff',
    seedColor: '#8844aa',
  },
};

// ============ Item Definitions ============
export interface ItemDef {
  id: string;
  name: string;
  description: string;
  category: 'seed' | 'crop' | 'ore' | 'fish' | 'forage' | 'crafted' | 'tool' | 'decoration' | 'misc';
  sellValue: number;
  buyValue: number;
  color: string;
  emoji: string;
}

export const ITEMS: Record<string, ItemDef> = {
  // Seeds
  astro_carrot_seed: { id: 'astro_carrot_seed', name: 'Astro Carrot Seeds', description: 'Grows in any season. Fast grower.', category: 'seed', sellValue: 5, buyValue: 10, color: '#ffcc66', emoji: '🌱' },
  lunar_potato_seed: { id: 'lunar_potato_seed', name: 'Lunar Potato Seeds', description: 'Grows in cool seasons.', category: 'seed', sellValue: 7, buyValue: 15, color: '#bbaa88', emoji: '🌱' },
  star_tomato_seed: { id: 'star_tomato_seed', name: 'Star Tomato Seeds', description: 'Warm seasons only.', category: 'seed', sellValue: 10, buyValue: 20, color: '#88aa44', emoji: '🌱' },
  cosmic_corn_seed: { id: 'cosmic_corn_seed', name: 'Cosmic Corn Seeds', description: 'Warm seasons only.', category: 'seed', sellValue: 12, buyValue: 25, color: '#aacc22', emoji: '🌱' },
  nebula_berry_seed: { id: 'nebula_berry_seed', name: 'Nebula Berry Seeds', description: 'Cool seasons only. High value.', category: 'seed', sellValue: 15, buyValue: 30, color: '#8844aa', emoji: '🌱' },

  // Crops
  astro_carrot: { id: 'astro_carrot', name: 'Astro Carrot', description: 'A crunchy orange root from the stars.', category: 'crop', sellValue: 35, buyValue: 0, color: '#ff8800', emoji: '🥕' },
  lunar_potato: { id: 'lunar_potato', name: 'Lunar Potato', description: 'Starchy and filling.', category: 'crop', sellValue: 50, buyValue: 0, color: '#ddccaa', emoji: '🥔' },
  star_tomato: { id: 'star_tomato', name: 'Star Tomato', description: 'Juicy and bright.', category: 'crop', sellValue: 60, buyValue: 0, color: '#ff4444', emoji: '🍅' },
  cosmic_corn: { id: 'cosmic_corn', name: 'Cosmic Corn', description: 'Golden kernels of the cosmos.', category: 'crop', sellValue: 80, buyValue: 0, color: '#ffee44', emoji: '🌽' },
  nebula_berry: { id: 'nebula_berry', name: 'Nebula Berry', description: 'Glowing purple berries.', category: 'crop', sellValue: 100, buyValue: 0, color: '#cc44ff', emoji: '🫐' },

  // Ores & Materials
  iron: { id: 'iron', name: 'Iron Ore', description: 'Common space metal.', category: 'ore', sellValue: 15, buyValue: 0, color: '#aaaaaa', emoji: '🔩' },
  gold: { id: 'gold', name: 'Gold Ore', description: 'Shiny and valuable.', category: 'ore', sellValue: 40, buyValue: 0, color: '#ffdd00', emoji: '🪙' },
  crystal: { id: 'crystal', name: 'Rare Crystal', description: 'A shimmering space crystal.', category: 'ore', sellValue: 80, buyValue: 0, color: '#44ffff', emoji: '💎' },
  stone: { id: 'stone', name: 'Stone', description: 'Rubble from mining.', category: 'ore', sellValue: 2, buyValue: 0, color: '#888888', emoji: '🪨' },
  coal: { id: 'coal', name: 'Space Coal', description: 'Fuel for crafting.', category: 'ore', sellValue: 10, buyValue: 0, color: '#333333', emoji: '⚫' },

  // Fish
  space_bass: { id: 'space_bass', name: 'Space Bass', description: 'A common space fish.', category: 'fish', sellValue: 30, buyValue: 0, color: '#4488cc', emoji: '🐟' },
  starfish: { id: 'starfish', name: 'Star Fish', description: 'Literally a fish made of stars.', category: 'fish', sellValue: 45, buyValue: 0, color: '#ffcc44', emoji: '🐠' },
  void_eel: { id: 'void_eel', name: 'Void Eel', description: 'Slippery and dark.', category: 'fish', sellValue: 70, buyValue: 0, color: '#9933ff', emoji: '🐍' },
  cosmic_ray: { id: 'cosmic_ray', name: 'Cosmic Ray', description: 'A rare majestic fish.', category: 'fish', sellValue: 120, buyValue: 0, color: '#ff66ff', emoji: '🐡' },

  // Forage
  space_mushroom: { id: 'space_mushroom', name: 'Space Mushroom', description: 'Glowing fungi found in the wild.', category: 'forage', sellValue: 20, buyValue: 0, color: '#ff66aa', emoji: '🍄' },
  star_fruit: { id: 'star_fruit', name: 'Star Fruit', description: 'Wild fruit with a star shape.', category: 'forage', sellValue: 25, buyValue: 0, color: '#ffee88', emoji: '⭐' },
  moon_flower: { id: 'moon_flower', name: 'Moon Flower', description: 'Blooms under starlight.', category: 'forage', sellValue: 30, buyValue: 0, color: '#aaddff', emoji: '🌸' },
  comet_pearl: { id: 'comet_pearl', name: 'Comet Pearl', description: 'A rare shiny pearl.', category: 'forage', sellValue: 50, buyValue: 0, color: '#eeffaa', emoji: '🫧' },

  // Crafted items
  iron_bar: { id: 'iron_bar', name: 'Iron Bar', description: 'Refined iron.', category: 'crafted', sellValue: 30, buyValue: 0, color: '#cccccc', emoji: '⚙️' },
  gold_bar: { id: 'gold_bar', name: 'Gold Bar', description: 'Refined gold.', category: 'crafted', sellValue: 75, buyValue: 0, color: '#ffee00', emoji: '🏆' },
  solar_panel: { id: 'solar_panel', name: 'Solar Panel', description: 'Generates energy.', category: 'crafted', sellValue: 100, buyValue: 0, color: '#224488', emoji: '🔆' },
  space_soup: { id: 'space_soup', name: 'Space Soup', description: 'Restores 50 energy.', category: 'crafted', sellValue: 60, buyValue: 0, color: '#aa6644', emoji: '🍲' },
  bomb: { id: 'bomb', name: 'Bomb', description: 'Breaks rocks in mines.', category: 'crafted', sellValue: 50, buyValue: 0, color: '#333333', emoji: '💣' },
  sprinkler: { id: 'sprinkler', name: 'Sprinkler', description: 'Waters adjacent crops.', category: 'crafted', sellValue: 80, buyValue: 0, color: '#44aaff', emoji: '💧' },

  // Tools
  fishing_rod: { id: 'fishing_rod', name: 'Fishing Rod', description: 'For catching space fish.', category: 'tool', sellValue: 0, buyValue: 50, color: '#8B4513', emoji: '🎣' },
  sword: { id: 'sword', name: 'Laser Sword', description: 'For fighting space creatures.', category: 'tool', sellValue: 0, buyValue: 100, color: '#00ffff', emoji: '⚔️' },
  pickaxe_upgrade: { id: 'pickaxe_upgrade', name: 'Steel Pickaxe', description: 'Mines faster.', category: 'tool', sellValue: 0, buyValue: 200, color: '#888899', emoji: '⛏️' },

  // Misc
  energy_drink: { id: 'energy_drink', name: 'Energy Drink', description: 'Restores 30 energy.', category: 'misc', sellValue: 20, buyValue: 40, color: '#44ff44', emoji: '🥤' },
};

// ============ Shop Stock ============
export const SHOP_STOCK: ItemStack[] = [
  { itemId: 'astro_carrot_seed', quantity: 1 },
  { itemId: 'lunar_potato_seed', quantity: 1 },
  { itemId: 'star_tomato_seed', quantity: 1 },
  { itemId: 'cosmic_corn_seed', quantity: 1 },
  { itemId: 'nebula_berry_seed', quantity: 1 },
  { itemId: 'fishing_rod', quantity: 1 },
  { itemId: 'sword', quantity: 1 },
  { itemId: 'energy_drink', quantity: 1 },
  { itemId: 'pickaxe_upgrade', quantity: 1 },
];

// ============ Crafting Recipes ============
export const RECIPES: Recipe[] = [
  {
    id: 'iron_bar',
    name: 'Iron Bar',
    inputs: [{ itemId: 'iron', quantity: 3 }, { itemId: 'coal', quantity: 1 }],
    output: { itemId: 'iron_bar', quantity: 1 },
  },
  {
    id: 'gold_bar',
    name: 'Gold Bar',
    inputs: [{ itemId: 'gold', quantity: 3 }, { itemId: 'coal', quantity: 1 }],
    output: { itemId: 'gold_bar', quantity: 1 },
  },
  {
    id: 'solar_panel',
    name: 'Solar Panel',
    inputs: [{ itemId: 'iron_bar', quantity: 2 }, { itemId: 'crystal', quantity: 1 }],
    output: { itemId: 'solar_panel', quantity: 1 },
  },
  {
    id: 'space_soup',
    name: 'Space Soup',
    inputs: [{ itemId: 'astro_carrot', quantity: 1 }, { itemId: 'lunar_potato', quantity: 1 }],
    output: { itemId: 'space_soup', quantity: 1 },
  },
  {
    id: 'bomb',
    name: 'Bomb',
    inputs: [{ itemId: 'iron_bar', quantity: 1 }, { itemId: 'coal', quantity: 2 }],
    output: { itemId: 'bomb', quantity: 1 },
  },
  {
    id: 'sprinkler',
    name: 'Sprinkler',
    inputs: [{ itemId: 'iron_bar', quantity: 2 }, { itemId: 'gold', quantity: 1 }],
    output: { itemId: 'sprinkler', quantity: 1 },
  },
];

// ============ Fish Definitions ============
export const FISH: Record<string, FishData> = {
  space_bass: { id: 'space_bass', name: 'Space Bass', value: 30, difficulty: 1, color: '#4488cc' },
  starfish: { id: 'starfish', name: 'Star Fish', value: 45, difficulty: 2, color: '#ffcc44' },
  void_eel: { id: 'void_eel', name: 'Void Eel', value: 70, difficulty: 3, color: '#9933ff' },
  cosmic_ray: { id: 'cosmic_ray', name: 'Cosmic Ray', value: 120, difficulty: 4, color: '#ff66ff' },
};

export const FISH_POOL = ['space_bass', 'space_bass', 'starfish', 'starfish', 'void_eel', 'cosmic_ray'];

// ============ Decoration Definitions ============
export const DECORATIONS: Record<string, DecorationDef> = {
  space_tree: { id: 'space_tree', name: 'Space Tree', cost: 50, color: '#33aa55', size: 1, category: 'plant' },
  star_lamp: { id: 'star_lamp', name: 'Star Lamp', cost: 80, color: '#ffdd44', size: 1, category: 'light' },
  solar_statue: { id: 'solar_statue', name: 'Solar Statue', cost: 200, color: '#cccc88', size: 1, category: 'structure' },
  hydroponic_tower: { id: 'hydroponic_tower', name: 'Hydroponic Tower', cost: 150, color: '#4488aa', size: 1, category: 'structure' },
  void_fountain: { id: 'void_fountain', name: 'Void Fountain', cost: 300, color: '#aa44ff', size: 1, category: 'structure' },
  glow_flower: { id: 'glow_flower', name: 'Glow Flower', cost: 30, color: '#ff66cc', size: 1, category: 'plant' },
};

export const DECORATION_LIST = Object.values(DECORATIONS);

// ============ Ore Drop Tables ============
export const ORE_DROPS: Record<string, { itemId: string; chance: number }[]> = {
  stone: [
    { itemId: 'stone', chance: 1.0 },
  ],
  iron: [
    { itemId: 'iron', chance: 0.7 },
    { itemId: 'stone', chance: 0.5 },
  ],
  gold: [
    { itemId: 'gold', chance: 0.6 },
    { itemId: 'stone', chance: 0.4 },
  ],
  crystal: [
    { itemId: 'crystal', chance: 0.5 },
    { itemId: 'iron', chance: 0.3 },
  ],
  coal: [
    { itemId: 'coal', chance: 0.8 },
    { itemId: 'stone', chance: 0.3 },
  ],
};

export function getItemName(id: string): string {
  return ITEMS[id]?.name ?? id;
}

export function getItemSellValue(id: string): number {
  return ITEMS[id]?.sellValue ?? 0;
}

export function getItemBuyValue(id: string): number {
  return ITEMS[id]?.buyValue ?? 0;
}