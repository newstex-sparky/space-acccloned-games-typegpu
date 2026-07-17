import type { Vec2, Tool, PlayerStats, InventorySlot, ItemStack } from './types';

export class Player {
  pos: Vec2;
  pixelPos: Vec2;
  speed = 3.5;
  facing: 'up' | 'down' | 'left' | 'right' = 'down';
  tool: Tool = 'hoe';
  stats: PlayerStats;
  inventory: InventorySlot[];
  inventorySize = 24;
  selectedSlot = 0;
  moving = false;
  animFrame = 0;
  animTimer = 0;

  // Movement input from joystick
  moveInput: Vec2 = { x: 0, y: 0 };

  constructor(startX: number, startY: number) {
    this.pos = { x: startX, y: startY };
    this.pixelPos = { x: startX * 32, y: startY * 32 };
    this.stats = {
      energy: 100,
      maxEnergy: 100,
      health: 50,
      maxHealth: 50,
      money: 500,
    };
    this.inventory = this.initInventory();
  }

  private initInventory(): InventorySlot[] {
    const slots: InventorySlot[] = [];
    for (let i = 0; i < this.inventorySize; i++) {
      slots.push({ item: null });
    }
    // Starter items
    slots[0] = { item: { itemId: 'astro_carrot_seed', quantity: 15 } };
    slots[1] = { item: { itemId: 'lunar_potato_seed', quantity: 10 } };
    slots[2] = { item: { itemId: 'energy_drink', quantity: 2 } };
    return slots;
  }

  setMoveInput(x: number, y: number): void {
    this.moveInput.x = x;
    this.moveInput.y = y;
    if (x !== 0 || y !== 0) {
      if (Math.abs(x) > Math.abs(y)) {
        this.facing = x > 0 ? 'right' : 'left';
      } else {
        this.facing = y > 0 ? 'down' : 'up';
      }
    }
  }

  update(deltaTime: number, world: { isWalkable: (x: number, y: number) => boolean; getActiveWidth: () => number; getActiveHeight: () => number }): void {
    const mx = this.moveInput.x;
    const my = this.moveInput.y;
    const mag = Math.sqrt(mx * mx + my * my);

    if (mag > 0.1) {
      this.moving = true;
      this.animTimer += deltaTime;
      if (this.animTimer > 150) {
        this.animFrame = (this.animFrame + 1) % 4;
        this.animTimer = 0;
      }

      const nx = mx / mag;
      const ny = my / mag;
      const dx = nx * this.speed * (deltaTime / 16.67);
      const dy = ny * this.speed * (deltaTime / 16.67);

      // Try X movement
      const newPixelX = this.pixelPos.x + dx;
      const tileX = Math.floor((newPixelX + 16) / 32);
      const tileY = Math.floor((this.pixelPos.y + 16) / 32);
      if (tileX >= 0 && tileX < world.getActiveWidth() && world.isWalkable(tileX, tileY)) {
        this.pixelPos.x = newPixelX;
      }

      // Try Y movement
      const newPixelY = this.pixelPos.y + dy;
      const tileX2 = Math.floor((this.pixelPos.x + 16) / 32);
      const tileY2 = Math.floor((newPixelY + 16) / 32);
      if (tileY2 >= 0 && tileY2 < world.getActiveHeight() && world.isWalkable(tileX2, tileY2)) {
        this.pixelPos.y = newPixelY;
      }

      this.pos.x = Math.floor((this.pixelPos.x + 16) / 32);
      this.pos.y = Math.floor((this.pixelPos.y + 16) / 32);
    } else {
      this.moving = false;
      this.animFrame = 0;
    }
  }

  getFacingTile(): Vec2 {
    switch (this.facing) {
      case 'up': return { x: this.pos.x, y: this.pos.y - 1 };
      case 'down': return { x: this.pos.x, y: this.pos.y + 1 };
      case 'left': return { x: this.pos.x - 1, y: this.pos.y };
      case 'right': return { x: this.pos.x + 1, y: this.pos.y };
      default: return { x: this.pos.x, y: this.pos.y + 1 };
    }
  }

  setTool(tool: Tool): void {
    this.tool = tool;
  }

  consumeEnergy(amount: number): boolean {
    if (this.stats.energy < amount) {
      this.stats.energy = 0;
      return false;
    }
    this.stats.energy -= amount;
    return true;
  }

  restoreEnergy(amount: number): void {
    this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + amount);
  }

  addMoney(amount: number): void {
    this.stats.money += amount;
  }

  spendMoney(amount: number): boolean {
    if (this.stats.money < amount) return false;
    this.stats.money -= amount;
    return true;
  }

  // Inventory management
  addItem(itemId: string, quantity: number): number {
    let remaining = quantity;
    // First try to stack into existing slots
    for (const slot of this.inventory) {
      if (slot.item && slot.item.itemId === itemId) {
        slot.item.quantity += remaining;
        return 0;
      }
    }
    // Then find empty slot
    for (const slot of this.inventory) {
      if (!slot.item) {
        slot.item = { itemId, quantity: remaining };
        return 0;
      }
    }
    return remaining; // couldn't add all
  }

  removeItem(itemId: string, quantity: number): boolean {
    let count = quantity;
    for (const slot of this.inventory) {
      if (slot.item && slot.item.itemId === itemId) {
        const take = Math.min(slot.item.quantity, count);
        slot.item.quantity -= take;
        count -= take;
        if (slot.item.quantity <= 0) slot.item = null;
        if (count <= 0) return true;
      }
    }
    return count <= 0;
  }

  countItem(itemId: string): number {
    let total = 0;
    for (const slot of this.inventory) {
      if (slot.item && slot.item.itemId === itemId) {
        total += slot.item.quantity;
      }
    }
    return total;
  }

  getSelectedItem(): ItemStack | null {
    return this.inventory[this.selectedSlot]?.item ?? null;
  }

  hasItem(itemId: string, qty: number = 1): boolean {
    return this.countItem(itemId) >= qty;
  }

  isExhausted(): boolean {
    return this.stats.energy <= 0;
  }
}