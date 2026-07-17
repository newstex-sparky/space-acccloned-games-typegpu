import type { GameEngine } from '../engine/GameEngine';

interface Props {
  engine: GameEngine;
}

export function HUD({ engine }: Props) {
  const energy = engine.player.stats.energy;
  const maxEnergy = engine.player.stats.maxEnergy;
  const energyPct = (energy / maxEnergy) * 100;
  const money = engine.player.stats.money;
  const time = engine.gameTime.timeString;
  const seasonName = engine.getSeasonName();
  const seasonColor = engine.getSeasonColor();
  const day = engine.gameTime.day;
  const year = engine.gameTime.year;
  const isInMine = engine.world.isInMine();

  const energyColor = energyPct > 50 ? '#44ff44' : energyPct > 25 ? '#ffaa44' : '#ff4444';

  return (
    <div className="hud">
      <div className="hud-row">
        <div className="hud-item energy-item">
          <span className="hud-icon">⚡</span>
          <div className="hud-bar-container">
            <div className="hud-bar" style={{ width: `${energyPct}%`, background: energyColor }} />
            <span className="hud-bar-text">{Math.floor(energy)}/{maxEnergy}</span>
          </div>
        </div>
        <div className="hud-item">
          <span className="hud-icon">💰</span>
          <span className="hud-value">{money}g</span>
        </div>
      </div>
      <div className="hud-row">
        <div className="hud-item">
          <span className="hud-icon">🕐</span>
          <span className="hud-value">{time}</span>
        </div>
        <div className="hud-item">
          <span className="hud-icon" style={{ color: seasonColor }}>●</span>
          <span className="hud-value" style={{ color: seasonColor }}>{seasonName}</span>
          <span className="hud-day">D{day} Y{year}</span>
        </div>
      </div>
      {isInMine && (
        <div className="hud-mine-badge">
          🔩 Mine Level {engine.world.mineLevel}
        </div>
      )}
      {engine.decorationMode && (
        <div className="hud-deco-badge">
          🏠 Placing: {engine.decorationMode} — Tap action to place
        </div>
      )}
    </div>
  );
}