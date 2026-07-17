import { useState } from 'react';
import type { GameEngine } from '../engine/GameEngine';
import { ITEMS } from '../engine/items';

interface Props {
  engine: GameEngine;
  onClose: () => void;
}

export function InventoryModal({ engine, onClose }: Props) {
  const [, forceUpdate] = useState({});
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showToolSelect, setShowToolSelect] = useState(false);

  const refresh = () => forceUpdate({});

  const handleUseItem = (idx: number) => {
    const slot = engine.player.inventory[idx];
    if (!slot?.item) return;
    const item = ITEMS[slot.item.itemId];
    if (!item) return;

    if (item.category === 'tool') {
      if (slot.item.itemId === 'fishing_rod') {
        engine.player.setTool('fishing_rod');
        engine.notify('Equipped Fishing Rod', 'info');
        refresh();
      } else if (slot.item.itemId === 'sword') {
        engine.player.setTool('sword');
        engine.notify('Equipped Laser Sword', 'info');
        refresh();
      }
    } else if (item.category === 'misc' && slot.item.itemId === 'energy_drink') {
      engine.player.removeItem('energy_drink', 1);
      engine.player.restoreEnergy(30);
      engine.notify('Restored 30 energy!', 'success');
      refresh();
    } else if (item.category === 'crafted' && slot.item.itemId === 'space_soup') {
      engine.player.removeItem('space_soup', 1);
      engine.player.restoreEnergy(50);
      engine.notify('Restored 50 energy!', 'success');
      refresh();
    } else if (item.category === 'crafted' && slot.item.itemId === 'bomb') {
      engine.notify('Bombs are used in the mine!', 'info');
    }
  };

  const handleDropItem = (idx: number) => {
    const slot = engine.player.inventory[idx];
    if (!slot?.item) return;
    engine.player.removeItem(slot.item.itemId, 1);
    engine.notify(`Dropped ${ITEMS[slot.item.itemId]?.name ?? slot.item.itemId}`, 'info');
    refresh();
    setSelectedIdx(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal inventory-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📦 Inventory</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="inventory-grid">
            {engine.player.inventory.map((slot, idx) => {
              const item = slot.item ? ITEMS[slot.item.itemId] : null;
              return (
                <div
                  key={idx}
                  className={`inv-slot ${selectedIdx === idx ? 'selected' : ''} ${slot.item ? 'filled' : 'empty'}`}
                  onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                >
                  {item && (
                    <>
                      <span className="inv-emoji">{item.emoji}</span>
                      {slot.item!.quantity > 1 && (
                        <span className="inv-qty">{slot.item!.quantity}</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {selectedIdx !== null && engine.player.inventory[selectedIdx]?.item && (
            <div className="item-details">
              {(() => {
                const slot = engine.player.inventory[selectedIdx];
                const item = ITEMS[slot!.item!.itemId];
                return (
                  <>
                    <h3>{item.emoji} {item.name}</h3>
                    <p>{item.description}</p>
                    {item.sellValue > 0 && <p className="item-val">Sell: {item.sellValue}g</p>}
                    <div className="item-actions">
                      {(item.category === 'tool' || item.category === 'misc' || item.category === 'crafted') && (
                        <button className="btn btn-primary" onClick={() => handleUseItem(selectedIdx)}>Use</button>
                      )}
                      <button className="btn btn-danger" onClick={() => handleDropItem(selectedIdx)}>Drop</button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <div className="tool-selector">
            <h3>🛠️ Current Tool: {engine.player.tool}</h3>
            <div className="tool-buttons">
              <button className={`btn tool-btn ${engine.player.tool === 'hoe' ? 'active' : ''}`} onClick={() => { engine.setTool('hoe'); refresh(); }}>⛏️ Hoe</button>
              <button className={`btn tool-btn ${engine.player.tool === 'watering_can' ? 'active' : ''}`} onClick={() => { engine.setTool('watering_can'); refresh(); }}>💧 Can</button>
              <button className={`btn tool-btn ${engine.player.tool === 'pickaxe' ? 'active' : ''}`} onClick={() => { engine.setTool('pickaxe'); refresh(); }}>⛏️ Pick</button>
              <button className={`btn tool-btn ${engine.player.tool === 'fishing_rod' ? 'active' : ''}`} onClick={() => { engine.setTool('fishing_rod'); refresh(); }}>🎣 Rod</button>
              <button className={`btn tool-btn ${engine.player.tool === 'sword' ? 'active' : ''}`} onClick={() => { engine.setTool('sword'); refresh(); }}>⚔️ Sword</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}