import React, { useRef, useEffect } from 'react';
import { WorldTile } from '../utils/worldGenerator';
import { Mob, PlayerCustomization, PeerPlayer, Item } from '../types/game';
import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT } from '../utils/constants';

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  lifetime: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  lifetime: number;
}

interface GameCanvasProps {
  tiles: WorldTile[][];
  mobs: Mob[];
  playerPos: { x: number; y: number; facing: 'up' | 'down' | 'left' | 'right' };
  playerCustom: PlayerCustomization;
  equippedItem: Item | null;
  isAttacking: boolean;
  attackAngle: number;
  isFishing: boolean;
  fishingBite: boolean;
  timeOfDay: number; // 0..24 hours
  onlinePlayers: PeerPlayer[];
  floatingTexts: FloatingText[];
  particles: Particle[];
  onTileClick: (x: number, y: number) => void;
  playerHp: number;
  playerMaxHp: number;
  showHitStop: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  tiles,
  mobs,
  playerPos,
  playerCustom,
  equippedItem,
  isAttacking,
  attackAngle,
  isFishing,
  fishingBite,
  timeOfDay,
  onlinePlayers,
  floatingTexts,
  particles,
  onTileClick,
  playerHp,
  playerMaxHp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle canvas click to interact with world
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert screen coordinates to world tile
    const cameraX = playerPos.x * TILE_SIZE - canvas.width / 2;
    const cameraY = playerPos.y * TILE_SIZE - canvas.height / 2;

    const worldPixelX = cameraX + clickX;
    const worldPixelY = cameraY + clickY;

    const tileX = Math.floor(worldPixelX / TILE_SIZE);
    const tileY = Math.floor(worldPixelY / TILE_SIZE);

    if (tileX >= 0 && tileX < WORLD_WIDTH && tileY >= 0 && tileY < WORLD_HEIGHT) {
      onTileClick(tileX, tileY);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Resize canvas to match display container
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Camera centered on player
    const cameraX = Math.round(playerPos.x * TILE_SIZE - canvas.width / 2);
    const cameraY = Math.round(playerPos.y * TILE_SIZE - canvas.height / 2);

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // Visible tile boundaries
    const startX = Math.max(0, Math.floor(cameraX / TILE_SIZE) - 1);
    const endX = Math.min(WORLD_WIDTH - 1, Math.ceil((cameraX + canvas.width) / TILE_SIZE) + 1);
    const startY = Math.max(0, Math.floor(cameraY / TILE_SIZE) - 1);
    const endY = Math.min(WORLD_HEIGHT - 1, Math.ceil((cameraY + canvas.height) / TILE_SIZE) + 1);

    const now = Date.now();
    const waterAnim = Math.sin(now / 400) * 2;

    // 1. RENDER TILES
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const tile = tiles[y]?.[x];
        if (!tile) continue;

        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        // Base ground
        switch (tile.baseType) {
          case 'water':
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            // Ripple wave
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(px + 4 + waterAnim, py + 8, 12, 2);
            ctx.fillRect(px + 14 - waterAnim, py + 20, 10, 2);
            break;
          case 'sand':
            ctx.fillStyle = '#d97706';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(px + 2, py + 4, 3, 2);
            ctx.fillRect(px + 16, py + 18, 4, 2);
            break;
          case 'snow':
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 6, py + 6, 2, 2);
            ctx.fillRect(px + 20, py + 18, 3, 3);
            break;
          case 'stone_floor':
            ctx.fillStyle = '#334155';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            break;
          case 'tilled_soil':
            ctx.fillStyle = '#451a03';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(px + 2, py + 4, 28, 4);
            ctx.fillRect(px + 2, py + 14, 28, 4);
            ctx.fillRect(px + 2, py + 24, 28, 4);
            break;
          case 'grass':
          default:
            ctx.fillStyle = tile.biome === 'forest' ? '#14532d' : '#15803d';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            // Grass tufts
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(px + 6, py + 8, 2, 3);
            ctx.fillRect(px + 22, py + 20, 2, 3);
            break;
        }

