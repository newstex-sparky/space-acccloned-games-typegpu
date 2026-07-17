import type {
  GameScreen, Notification, EngineCallbacks, NPCId, Quest, ItemStack,
  FishingState, Season, GameTime, Tool, Vec2, Tile, BuildingType,
} from './types';
import { World } from './World';
import { HOUSE_POS } from './World';
import { Player } from './Player';
import {
  CROPS, ITEMS, RECIPES, SHOP_STOCK, FISH, FISH_POOL, ORE_DROPS, DECORATIONS,
  getItemBuyValue, getItemSellValue, BUILDINGS, COOKING_RECIPES,
} from './items';
import { createNPCStates, NPCS, getGiftReaction, getGiftPoints, getReactionText } from './npcs';
import { createInitialQuests } from './quests';

const SEASONS: Season[] = ['nebula', 'aurora', 'ember', 'frost'];
const SEASON_NAMES: Record<Season, string> = {
  nebula: 'Nebula',
  aurora: 'Aurora',
  ember: 'Ember',
  frost: 'Frost',
};

let notifId = 0;

export class GameEngine {
  world: World;
  player: Player;
  callbacks: EngineCallbacks;
  screen: GameScreen | null = null;
  activeNPC: NPCId | null = null;
  fishingState: FishingState = 'idle';
  fishingTimer = 0;
  fishingTarget: Vec2 | null = null;
  fishingBar = 0;
  fishingDir = 1;
  fishingCurrentFish: string | null = null;
  notifications: Notification[] = [];
  quests: Quest[];
  npcs: ReturnType<typeof createNPCStates>;
  gameTime: GameTime;
  lastFrameTime = 0;
  running = false;
  rafId: number | null = null;
  decorationMode: string | null = null;
  // House decoration placement (inside the house interior)
  houseDecorationMode: string | null = null;
  // Build mode — when set, the next action places this building type
  buildMode: BuildingType | null = null;
  // Pending seed selection position for planting
  pendingPlant: Vec2 | null = null;
  currentDialog: { npcId: NPCId; text: string; mode: 'talk' | 'gift' } | null = null;
  talkedNpcs: Set<NPCId> = new Set();

  // Day transition
  dayTransitioning = false;

