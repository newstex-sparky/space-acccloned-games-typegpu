/**
 * Xbox Controller Configuration
 * Based on Xbox 360/One gamepad mappings
 */

export const XBOX_BUTTONS = {
  A: 0,      // Green button - Primary action
  B: 1,      // Red button - Secondary action
  X: 2,      // Blue button - Tertiary action
  Y: 3,      // Yellow button - Quaternary action
  DPadUp: 12,
  DPadDown: 13,
  LB: 4,     // Left bumper - Menu
  RB: 5,     // Right bumper - Inventory
  LT: 6,     // Left trigger - Zoom in
  RT: 7,     // Right trigger - Zoom out
  Menu: 10,  // View button - Pause
  Select: 8   // Back button - Inventory
}

export const XBOX_AXES = {
  LeftThumbstickX: 0,
  LeftThumbstickY: 1,
  RightThumbstickX: 2,
  RightThumbstickY: 3,
  LeftTrigger: 4,
  RightTrigger: 5
}

/**
 * Action mappings for Xbox controllers
 */
export const XBOX_ACTIONS = {
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
}

/**
 * Helper function to map Xbox button indices to actions
 */
export function getXboxAction(buttonIndex: number): string | null {
  const actions: { [key: number]: string } = {
    [XBOX_BUTTONS.A]: 'gather_resources',
    [XBOX_BUTTONS.B]: 'build_house',
    [XBOX_BUTTONS.X]: 'build_workshop',
    [XBOX_BUTTONS.Y]: 'build_hangar',
    [XBOX_BUTTONS.LB]: 'pause',
    [XBOX_BUTTONS.RB]: 'inventory',
    [XBOX_BUTTONS.Menu]: 'pause',
    [XBOX_BUTTONS.Select]: 'inventory'
  }
  return actions[buttonIndex] || null
}

/**
 * Helper function to get trigger actions
 */
export function getTriggerAction(triggerIndex: number, isLeft: boolean): string | null {
  if (isLeft && triggerIndex === XBOX_AXES.LeftTrigger) {
    return 'zoom_in'
  }
  if (!isLeft && triggerIndex === XBOX_AXES.RightTrigger) {
    return 'zoom_out'
  }
  return null
}