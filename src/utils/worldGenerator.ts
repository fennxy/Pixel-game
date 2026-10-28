import { BiomeType, Mob, PlacedStructure, PlacedCrop } from '../types/game';
import { WORLD_WIDTH, WORLD_HEIGHT } from './constants';

export interface WorldTile {
  x: number;
  y: number;
  biome: BiomeType;
  baseType: 'grass' | 'water' | 'sand' | 'snow' | 'dirt' | 'stone_floor' | 'tilled_soil';
  hasTree: boolean;
  treeHealth: number;
  hasRock: boolean;
  rockType: 'stone' | 'iron' | 'gold' | 'gem';
  rockHealth: number;
  structure?: PlacedStructure;
  crop?: PlacedCrop;
}

export function generateWorld(): {
  tiles: WorldTile[][];
  mobs: Mob[];
  structures: PlacedStructure[];
} {
  const tiles: WorldTile[][] = [];
  const mobs: Mob[] = [];
  const structures: PlacedStructure[] = [];

  const centerX = Math.floor(WORLD_WIDTH / 2);
  const centerY = Math.floor(WORLD_HEIGHT / 2);

  // 1. Generate base tiles with biome partitioning
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    const row: WorldTile[] = [];
    for (let x = 0; x < WORLD_WIDTH; x++) {
      let biome: BiomeType = 'plains';
      let baseType: WorldTile['baseType'] = 'grass';

      // Biome geography
      if (y < 22) {
        biome = 'forest';
      } else if (x > 48 && y > 22) {
        biome = 'desert';
        baseType = 'sand';
      } else if (x < 22 && y > 22) {
        biome = 'snow';
        baseType = 'snow';
      } else if (x > 38 && y > 46) {
        biome = 'dungeon';
        baseType = 'stone_floor';
      } else {
        biome = 'plains';
        baseType = 'grass';
      }

      // Natural lakes & rivers for fishing
      const distFromCenter = Math.hypot(x - (centerX - 6), y - (centerY + 6));
      const distFromRiver = Math.abs(x - 30 + Math.sin(y / 4) * 3);

      if (distFromCenter < 4 || (distFromRiver < 1.8 && biome === 'plains' && y > 24 && y < 50)) {
        baseType = 'water';
      }

      // Border water ocean
      if (x === 0 || y === 0 || x === WORLD_WIDTH - 1 || y === WORLD_HEIGHT - 1) {
        baseType = 'water';
      }

      // Resource generation (Trees, Rocks, Ores)
      let hasTree = false;
      let hasRock = false;
      let rockType: WorldTile['rockType'] = 'stone';

      if (baseType !== 'water') {
        const rand = Math.random();

        // Forest has dense trees
        if (biome === 'forest' && rand < 0.32) {
          hasTree = true;
        } else if (biome === 'plains' && rand < 0.12) {
          hasTree = true;
        }

        // Rocks and minerals
        if (!hasTree && rand > 0.88) {
          hasRock = true;
          const oreRoll = Math.random();
          if (biome === 'dungeon' || biome === 'desert') {
            if (oreRoll < 0.4) rockType = 'iron';
            else if (oreRoll < 0.75) rockType = 'gold';
            else rockType = 'gem';
          } else if (biome === 'snow') {
            if (oreRoll < 0.5) rockType = 'iron';
            else rockType = 'gem';
          } else {
            if (oreRoll < 0.7) rockType = 'stone';
            else rockType = 'iron';
          }
        }
      }

      // Clear immediate player spawn area at center
      if (Math.hypot(x - centerX, y - centerY) < 4) {
        baseType = 'grass';
        hasTree = false;
        hasRock = false;
      }

      row.push({
        x,
        y,
        biome,
        baseType,
        hasTree,
        treeHealth: hasTree ? 3 : 0,
        hasRock,
        rockType,
        rockHealth: hasRock ? 3 : 0,
      });
    }
    tiles.push(row);
  }

  // 2. Add Starter Cozy Shelter near spawn
  const houseX = centerX + 2;
  const houseY = centerY - 1;

  structures.push(
    { id: 'starter_wall_1', type: 'wall_wood', x: houseX - 1, y: houseY - 1, hp: 100, maxHp: 100 },
    { id: 'starter_wall_2', type: 'wall_wood', x: houseX, y: houseY - 1, hp: 100, maxHp: 100 },
    { id: 'starter_wall_3', type: 'wall_wood', x: houseX + 1, y: houseY - 1, hp: 100, maxHp: 100 },
    { id: 'starter_wall_4', type: 'wall_wood', x: houseX - 1, y: houseY + 1, hp: 100, maxHp: 100 },
    { id: 'starter_wall_5', type: 'wall_wood', x: houseX + 1, y: houseY + 1, hp: 100, maxHp: 100 },
    { id: 'starter_campfire', type: 'campfire', x: houseX, y: houseY + 2, hp: 100, maxHp: 100 },
    { id: 'starter_bed', type: 'bed', x: houseX - 1, y: houseY, hp: 100, maxHp: 100 },
    { id: 'starter_chest', type: 'chest', x: houseX + 1, y: houseY, hp: 100, maxHp: 100 }
  );

  // Attach structures to world tiles
  structures.forEach((st) => {
    if (tiles[st.y] && tiles[st.y][st.x]) {
      tiles[st.y][st.x].structure = st;
      tiles[st.y][st.x].hasTree = false;
      tiles[st.y][st.x].hasRock = false;
    }
  });

  // Starter farm plot with wheat
  const farmX = centerX + 4;
  const farmY = centerY + 1;
  if (tiles[farmY] && tiles[farmY][farmX]) {
    tiles[farmY][farmX].baseType = 'tilled_soil';
    tiles[farmY][farmX].crop = {
      type: 'wheat',
      stage: 1,
      maxStage: 3,
      watered: true,
      growthTimer: 10,
    };
  }

  // 3. Spawn Initial Wildlife & Mobs
  // Chickens and cows near village
  mobs.push(
    {
      id: 'chicken_1',
      type: 'chicken',
      name: 'Ayam Kampung',
      nameId: 'Ayam Kampung',
      x: centerX - 2,
      y: centerY + 2,
      hp: 15,
      maxHp: 15,
      speed: 0.8,
      damage: 0,
      aggressive: false,
      isAnimal: true,
      facing: 'down',
      animFrame: 0,
      attackCooldown: 0,
      targetPlayer: false,
    },
    {
      id: 'cow_1',
      type: 'cow',
      name: 'Sapi Perah',
      nameId: 'Sapi Perah',
      x: centerX - 3,
      y: centerY - 2,
      hp: 40,
      maxHp: 40,
      speed: 0.6,
      damage: 0,
      aggressive: false,
      isAnimal: true,
      facing: 'right',
      animFrame: 0,
      attackCooldown: 0,
      targetPlayer: false,
    },
    {
      id: 'sheep_1',
      type: 'sheep',
      name: 'Domba Putih',
      nameId: 'Domba Putih',
      x: centerX + 1,
      y: centerY + 4,
      hp: 25,
      maxHp: 25,
      speed: 0.7,
      damage: 0,
      aggressive: false,
      isAnimal: true,
      facing: 'left',
      animFrame: 0,
      attackCooldown: 0,
      targetPlayer: false,
    }
  );

  // Forest wild animals (Boars & Deers)
  for (let i = 0; i < 4; i++) {
    mobs.push({
      id: `boar_${i}`,
      type: 'boar',
      name: 'Babi Hutan',
      nameId: 'Babi Hutan Rimba',
      x: 10 + Math.floor(Math.random() * 50),
      y: 5 + Math.floor(Math.random() * 12),
      hp: 35,
      maxHp: 35,
      speed: 1.1,
      damage: 8,
      aggressive: false, // only fights back
      isAnimal: true,
      facing: 'down',
      animFrame: 0,
      attackCooldown: 0,
      targetPlayer: false,
    });
    mobs.push({
      id: `deer_${i}`,
      type: 'deer',
      name: 'Rusa Hutan',
      nameId: 'Rusa Liar',
      x: 8 + Math.floor(Math.random() * 50),
      y: 4 + Math.floor(Math.random() * 14),
      hp: 30,
      maxHp: 30,
      speed: 1.3,
      damage: 0,
      aggressive: false,
      isAnimal: true,
      facing: 'left',
      animFrame: 0,
      attackCooldown: 0,
      targetPlayer: false,
    });
  }

  // Monsters in outer areas
  // Slimes
  for (let i = 0; i < 6; i++) {
    mobs.push({
      id: `slime_${i}`,
      type: 'slime',
      name: 'Slime Hijau',
      nameId: 'Slime Hijau',
      x: 15 + Math.floor(Math.random() * 40),
      y: 26 + Math.floor(Math.random() * 20),
      hp: 25,
      maxHp: 25,
      speed: 0.9,
      damage: 6,
      aggressive: true,
      isAnimal: false,
      facing: 'down',
      animFrame: 0,
      attackCooldown: 0,
      targetPlayer: false,
    });
  }

  // Desert Goblins & Spiders
  for (let i = 0; i < 5; i++) {
    mobs.push({
      id: `goblin_${i}`,
      type: 'goblin',
      name: 'Goblin Padang Pasir',
      nameId: 'Goblin Gurun',
      x: 52 + Math.floor(Math.random() * 14),
      y: 25 + Math.floor(Math.random() * 25),
      hp: 45,
      maxHp: 45,
      speed: 1.2,
      damage: 12,
      aggressive: true,
      isAnimal: false,
      facing: 'left',
      animFrame: 0,
      attackCooldown: 0,
      targetPlayer: false,
    });
  }

  // Snow Wolves & Skeletons
  for (let i = 0; i < 5; i++) {
    mobs.push({
      id: `wolf_${i}`,
      type: 'wolf',
      name: 'Serigala Es',
      nameId: 'Serigala Salju',
      x: 5 + Math.floor(Math.random() * 14),
      y: 25 + Math.floor(Math.random() * 25),
      hp: 55,
      maxHp: 55,
      speed: 1.4,
      damage: 14,
      aggressive: true,
      isAnimal: false,
      facing: 'right',
      animFrame: 0,
      attackCooldown: 0,
      targetPlayer: false,
    });
  }

  // Ancient Dungeon Golem Boss!
  mobs.push({
    id: 'boss_golem_ancient',
    type: 'golem_boss',
    name: 'Golem Purba Penjaga Batu',
    nameId: 'Ancient Golem Boss',
    x: 52,
    y: 56,
    hp: 450,
    maxHp: 450,
    speed: 0.7,
    damage: 28,
    aggressive: true,
    isAnimal: false,
    facing: 'down',
    animFrame: 0,
    attackCooldown: 0,
    targetPlayer: false,
  });

  return { tiles, mobs, structures };
}
