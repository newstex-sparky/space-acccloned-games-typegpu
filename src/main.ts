import * as typegpu from 'typegpu'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { GameWorld } from './engine/GameWorld'
import { ColonySystem } from './systems/ColonySystem'
import { VillagerSystem } from './systems/VillagerSystem'
import { ResourceSystem } from './systems/ResourceSystem'
import { TimeSystem } from './systems/TimeSystem'
import { InputSystem } from './systems/InputSystem'

// Check WebGPU support
const checkWebGPUSupport = (): boolean => {
  if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
    return true
  }
  return false
}

// TypeGPU Renderer class
export class TypeGPURenderer {
  private canvas: HTMLCanvasElement
  private context: typegpu.GPUDevice
  private swapChain: typegpu.Surface
  private pipeline: typegpu.ComputePipeline | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = typegpu.requestDevice()
    this.swapChain = this.context.createSwapChainForCanvas(canvas)
  }

  async init(): Promise<void> {
    // Initialize TypeGPU shader modules
    const starfieldShader = await this.createStarfieldShader()
    const groundShader = await this.createGroundShader()

    // Create render pipeline
    this.pipeline = await this.createRenderPipeline(starfieldShader, groundShader)
    console.log('✅ TypeGPU renderer initialized')
  }

  private async createStarfieldShader(): Promise<typegpu.ShaderModule> {
    // Starfield vertex shader (TypeGPU)
    return this.context.createShaderModule({
      source: `
#version 300 es
layout(location=0) in vec2 position;
layout(location=1) in float scale;
uniform mat4 projection;
uniform float time;
out vec3 vPosition;

void main() {
  vec2 starPos = position * (1.0 + sin(time + position.x) * 0.1);
  gl_Position = projection * vec4(starPos, 0.0, 1.0);
  vPosition = starPos;
}
      `
    })
  }

  private async createGroundShader(): Promise<typegpu.ShaderModule> {
    // Ground fragment shader
    return this.context.createShaderModule({
      source: `
#version 300 es
precision highp float;
in vec3 vPosition;
out vec4 fragColor;

void main() {
  float distance = length(vPosition);
  float alpha = smoothstep(50.0, 0.0, distance);
  fragColor = vec4(0.15, 0.15, 0.27, alpha);
}
      `
    })
  }

  private async createRenderPipeline(
    vertexShader: typegpu.ShaderModule,
    fragmentShader: typegpu.ShaderModule
  ): Promise<typegpu.ComputePipeline> {
    return this.context.createComputePipeline({
      layout: 'auto',
      compute: {
        module: vertexShader,
        entryPoint: 'main'
      }
    })
  }

  render(): void {
    // Render frame
    if (this.swapChain) {
      this.swapChain.getCurrentTexture().createView()
    }
  }
}

// Initialize game systems
async function init() {
  console.log('🚀 Initializing Space Acccloned...')

  // Check WebGPU support
  if (!checkWebGPUSupport()) {
    console.warn('⚠️ WebGPU not supported')
    document.getElementById('webgpu-warning').classList.add('show')
    return
  }

  // Hide loading screen
  setTimeout(() => {
    document.getElementById('loading-screen').classList.add('hidden')
  }, 2000)

  // Initialize TypeGPU
  const canvas = document.createElement('canvas')
  canvas.id = 'webgpu-canvas'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  document.getElementById('canvas-container').appendChild(canvas)

  const renderer = new TypeGPURenderer(canvas)
  await renderer.init()

  // Initialize game systems
  const gameWorld = new GameWorld(canvas)
  const colonySystem = new ColonySystem(gameWorld)
  const villagerSystem = new VillagerSystem(canvas)
  const resourceSystem = new ResourceSystem(gameWorld)
  const timeSystem = new TimeSystem(gameWorld)
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
  function animate() {
    requestAnimationFrame(animate)

    // Update game systems
    gameWorld.update()
    colonySystem.update()
    villagerSystem.update()
    resourceSystem.update()
    timeSystem.update()
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
  document.getElementById('loading-screen').classList.add('hidden')
  document.getElementById('webgpu-warning').classList.add('show')
})