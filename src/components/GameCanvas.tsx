import { useEffect, useRef } from 'react';
import type { GameEngine } from '../engine/GameEngine';
import { TILE_SIZE } from '../engine/World';
import { CROPS, ITEMS, DECORATIONS, BUILDINGS } from '../engine/items';
import { NPCS } from '../engine/npcs';

interface Props {
  engine: GameEngine;
}

export function GameCanvas({ engine }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef(engine);
  engineRef.current = engine;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const eng = engineRef.current;
      const world = eng.world;
      const player = eng.player;
      const cw = canvas.width;
      const ch = canvas.height;

      // Camera follows player
      const camX = player.pixelPos.x - cw / 2 + 16;
      const camY = player.pixelPos.y - ch / 2 + 16;

      // Background
      const isNight = eng.isNight();
      ctx.fillStyle = isNight ? '#0a0a1f' : '#111133';
      ctx.fillRect(0, 0, cw, ch);

      // Draw stars in background (night)
      if (isNight) {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
          const sx = (i * 137) % cw;
          const sy = (i * 89) % ch;
          ctx.globalAlpha = 0.3 + (Math.sin(Date.now() / 1000 + i) + 1) * 0.3;
          ctx.fillRect(sx, sy, 2, 2);
        }
        ctx.globalAlpha = 1;
      }

      const tiles = world.getActiveTiles();
      const aw = world.getActiveWidth();
      const ah = world.getActiveHeight();

      // Calculate visible tile range
      const startTileX = Math.max(0, Math.floor(camX / TILE_SIZE));
      const endTileX = Math.min(aw, Math.ceil((camX + cw) / TILE_SIZE));
      const startTileY = Math.max(0, Math.floor(camY / TILE_SIZE));
      const endTileY = Math.min(ah, Math.ceil((camY + ch) / TILE_SIZE));

      // Draw tiles
      for (let ty = startTileY; ty < endTileY; ty++) {
        for (let tx = startTileX; tx < endTileX; tx++) {
          const tile = tiles[ty][tx];
          const px = Math.round(tx * TILE_SIZE - camX);
          const py = Math.round(ty * TILE_SIZE - camY);

          drawTile(ctx, tile, px, py, eng);
        }
      }

      // Draw NPCs (only in overworld)
      if (!world.isInMine() && !world.isInHouse()) {
        for (const npcId of Object.keys(eng.npcs) as any[]) {
          const npc = eng.npcs[npcId];
          const def = NPCS[npcId];
          const px = Math.round(npc.pos.x * TILE_SIZE - camX);
          const py = Math.round(npc.pos.y * TILE_SIZE - camY);
          if (px > -TILE_SIZE && px < cw && py > -TILE_SIZE && py < ch) {
            drawNPC(ctx, def.color, px, py, npc.name);
          }
        }

        // Draw buildings (only in overworld)
        drawBuildings(ctx, eng, camX, camY);
      }

      // Draw player
      const ppx = Math.round(player.pixelPos.x - camX);
      const ppy = Math.round(player.pixelPos.y - camY);
      drawPlayer(ctx, player.facing, ppx, ppy, player.animFrame, player.moving);

      // Draw facing indicator
      const facing = player.getFacingTile();
      const fpx = Math.round(facing.x * TILE_SIZE - camX);
      const fpy = Math.round(facing.y * TILE_SIZE - camY);
      ctx.strokeStyle = 'rgba(255, 255, 100, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(fpx + 2, fpy + 2, TILE_SIZE - 4, TILE_SIZE - 4);

      // Draw fishing line
      if (eng.fishingState === 'casting' || eng.fishingState === 'waiting' || eng.fishingState === 'biting') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ppx + 16, ppy + 16);
        const fx = fpx + 16;
        const fy = fpy + 16;
        ctx.lineTo(fx, fy);
        ctx.stroke();
        // Bobber
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fill();

        // Fishing bar during biting
        if (eng.fishingState === 'biting') {
          const barW = 40;
          const barH = 100;
          const barX = fx - barW / 2;
          const barY = fy - barH - 20;
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(barX, barY, barW, barH);
          // Catch zone
          ctx.fillStyle = 'rgba(100, 255, 100, 0.3)';
          ctx.fillRect(barX, barY + 25, barW, 50);
          // Indicator
          ctx.fillStyle = '#ffff44';
          ctx.fillRect(barX, barY + barH - (eng.fishingBar / 100) * barH - 3, barW, 6);
        }
      }

      // Day/night overlay
      if (isNight) {
        ctx.fillStyle = 'rgba(10, 10, 40, 0.35)';
        ctx.fillRect(0, 0, cw, ch);
      }

      rafId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [engine]);

  return <canvas ref={canvasRef} className="game-canvas" />;
}