        // Crops on tilled soil
        if (tile.crop) {
          const { stage, type } = tile.crop;
          const cx = px + TILE_SIZE / 2;
          const cy = py + TILE_SIZE / 2;

          if (stage === 0) {
            // Seed
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(cx - 2, cy - 2, 4, 4);
          } else if (stage === 1) {
            // Sprout
            ctx.fillStyle = '#86efac';
            ctx.fillRect(cx - 1, cy - 6, 2, 8);
            ctx.fillRect(cx - 4, cy - 8, 3, 3);
            ctx.fillRect(cx + 1, cy - 8, 3, 3);
          } else {
            // Mature crop
            if (type === 'wheat') {
              ctx.fillStyle = '#facc15';
              ctx.fillRect(cx - 2, cy - 10, 4, 12);
              ctx.fillStyle = '#ca8a04';
              ctx.fillRect(cx - 4, cy - 14, 8, 5);
            } else if (type === 'carrot') {
              ctx.fillStyle = '#22c55e';
              ctx.fillRect(cx - 3, cy - 12, 6, 5);
              ctx.fillStyle = '#ea580c';
              ctx.fillRect(cx - 2, cy - 6, 5, 8);
            }
          }
        }

        // Housing / Placed Structures
        if (tile.structure) {
          const st = tile.structure;
          switch (st.type) {
            case 'wall_wood':
              ctx.fillStyle = '#78350f';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#92400e';
              ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
              break;
            case 'wall_stone':
              ctx.fillStyle = '#475569';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#64748b';
              ctx.fillRect(px + 3, py + 3, 11, 10);
              ctx.fillRect(px + 16, py + 3, 12, 10);
              ctx.fillRect(px + 3, py + 16, 25, 12);
              break;
            case 'campfire':
              ctx.fillStyle = '#451a03';
              ctx.fillRect(px + 4, py + 18, 24, 6);
              // Animated flame
              const flameHeight = 8 + Math.sin(now / 150) * 4;
              ctx.fillStyle = '#ea580c';
              ctx.beginPath();
              ctx.arc(px + 16, py + 14, 8, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#facc15';
              ctx.beginPath();
              ctx.arc(px + 16, py + 14 - flameHeight / 3, 4, 0, Math.PI * 2);
              ctx.fill();
              break;
            case 'bed':
              ctx.fillStyle = '#991b1b';
              ctx.fillRect(px + 2, py + 4, 28, 24);
              ctx.fillStyle = '#f8fafc';
              ctx.fillRect(px + 4, py + 6, 10, 8);
              break;
            case 'chest':
              ctx.fillStyle = '#b45309';
              ctx.fillRect(px + 4, py + 6, 24, 20);
              ctx.fillStyle = '#e2e8f0';
              ctx.fillRect(px + 14, py + 14, 4, 6);
              break;
            case 'forge':
              ctx.fillStyle = '#334155';
              ctx.fillRect(px + 4, py + 8, 24, 18);
              ctx.fillStyle = '#f97316';
              ctx.fillRect(px + 10, py + 12, 12, 6);
              break;
            case 'shop_stall':
              // Market canopy
              ctx.fillStyle = '#dc2626';
              ctx.fillRect(px + 2, py + 2, 28, 12);
              ctx.fillStyle = '#f8fafc';
              ctx.fillRect(px + 6, py + 2, 6, 12);
              ctx.fillRect(px + 18, py + 2, 6, 12);
              ctx.fillStyle = '#78350f';
              ctx.fillRect(px + 4, py + 14, 24, 14);
              ctx.fillStyle = '#fbbf24';
              ctx.font = '10px sans-serif';
              ctx.fillText('$', px + 12, py + 24);
              break;
            case 'fence':
              ctx.fillStyle = '#92400e';
              ctx.fillRect(px + 4, py + 12, 24, 4);
              ctx.fillRect(px + 6, py + 4, 4, 24);
              ctx.fillRect(px + 22, py + 4, 4, 24);
              break;
          }
        }

        // Natural Resources: Rocks
        if (tile.hasRock) {
          const cx = px + 16;
          const cy = py + 18;
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(cx, cy, 11, 0, Math.PI * 2);
          ctx.fill();

          if (tile.rockType === 'iron') {
            ctx.fillStyle = '#fb923c';
            ctx.fillRect(cx - 3, cy - 3, 3, 3);
            ctx.fillRect(cx + 2, cy + 2, 3, 3);
          } else if (tile.rockType === 'gold') {
            ctx.fillStyle = '#facc15';
            ctx.fillRect(cx - 4, cy - 2, 4, 4);
            ctx.fillRect(cx + 1, cy + 1, 4, 4);
          } else if (tile.rockType === 'gem') {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(cx - 2, cy - 4, 5, 5);
          }
        }

        // Natural Resources: Trees
        if (tile.hasTree) {
          const tx = px + 16;
          const ty = py + 24;
          // Trunk
          ctx.fillStyle = '#5c2c06';
          ctx.fillRect(tx - 3, ty - 8, 6, 12);
          // Foliage
          ctx.fillStyle = tile.biome === 'forest' ? '#14532d' : '#166534';
          ctx.beginPath();
          ctx.arc(tx, ty - 18, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(tx - 4, ty - 22, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. RENDER WILDLIFE & MOBS
    mobs.forEach((mob) => {
      const mx = mob.x * TILE_SIZE;
      const my = mob.y * TILE_SIZE;

      ctx.save();
      ctx.translate(mx, my);

      // Mob shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(16, 26, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      if (mob.type === 'chicken') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 14, 12, 10);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(20, 16, 4, 4);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(14, 11, 4, 3);
      } else if (mob.type === 'cow') {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(4, 8, 24, 16);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8, 10, 6, 6);
        ctx.fillRect(18, 12, 5, 5);
      } else if (mob.type === 'sheep') {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(16, 16, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#334155';
        ctx.fillRect(20, 14, 6, 6);
      } else if (mob.type === 'boar') {
        ctx.fillStyle = '#5c2c06';
        ctx.fillRect(6, 12, 20, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(24, 18, 4, 2); // tusk
      } else if (mob.type === 'deer') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(8, 10, 16, 14);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(18, 4, 2, 8); // antler
        ctx.fillRect(16, 4, 6, 2);
      } else if (mob.type === 'slime') {
        const bounce = Math.sin(now / 180 + mob.x) * 2;
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(16, 18 + bounce, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#052e16';
        ctx.fillRect(13, 16 + bounce, 2, 3);
        ctx.fillRect(18, 16 + bounce, 2, 3);
      } else if (mob.type === 'goblin') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(8, 10, 16, 16);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(11, 13, 3, 2);
        ctx.fillRect(18, 13, 3, 2);
      } else if (mob.type === 'wolf') {
        ctx.fillStyle = '#475569';
        ctx.fillRect(6, 12, 20, 12);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(20, 13, 2, 2);
      } else if (mob.type === 'golem_boss') {
        // Ancient Boss Colossus
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-8, -12, 48, 48);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(2, -4, 8, 4);
        ctx.fillRect(22, -4, 8, 4);
      } else {
        ctx.fillStyle = mob.customColor || '#94a3b8';
        ctx.fillRect(8, 8, 16, 16);
      }

      // Mob Health Bar
      if (mob.hp < mob.maxHp) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(4, 2, 24, 3);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(4, 2, (mob.hp / mob.maxHp) * 24, 3);
      }

      // Name label
      ctx.fillStyle = '#f8fafc';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(mob.nameId, 16, -2);

      ctx.restore();
    });

    // 3. RENDER CO-OP PEER PLAYERS
    onlinePlayers.forEach((peer) => {
      const px = peer.x * TILE_SIZE;
      const py = peer.y * TILE_SIZE;

      ctx.save();
      ctx.translate(px, py);

      // Name tag
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(peer.name, 16, -6);

      // Body
      ctx.fillStyle = peer.outfitColor || '#2563eb';
      ctx.fillRect(10, 14, 12, 12);
      // Head
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(11, 6, 10, 8);
      // Hair
      ctx.fillStyle = peer.hairColor || '#451a03';
      ctx.fillRect(10, 4, 12, 4);

      ctx.restore();
    });

    // 4. RENDER LOCAL PLAYER
    const plX = playerPos.x * TILE_SIZE;
    const plY = playerPos.y * TILE_SIZE;

    ctx.save();
    ctx.translate(plX, plY);

    // Glowing Aura if enabled
    if (playerCustom.aura && playerCustom.aura !== 'none') {
      let auraColor = 'rgba(234, 88, 12, 0.3)';
      if (playerCustom.aura === 'daun') auraColor = 'rgba(34, 197, 94, 0.3)';
      if (playerCustom.aura === 'kristal') auraColor = 'rgba(56, 189, 248, 0.3)';
      if (playerCustom.aura === 'emas') auraColor = 'rgba(250, 204, 21, 0.4)';

      ctx.fillStyle = auraColor;
      ctx.beginPath();
      ctx.arc(16, 18, 18 + Math.sin(now / 200) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 28, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player Legs & Shoes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(11, 24, 4, 5);
    ctx.fillRect(17, 24, 4, 5);

    // Player Body / Outfit
    ctx.fillStyle = playerCustom.outfitColor || '#16a34a';
    ctx.fillRect(10, 14, 12, 11);

    // Head / Skin
    ctx.fillStyle = playerCustom.skinColor || '#fcd34d';
    ctx.fillRect(11, 6, 10, 8);

    // Eyes
    ctx.fillStyle = '#0f172a';
    if (playerPos.facing === 'down') {
      ctx.fillRect(13, 9, 2, 2);
      ctx.fillRect(17, 9, 2, 2);
    } else if (playerPos.facing === 'left') {
      ctx.fillRect(12, 9, 2, 2);
    } else if (playerPos.facing === 'right') {
      ctx.fillRect(18, 9, 2, 2);
    }

    // Hair
    ctx.fillStyle = playerCustom.hairColor || '#78350f';
    ctx.fillRect(10, 4, 12, 4);
    if (playerCustom.hairStyle === 'gondrong' || playerCustom.hairStyle === 'kuncir') {
      ctx.fillRect(9, 6, 3, 6);
      ctx.fillRect(20, 6, 3, 6);
    }

    // Hat / Helmet Cosmetic
    if (playerCustom.hat === 'topi_jerami') {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(6, 2, 20, 4);
      ctx.fillRect(10, 0, 12, 3);
    } else if (playerCustom.hat === 'helm_ksatria') {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(9, 1, 14, 6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(15, -2, 2, 4);
    } else if (playerCustom.hat === 'mahkota') {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(9, 1, 14, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(15, 2, 2, 2);
    }

    // Handheld weapon / tool & Attack swing
    if (equippedItem) {
      ctx.save();
      ctx.translate(16, 18);
      if (isAttacking) {
        ctx.rotate(attackAngle);
        // Slash arc
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 22, -0.6, 0.6);
        ctx.stroke();
      }

      ctx.fillStyle = '#94a3b8';
      if (equippedItem.type === 'weapon') {
        // Sword blade
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(6, -2, 14, 4);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, -3, 4, 6);
      } else if (equippedItem.toolType === 'axe') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(4, -2, 10, 3);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(12, -5, 5, 9);
      } else if (equippedItem.toolType === 'pickaxe') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(4, -2, 10, 3);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(13, -7, 4, 13);
      } else if (equippedItem.toolType === 'rod') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(4, -1, 16, 2);
      }
      ctx.restore();
    }

