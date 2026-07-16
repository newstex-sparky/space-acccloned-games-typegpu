/**
 * PlayStation Controller Configuration
 * Based on DualShock/DualSense mappings
 */

export const PLAYSTATION_BUTTONS = {
  Cross: 0,      // Green button - Primary action
  Square: 1,     // Red button - Secondary action
  Triangle: 2,   // Blue button - Tertiary action
  Circle: 3,     // Yellow button - Quaternary action
  DPadUp: 12,
  DPadDown: 13,
  L1: 4,         // Left shoulder button
  R1: 5,         // Right shoulder button
  L2: 6,         // Left trigger
  R2: 7,         // Right trigger
  Options: 10,   // Create button - Pause
  TouchPad: 11   // TouchPad - Inventory
}

export const PLAYSTATION_AXES = {
  LeftThumbstickX: 0,
  LeftThumbstickY: 1,
  RightThumbstickX: 2,
  RightThumbstickY: 3,
  LeftTrigger: 4,
  RightTrigger: 5
}

/**
 * Action mappings for PlayStation controllers
 */
export const PLAYSTATION_ACTIONS = {
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
}

/**
 * Helper function to map PlayStation button indices to actions
 */
export function getPlayStationAction(buttonIndex: number): string | null {
  const actions: { [key: number]: string } = {
    [PLAYSTATION_BUTTONS.Cross]: 'gather_resources',
    [PLAYSTATION_BUTTONS.Square]: 'build_house',
    [PLAYSTATION_BUTTONS.Triangle]: 'build_workshop',
    [PLAYSTATION_BUTTONS.Circle]: 'build_hangar',
    [PLAYSTATION_BUTTONS.L1]: 'pause',
    [PLAYSTATION_BUTTONS.R1]: 'inventory',
    [PLAYSTATION_BUTTONS.Options]: 'pause',
    [PLAYSTATION_BUTTONS.TouchPad]: 'inventory'
  }
  return actions[buttonIndex] || null
}

/**
 * Helper function to get trigger actions
 */
export function getPlayStationTriggerAction(triggerIndex: number, isLeft: boolean): string | null {
  if (isLeft && triggerIndex === PLAYSTATION_AXES.LeftTrigger) {
    return 'zoom_in'
  }
  if (!isLeft && triggerIndex === PLAYSTATION_AXES.RightTrigger) {
    return 'zoom_out'
  }
  return null
}