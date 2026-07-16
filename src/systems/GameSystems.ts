import * as typegpu from 'typegpu'
import { GameWorld, Camera } from '../engine'
import { GameState, BuildingType, ControllerType } from '../types/game'

// Colony System class
export class ColonySystem {
  readonly gameState: GameState
  readonly scene: GameWorld

  constructor(world: GameWorld) {
    this.scene = world
    this.gameState = {
      time: 0,
      resources: { ore: 0, water: 0, energy: 0 },
      buildings: [],
      villagerCount: 0,
      selectedBuilding: null
    }
  }

  addBuilding(type: BuildingType, position: { x: number; z: number }): void {
    const id = `building_${type}_${Date.now()}_${Math.random()}`
    const building = { id, type, position, mesh: null }

    this.gameState.buildings.push(building)
    console.log(`🏗️ Added ${type} at ${position.x}, ${position.z}`)
  }

  gatherResources(): void {
    const resources = ['ore', 'water', 'energy']
    for (const res of resources) {
      this.gameState.resources[res]++
    }
    console.log(`⛏️ Resourced: ${resources}`)
  }

  showInventory(): void {
    console.log('🎒 Space Colony Inventory:')
    console.log(`  - Ore: ${this.gameState.resources.ore}`)
    console.log(`  - Water: ${this.gameState.resources.water}`)
    console.log(`  - Energy: ${this.gameState.resources.energy}`)
    console.log(`  - Buildings: ${this.gameState.buildings.length}`)
    console.log(`  - Colonists: ${this.gameState.villagerCount}`)
  }

  selectBuilding(buildingType: BuildingType): void {
    this.gameState.selectedBuilding = buildingType
  }

  deselectBuilding(): void {
    this.gameState.selectedBuilding = null
  }

  getGameState(): GameState {
    return this.gameState
  }

  update(delta: number): void {
    // Update time
    this.gameState.time += delta * 1000
    if (this.gameState.time >= 24000) {
      this.gameState.time = 0
    }
  }
}

// Villager System class
export class VillagerSystem {
  readonly scene: GameWorld
  private villagers: any[] = []

  constructor(world: GameWorld) {
    this.scene = world
  }

  addVillager(name: string, position?: { x: number; z: number }): void {
    const id = `villager_${name}_${Date.now()}`
    const defaultPosition = { x: (Math.random() - 0.5) * 8, z: (Math.random() - 0.5) * 8 }

    const villager = {
      id,
      name,
      mood: 'neutral',
      currentActivity: 'idle',
      position: position || defaultPosition
    }

    this.villagers.push(villager)
    console.log(`🦊 ${name} registered as space crew member`)
  }

  async generateMotion(prompt: string, character: string, activity: string): Promise<any> {
    console.log(`🚀 Generating motion for ${character}: ${prompt}`)

    try {
      // ARDY API call placeholder
      await new Promise(resolve => setTimeout(resolve, 500))
      return { motionData: [], fps: 60, duration: 2.0 }
    } catch (error) {
      console.error('ARDY motion generation failed:', error)
      return { motionData: [], fps: 60, duration: 0 }
    }
  }

  updateBehavior(): void {
    // AI behavior update
  }

  update(delta: number): void {
    this.updateBehavior()
  }

  getVillagers(): any[] {
    return this.villagers
  }
}

// Resource System class
export class ResourceSystem {
  readonly gameState: { ore: number; water: number; energy: number }

  constructor() {
    this.gameState = { ore: 0, water: 0, energy: 0 }
  }

  addResource(type: 'ore' | 'water' | 'energy', amount: number = 1): void {
    if (type in this.gameState) {
      this.gameState[type as keyof typeof this.gameState] += amount
    }
  }

  getResource(type: 'ore' | 'water' | 'energy'): number {
    return this.gameState[type]
  }

  update(delta: number): void {
    // Resource regeneration
  }

  getGameState() {
    return this.gameState
  }
}

// Time System class
export class TimeSystem {
  readonly gameState: { time: number }

  constructor() {
    this.gameState = { time: 0 }
  }