    // Fishing line if fishing
    if (isFishing) {
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(16, 16);
      ctx.lineTo(16 + (playerPos.facing === 'right' ? 36 : playerPos.facing === 'left' ? -36 : 0), 16 + (playerPos.facing === 'down' ? 36 : playerPos.facing === 'up' ? -36 : 0));
      ctx.stroke();

      // Bobber
      const bx = 16 + (playerPos.facing === 'right' ? 36 : playerPos.facing === 'left' ? -36 : 0);
      const by = 16 + (playerPos.facing === 'down' ? 36 : playerPos.facing === 'up' ? -36 : 0);
      ctx.fillStyle = fishingBite ? '#ef4444' : '#f8fafc';
      ctx.beginPath();
      ctx.arc(bx, by + Math.sin(now / 150) * 2, 4, 0, Math.PI * 2);
      ctx.fill();

      if (fishingBite) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('!', bx, by - 8);
      }
    }

    // Mini HP readout above player head
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, -8, 24, 3);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(4, -8, Math.max(0, (playerHp / playerMaxHp) * 24), 3);

    ctx.restore();

    // 5. RENDER PARTICLES
    particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. RENDER FLOATING DAMAGE / LOOT NUMBERS
    floatingTexts.forEach((ft) => {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    });

    // 7. DAY / NIGHT CYCLE LIGHTING & TORCH GLOW
    // Night is between 19h and 5h, dusk between 17h and 19h
    let nightAlpha = 0;
    if (timeOfDay >= 19 || timeOfDay < 5) {
      nightAlpha = 0.72; // deep night
    } else if (timeOfDay >= 17 && timeOfDay < 19) {
      nightAlpha = ((timeOfDay - 17) / 2) * 0.72; // dusk transition
    } else if (timeOfDay >= 5 && timeOfDay < 7) {
      nightAlpha = (1 - (timeOfDay - 5) / 2) * 0.72; // dawn transition
    }

    if (nightAlpha > 0.05) {
      // Create dark overlay with radial light holes
      ctx.save();
      ctx.fillStyle = `rgba(5, 10, 30, ${nightAlpha})`;

      // Draw dark rectangle over screen
      ctx.fillRect(cameraX, cameraY, canvas.width, canvas.height);

      // Light cutouts with destination-out blending
      ctx.globalCompositeOperation = 'destination-out';

      // 1. Light around player
      const plScreenX = plX + 16;
      const plScreenY = plY + 16;
      const plGrad = ctx.createRadialGradient(plScreenX, plScreenY, 15, plScreenX, plScreenY, 90);
      plGrad.addColorStop(0, 'rgba(0,0,0,1)');
      plGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = plGrad;
      ctx.beginPath();
      ctx.arc(plScreenX, plScreenY, 90, 0, Math.PI * 2);
      ctx.fill();

      // 2. Light around campfires
      for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
          if (tiles[y]?.[x]?.structure?.type === 'campfire') {
            const fx = x * TILE_SIZE + 16;
            const fy = y * TILE_SIZE + 16;
            const fireGrad = ctx.createRadialGradient(fx, fy, 15, fx, fy, 110);
            fireGrad.addColorStop(0, 'rgba(0,0,0,1)');
            fireGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = fireGrad;
            ctx.beginPath();
            ctx.arc(fx, fy, 110, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }, [
    tiles,
    mobs,
    playerPos,
    playerCustom,
    equippedItem,
    isAttacking,
    attackAngle,
    isFishing,
    fishingBite,
    timeOfDay,
    onlinePlayers,
    floatingTexts,
    particles,
    playerHp,
    playerMaxHp,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="pixel-canvas absolute inset-0 w-full h-full cursor-crosshair touch-none"
      onPointerDown={handleCanvasPointerDown}
    />
  );
};
