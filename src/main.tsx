import * as typegpu from 'typegpu'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { GameWorld, TypeGPURenderer } from './engine'
import { ColonySystem, VillagerSystem, ResourceSystem, TimeSystem, InputSystem } from './systems'

// Check WebGPU support
const checkWebGPUSupport = (): boolean => {
  if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
    return true
  }
  return false
}

// Initialize game systems
async function init() {
  console.log('🚀 Initializing Space Acccloned...')

  // Check WebGPU support
  if (!checkWebGPUSupport()) {
    console.warn('⚠️ WebGPU not supported')
    const warning = document.getElementById('webgpu-warning')
    if (warning) warning.classList.add('show')
    return
  }

  // Hide loading screen
  setTimeout(() => {
    const loading = document.getElementById('loading-screen')
    if (loading) loading.classList.add('hidden')
  }, 2000)

  // Initialize TypeGPU
  const canvas = document.createElement('canvas')
  canvas.id = 'webgpu-canvas'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  const canvasContainer = document.getElementById('canvas-container')
  if (canvasContainer) canvasContainer.appendChild(canvas)

  const renderer = new TypeGPURenderer(canvas)
  await renderer.init()

  // Initialize game systems
  const gameWorld = new GameWorld(canvas)
  const colonySystem = new ColonySystem(gameWorld)
  const villagerSystem = new VillagerSystem(gameWorld)
  const resourceSystem = new ResourceSystem()
  const timeSystem = new TimeSystem()
  const inputSystem = new InputSystem()

  // React app root
  const container = document.getElementById('ui-layer')!
  const root = createRoot(container)
  root.render(
    <App
      world={gameWorld}
      colony={colonySystem}
      villagers={villagerSystem}
      resources={resourceSystem}
      time={timeSystem}
      input={inputSystem}
      renderer={renderer}
    />
  )

  // Animation loop
  let lastTime = performance.now()
  function animate() {
    requestAnimationFrame(animate)

    const now = performance.now()
    const delta = (now - lastTime) / 1000
    lastTime = now

    // Update game systems
    gameWorld.update()
    colonySystem.update(delta)
    villagerSystem.update(delta)
    resourceSystem.update(delta)
    timeSystem.update(delta)
    inputSystem.update()

    renderer.render()
  }

  animate()

  // Handle resize
  window.addEventListener('resize', () => {
    gameWorld.handleResize()
  })
}

// Start the game
init().catch(error => {
  console.error('Failed to initialize Space Acccloned:', error)
  const loading = document.getElementById('loading-screen')
  if (loading) loading.classList.add('hidden')
  const warning = document.getElementById('webgpu-warning')
  if (warning) warning.classList.add('show')
})