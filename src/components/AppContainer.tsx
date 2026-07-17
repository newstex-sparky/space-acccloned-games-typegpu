import * as React from 'react'
import './App.css'
import { BuildingType } from '../types/game'

interface GameStateDisplayProps {
  gameState: {
    time: number
    resources: { ore: number; water: number; energy: number }
    buildings: any[]
    villagerCount: number
  }
  showInventory: boolean
  onToggleInventory: () => void
}

export const GameStateDisplay: React.FC<GameStateDisplayProps> = ({
  gameState,
  showInventory,
  onToggleInventory
}) => {
  const hours = Math.floor(gameState.time / 1000)
  const minutes = Math.floor((gameState.time % 1000) / 100)

  return (
    <div className="game-state-panel">
      <div className="time-display">
        <span className="time-label">⏰ Time:</span>
        <span className="time-value">{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}</span>
      </div>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">⛏️ Ore</span>
          <span className="stat-value">{gameState.resources.ore}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">💧 Water</span>
          <span className="stat-value">{gameState.resources.water}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">⚡ Energy</span>
          <span className="stat-value">{gameState.resources.energy}</span>
        </div>
      </div>
      <button className="toggle-inventory" onClick={onToggleInventory}>
        🎒 Inventory
      </button>
    </div>
  )
}

interface ActionButtonsProps {
  onGather: () => void
  onBuild: (type: BuildingType) => void
  onAddVillager: () => void
  controllerConnected: boolean
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onGather,
  onBuild,
  onAddVillager,
  controllerConnected
}) => {
  const controllerHint = controllerConnected ? (
    <span className="controller-hint">🎮 Controller ready</span>
  ) : null

  return (
    <div className="action-buttons">
      {controllerHint}
      <button className="action-button gather-button" onClick={onGather}>
        ⛏️ Gather Resources
      </button>
      <button className="action-button" onClick={() => onBuild('house')}>
        🏠 Build House
      </button>
      <button className="action-button" onClick={() => onBuild('workshop')}>
        🔧 Build Workshop
      </button>
      <button className="action-button" onClick={() => onBuild('hangar')}>
        🏗️ Build Hangar
      </button>
      <button className="action-button add-villager-button" onClick={onAddVillager}>
        🦊 Add Colonist
      </button>
    </div>
  )
}

interface AppContainerProps {
  children: React.ReactNode
}

export const AppContainer: React.FC<AppContainerProps> = ({ children }) => (
  <div className="app-container">{children}</div>
)