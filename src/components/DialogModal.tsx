import { useState } from 'react';
import type { GameEngine } from '../engine/GameEngine';
import { ITEMS } from '../engine/items';
import { NPCS, getGiftReaction } from '../engine/npcs';

interface Props {
  engine: GameEngine;
  onClose: () => void;
}

export function DialogModal({ engine, onClose }: Props) {
  const [, forceUpdate] = useState({});
  const [showGifts, setShowGifts] = useState(false);
  const refresh = () => forceUpdate({});

  const dialog = engine.currentDialog;
  if (!dialog) return null;

  const npc = engine.npcs[dialog.npcId];
  const def = NPCS[dialog.npcId];
  const hearts = engine.getNPCHearts(dialog.npcId);

  const giveGift = (itemId: string) => {
    engine.giftNPC(dialog.npcId, itemId);
    setShowGifts(false);
    refresh();
  };

  // Get giftable items from inventory
  const giftableItems = engine.player.inventory
    .map((slot, idx) => ({ slot, idx }))
    .filter(s => s.slot.item && ITEMS[s.slot.item.itemId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal dialog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-portrait" style={{ background: def.color }}>
          <span className="dialog-portrait-name">{def.name}</span>
          <span className="dialog-portrait-role">{def.role}</span>
        </div>
        <div className="dialog-content">
          <div className="dialog-hearts">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className={i < hearts ? 'heart filled' : 'heart'}>❤️</span>
            ))}
          </div>
          <p className="dialog-text">{dialog.text}</p>

          {showGifts && (
            <div className="gift-list">
              <p>Select a gift:</p>
              <div className="gift-items">
                {giftableItems.map(({ slot }) => {
                  const item = ITEMS[slot!.item!.itemId];
                  const reaction = getGiftReaction(dialog.npcId, slot!.item!.itemId);
                  return (
                    <button
                      key={slot!.item!.itemId}
                      className="gift-item-btn"
                      onClick={() => giveGift(slot!.item!.itemId)}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                      <span className="gift-reaction">
                        {reaction === 'love' && '❤️'}
                        {reaction === 'like' && '👍'}
                        {reaction === 'neutral' && '😐'}
                        {reaction === 'dislike' && '👎'}
                        {reaction === 'hate' && '💔'}
                      </span>
                    </button>
                  );
                })}
                {giftableItems.length === 0 && <p>No items to gift!</p>}
              </div>
            </div>
          )}

          <div className="dialog-actions">
            {!showGifts && dialog.mode === 'talk' && (
              <button className="btn btn-primary" onClick={() => setShowGifts(true)}>
                🎁 Give Gift
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}