import { useRef, useCallback, useEffect, useState } from 'react';
import type { GameEngine } from '../engine/GameEngine';

interface Props {
  engine: GameEngine;
}

export function TouchControls({ engine }: Props) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [actionLabel, setActionLabel] = useState('Action');
  const touchIdRef = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const update = () => {
      setActionLabel(engine.getActionLabel());
    };
    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, [engine]);

  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const joystick = joystickRef.current;
    if (!joystick) return;
    const rect = joystick.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    touchIdRef.current = e.changedTouches[0].identifier;
    handleJoystickMove(e);
  }, []);

  const handleJoystickMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;
    const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
    if (!touch) return;

    let dx = touch.clientX - centerRef.current.x;
    let dy = touch.clientY - centerRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 50;
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    const knob = knobRef.current;
    if (knob) {
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    // Normalize for movement
    const nx = dx / maxDist;
    const ny = dy / maxDist;
    engine.player.setMoveInput(Math.abs(nx) > 0.15 ? nx : 0, Math.abs(ny) > 0.15 ? ny : 0);
  }, [engine]);

  const handleJoystickEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
    if (!touch) return;
    touchIdRef.current = null;
    const knob = knobRef.current;
    if (knob) {
      knob.style.transform = 'translate(0px, 0px)';
    }
    engine.player.setMoveInput(0, 0);
  }, [engine]);

  const handleAction = useCallback(() => {
    if (engine.fishingState === 'biting' || engine.fishingState === 'waiting') {
      engine.reelFish();
    } else {
      engine.performAction();
    }
  }, [engine]);

  return (
    <div className="touch-controls">
      {/* Joystick - left side */}
      <div
        className="joystick"
        ref={joystickRef}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        <div className="joystick-base" />
        <div className="joystick-knob" ref={knobRef} />
      </div>

      {/* Action button - right side */}
      <div className="action-area">
        <button className="action-btn" onTouchStart={(e) => { e.preventDefault(); handleAction(); }}>
          {actionLabel}
        </button>
        {engine.fishingState !== 'idle' && (
          <button className="action-btn cancel-btn" onTouchStart={(e) => { e.preventDefault(); engine.cancelFishing(); }}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}