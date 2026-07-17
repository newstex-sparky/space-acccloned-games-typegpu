import type { Quest } from './types';

export const QUESTS: Quest[] = [
  {
    id: 'q_first_crop',
    title: 'First Harvest',
    description: 'Plant and harvest your first crop. A space farmer\'s journey begins!',
    status: 'available',
    objectives: [
      { id: 'harvest1', text: 'Harvest any crop', type: 'collect', target: 'any_crop', amount: 1, current: 0, done: false },
    ],
    reward: { money: 50, items: [{ itemId: 'astro_carrot_seed', quantity: 5 }] },
  },
  {
    id: 'q_meet_orion',
    title: 'Meet the Mechanic',
    description: 'Orion runs the repair bay. Go say hello!',
    status: 'available',
    objectives: [
      { id: 'talk_orion', text: 'Talk to Orion', type: 'talk', target: 'orion', amount: 1, current: 0, done: false },
    ],
    reward: { money: 30, items: [{ itemId: 'energy_drink', quantity: 1 }] },
  },
  {
    id: 'q_mining_iron',
    title: 'Iron Will',
    description: 'Orion needs iron for repairs. Mine some iron ore.',
    status: 'available',
    objectives: [
      { id: 'get_iron', text: 'Collect 5 Iron Ore', type: 'collect', target: 'iron', amount: 5, current: 0, done: false },
    ],
    reward: { money: 100, items: [{ itemId: 'coal', quantity: 5 }] },
  },
  {
    id: 'q_fish_master',
    title: 'Stellar Angler',
    description: 'Catch 3 fish from the space lake.',
    status: 'available',
    objectives: [
      { id: 'catch_fish', text: 'Catch 3 fish', type: 'collect', target: 'any_fish', amount: 3, current: 0, done: false },
    ],
    reward: { money: 80, items: [{ itemId: 'starfish', quantity: 1 }] },
  },
  {
    id: 'q_forager',
    title: 'Wild Gatherer',
    description: 'Forage 5 wild items from around the station.',
    status: 'available',
    objectives: [
      { id: 'forage5', text: 'Forage 5 items', type: 'collect', target: 'any_forage', amount: 5, current: 0, done: false },
    ],
    reward: { money: 60, items: [{ itemId: 'space_mushroom', quantity: 2 }] },
  },
  {
    id: 'q_craft_iron',
    title: 'Blacksmith',
    description: 'Craft an Iron Bar from iron ore and coal.',
    status: 'available',
    objectives: [
      { id: 'craft_bar', text: 'Craft 1 Iron Bar', type: 'craft', target: 'iron_bar', amount: 1, current: 0, done: false },
    ],
    reward: { money: 75, items: [{ itemId: 'gold', quantity: 3 }] },
  },
  {
    id: 'q_all_npcs',
    title: 'Social Butterfly',
    description: 'Talk to all 4 NPCs on the station.',
    status: 'available',
    objectives: [
      { id: 'talk_all', text: 'Talk to all NPCs', type: 'talk', target: 'all', amount: 4, current: 0, done: false },
    ],
    reward: { money: 120, items: [{ itemId: 'energy_drink', quantity: 2 }] },
  },
  {
    id: 'q_gold_rush',
    title: 'Gold Rush',
    description: 'Mine 3 gold ore from the deep mines.',
    status: 'available',
    objectives: [
      { id: 'get_gold', text: 'Collect 3 Gold Ore', type: 'collect', target: 'gold', amount: 3, current: 0, done: false },
    ],
    reward: { money: 200, items: [{ itemId: 'crystal', quantity: 1 }] },
  },
];

export function createInitialQuests(): Quest[] {
  return JSON.parse(JSON.stringify(QUESTS));
}