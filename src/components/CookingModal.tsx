import { useState } from 'react';
import type { GameEngine } from '../engine/GameEngine';
import { COOKING_RECIPES, ITEMS } from '../engine/items';

interface Props {
  engine: GameEngine;
  onClose: () => void;
}

export function CookingModal({ engine, onClose }: Props) {
  const [, forceUpdate] = useState({});
  const refresh = () => forceUpdate({});

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal cooking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🍳 Kitchen</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="cooking-hint">Cook crops into meals that restore energy or sell for profit!</p>
          <div className="cooking-list">
            {COOKING_RECIPES.map((recipe) => {
              const canCook = engine.canCook(recipe.id);
              const outputItem = ITEMS[recipe.output.itemId];
              return (
                <div key={recipe.id} className={`cooking-item ${canCook ? '' : 'locked'}`}>
                  <span className="cooking-item-icon">{recipe.emoji}</span>
                  <div className="cooking-item-info">
                    <span className="cooking-item-name">{recipe.name}</span>
                    <span className="cooking-item-desc">+{recipe.energy} energy • Sells: {recipe.sellValue}g</span>
                    <div className="cooking-ingredients">
                      {recipe.inputs.map((inp, i) => {
                        const have = engine.player.countItem(inp.itemId);
                        const enough = have >= inp.quantity;
                        return (
                          <span key={i} className={`cooking-ingredient ${enough ? 'have' : 'need'}`}>
                            {ITEMS[inp.itemId]?.emoji ?? ''} {have}/{inp.quantity}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    className="btn btn-success cooking-btn"
                    disabled={!canCook}
                    onClick={() => { engine.cook(recipe.id); refresh(); }}
                  >
                    Cook
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