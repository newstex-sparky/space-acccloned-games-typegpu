import { useState } from 'react';
import type { GameEngine } from '../engine/GameEngine';
import type { BuildingType } from '../engine/types';
import { BUILDINGS, ITEMS } from '../engine/items';

interface Props {
  engine: GameEngine;
  onClose: () => void;
}

export function BuildModal({ engine, onClose }: Props) {
  const [, forceUpdate] = useState({});
  const refresh = () => forceUpdate({});

  const buildingTypes = Object.keys(BUILDINGS) as BuildingType[];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal build-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏗️ Construction</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="build-money">💰 {engine.player.stats.money}g</div>
          <p className="build-hint">Select a building to construct, then tap where to place it on the map.</p>
          <div className="build-list">
            {buildingTypes.map((bt) => {
              const def = BUILDINGS[bt];
              const canAfford = engine.canAffordBuilding(bt);
              return (
                <div key={bt} className={`build-item ${canAfford ? '' : 'locked'}`}>
                  <span className="build-item-icon">{def.emoji}</span>
                  <div className="build-item-info">
                    <span className="build-item-name">{def.name}</span>
                    <span className="build-item-desc">{def.description}</span>
                    <div className="build-item-costs">
                      <span className="build-cost-gold">💰 {def.cost}g</span>
                      {def.materials.map((mat, i) => {
                        const have = engine.player.countItem(mat.itemId);
                        const enough = have >= mat.quantity;
                        return (
                          <span key={i} className={`build-cost-mat ${enough ? 'have' : 'need'}`}>
                            {ITEMS[mat.itemId]?.emoji ?? ''} {have}/{mat.quantity}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary build-btn"
                    disabled={!canAfford}
                    onClick={() => {
                      engine.startBuildMode(bt);
                      onClose();
                    }}
                  >
                    Build
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}