  update(delta: number): void {
    // Time progression (4 minutes = 24 hours)
    const hoursPerSecond = 1 / 4
    this.gameState.time += delta * hoursPerSecond * 1000
    if (this.gameState.time >= 24000) {
      this.gameState.time = 0
    }
  }

  getGameState() {
    return this.gameState
  }

  getTimeString() {
    const hours = Math.floor(this.gameState.time / 1000)
    const minutes = Math.floor((this.gameState.time % 1000) / 100)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }
}

// Input System class - Game Controller Support
export class InputSystem {
  private gamepads: Map<number, GamepadState> = new Map()
  private activeController: GamepadState | null = null
  private controllerType: ControllerType = 'generic'

  constructor() {
    this.setupInputListeners()
  }

  private setupInputListeners(): void {
    // Gamepad connection listener
    window.addEventListener('gamepadconnected', (e) => {
      console.log(`🎮 Gamepad connected: ${e.gamepad.id}`)
      this.controllerType = this.detectControllerType(e.gamepad)
      this.gamepads.set(e.gamepad.index, {
        index: e.gamepad.index,
        id: e.gamepad.id,
        buttons: e.gamepad.buttons.map(b => b.pressed),
        axes: e.gamepad.axes
      })
    })

    // Gamepad disconnection listener
    window.addEventListener('gamepaddisconnected', (e) => {
      console.log(`🎮 Gamepad disconnected: ${e.gamepad.id}`)
      this.gamepads.delete(e.gamepad.index)
      if (this.gamepads.size === 0) {
        this.activeController = null
      }
    })
  }

  private detectControllerType(gamepad: Gamepad): ControllerType {
    const id = gamepad.id.toLowerCase()
    if (id.includes('xbox')) return 'xbox'
    if (id.includes('playstation') || id.includes('dualshock') || id.includes('dualsense')) {
      return 'playstation'
    }
    if (id.includes('nintendo') || id.includes('switch')) return 'switch'
    return 'generic'
  }

  private updateGamepads(): void {
    const gamepads = navigator.getGamepads()
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i]
      if (gp) {
        this.activeController = {
          index: gp.index,
          id: gp.id,
          buttons: gp.buttons.map(b => b.pressed),
          axes: gp.axes
        }
      }
    }
  }

  update(): void {
    this.updateGamepads()
  }

  // Controller action handlers
  isButtonPressed(button: string): boolean {
    if (!this.activeController) return false

    const mappings = this.getControllerMappings()
    return this.activeController.buttons[mappings.buttons[button as keyof typeof mappings.buttons] || 0] ||
           this.activeController.buttons[this.mapButtonToIndex(button) || 0]
  }

  // Get action from current controller input
  getAction(): string | null {
    if (!this.activeController) return null

    const mappings = this.getControllerMappings()

    // Check buttons
    for (const [buttonName, action] of Object.entries(mappings.buttons)) {
      if (this.activeController.buttons[buttonName as keyof GamepadState['buttons']] !== undefined) {
        if (this.activeController.buttons[buttonName as keyof GamepadState['buttons']]) {
          return action
        }
      }
    }

    return null
  }

  getControllerMappings(): any {
    switch (this.controllerType) {
      case 'xbox':
        return window.XBOX_MAPPING || { buttons: {} }
      case 'playstation':
        return window.PLAYSTATION_MAPPING || { buttons: {} }
      case 'switch':
        return window.SWITCH_MAPPING || { buttons: {} }
      default:
        return { buttons: {} }
    }
  }

  getControllerType(): ControllerType {
    return this.controllerType
  }

  getGamepadState(index: number): GamepadState | undefined {
    return this.gamepads.get(index)
  }

  getActiveGamepad(): GamepadState | null {
    return this.activeController
  }

  // Button index mapping
  private mapButtonToIndex(buttonName: string): number | null {
    const index = ['A', 'B', 'X', 'Y', 'DpadUp', 'DpadDown', 'LB', 'RB', 'LT', 'RT', 'Menu', 'Select']
      .findIndex(name => name.toUpperCase() === buttonName.toUpperCase())
    return index >= 0 ? index : null
  }
}

// Gamepad State interface
interface GamepadState {
  index: number
  id: string
  buttons: boolean[]
  axes: number[]
}