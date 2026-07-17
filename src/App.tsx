import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameEngine } from './engine/GameEngine';
import type { GameScreen, Notification, NPCId, FishingState } from './engine/types';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { InventoryModal } from './components/InventoryModal';
import { ShopModal } from './components/ShopModal';
import { CraftingModal } from './components/CraftingModal';
import { QuestModal } from './components/QuestModal';
import { DialogModal } from './components/DialogModal';
import { Notifications } from './components/Notifications';
import { WORLD_W, WORLD_H, TILE_SIZE } from './engine/World';
import { NPCS } from './engine/npcs';
import { ITEMS } from './engine/items';

export function App() {
  const [, forceUpdate] = useState({});
  const [screen, setScreen] = useState<GameScreen | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeNPC, setActiveNPC] = useState<NPCId | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showStart, setShowStart] = useState(true);
  const engineRef = useRef<GameEngine | null>(null);

  // Initialize engine
  if (!engineRef.current) {
    engineRef.current = new GameEngine({
      onStateChange: () => forceUpdate({}),
      onNotification: (n) => {
        setNotifications(prev => [...prev, n]);
      },
      onScreenChange: (s) => setScreen(s),
      onDialogChange: (npcId) => setActiveNPC(npcId),
      onFishingChange: (_state: FishingState) => forceUpdate({}),
    });
  }

  const engine = engineRef.current;

  useEffect(() => {
    engine.start();
    return () => engine.stop();
  }, [engine]);

  // Clear notifications after they display
  useEffect(() => {
    if (notifications.length > 0) {
      const timers = notifications.map(n =>
        setTimeout(() => {
          setNotifications(prev => prev.filter(nn => nn.id !== n.id));
        }, n.timeout)
      );
      return () => timers.forEach(t => clearTimeout(t));
    }
  }, [notifications]);

  const handleCloseScreen = useCallback(() => {
    engine.closeScreen();
    setScreen(null);
  }, [engine]);

  const handleCloseDialog = useCallback(() => {
    engine.closeDialog();
    setActiveNPC(null);
  }, [engine]);

  const handleNavTab = (tab: 'inventory' | 'shop' | 'crafting' | 'quests' | 'map') => {
    if (tab === 'map') {
      setShowMap(true);
    } else {
      engine.openScreen(tab);
    }
  };

  const startGame = () => {
    setShowStart(false);
  };

  if (showStart) {
    return (
      <div className="start-screen">
        <div className="start-content">
          <h1>🌱 Space Harvest 🚀</h1>
          <p className="start-subtitle">A Stardew Valley Adventure in Space</p>
          <div className="start-features">
            <p>🌾 Farm cosmic crops across 4 space seasons</p>
            <p>⛏️ Explore deep space mines for rare ores</p>
            <p>🎣 Catch exotic space fish</p>
            <p>🤝 Befriend 4 unique colonists</p>
            <p>🔨 Craft tools and decorations</p>
            <p>📋 Complete quests for rewards</p>
          </div>
          <button className="btn-start" onClick={startGame}>Start Colony</button>
          <p className="start-hint">Best played on mobile with touch controls!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <GameCanvas engine={engine} />
      <div className="ui-layer">
        <HUD engine={engine} />
        <Notifications notifications={notifications} />

        {!screen && !activeNPC && (
          <TouchControls engine={engine} />
        )}

        {/* Bottom navigation */}
        {!screen && !activeNPC && (
          <div className="bottom-nav">
            <button className="nav-btn" onClick={() => handleNavTab('inventory')}>
              <span className="nav-icon">🎒</span>
              <span className="nav-label">Bag</span>
            </button>
            <button className="nav-btn" onClick={() => handleNavTab('shop')}>
              <span className="nav-icon">🏪</span>
              <span className="nav-label">Shop</span>
            </button>
            <button className="nav-btn" onClick={() => handleNavTab('crafting')}>
              <span className="nav-icon">🔨</span>
              <span className="nav-label">Craft</span>
            </button>
            <button className="nav-btn" onClick={() => handleNavTab('quests')}>
              <span className="nav-icon">📋</span>
              <span className="nav-label">Quests</span>
            </button>
            <button className="nav-btn" onClick={() => handleNavTab('map')}>
              <span className="nav-icon">🗺️</span>
              <span className="nav-label">Map</span>
            </button>
          </div>
        )}

        {/* Modals */}
        {screen === 'inventory' && <InventoryModal engine={engine} onClose={handleCloseScreen} />}
        {screen === 'shop' && <ShopModal engine={engine} onClose={handleCloseScreen} />}
        {screen === 'crafting' && <CraftingModal engine={engine} onClose={handleCloseScreen} />}
        {screen === 'quests' && <QuestModal engine={engine} onClose={handleCloseScreen} />}
        {activeNPC && <DialogModal engine={engine} onClose={handleCloseDialog} />}

        {/* Map overlay */}
        {showMap && <MapModal engine={engine} onClose={() => setShowMap(false)} />}
      </div>
    </div>
  );
}

// Simple map modal
function MapModal({ engine, onClose }: { engine: GameEngine; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = Math.min(300 / WORLD_W, 300 / WORLD_H);
    canvas.width = WORLD_W * scale;
    canvas.height = WORLD_H * scale;

    const world = engine.world;
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const t = world.tiles[y][x];
        let color = '#226633';
        if (t.type === 'water') color = '#2244aa';
        else if (t.type === 'wall') color = '#332255';
        else if (t.type === 'rock') color = '#776655';
        else if (t.type === 'path') color = '#887766';
        else if (t.type === 'floor') color = '#554433';
        else if (t.type === 'tilled' || t.type === 'crop') color = '#553311';
        if (t.decorationId === 'house') color = '#aa6644';
        if (t.decorationId === 'shop') color = '#4488ff';
        if (t.decorationId === 'mine_entrance') color = '#ff8800';
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    // Draw NPCs
    for (const npcId of Object.keys(engine.npcs) as any[]) {
      const npc = engine.npcs[npcId];
      const def = NPCS[npcId];
      ctx.fillStyle = def.color;
      ctx.fillRect(npc.pos.x * scale - 1, npc.pos.y * scale - 1, scale + 2, scale + 2);
    }

    // Draw player
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(engine.player.pos.x * scale - 1, engine.player.pos.y * scale - 1, scale + 2, scale + 2);
  }, [engine]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal map-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🗺️ Station Map</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <canvas ref={canvasRef} className="map-canvas" />
          <div className="map-legend">
            <div><span style={{ color: '#ffff00' }}>●</span> You</div>
            <div><span style={{ color: '#aa6644' }}>●</span> Home</div>
            <div><span style={{ color: '#4488ff' }}>●</span> Shop</div>
            <div><span style={{ color: '#ff8800' }}>●</span> Mine</div>
            <div><span style={{ color: '#2244aa' }}>●</span> Lake</div>
          </div>
          <div className="map-npcs">
            <p>Colonists on the station:</p>
            {Object.keys(engine.npcs).map((id) => {
              const npc = engine.npcs[id as NPCId];
              const def = NPCS[id as NPCId];
              return (
                <div key={id} className="map-npc">
                  <span style={{ color: def.color }}>●</span>
                  <span>{def.name} - {def.role}</span>
                  <span>❤️ {engine.getNPCHearts(id as NPCId)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}