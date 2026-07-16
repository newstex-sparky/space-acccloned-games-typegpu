export interface GameState {
  time: number        // 0-24000 (4 min = 24 hours)
  resources: {
    ore: number
    water: number
    energy: number
  }
  buildings: Building[]
  villagerCount: number
  selectedBuilding: BuildingType | null
}

export type BuildingType = 'house' | 'workshop' | 'hangar' | 'observation'

export interface Building {
  id: string
  type: BuildingType
  position: { x: number; z: number }
  mesh: any // TypeGPU mesh reference
}

export interface Villager {
  id: string
  name: string
  mood: 'happy' | 'neutral' | 'tired'
  currentActivity: 'idle' | 'work' | 'social'
  position: { x: number; z: number }
}

export type ControllerType = 'xbox' | 'playstation' | 'switch' | 'generic'

export interface ControllerMapping {
  buttons: {
    A: string
    B: string
    X: string
    Y: string
    DPadUp: string
    DPadDown: string
    LB: string
    RB: string
    LT: string
    RT: string
    Menu: string
    Select: string
  }
  triggers: {
    L: string
    R: string
  }
}

export interface ARDYRequest {
  prompt: string
  character: string
  activity: string
}

export interface ARDYResponse {
  motionData: Float32Array[]
  fps: number
  duration: number
}

// Controller mappings
export const XBOX_MAPPING: ControllerMapping = {
  buttons: {
    A: 'gather_resources',
    B: 'build_house',
    X: 'build_workshop',
    Y: 'build_hangar',
    DPadUp: 'scroll_up',
    DPadDown: 'scroll_down',
    LB: 'pause',
    RB: 'inventory',
    LT: 'zoom_in',
    RT: 'zoom_out',
    Menu: 'pause',
    Select: 'inventory'
  },
  triggers: {
    L: 'zoom_in',
    R: 'zoom_out'
  }
}

export const PLAYSTATION_MAPPING: ControllerMapping = {
  buttons: {
    Cross: 'gather_resources',
    Square: 'build_house',
    Triangle: 'build_workshop',
    Circle: 'build_hangar',
    DPadUp: 'scroll_up',
    DPadDown: 'scroll_down',
    L1: 'pause',
    R1: 'inventory',
    L2: 'zoom_in',
    R2: 'zoom_out',
    Options: 'pause',
    TouchPad: 'inventory'
  },
  triggers: {
    L: 'zoom_in',
    R: 'zoom_out'
  }
}

export const SWITCH_MAPPING: ControllerMapping = {
  buttons: {
    B: 'gather_resources',
    A: 'build_house',
    X: 'build_workshop',
    Y: 'build_hangar',
    DPadUp: 'scroll_up',
    DPadDown: 'scroll_down',
    L: 'pause',
    R: 'inventory',
    LStick: 'zoom',
    RStick: 'pan',
    '-': 'pause',
    '+': 'inventory'
  },
  triggers: {
    L: 'zoom',
    R: 'zoom'
  }
}