function drawTile(ctx: CanvasRenderingContext2D, tile: any, px: number, py: number, engine: any) {
  const sz = TILE_SIZE;

  switch (tile.type) {
    case 'grass':
      ctx.fillStyle = '#226633';
      ctx.fillRect(px, py, sz, sz);
      // Some texture dots
      ctx.fillStyle = '#338844';
      const h1 = (px * 7 + py * 3) % 31;
      if (h1 < 10) ctx.fillRect(px + h1, py + h1, 3, 3);
      if (h1 > 20) ctx.fillRect(px + 20, py + 12, 2, 2);
      break;

    case 'floor':
      ctx.fillStyle = '#554433';
      ctx.fillRect(px, py, sz, sz);
      ctx.strokeStyle = '#443322';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, sz - 1, sz - 1);
      break;

    case 'path':
      ctx.fillStyle = '#887766';
      ctx.fillRect(px, py, sz, sz);
      ctx.fillStyle = '#998877';
      ctx.fillRect(px + 4, py + 4, sz - 8, sz - 8);
      break;

    case 'water':
      ctx.fillStyle = '#2244aa';
      ctx.fillRect(px, py, sz, sz);
      // Animated waves
      const t = Date.now() / 500;
      ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
      ctx.fillRect(px + 4 + Math.sin(t + px) * 2, py + 8, sz - 8, 3);
      ctx.fillRect(px + 6 + Math.cos(t + py) * 2, py + 20, sz - 12, 2);
      break;

    case 'wall':
      ctx.fillStyle = '#332255';
      ctx.fillRect(px, py, sz, sz);
      ctx.strokeStyle = '#443366';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, sz - 1, sz - 1);
      break;

    case 'rock':
      if (tile.decorationId === 'mine_entrance') {
        ctx.fillStyle = '#553311';
        ctx.fillRect(px, py, sz, sz);
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(px + 8, py + 8, sz - 16, sz - 16);
        ctx.fillStyle = '#000';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MINE', px + sz / 2, py + sz / 2 + 4);
      } else {
        ctx.fillStyle = '#776655';
        ctx.fillRect(px, py, sz, sz);
        ctx.fillStyle = '#998877';
        ctx.fillRect(px + 6, py + 4, sz - 12, sz - 8);
        ctx.fillStyle = '#554433';
        ctx.fillRect(px + 8, py + 10, 6, 4);
      }
      break;

    case 'mine_floor':
      ctx.fillStyle = '#221122';
      ctx.fillRect(px, py, sz, sz);
      ctx.strokeStyle = '#332233';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, sz - 1, sz - 1);
      break;

    case 'mine_rock':
      ctx.fillStyle = '#443355';
      ctx.fillRect(px, py, sz, sz);
      ctx.fillStyle = '#554466';
      ctx.fillRect(px + 4, py + 4, sz - 8, sz - 8);
      // Ore specks
      if (tile.oreType) {
        const oreColor: Record<string, string> = {
          iron: '#aaaaaa',
          gold: '#ffdd00',
          crystal: '#44ffff',
          coal: '#222222',
          stone: '#888888',
        };
        ctx.fillStyle = oreColor[tile.oreType] || '#888';
        ctx.fillRect(px + 10, py + 10, 4, 4);
        ctx.fillRect(px + 18, py + 18, 3, 3);
        ctx.fillRect(px + 14, py + 22, 3, 3);
      }
      break;

    case 'house_interior':
      // Wooden floor
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(px, py, sz, sz);
      ctx.strokeStyle = '#6a4a1b';
      ctx.lineWidth = 1;
      // Plank lines
      ctx.beginPath();
      ctx.moveTo(px, py + sz / 2);
      ctx.lineTo(px + sz, py + sz / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + sz / 2, py);
      ctx.lineTo(px + sz / 2, py + sz / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + sz / 4, py + sz / 2);
      ctx.lineTo(px + sz / 4, py + sz);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + 3 * sz / 4, py + sz / 2);
      ctx.lineTo(px + 3 * sz / 4, py + sz);
      ctx.stroke();
      break;

    case 'building':
      // Building base — the actual structure is drawn separately
      // by drawBuildings() so here we just draw a dark pad
      ctx.fillStyle = '#443322';
      ctx.fillRect(px, py, sz, sz);
      break;

    case 'tilled':
      ctx.fillStyle = '#553311';
      ctx.fillRect(px, py, sz, sz);
      ctx.strokeStyle = '#442200';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(px + 4 + i * 8, py + 4);
        ctx.lineTo(px + 4 + i * 8, py + sz - 4);
        ctx.stroke();
      }
      if (tile.watered) {
        ctx.fillStyle = 'rgba(50, 100, 200, 0.3)';
        ctx.fillRect(px, py, sz, sz);
      }
      break;

    case 'crop':
      ctx.fillStyle = '#553311';
      ctx.fillRect(px, py, sz, sz);
      if (tile.watered) {
        ctx.fillStyle = 'rgba(50, 100, 200, 0.2)';
        ctx.fillRect(px, py, sz, sz);
      }
      if (tile.crop) {
        const def = CROPS[tile.crop.cropId];
        if (def) {
          if (tile.crop.dead) {
            ctx.fillStyle = '#884400';
            ctx.fillRect(px + 8, py + 8, sz - 16, sz - 16);
          } else {
            // Draw crop at current stage
            const stage = tile.crop.stage;
            const maxS = tile.crop.maxStage;
            const ratio = stage / maxS;
            const color = ratio >= 1 ? def.color : def.seedColor;
            const size = 6 + ratio * (sz - 14);

            if (stage === 0) {
              // Seed - small dot
              ctx.fillStyle = def.seedColor;
              ctx.fillRect(px + sz / 2 - 3, py + sz / 2 - 3, 6, 6);
            } else if (ratio >= 1) {
              // Harvestable
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(px + sz / 2, py + sz / 2, size / 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffff00';
              ctx.fillRect(px + sz / 2 - 2, py + 4, 4, 4);
            } else {
              // Growing
              ctx.fillStyle = color;
              ctx.fillRect(px + (sz - size) / 2, py + (sz - size) / 2, size, size);
              // Stem
              ctx.fillStyle = '#338833';
              ctx.fillRect(px + sz / 2 - 1, py + sz / 2, 2, size / 2);
            }
          }
        }
      }
      break;

    default:
      ctx.fillStyle = '#222222';
      ctx.fillRect(px, py, sz, sz);
  }

  // Forage items
  if (tile.forageId) {
    const item = ITEMS[tile.forageId];
    if (item) {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(px + sz / 2, py + sz / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.fillStyle = 'rgba(255, 255, 100, 0.3)';
      ctx.beginPath();
      ctx.arc(px + sz / 2, py + sz / 2, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Decorations
  if (tile.decorationId) {
    if (tile.decorationId === 'shop') {
      ctx.fillStyle = '#4488ff';
      ctx.fillRect(px - sz, py - sz, sz * 3, sz * 3);
      ctx.fillStyle = '#ffdd44';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SHOP', px + sz / 2 - sz, py + sz / 2 - sz + 4);
    } else if (tile.decorationId === 'house') {
      ctx.fillStyle = '#aa6644';
      ctx.fillRect(px - sz, py - sz, sz * 3, sz * 3);
      ctx.fillStyle = '#332222';
      ctx.fillRect(px - sz + 10, py - sz + 16, 12, 16);
      ctx.fillStyle = '#ffdd44';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HOME', px + sz / 2 - sz, py - sz + 30);
    } else if (tile.decorationId === 'mine_exit') {
      ctx.fillStyle = '#ff4444';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT', px + sz / 2, py + sz / 2 + 4);
    } else if (DECORATIONS[tile.decorationId]) {
      const dec = DECORATIONS[tile.decorationId];
      ctx.fillStyle = dec.color;
      if (dec.category === 'plant') {
        ctx.beginPath();
        ctx.arc(px + sz / 2, py + sz / 2, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (dec.category === 'light') {
        ctx.beginPath();
        ctx.arc(px + sz / 2, py + sz / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 100, 0.3)';
        ctx.beginPath();
        ctx.arc(px + sz / 2, py + sz / 2, 14, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(px + 6, py + 6, sz - 12, sz - 12);
      }
    } else {
      // House interior furniture
      drawFurniture(ctx, tile.decorationId, px, py, sz);
    }
  }

  // Decoration placement preview
  if (engine.decorationMode) {
    const facing = engine.player.getFacingTile();
    const tile2 = engine.world.getTile(facing.x, facing.y);
    if (tile2 && px === Math.round(facing.x * TILE_SIZE - (engine.player.pixelPos.x - window.innerWidth / 2 + 16)) &&
        py === Math.round(facing.y * TILE_SIZE - (engine.player.pixelPos.y - window.innerHeight / 2 + 16))) {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 1, sz - 2, sz - 2);
    }
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, facing: string, px: number, py: number, animFrame: number, moving: boolean) {
  const sz = TILE_SIZE;
  const bob = moving ? Math.sin(animFrame * Math.PI / 2) * 2 : 0;

  // Body
  ctx.fillStyle = '#4466ff';
  ctx.fillRect(px + 8, py + 12 + bob, sz - 16, sz - 16);

  // Head
  ctx.fillStyle = '#ffddaa';
  ctx.fillRect(px + 10, py + 4 + bob, sz - 20, 10);

  // Visor
  ctx.fillStyle = '#224488';
  if (facing === 'down') {
    ctx.fillRect(px + 12, py + 8 + bob, sz - 24, 4);
  } else if (facing === 'up') {
    ctx.fillStyle = '#ffddaa';
    // No visor from back
  } else if (facing === 'left') {
    ctx.fillRect(px + 10, py + 8 + bob, 6, 4);
  } else {
    ctx.fillRect(px + sz - 16, py + 8 + bob, 6, 4);
  }

  // Legs
  ctx.fillStyle = '#334499';
  const legOffset = moving ? (animFrame % 2) * 2 : 0;
  ctx.fillRect(px + 10, py + sz - 6 + bob - legOffset, 4, 6);
  ctx.fillRect(px + sz - 14, py + sz - 6 + bob + legOffset, 4, 6);
}

function drawNPC(ctx: CanvasRenderingContext2D, color: string, px: number, py: number, name: string) {
  const sz = TILE_SIZE;
  // Body
  ctx.fillStyle = color;
  ctx.fillRect(px + 8, py + 12, sz - 16, sz - 16);
  // Head
  ctx.fillStyle = '#ffddaa';
  ctx.fillRect(px + 10, py + 4, sz - 20, 10);
  // Name
  ctx.fillStyle = '#ffffff';
  ctx.font = '8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name, px + sz / 2, py - 4);
}

// ============ House Interior Furniture ============
function drawFurniture(ctx: CanvasRenderingContext2D, id: string | null, px: number, py: number, sz: number) {
  if (!id) return;
  switch (id) {
    case 'bed':
      ctx.fillStyle = '#cc8899';
      ctx.fillRect(px + 2, py + 4, sz - 4, sz - 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 4, py + 6, sz / 2 - 6, sz - 16);
      break;
    case 'table':
      ctx.fillStyle = '#885533';
      ctx.fillRect(px + 4, py + 6, sz - 8, sz - 12);
      ctx.fillStyle = '#aa7744';
      ctx.fillRect(px + 6, py + 6, sz - 12, 4);
      break;
    case 'chair':
      ctx.fillStyle = '#bb8855';
      ctx.fillRect(px + 8, py + 8, sz - 16, sz - 16);
      ctx.fillStyle = '#996644';
      ctx.fillRect(px + 8, py + 4, 4, sz - 12);
      break;
    case 'chest':
      ctx.fillStyle = '#aa6633';
      ctx.fillRect(px + 4, py + 8, sz - 8, sz - 14);
      ctx.fillStyle = '#ffdd44';
      ctx.fillRect(px + sz / 2 - 2, py + 10, 4, 4);
      break;
    case 'counter':
      ctx.fillStyle = '#998877';
      ctx.fillRect(px + 2, py + 8, sz - 4, sz - 12);
      ctx.fillStyle = '#bbabaa';
      ctx.fillRect(px + 2, py + 8, sz - 4, 4);
      break;
    case 'stove':
      ctx.fillStyle = '#666677';
      ctx.fillRect(px + 4, py + 4, sz - 8, sz - 8);
      ctx.fillStyle = '#ff4422';
      ctx.beginPath();
      ctx.arc(px + sz / 2, py + sz / 2, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'door':
      ctx.fillStyle = '#553322';
      ctx.fillRect(px + 4, py + 2, sz - 8, sz - 4);
      ctx.fillStyle = '#ffdd44';
      ctx.fillRect(px + sz / 2 - 2, py + sz / 2 - 2, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT', px + sz / 2, py + sz - 6);
      break;
    case 'lamp':
      ctx.fillStyle = '#444455';
      ctx.fillRect(px + sz / 2 - 2, py + 10, 4, sz - 14);
      ctx.fillStyle = '#ffee66';
      ctx.beginPath();
      ctx.arc(px + sz / 2, py + 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 100, 0.3)';
      ctx.beginPath();
      ctx.arc(px + sz / 2, py + 8, 12, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'rug':
      ctx.fillStyle = 'rgba(204, 68, 102, 0.6)';
      ctx.fillRect(px + 2, py + 2, sz - 4, sz - 4);
      ctx.strokeStyle = '#aa3355';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 4, py + 4, sz - 8, sz - 8);
      break;
    case 'plant_pot':
      ctx.fillStyle = '#aa6644';
      ctx.fillRect(px + 10, py + 14, sz - 20, sz - 20);
      ctx.fillStyle = '#44aa66';
      ctx.beginPath();
      ctx.arc(px + sz / 2, py + 10, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'shelf':
      ctx.fillStyle = '#996644';
      ctx.fillRect(px + 2, py + 4, sz - 4, sz - 8);
      ctx.fillStyle = '#774422';
      ctx.fillRect(px + 2, py + sz / 3 + 4, sz - 4, 2);
      ctx.fillRect(px + 2, py + 2 * sz / 3 + 4, sz - 4, 2);
      break;
    case 'tv':
      ctx.fillStyle = '#222244';
      ctx.fillRect(px + 4, py + 6, sz - 8, sz - 14);
      ctx.fillStyle = '#4488aa';
      ctx.fillRect(px + 7, py + 9, sz - 14, sz - 22);
      break;
    default:
      // Generic furniture from inventory items (placed by player)
      if (ITEMS[id]) {
        const item = ITEMS[id];
        ctx.fillStyle = item.color;
        ctx.fillRect(px + 6, py + 6, sz - 12, sz - 12);
      }
      break;
  }
}

// ============ Buildings on the Overworld ============
function drawBuildings(ctx: CanvasRenderingContext2D, engine: any, camX: number, camY: number) {
  const world = engine.world;
  if (!world.buildings || world.buildings.length === 0) return;
  for (const b of world.buildings) {
    const def = BUILDINGS[b.type];
    if (!def) continue;
    const px = Math.round(b.x * TILE_SIZE - camX);
    const py = Math.round(b.y * TILE_SIZE - camY);
    const w = def.width * TILE_SIZE;
    const h = def.height * TILE_SIZE;
    // Building body
    ctx.fillStyle = def.color;
    ctx.fillRect(px, py, w, h);
    // Roof
    ctx.fillStyle = def.roofColor;
    ctx.beginPath();
    ctx.moveTo(px - 4, py);
    ctx.lineTo(px + w + 4, py);
    ctx.lineTo(px + w / 2, py - 12);
    ctx.closePath();
    ctx.fill();
    // Door
    ctx.fillStyle = '#332211';
    ctx.fillRect(px + w / 2 - 6, py + h - 16, 12, 16);
    // Label emoji
    ctx.font = `${Math.max(14, TILE_SIZE * 0.6)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(def.emoji, px + w / 2, py + h / 2 + 6);
    ctx.textAlign = 'left';
  }
}