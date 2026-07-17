import { useState } from 'react';
import type { GameEngine } from '../engine/GameEngine';
import { ITEMS } from '../engine/items';

interface Props {
  engine: GameEngine;
  onClose: () => void;
}

export function QuestModal({ engine, onClose }: Props) {
  const [, forceUpdate] = useState({});
  const refresh = () => forceUpdate({});
  const quests = engine.getQuests();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal quest-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Quest Board</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="quest-list">
            {quests.map((q) => (
              <div key={q.id} className={`quest-card quest-${q.status}`}>
                <div className="quest-title">{q.title}</div>
                <div className="quest-desc">{q.description}</div>
                <div className="quest-objectives">
                  {q.objectives.map((obj, i) => (
                    <div key={i} className={`quest-obj ${obj.done ? 'done' : ''}`}>
                      <span className="quest-obj-icon">{obj.done ? '✅' : '⬜'}</span>
                      <span className="quest-obj-text">{obj.text}</span>
                      <span className="quest-obj-progress">({obj.current}/{obj.amount})</span>
                    </div>
                  ))}
                </div>
                <div className="quest-reward">
                  <span>Reward: </span>
                  {q.reward.money && <span className="reward-money">💰{q.reward.money}g </span>}
                  {q.reward.items?.map((it, i) => (
                    <span key={i} className="reward-item">
                      {ITEMS[it.itemId]?.emoji ?? '🎁'} {ITEMS[it.itemId]?.name ?? it.itemId} x{it.quantity}
                    </span>
                  ))}
                </div>
                <div className="quest-actions">
                  {q.status === 'available' && (
                    <button className="btn btn-primary" onClick={() => { engine.acceptQuest(q.id); refresh(); }}>
                      Accept
                    </button>
                  )}
                  {q.status === 'active' && (
                    <span className="quest-status active">In Progress</span>
                  )}
                  {q.status === 'completed' && (
                    <button className="btn btn-success" onClick={() => { engine.claimQuest(q.id); refresh(); }}>
                      Claim Reward!
                    </button>
                  )}
                  {q.status === 'claimed' && (
                    <span className="quest-status claimed">✅ Completed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}