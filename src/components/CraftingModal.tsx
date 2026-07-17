import { useState } from 'react';
import type { GameEngine } from '../engine/GameEngine';
import { RECIPES, ITEMS } from '../engine/items';

interface Props {
  engine: GameEngine;
  onClose: () => void;
}

export function CraftingModal({ engine, onClose }: Props) {
  const [, forceUpdate] = useState({});
  const refresh = () => forceUpdate({});

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal crafting-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔨 Crafting Station</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="crafting-list">
            {RECIPES.map((recipe) => {
              const canCraft = engine.canCraft(recipe.id);
              const output = ITEMS[recipe.output.itemId];
              return (
                <div key={recipe.id} className={`craft-item ${canCraft ? 'available' : 'locked'}`}>
                  <div className="craft-output">
                    <span className="craft-icon">{output?.emoji ?? '❓'}</span>
                    <span className="craft-name">{recipe.name}</span>
                  </div>
                  <div className="craft-inputs">
                    {recipe.inputs.map((inp, i) => {
                      const item = ITEMS[inp.itemId];
                      const have = engine.player.countItem(inp.itemId);
                      const enough = have >= inp.quantity;
                      return (
                        <span key={i} className={`craft-input ${enough ? 'have' : 'need'}`}>
                          {item?.emoji ?? '❓'} {item?.name ?? inp.itemId}: {have}/{inp.quantity}
                        </span>
                      );
                    })}
                  </div>
                  <button
                    className="btn btn-craft"
                    disabled={!canCraft}
                    onClick={() => { engine.craft(recipe.id); refresh(); }}
                  >
                    Craft
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