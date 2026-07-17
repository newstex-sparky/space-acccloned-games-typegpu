import type { NPCId, NPCState } from './types';

export interface NPCDef {
  id: NPCId;
  name: string;
  color: string;
  homePos: { x: number; y: number };
  role: string;
  dialogs: string[];
  giftLoves: string[];
  giftLikes: string[];
  giftDislikes: string[];
  giftHates: string[];
}

export const NPCS: Record<NPCId, NPCDef> = {
  orion: {
    id: 'orion',
    name: 'Orion',
    color: '#4488ff',
    homePos: { x: 5, y: 5 },
    role: 'Space Mechanic',
    dialogs: [
      "Hey there, new colonist! Welcome to Station Alpha.",
      "I fix the life support systems around here. It's tough work.",
      "If you find any iron ore, bring it to me! I'm always running low.",
      "The stars look beautiful tonight, don't they?",
      "Have you tried fishing in the lake? Caught a huge one yesterday!",
      "The mines can be dangerous. Watch out for space slimes!",
    ],
    giftLoves: ['iron', 'iron_bar', 'solar_panel'],
    giftLikes: ['gold', 'coal', 'cosmic_corn', 'star_tomato'],
    giftDislikes: ['space_mushroom', 'stone'],
    giftHates: ['void_eel'],
  },
  vega: {
    id: 'vega',
    name: 'Vega',
    color: '#ff66cc',
    homePos: { x: 35, y: 8 },
    role: 'Botanist',
    dialogs: [
      "Oh! A new neighbor! I'm Vega, the station botanist.",
      "I study the alien plant life we've discovered.",
      "Nebula berries are my favorite! So sweet and glowy.",
      "Every season brings new possibilities for our crops.",
      "Did you know moon flowers only bloom at night?",
      "I dream of growing a garden that spans the whole station!",
    ],
    giftLoves: ['nebula_berry', 'moon_flower', 'glow_flower'],
    giftLikes: ['star_fruit', 'space_mushroom', 'astro_carrot'],
    giftDislikes: ['coal', 'stone', 'iron'],
    giftHates: ['bomb'],
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    color: '#ffaa44',
    homePos: { x: 20, y: 35 },
    role: 'Shopkeeper',
    dialogs: [
      "Welcome to the Galactic Trading Post!",
      "I buy and sell everything a space farmer needs.",
      "Fresh crops fetch a good price, you know.",
      "Looking for seeds? I've got the best selection this side of the nebula.",
      "The economy's been rough, but we colonists stick together.",
      "Stop by anytime! I'm always here.",
    ],
    giftLoves: ['gold_bar', 'cosmic_ray', 'crystal'],
    giftLikes: ['starfish', 'lunar_potato', 'gold'],
    giftDislikes: ['stone', 'coal'],
    giftHates: ['space_mushroom'],
  },
  cygnus: {
    id: 'cygnus',
    name: 'Cygnus',
    color: '#44ffaa',
    homePos: { x: 30, y: 30 },
    role: 'Miner & Explorer',
    dialogs: [
      "G'day! Name's Cygnus. I explore the deep mines.",
      "There's treasure down there, but also danger.",
      "I once found a crystal the size of my head!",
      "The deeper you go, the rarer the ores. But the monsters get tougher too.",
      "Need a fishing rod? I found one in the mines yesterday. Nova's selling it now.",
      "Sometimes I hear... things... in the deep. Don't go alone.",
    ],
    giftLoves: ['crystal', 'rare_crystal', 'bomb', 'sword'],
    giftLikes: ['iron', 'gold', 'coal', 'space_bass'],
    giftDislikes: ['moon_flower', 'glow_flower'],
    giftHates: ['nebula_berry'],
  },
};

export const NPC_LIST = Object.values(NPCS);

export function createNPCStates(): Record<NPCId, NPCState> {
  const states: Partial<Record<NPCId, NPCState>> = {};
  for (const def of NPC_LIST) {
    states[def.id] = {
      id: def.id,
      name: def.name,
      friendship: 0,
      talkedToday: false,
      giftedToday: false,
      pos: { ...def.homePos },
      homePos: { ...def.homePos },
      dialogIndex: 0,
    };
  }
  return states as Record<NPCId, NPCState>;
}

export function getGiftReaction(npcId: NPCId, itemId: string): 'love' | 'like' | 'neutral' | 'dislike' | 'hate' {
  const def = NPCS[npcId];
  if (def.giftLoves.includes(itemId)) return 'love';
  if (def.giftLikes.includes(itemId)) return 'like';
  if (def.giftDislikes.includes(itemId)) return 'dislike';
  if (def.giftHates.includes(itemId)) return 'hate';
  return 'neutral';
}

export function getGiftPoints(reaction: 'love' | 'like' | 'neutral' | 'dislike' | 'hate'): number {
  switch (reaction) {
    case 'love': return 80;
    case 'like': return 45;
    case 'neutral': return 20;
    case 'dislike': return -20;
    case 'hate': return -50;
    default: return 20;
  }
}

export function getReactionText(npcId: NPCId, reaction: 'love' | 'like' | 'neutral' | 'dislike' | 'hate'): string {
  const name = NPCS[npcId].name;
  switch (reaction) {
    case 'love': return `${name}: \"This is amazing! I love it! Thank you so much!\"`;
    case 'like': return `${name}: \"Oh, thank you! I really like this.\"`;
    case 'neutral': return `${name}: \"Thanks for the gift.\"`;
    case 'dislike': return `${name}: \"Uh... thanks, I guess.\"`;
    case 'hate': return `${name}: \"Why would you give me this? I hate it!\"`;
    default: return `${name}: \"...\"`;
  }
}