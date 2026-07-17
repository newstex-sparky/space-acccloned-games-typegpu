import type { GameEngine } from '../engine/GameEngine';
import { CROPS, ITEMS } from '../engine/items';

interface Props {
  engine: GameEngine;
  onClose: () => void;
}

export function SeedSelectModal({ engine, onClose }: Props) {
  const seeds = engine.getAvailableSeeds();
  const season = engine.gameTime.season;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal seed-select-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🌱 Select Seeds</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {seeds.length === 0 ? (
            <div className="shop-empty">No seeds! Buy some at the shop.</div>
          ) : (
            <>
              <p className="seed-select-hint">
                Current season: <strong style={{ color: engine.getSeasonColor() }}>{engine.getSeasonName()}</strong>
              </p>
              <div className="seed-select-list">
                {seeds.map((seed) => {
                  const cropDef = CROPS[seed.cropId];
                  const inSeason = cropDef ? cropDef.seasons.includes(season) : false;
                  return (
                    <div
                      key={seed.itemId}
                      className={`seed-select-item ${inSeason ? 'in-season' : 'out-of-season'}`}
                    >
                      <span className="seed-select-icon">{ITEMS[seed.itemId]?.emoji ?? '🌱'}</span>
                      <div className="seed-select-info">
                        <span className="seed-select-name">{seed.name}</span>
                        <span className="seed-select-meta">
                          Qty: {seed.quantity} • Sells: {cropDef?.sellValue ?? 0}g
                          {!inSeason && <span className="seed-warn"> ⚠ Out of season</span>}
                        </span>
                      </div>
                      <button
                        className="btn btn-primary seed-select-btn"
                        disabled={!inSeason}
                        onClick={() => engine.plantSelectedSeed(seed.itemId)}
                      >
                        Plant
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}