  constructor(callbacks: EngineCallbacks) {
    this.callbacks = callbacks;
    this.world = new World();
    this.player = new Player(16, 16);
    this.quests = createInitialQuests();
    this.npcs = createNPCStates();
    this.gameTime = {
      day: 1,
      season: 'nebula',
      year: 1,
      minutes: 360, // 6:00 AM
      timeString: '6:00 AM',
    };
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  gameLoop = (): void => {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min(now - this.lastFrameTime, 50);
    this.lastFrameTime = now;

    this.update(dt);
    this.callbacks.onStateChange();

    this.rafId = requestAnimationFrame(this.gameLoop);
  };

  update(dt: number): void {
    // Update player movement
    this.player.update(dt, this.world);

    // Update game time (1 game minute = ~0.7 real seconds, so a 20h day = ~840 seconds = 14 min real time)
    // Let's make it faster: 1 game minute = 0.5 real seconds
    this.gameTime.minutes += dt / 500;
    if (this.gameTime.minutes >= 1440) {
      // Past midnight - pass out
      this.passOut();
      return;
    }

    // Check 2AM limit
    if (this.gameTime.minutes >= 120 && this.gameTime.minutes < 360) {
      // Between midnight and 6AM - warn
      // Actually passing out happens at 2AM (120 min after midnight = 1440 + 120 = but our clock starts at 360 for 6AM)
      // Let's redefine: minutes go from 360 (6AM) to 360+1200 (2AM next day = 1560)
      // When minutes reach 1560, pass out
    }

    // Update time string
    this.updateTimeString();

    // Fishing minigame
    if (this.fishingState === 'waiting') {
      this.fishingTimer += dt;
      // Random bite after 2-6 seconds
      const biteTime = 2000 + (this.fishingTimer % 4000); // pseudo-random
      if (this.fishingTimer > biteTime) {
        this.fishingState = 'biting';
        this.fishingTimer = 0;
        this.fishingBar = 50;
        this.fishingDir = 1;
        this.callbacks.onFishingChange('biting');
        this.notify('A fish is biting! Tap to reel!', 'warning');
      }
    } else if (this.fishingState === 'biting') {
      this.fishingTimer += dt;
      // The bar moves up and down
      this.fishingBar += this.fishingDir * dt * 0.08;
      if (this.fishingBar >= 100) { this.fishingBar = 100; this.fishingDir = -1; }
      if (this.fishingBar <= 0) { this.fishingBar = 0; this.fishingDir = 1; }
      // Fish escapes after 3 seconds
      if (this.fishingTimer > 3000) {
        this.fishingState = 'failed';
        this.fishingTimer = 0;
        this.callbacks.onFishingChange('failed');
        this.notify('The fish got away!', 'error');
        setTimeout(() => {
          if (this.fishingState === 'failed') {
            this.fishingState = 'idle';
            this.callbacks.onFishingChange('idle');
          }
        }, 1500);
      }
    }

    // Move NPCs around their home area
    this.updateNPCs(dt);
  };

  updateTimeString(): void {
    const m = Math.floor(this.gameTime.minutes);
    let displayMin = m % 60;
    let displayHour = Math.floor(m / 60);
    const ampm = displayHour < 12 || displayHour >= 24 ? 'AM' : 'PM';
    if (displayHour >= 24) displayHour -= 24;
    if (displayHour === 0) displayHour = 12;
    if (displayHour > 12) displayHour -= 12;
    this.gameTime.timeString = `${displayHour}:${displayMin.toString().padStart(2, '0')} ${ampm}`;
  }

  updateNPCs(dt: number): void {
    for (const npcId of Object.keys(this.npcs) as NPCId[]) {
      const npc = this.npcs[npcId];
      const def = NPCS[npcId];
      // Simple wandering near home
      if (Math.random() < 0.002) {
        const dx = Math.floor(Math.random() * 5) - 2;
        const dy = Math.floor(Math.random() * 5) - 2;
        const nx = def.homePos.x + dx;
        const ny = def.homePos.y + dy;
        if (this.world.isWalkable(nx, ny)) {
          npc.pos = { x: nx, y: ny };
        }
      }
    }
  }

  // ============ Actions ============
  performAction(): void {
    const facing = this.player.getFacingTile();

    // House interior interactions take priority when inside the house
    if (this.world.isInHouse()) {
      this.handleHouseAction(facing);
      return;
    }

    // Build mode: place a building on the facing tile
    if (this.buildMode) {
      this.placeBuildingAt(facing.x, facing.y, this.buildMode);
      return;
    }

    // House decoration placement mode (when inside the house)
    if (this.houseDecorationMode) {
      const placed = this.world.placeHouseDecoration(facing.x, facing.y, this.houseDecorationMode);
      if (placed) {
        this.notify(`Placed ${ITEMS[this.houseDecorationMode]?.name ?? this.houseDecorationMode}!`, 'success');
        this.houseDecorationMode = null;
      } else {
        this.notify('Cannot place there!', 'error');
      }
      return;
    }

    const tile = this.world.isInMine() ? this.world.getMineTile(facing.x, facing.y) : this.world.getTile(facing.x, facing.y);
    if (!tile) return;

    // Check NPC at facing tile
    for (const npcId of Object.keys(this.npcs) as NPCId[]) {
      const npc = this.npcs[npcId];
      if (npc.pos.x === facing.x && npc.pos.y === facing.y) {
        this.talkToNPC(npcId);
        return;
      }
    }

    if (this.world.isInMine()) {
      this.handleMineAction(tile, facing);
      return;
    }

    // Decoration mode
    if (this.decorationMode) {
      const placed = this.world.placeDecoration(facing.x, facing.y, this.decorationMode);
      if (placed) {
        this.notify(`Placed ${DECORATIONS[this.decorationMode].name}!`, 'success');
        this.decorationMode = null;
      } else {
        this.notify('Cannot place there!', 'error');
      }
      return;
    }

    // Shop interaction
    if (tile.decorationId === 'shop') {
      this.openScreen('shop');
      return;
    }

    // House — enter the interior
    if (tile.decorationId === 'house') {
      this.enterHouse();
      return;
    }

    // Mine entrance
    if (tile.decorationId === 'mine_entrance') {
      this.world.enterMine();
      this.player.pos = { x: 2, y: 2 };
      this.player.pixelPos = { x: 2 * 32, y: 2 * 32 };
      this.notify('Entered the mine! Break rocks for ore.', 'info');
      return;
    }

    // Forage
    if (tile.forageId) {
      const id = this.world.collectForage(facing.x, facing.y);
      if (id) {
        this.player.addItem(id, 1);
        this.notify(`Foraged ${ITEMS[id]?.name ?? id}!`, 'success');
        this.checkQuestProgress('any_forage', 1);
        this.checkQuestProgress(id, 1);
      }
      return;
    }

    // Fishing
    if (tile.type === 'water' || this.world.isAdjacentToWater(facing.x, facing.y)) {
      if (this.player.hasItem('fishing_rod')) {
        this.startFishing();
        return;
      } else {
        this.notify('You need a fishing rod! Buy one at the shop.', 'warning');
        return;
      }
    }

    // Crop/soil actions
    if (tile.type === 'crop' && tile.crop) {
      if (tile.crop.harvestable) {
        const cropId = this.world.harvestCrop(facing.x, facing.y);
        if (cropId) {
          this.player.addItem(cropId, 1);
          const def = CROPS[cropId];
          this.notify(`Harvested ${def.name}! +${def.sellValue}g value`, 'success');
          this.checkQuestProgress('any_crop', 1);
          this.checkQuestProgress(cropId, 1);
          this.player.consumeEnergy(2);
        }
      } else if (!tile.watered) {
        this.waterTile(facing.x, facing.y);
      } else {
        this.notify('Crop is growing... be patient.', 'info');
      }
      return;
    }

    if (tile.type === 'tilled') {
      if (!tile.watered) {
        this.waterTile(facing.x, facing.y);
      } else {
        // Open the seed selection modal
        const seeds = this.getAvailableSeeds();
        if (seeds.length === 0) {
          this.notify('No seeds! Buy some at the shop.', 'warning');
        } else {
          this.pendingPlant = { x: facing.x, y: facing.y };
          this.openScreen('seed_select');
        }
      }
      return;
    }

    if (tile.type === 'grass' || tile.type === 'floor') {
      // Till with hoe
      if (this.player.tool === 'hoe') {
        if (this.player.consumeEnergy(5)) {
          if (this.world.tillTile(facing.x, facing.y)) {
            this.notify('Tilled soil!', 'success');
          }
        } else {
          this.notify('Too tired to till!', 'warning');
        }
      }
      return;
    }

    // Rock in overworld
    if (tile.type === 'rock') {
      if (this.player.consumeEnergy(3)) {
        // 50% chance to get wood, 50% chance to get stone
        if (Math.random() < 0.5) {
          this.player.addItem('wood', 1);
          this.notify('Chopped some wood.', 'info');
        } else {
          this.player.addItem('stone', 1);
          this.notify('Mined some stone.', 'info');
        }
      }
      return;
    }
  }

  handleMineAction(tile: Tile, pos: Vec2): void {
    if (tile.type === 'mine_rock') {
      if (this.player.consumeEnergy(4)) {
        const result = this.world.mineRock(pos.x, pos.y);
        if (result) {
          // Give ores based on ore type
          const drops = ORE_DROPS[result.oreType] || ORE_DROPS.stone;
          for (const drop of drops) {
            if (Math.random() < drop.chance) {
              const amt = 1 + Math.floor(Math.random() * result.amount);
              this.player.addItem(drop.itemId, amt);
              this.notify(`Mined ${amt}x ${ITEMS[drop.itemId]?.name ?? drop.itemId}!`, 'success');
              this.checkQuestProgress(drop.itemId, amt);
            }
          }
        }
      } else {
        this.notify('Too tired to mine!', 'warning');
      }
      return;
    }

    if (tile.decorationId === 'mine_exit') {
      this.world.exitMine();
      const exit = { x: 43, y: 44 };
      this.player.pos = { ...exit };
      this.player.pixelPos = { x: exit.x * 32, y: exit.y * 32 };
      this.notify('Left the mine.', 'info');
      return;
    }
  }

  waterTile(x: number, y: number): void {
    if (this.player.consumeEnergy(2)) {
      if (this.world.waterTile(x, y)) {
        this.notify('Watered!', 'success');
      }
    } else {
      this.notify('Too tired to water!', 'warning');
    }
  }

  // ============ House Interior ============
  enterHouse(): void {
    // Save the overworld position to return to
    this.world.houseExitPos = { x: HOUSE_POS.x + 1, y: HOUSE_POS.y + 2 };
    this.world.enterHouse();
    // Place player at the door (bottom-center of the interior)
    const doorX = Math.floor(this.world.houseW / 2);
    const doorY = this.world.houseH - 2;
    this.player.pos = { x: doorX, y: doorY };
    this.player.pixelPos = { x: doorX * 32, y: doorY * 32 };
    this.notify('Entered your home. 🏠', 'info');
  }

  exitHouse(): void {
    this.world.exitHouse();
    const exit = this.world.houseExitPos;
    this.player.pos = { ...exit };
    this.player.pixelPos = { x: exit.x * 32, y: exit.y * 32 };
    this.notify('Left the house.', 'info');
  }

  handleHouseAction(facing: Vec2): void {
    const tile = this.world.getHouseTile(facing.x, facing.y);
    if (!tile) return;

    // House decoration placement
    if (this.houseDecorationMode) {
      const placed = this.world.placeHouseDecoration(facing.x, facing.y, this.houseDecorationMode);
      if (placed) {
        this.notify(`Placed ${ITEMS[this.houseDecorationMode]?.name ?? this.houseDecorationMode}!`, 'success');
        this.houseDecorationMode = null;
      } else {
        this.notify('Cannot place there!', 'error');
      }
      return;
    }

    switch (tile.decorationId) {
      case 'bed':
        this.sleep();
        return;
      case 'door':
        this.exitHouse();
        return;
      case 'chest':
        this.openScreen('inventory');
        return;
      case 'stove':
      case 'counter':
        this.openScreen('cooking');
        return;
    }

    this.notify('Nothing here.', 'info');
  }

  // ============ Seed Selection ============
  getAvailableSeeds(): { itemId: string; name: string; quantity: number; cropId: string }[] {
    const seeds: { itemId: string; name: string; quantity: number; cropId: string }[] = [];
    const seen = new Set<string>();
    for (const slot of this.player.inventory) {
      if (!slot.item) continue;
      const def = ITEMS[slot.item.itemId];
      if (!def || def.category !== 'seed') continue;
      if (seen.has(slot.item.itemId)) continue;
      seen.add(slot.item.itemId);
      const cropId = slot.item.itemId.replace('_seed', '');
      if (!CROPS[cropId]) continue;
      seeds.push({
        itemId: slot.item.itemId,
        name: def.name,
        quantity: this.player.countItem(slot.item.itemId),
        cropId,
      });
    }
    return seeds;
  }

  plantSelectedSeed(seedId: string): void {
    if (!this.pendingPlant) return;
    const cropId = seedId.replace('_seed', '');
    const cropDef = CROPS[cropId];
    if (!cropDef) {
      this.notify('Unknown seed!', 'error');
      this.closeScreen();
      return;
    }
    if (!cropDef.seasons.includes(this.gameTime.season)) {
      this.notify(`Can't grow ${cropDef.name} in ${SEASON_NAMES[this.gameTime.season]} season!`, 'warning');
      return;
    }
    if (this.world.plantCrop(this.pendingPlant.x, this.pendingPlant.y, cropId, this.gameTime.season)) {
      this.player.removeItem(seedId, 1);
      this.notify(`Planted ${cropDef.name}!`, 'success');
      this.player.consumeEnergy(2);
      this.pendingPlant = null;
      this.closeScreen();
    } else {
      this.notify('Failed to plant there!', 'error');
    }
  }

  cancelSeedSelect(): void {
    this.pendingPlant = null;
    this.closeScreen();
  }

  // ============ Build Menu ============
  canAffordBuilding(buildingType: BuildingType): boolean {
    const def = BUILDINGS[buildingType];
    if (!def) return false;
    if (this.player.stats.money < def.cost) return false;
    for (const mat of def.materials) {
      if (!this.player.hasItem(mat.itemId, mat.quantity)) return false;
    }
    return true;
  }

  startBuildMode(buildingType: BuildingType): void {
    if (!this.canAffordBuilding(buildingType)) {
      this.notify('Not enough resources!', 'error');
      return;
    }
    this.buildMode = buildingType;
    this.closeScreen();
    this.notify(`Tap where to place the ${BUILDINGS[buildingType].name}.`, 'info');
  }

  placeBuildingAt(x: number, y: number, buildingType: BuildingType): void {
    const def = BUILDINGS[buildingType];
    if (!def) {
      this.buildMode = null;
      return;
    }
    if (!this.canAffordBuilding(buildingType)) {
      this.notify('Not enough resources!', 'error');
      this.buildMode = null;
      return;
    }
    if (!this.world.canPlaceBuilding(x, y, buildingType)) {
      this.notify('Cannot build there!', 'error');
      return;
    }
    // Deduct gold and materials
    this.player.spendMoney(def.cost);
    for (const mat of def.materials) {
      this.player.removeItem(mat.itemId, mat.quantity);
    }
    // Place
    if (this.world.placeBuilding(x, y, buildingType)) {
      this.notify(`Built ${def.name}! 🏗️`, 'success');
    } else {
      // Refund on failure
      this.player.addMoney(def.cost);
      for (const mat of def.materials) {
        this.player.addItem(mat.itemId, mat.quantity);
      }
      this.notify('Failed to build!', 'error');
    }
    this.buildMode = null;
  }

  cancelBuildMode(): void {
    this.buildMode = null;
  }

  // ============ Cooking ============
  canCook(recipeId: string): boolean {
    const recipe = COOKING_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;
    for (const inp of recipe.inputs) {
      if (!this.player.hasItem(inp.itemId, inp.quantity)) return false;
    }
    return true;
  }

  cook(recipeId: string): void {
    const recipe = COOKING_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;
    for (const inp of recipe.inputs) {
      if (!this.player.hasItem(inp.itemId, inp.quantity)) {
        this.notify(`Missing ${ITEMS[inp.itemId]?.name ?? inp.itemId}!`, 'error');
        return;
      }
    }
    for (const inp of recipe.inputs) {
      this.player.removeItem(inp.itemId, inp.quantity);
    }
    this.player.addItem(recipe.output.itemId, recipe.output.quantity);
    this.notify(`Cooked ${ITEMS[recipe.output.itemId]?.name ?? recipe.output.itemId}!`, 'success');
  }

  eatFood(itemId: string): void {
    const def = ITEMS[itemId];
    if (!def) return;
    if (def.category !== 'food' && itemId !== 'space_soup' && itemId !== 'energy_drink') {
      this.notify("That's not food!", 'warning');
      return;
    }
    if (!this.player.removeItem(itemId, 1)) {
      this.notify("You don't have that!", 'error');
      return;
    }
    let energy = 0;
    if (itemId === 'energy_drink') energy = 30;
    else if (itemId === 'space_soup') energy = 50;
    else {
      const recipe = COOKING_RECIPES.find(r => r.output.itemId === itemId);
      energy = recipe?.energy ?? 20;
    }
    this.player.restoreEnergy(energy);
    this.notify(`Ate ${def.name}. +${energy} energy!`, 'success');
  }

  // ============ House Decoration Mode ============
  startHouseDecorationMode(decorationId: string): void {
    this.houseDecorationMode = decorationId;
    this.notify(`Tap where to place ${ITEMS[decorationId]?.name ?? decorationId}`, 'info');
    this.closeScreen();
  }

  // ============ Fishing ============
  startFishing(): void {
    if (this.fishingState !== 'idle') return;
    if (this.player.consumeEnergy(3)) {
      this.fishingState = 'casting';
      this.fishingTimer = 0;
      this.callbacks.onFishingChange('casting');
      this.notify('Casting line...', 'info');
      setTimeout(() => {
        this.fishingState = 'waiting';
        this.fishingTimer = 0;
        this.callbacks.onFishingChange('waiting');
      }, 800);
    } else {
      this.notify('Too tired to fish!', 'warning');
    }
  }

  reelFish(): void {
    if (this.fishingState === 'biting') {
      // Check if bar is in the "catch zone" (30-70)
      if (this.fishingBar >= 25 && this.fishingBar <= 75) {
        // Success! Catch fish
        const fishId = FISH_POOL[Math.floor(Math.random() * FISH_POOL.length)];
        this.player.addItem(fishId, 1);
        const fish = FISH[fishId];
        this.notify(`Caught a ${fish.name}! Worth ${fish.value}g`, 'success');
        this.fishingState = 'caught';
        this.fishingTimer = 0;
        this.callbacks.onFishingChange('caught');
        this.checkQuestProgress('any_fish', 1);
        this.checkQuestProgress(fishId, 1);
        setTimeout(() => {
          this.fishingState = 'idle';
          this.callbacks.onFishingChange('idle');
        }, 1500);
      } else {
        this.fishingState = 'failed';
        this.fishingTimer = 0;
        this.callbacks.onFishingChange('failed');
        this.notify('The fish slipped away!', 'error');
        setTimeout(() => {
          this.fishingState = 'idle';
          this.callbacks.onFishingChange('idle');
        }, 1500);
      }
    } else if (this.fishingState === 'waiting') {
      // Reeled too early
      this.fishingState = 'failed';
      this.fishingTimer = 0;
      this.callbacks.onFishingChange('failed');
      this.notify('Too early! The fish escaped.', 'error');
      setTimeout(() => {
        this.fishingState = 'idle';
        this.callbacks.onFishingChange('idle');
      }, 1500);
    }
  }

  cancelFishing(): void {
    if (this.fishingState !== 'idle') {
      this.fishingState = 'idle';
      this.fishingTimer = 0;
      this.callbacks.onFishingChange('idle');
    }
  }

  // ============ NPC Interaction ============
  talkToNPC(npcId: NPCId): void {
    const npc = this.npcs[npcId];
    const def = NPCS[npcId];
    const dialog = def.dialogs[npc.dialogIndex % def.dialogs.length];
    npc.dialogIndex++;
    if (!npc.talkedToday) {
      npc.talkedToday = true;
      npc.friendship += 10;
    }
    this.talkedNpcs.add(npcId);
    this.currentDialog = { npcId, text: dialog, mode: 'talk' };
    this.activeNPC = npcId;
    this.callbacks.onDialogChange(npcId);
    // Check quest
    this.checkQuestProgress('talk_' + npcId, 1);
    if (this.talkedNpcs.size >= 4) {
      this.checkQuestProgress('all', 4);
    }
  }

  giftNPC(npcId: NPCId, itemId: string): void {
    const npc = this.npcs[npcId];
    if (npc.giftedToday) {
      this.notify(`${npc.name} already received a gift today.`, 'warning');
      return;
    }
    if (!this.player.removeItem(itemId, 1)) {
      this.notify('You don\'t have that item!', 'error');
      return;
    }
    npc.giftedToday = true;
    const reaction = getGiftReaction(npcId, itemId);
    const points = getGiftPoints(reaction);
    npc.friendship = Math.max(0, Math.min(1000, npc.friendship + points));
    const text = getReactionText(npcId, reaction);
    this.currentDialog = { npcId, text, mode: 'gift' };
    this.callbacks.onDialogChange(npcId);
    if (points > 0) {
      this.notify(`+${points} friendship with ${npc.name}!`, 'success');
    } else {
      this.notify(`${points} friendship with ${npc.name}.`, 'error');
    }
  }

  closeDialog(): void {
    this.currentDialog = null;
    this.activeNPC = null;
    this.callbacks.onDialogChange(null);
  }

  // ============ Screen Management ============
  openScreen(screen: GameScreen): void {
    this.screen = screen;
    this.callbacks.onScreenChange(screen);
  }

  closeScreen(): void {
    this.screen = null;
    this.callbacks.onScreenChange(null);
  }

  // ============ Shop ============
  buyItem(itemId: string, quantity: number = 1): void {
    const item = ITEMS[itemId];
    if (!item || item.buyValue <= 0) return;
    const cost = item.buyValue * quantity;
    if (this.player.spendMoney(cost)) {
      this.player.addItem(itemId, quantity);
      this.notify(`Bought ${quantity}x ${item.name} for ${cost}g`, 'success');
    } else {
      this.notify('Not enough money!', 'error');
    }
  }

  sellItem(itemId: string, quantity: number = 1): void {
    const item = ITEMS[itemId];
    if (!item || item.sellValue <= 0) return;
    if (!this.player.removeItem(itemId, quantity)) {
      this.notify('Not enough items to sell!', 'error');
      return;
    }
    const earnings = item.sellValue * quantity;
    this.player.addMoney(earnings);
    this.notify(`Sold ${quantity}x ${item.name} for ${earnings}g`, 'success');
    this.checkQuestProgress('sell_any', 1);
  }

  // ============ Crafting ============
  craft(recipeId: string): void {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;
    // Check inputs
    for (const input of recipe.inputs) {
      if (!this.player.hasItem(input.itemId, input.quantity)) {
        this.notify(`Missing ${ITEMS[input.itemId]?.name ?? input.itemId}!`, 'error');
        return;
      }
    }
    // Consume inputs
    for (const input of recipe.inputs) {
      this.player.removeItem(input.itemId, input.quantity);
    }
    // Add output
    this.player.addItem(recipe.output.itemId, recipe.output.quantity);
    this.notify(`Crafted ${ITEMS[recipe.output.itemId]?.name ?? recipe.output.itemId}!`, 'success');
    this.checkQuestProgress('craft_' + recipe.output.itemId, 1);
    if (recipe.output.itemId === 'iron_bar') {
      this.checkQuestProgress('iron_bar', 1);
    }
  }

  canCraft(recipeId: string): boolean {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;
    for (const input of recipe.inputs) {
      if (!this.player.hasItem(input.itemId, input.quantity)) return false;
    }
    return true;
  }

  // ============ Quests ============
  getQuests(): Quest[] {
    return this.quests;
  }

  acceptQuest(questId: string): void {
    const q = this.quests.find(q => q.id === questId);
    if (q && q.status === 'available') {
      q.status = 'active';
      this.notify(`Quest accepted: ${q.title}`, 'info');
    }
  }

  claimQuest(questId: string): void {
    const q = this.quests.find(q => q.id === questId);
    if (q && q.status === 'completed') {
      q.status = 'claimed';
      if (q.reward.money) this.player.addMoney(q.reward.money);
      if (q.reward.items) {
        for (const item of q.reward.items) {
          this.player.addItem(item.itemId, item.quantity);
        }
      }
      this.notify(`Quest reward claimed: ${q.title}`, 'success');
    }
  }

  checkQuestProgress(target: string, amount: number): void {
    for (const q of this.quests) {
      if (q.status !== 'active') continue;
      for (const obj of q.objectives) {
        if (obj.done) continue;
        if (obj.target === target || obj.target === 'any_crop' || obj.target === 'any_fish' || obj.target === 'any_forage') {
          if (obj.target === target || (obj.target === 'any_crop' && ITEMS[target]?.category === 'crop') ||
              (obj.target === 'any_fish' && ITEMS[target]?.category === 'fish') ||
              (obj.target === 'any_forage' && ITEMS[target]?.category === 'forage')) {
            obj.current = Math.min(obj.amount, obj.current + amount);
            if (obj.current >= obj.amount) {
              obj.done = true;
            }
          }
        }
        // Talk quests
        if (obj.type === 'talk' && obj.target === target) {
          obj.current = Math.min(obj.amount, obj.current + amount);
          if (obj.current >= obj.amount) obj.done = true;
        }
        if (obj.type === 'talk' && obj.target === 'all' && target.startsWith('talk_')) {
          obj.current = this.talkedNpcs.size;
          if (obj.current >= obj.amount) obj.done = true;
        }
        // Craft quests
        if (obj.type === 'craft' && (obj.target === target || target === obj.target)) {
          obj.current = Math.min(obj.amount, obj.current + amount);
          if (obj.current >= obj.amount) obj.done = true;
        }
        // Collect quests with specific item target
        if (obj.type === 'collect' && obj.target === target) {
          obj.current = Math.min(obj.amount, obj.current + amount);
          if (obj.current >= obj.amount) obj.done = true;
        }
      }
      // Check if all objectives done
      if (q.objectives.every(o => o.done) && q.status === 'active') {
        q.status = 'completed';
        this.notify(`Quest complete: ${q.title}! Claim your reward.`, 'success');
      }
    }
  }

  // ============ Day/Night Cycle ============
  sleep(): void {
    this.dayTransitioning = true;
    this.notify('You went to sleep. Good night!', 'info');
    this.advanceDay();
    this.dayTransitioning = false;
  }

  advanceDay(): void {
    this.gameTime.day++;
    this.gameTime.minutes = 360; // 6 AM

    // Change season every 14 days
    if (this.gameTime.day > 14) {
      this.gameTime.day = 1;
      const seasonIdx = SEASONS.indexOf(this.gameTime.season);
      const nextIdx = (seasonIdx + 1) % SEASONS.length;
      this.gameTime.season = SEASONS[nextIdx];
      if (nextIdx === 0) this.gameTime.year++;
      this.notify(`New season: ${SEASON_NAMES[this.gameTime.season]}! Year ${this.gameTime.year}`, 'info');
    }

    // Grow crops
    this.growCrops();

    // Restore energy
    this.player.stats.energy = this.player.stats.maxEnergy;
    this.player.stats.health = this.player.stats.maxHealth;

    // Reset NPC daily flags
    for (const npcId of Object.keys(this.npcs) as NPCId[]) {
      this.npcs[npcId].talkedToday = false;
      this.npcs[npcId].giftedToday = false;
    }

    // Spawn forage every few days
    if (this.gameTime.day % 3 === 0) {
      this.world.spawnForage(3);
    }

    // Clear watered tiles
    for (let y = 0; y < this.world.height; y++) {
      for (let x = 0; x < this.world.width; x++) {
        const t = this.world.tiles[y][x];
        t.watered = false;
        if (t.crop) t.crop.watered = false;
      }
    }

    this.notify(`Day ${this.gameTime.day} - ${SEASON_NAMES[this.gameTime.season]} Season`, 'info');
  }

  growCrops(): void {
    for (let y = 0; y < this.world.height; y++) {
      for (let x = 0; x < this.world.width; x++) {
        const t = this.world.tiles[y][x];
        if (t.crop && !t.crop.dead) {
          const def = CROPS[t.crop.cropId];
          if (def) {
            if (def.seasons.includes(this.gameTime.season)) {
              if (t.watered || t.crop.watered) {
                t.crop.daysGrown++;
                if (t.crop.daysGrown >= def.growthDays) {
                  t.crop.stage = t.crop.maxStage;
                  t.crop.harvestable = true;
                } else {
                  t.crop.stage = Math.floor((t.crop.daysGrown / def.growthDays) * t.crop.maxStage);
                }
              }
            } else {
              // Wrong season - crop dies
              t.crop.dead = true;
            }
          }
        }
      }
    }
  }

  passOut(): void {
    this.notify('You passed out from exhaustion!', 'error');
    this.advanceDay();
    this.player.stats.energy = Math.floor(this.player.stats.maxEnergy * 0.5);
    this.player.stats.money = Math.max(0, this.player.stats.money - 50);
  }

  // ============ Notifications ============
  notify(text: string, type: Notification['type'] = 'info'): void {
    const n: Notification = {
      id: ++notifId,
      text,
      type,
      timeout: 3000,
    };
    this.notifications.push(n);
    this.callbacks.onNotification(n);
    // Auto-remove after timeout
    setTimeout(() => {
      this.notifications = this.notifications.filter(nn => nn.id !== n.id);
      this.callbacks.onStateChange();
    }, n.timeout);
  }

  // ============ Tool selection ============
  setTool(tool: Tool): void {
    this.player.setTool(tool);
    this.notify(`Tool: ${tool}`, 'info');
  }

  // ============ Decoration mode ============
  startDecorationMode(decorationId: string): void {
    this.decorationMode = decorationId;
    this.notify(`Tap where to place ${DECORATIONS[decorationId]?.name ?? decorationId}`, 'info');
    this.closeScreen();
  }

  buyDecoration(decorationId: string): boolean {
    const def = DECORATIONS[decorationId];
    if (!def) return false;
    if (this.player.spendMoney(def.cost)) {
      this.startDecorationMode(decorationId);
      return true;
    } else {
      this.notify('Not enough money!', 'error');
      return false;
    }
  }

  // ============ Helpers for UI ============
  getNPCHearts(npcId: NPCId): number {
    return Math.floor(this.npcs[npcId].friendship / 100);
  }

  getEnergyPercent(): number {
    return (this.player.stats.energy / this.player.stats.maxEnergy) * 100;
  }

  isNight(): boolean {
    const h = Math.floor(this.gameTime.minutes / 60);
    return h >= 18 || h < 6;
  }

  getTimeColor(): string {
    const h = Math.floor(this.gameTime.minutes / 60);
    if (h >= 6 && h < 12) return '#ffeeaa'; // morning
    if (h >= 12 && h < 18) return '#ffdd88'; // afternoon
    if (h >= 18 && h < 20) return '#ff9966'; // evening
    return '#4466aa'; // night
  }

  getSeasonName(): string {
    return SEASON_NAMES[this.gameTime.season];
  }

  getSeasonColor(): string {
    switch (this.gameTime.season) {
      case 'nebula': return '#9966ff';
      case 'aurora': return '#44ffaa';
      case 'ember': return '#ff6644';
      case 'frost': return '#66ccff';
      default: return '#ffffff';
    }
  }

  // Context-sensitive action label
  getActionLabel(): string {
    const facing = this.player.getFacingTile();

    if (this.world.isInMine()) {
      const t = this.world.getMineTile(facing.x, facing.y);
      if (t?.type === 'mine_rock') return 'Mine';
      if (t?.decorationId === 'mine_exit') return 'Exit';
      return 'Action';
    }

    // House interior labels
    if (this.world.isInHouse()) {
      if (this.houseDecorationMode) return 'Place';
      const t = this.world.getHouseTile(facing.x, facing.y);
      if (!t) return 'Action';
      switch (t.decorationId) {
        case 'bed': return 'Sleep';
        case 'door': return 'Exit';
        case 'chest': return 'Storage';
        case 'stove':
        case 'counter': return 'Cook';
        default: return 'Action';
      }
    }

    // Check NPC
    for (const npcId of Object.keys(this.npcs) as NPCId[]) {
      const npc = this.npcs[npcId];
      if (npc.pos.x === facing.x && npc.pos.y === facing.y) return 'Talk';
    }

    const tile = this.world.getTile(facing.x, facing.y);
    if (!tile) return 'Action';

    if (this.buildMode) return `Place ${BUILDINGS[this.buildMode]?.name ?? 'Building'}`;
    if (this.decorationMode) return 'Place';

    if (tile.decorationId === 'shop') return 'Shop';
    if (tile.decorationId === 'house') return 'Enter';
    if (tile.decorationId === 'mine_entrance') return 'Enter Mine';
    if (tile.forageId) return 'Forage';
    if (tile.type === 'water' || this.world.isAdjacentToWater(facing.x, facing.y)) {
      if (this.fishingState !== 'idle') return 'Reel';
      return 'Fish';
    }
    if (tile.type === 'crop' && tile.crop) {
      if (tile.crop.harvestable) return 'Harvest';
      if (!tile.watered) return 'Water';
      return 'Wait';
    }
    if (tile.type === 'tilled') {
      if (!tile.watered) return 'Water';
      return 'Plant';
    }
    if (tile.type === 'grass' || tile.type === 'floor') {
      if (this.player.tool === 'hoe') return 'Till';
    }
    if (tile.type === 'rock') return 'Mine';

    return 'Action';
  }
}