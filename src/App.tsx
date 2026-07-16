import * as React from 'react'
import { AppContainer } from './components/AppContainer'
import { GameStateDisplay } from './components/GameStateDisplay'
import { ActionButtons } from './components/ActionButtons'
import { InputSystem, ControllerType } from '../systems/GameSystems'
import { GameWorld, ColonySystem, VillagerSystem, ResourceSystem, TimeSystem, TypeGPURenderer } from '../engine'
import { GameState, BuildingType } from '../types/game'

interface AppProps {
  world: GameWorld
  colony: ColonySystem
  villagers: VillagerSystem
  resources: ResourceSystem
  time: TimeSystem
  input: InputSystem
  renderer: TypeGPURenderer
}

export const App: React.FC<AppProps> = ({
  world,
  colony,
  villagers,
  resources,
  time,
  input,
  renderer
}) => {
  const [gameState, setGameState] = React.useState<GameState>(colony.getGameState())
  const [showInventory, setShowInventory] = React.useState(false)
  const [controllerConnected, setControllerConnected] = React.useState(false)
  const [controllerType, setControllerType] = React.useState<ControllerType | null>(null)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setGameState(colony.getGameState())
    }, 1000)
    return () => clearInterval(interval)
  }, [colony])

  React.useEffect(() => {
    const checkController = setInterval(() => {
      const activeGamepad = input.getActiveGamepad()
      if (activeGamepad) {
        if (!controllerConnected) {
          setControllerConnected(true)
          setControllerType(input.getControllerType())
        }
      } else {
        setControllerConnected(false)
      }
    }, 500)
    return () => clearInterval(checkController)
  }, [input, controllerConnected])

  const handleGather = () => {
    colony.gatherResources()
  }

  const handleBuild = (type: BuildingType) => {
    const position = { x: (Math.random() - 0.5) * 6, z: (Math.random() - 0.5) * 6 }
    colony.addBuilding(type, position)
  }

  const addRandomVillager = () => {
    const names = ['Nova', 'Cora', 'Quinn', 'Rex', 'Zara', 'Luna', 'Atlas', 'Nebula']
    const name = names[Math.floor(Math.random() * names.length)]
    villagers.addVillager(name)
  }

  return (
    <AppContainer>
      {controllerConnected && (
        <div className="controller-connected">
          🎮 {controllerType.toUpperCase()} Controller Connected
        </div>
      )}

      <GameStateDisplay
        gameState={gameState}
        showInventory={showInventory}
        onToggleInventory={() => setShowInventory(!showInventory)}
      />

      {showInventory && (
        <div className="inventory-panel">
          <h3>🎒 Space Colony Inventory</h3>
          <p>Ore: {gameState.resources.ore}</p>
          <p>Water: {gameState.resources.water}</p>
          <p>Energy: {gameState.resources.energy}</p>
          <p>Buildings: {gameState.buildings.length}</p>
          <p>Colonists: {gameState.villagerCount}</p>
        </div>
      )}

      <ActionButtons
        onGather={handleGather}
        onBuild={handleBuild}
        onAddVillager={addRandomVillager}
        controllerConnected={controllerConnected}
      />

      <div className="villager-list">
        <h3>🦊 Space Crew ({gameState.villagerCount})</h3>
        {gameState.villagerCount === 0 && <p>No colonists yet</p>}
      </div>
    </AppContainer>
  )
}