/**
 * Nintendo Switch Controller Configuration
 * Based on Pro Controller mappings
 */

export const SWITCH_BUTTONS = {
  B: 0,          // Red button (left) - Primary action
  A: 1,          // Green button (right) - Secondary action
  X: 2,          // Blue button (left) - Tertiary action
  Y: 3,          # Yellow button (right) - Quaternary action
  DPadUp: 12,
  DPadDown: 13,
  L: 4,          # Left shoulder button
  R: 5,          # Right shoulder button
  LStick: 11,    # Left stick click
  RStick: 12,    # Right stick click
  Minus: 8,      # - button
  Plus: 9        # + button
}

export const SWITCH_AXES = {
  LeftThumbstickX: 0,
  LeftThumbstickY: 1,
  RightThumbstickX: 2,
  RightThumbstickY: 3,
  // Triggers handled as buttons for Switch Pro Controller
}

/**
 * Action mappings for Nintendo Switch controllers
 */
export const SWITCH_ACTIONS = {
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
  Minus: 'pause',
  Plus: 'inventory'
}

/**
 * Helper function to map Switch button indices to actions
 */
export function getSwitchAction(buttonIndex: number): string | null {
  const actions: { [key: number]: string } = {
    [SWITCH_BUTTONS.B]: 'gather_resources',
    [SWITCH_BUTTONS.A]: 'build_house',
    [SWITCH_BUTTONS.X]: 'build_workshop',
    [SWITCH_BUTTONS.Y]: 'build_hangar',
    [SWITCH_BUTTONS.L]: 'pause',
    [SWITCH_BUTTONS.R]: 'inventory',
    [SWITCH_BUTTONS.Minus]: 'pause',
    [SWITCH_BUTTONS.Plus]: 'inventory'
  }
  return actions[buttonIndex] || null
}

/**
 * Helper function for Switch trigger actions (using L/R buttons as zoom)
 */
export function getSwitchTriggerAction(buttonIndex: number, isLeft: boolean): string | null {
  if (buttonIndex === SWITCH_BUTTONS.L) {
    return isLeft ? 'zoom_in' : null
  }
  if (buttonIndex === SWITCH_BUTTONS.R) {
    return isLeft ? null : 'zoom_out'
  }
  return null
}