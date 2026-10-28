import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateWorld, WorldTile } from './utils/worldGenerator';
import {
  Mob,
  PlayerCustomization,
  InventorySlot,
  Item,
  SkillNode,
  GameMod,
  Quest,
  PeerPlayer,
  TradeOffer,
  PlayerShop,
  Guild,
  ChatMessage,
  VoiceNote,
  StructureType,
} from './types/game';
import {
  ITEMS,
  INITIAL_SKILL_TREE,
  INITIAL_QUESTS,
  COMMUNITY_MODS,
  CRAFTING_RECIPES,
  COOKING_RECIPES,
  CraftingRecipe,
  TILE_SIZE,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from './utils/constants';
import { sound } from './utils/audio';
import { GameCanvas } from './components/GameCanvas';
import { MobileControls } from './components/MobileControls';
import { InventoryModal } from './components/InventoryModal';
import { CraftingModal } from './components/CraftingModal';
import { CookingFarmingModal } from './components/CookingFarmingModal';
import { HousingBuildModal } from './components/HousingBuildModal';
import { PlayerShopModal } from './components/PlayerShopModal';
import { SkillTreeModal } from './components/SkillTreeModal';
import { MultiplayerGuildModal } from './components/MultiplayerGuildModal';
import { VoiceNoteChatModal } from './components/VoiceNoteChatModal';
import { ModManagerModal } from './components/ModManagerModal';
import { CharacterCreatorModal } from './components/CharacterCreatorModal';
import { QuestModal } from './components/QuestModal';
import {
  Heart,
  Utensils,
  Droplet,
  Coins,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Pause,
  SlidersHorizontal,
} from 'lucide-react';

type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');

  // World State
  const [worldData, setWorldData] = useState<{
    tiles: WorldTile[][];
    mobs: Mob[];
  }>(() => {
    const { tiles, mobs } = generateWorld();
    return { tiles, mobs };
  });

  // Local Player Stats & State
  const [playerPos, setPlayerPos] = useState({
    x: 35,
    y: 35,
    facing: 'down' as 'up' | 'down' | 'left' | 'right',
  });
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const [playerHunger, setPlayerHunger] = useState(85);
  const [playerThirst, setPlayerThirst] = useState(90);
  const [gold, setGold] = useState(120);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerExp, setPlayerExp] = useState(0);
  const [playerMaxExp, setPlayerMaxExp] = useState(100);
  const [skillPoints, setSkillPoints] = useState(2);
  const [playerName, setPlayerName] = useState('Pendekar Nusantara');

  // Character Customization
  const [playerCustom, setPlayerCustom] = useState<PlayerCustomization>({
    gender: 'pria',
    hairStyle: 'pendek',
    hairColor: '#78350f',
    skinColor: '#fcd34d',
    outfitColor: '#16a34a',
    hat: 'topi_jerami',
    aura: 'emas',
  });

  // Inventory & Equipment
  const [inventory, setInventory] = useState<InventorySlot[]>([
    { item: ITEMS['wooden_axe'], count: 1 },
    { item: ITEMS['stone_pickaxe'], count: 1 },
    { item: ITEMS['iron_sword'], count: 1 },
    { item: ITEMS['fishing_rod'], count: 1 },
    { item: ITEMS['hoe'], count: 1 },
    { item: ITEMS['cooked_meat'], count: 5 },
    { item: ITEMS['wheat_seed'], count: 8 },
    { item: ITEMS['wood'], count: 20 },
    { item: ITEMS['stone'], count: 15 },
  ]);

  const [equippedWeapon, setEquippedWeapon] = useState<Item | null>(ITEMS['iron_sword']);
  const [equippedArmor, setEquippedArmor] = useState<Item | null>(null);
  const [equippedTool, setEquippedTool] = useState<Item | null>(ITEMS['wooden_axe']);

  // Combat, Animation & Interaction
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackAngle, setAttackAngle] = useState(0);
  const [isFishing, setIsFishing] = useState(false);
  const [fishingBite, setFishingBite] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<
    { id: string; x: number; y: number; text: string; color: string; lifetime: number }[]
  >([]);
  const [particles, setParticles] = useState<
    { x: number; y: number; vx: number; vy: number; color: string; size: number; lifetime: number }[]
  >([]);

  // Survival Clock: 0..24 hours
  const [timeOfDay, setTimeOfDay] = useState(8.5); // Starts at 8:30 AM

  // Mobile Handedness
  const [isRightHanded, setIsRightHanded] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Active Building / Structure Placement
  const [activePlacingType, setActivePlacingType] = useState<StructureType | null>(null);

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Skill Tree
  const [skillNodes, setSkillNodes] = useState<SkillNode[]>(INITIAL_SKILL_TREE);

  // Quests
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);

  // Mods
  const [mods, setMods] = useState<GameMod[]>(COMMUNITY_MODS);

  // Player Shop
  const [playerShop, setPlayerShop] = useState<PlayerShop>({
    isOpen: true,
    name: 'Warung Survival Barokah',
    items: [
      { id: 's1', item: ITEMS['cooked_meat'], price: 30, count: 2 },
      { id: 's2', item: ITEMS['iron_ore'], price: 25, count: 4 },
    ],
    totalEarnings: 85,
    customerLogs: [
      {
        id: 'cl1',
        buyerName: 'NPC Petani Joko',
        itemName: 'Daging Bakar Rempah',
        price: 30,
        timestamp: '08:15',
      },
    ],
  });

  // Guild
  const [guild, setGuild] = useState<Guild>({
    id: 'g1',
    name: 'Garuda Rimba Nusantara',
    motto: 'Bersatu Menaklukkan Alam Liar',
    bannerColor: '#2563eb',
    level: 2,
    exp: 420,
    maxExp: 1000,
    treasury: 350,
    perks: {
      expBonus: 15,
      harvestBonus: 20,
      combatBonus: 10,
    },
    members: [
      { name: 'Pendekar Nusantara', role: 'Ketua', level: 1, online: true },
      { name: 'Dewi_Craft', role: 'Wakil', level: 3, online: true },
      { name: 'Budi_Slayer', role: 'Anggota', level: 2, online: true },
    ],
  });

  // Multiplayer simulated companions & room code
  const [roomCode] = useState(() => `#NUSANTARA-${Math.floor(Math.random() * 899 + 100)}`);
  const [onlinePlayers, setOnlinePlayers] = useState<PeerPlayer[]>([
    {
      id: 'p_dewi',
      name: 'Dewi_Craft',
      x: 37,
      y: 33,
      direction: 'down',
      gender: 'wanita',
      hairColor: '#eab308',
      outfitColor: '#ec4899',
      hp: 100,
      maxHp: 100,
      action: 'idle',
      currentWeapon: 'Kapak',
    },
    {
      id: 'p_budi',
      name: 'Budi_Slayer',
      x: 33,
      y: 36,
      direction: 'right',
      gender: 'pria',
      hairColor: '#0f172a',
      outfitColor: '#3b82f6',
      hp: 95,
      maxHp: 100,
      action: 'idle',
      currentWeapon: 'Pedang',
    },
  ]);

  // Player-to-Player Trade
  const [tradeOffer, setTradeOffer] = useState<TradeOffer | null>(null);

  // Chat & Voice Notes
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'Dewi_Craft',
      channel: 'world',
      content: 'Halo kawan! Saya baru saja menemukan spot memancing banyak ikan lele di sungai barat!',
      timestamp: '08:10',
    },
    {
      id: 'm2',
      sender: 'Budi_Slayer',
      channel: 'guild',
      content: 'Siapkan senjata besi kalian, nanti malam kita serang Boss Golem bersama!',
      timestamp: '08:20',
    },
  ]);

  // Keys ref for smooth input
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const moveDirection = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Floating text helper
  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    setFloatingTexts((prev) => [
      ...prev,
      {
        id: `ft_${Date.now()}_${Math.random()}`,
        x: x * TILE_SIZE + 16,
        y: y * TILE_SIZE + 8,
        text,
        color,
        lifetime: 1.2,
      },
    ]);
  };

  // Particle burst helper
  const addParticles = (x: number, y: number, color: string, count = 6) => {
    const newP = Array.from({ length: count }, () => ({
      x: x * TILE_SIZE + 16,
      y: y * TILE_SIZE + 16,
      vx: (Math.random() - 0.5) * 60,
      vy: (Math.random() - 0.5) * 60,
      color,
      size: Math.random() * 3 + 2,
      lifetime: 0.6,
    }));
    setParticles((prev) => [...prev, ...newP]);
  };

  // Add Item to Inventory
  const addItemToInventory = useCallback((item: Item, count = 1) => {
    setInventory((prev) => {
      const existing = prev.find((s) => s.item.id === item.id);
      if (existing && item.stackable) {
        return prev.map((s) =>
          s.item.id === item.id ? { ...s, count: s.count + count } : s
        );
      }
      return [...prev, { item, count }];
    });
  }, []);

  // Deduct Item from Inventory
  const deductItemFromInventory = useCallback((itemId: string, count = 1) => {
    setInventory((prev) => {
      return prev
        .map((s) => (s.item.id === itemId ? { ...s, count: s.count - count } : s))
        .filter((s) => s.count > 0);
    });
  }, []);

  // Update Quest Progress
  const updateQuestProgress = useCallback((targetType: string, amount = 1) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.targetType === targetType && !q.completed) {
          const nextCount = q.currentCount + amount;
          return {
            ...q,
            currentCount: nextCount,
            completed: nextCount >= q.requiredCount,
          };
        }
        return q;
      })
    );
  }, []);

  // Gain EXP
  const gainExp = useCallback((amount: number) => {
    setPlayerExp((prevExp) => {
      let currentExp = prevExp + amount;
      let currentLevel = playerLevel;
      let currentMaxExp = playerMaxExp;

      if (currentExp >= currentMaxExp) {
        currentExp -= currentMaxExp;
        currentLevel += 1;
        currentMaxExp = Math.floor(currentMaxExp * 1.5);
        setPlayerLevel(currentLevel);
        setPlayerMaxExp(currentMaxExp);
        setSkillPoints((sp) => sp + 1);
        sound.playLevelUp();
        addFloatingText(playerPos.x, playerPos.y, `LEVEL UP! Lv.${currentLevel}`, '#a855f7');
      }
      return currentExp;
    });
  }, [playerLevel, playerMaxExp, playerPos]);

  // Main Attack Action (Tool/Weapon Swing)
  const handleAttack = useCallback(() => {
    if (isAttacking) return;
    setIsAttacking(true);
    setAttackAngle(0.6);
    sound.playSlash();

    setTimeout(() => {
      setAttackAngle(-0.6);
    }, 80);

    setTimeout(() => {
      setIsAttacking(false);
      setAttackAngle(0);
    }, 200);

    const targetX = playerPos.x + (playerPos.facing === 'right' ? 1 : playerPos.facing === 'left' ? -1 : 0);
    const targetY = playerPos.y + (playerPos.facing === 'down' ? 1 : playerPos.facing === 'up' ? -1 : 0);

    // 1. Check if hitting a Mob / Monster
    setWorldData((prev) => {
      let mobHit = false;
      const nextMobs = prev.mobs
        .map((m) => {
          const dist = Math.hypot(m.x - targetX, m.y - targetY);
          if (dist < 1.4) {
            mobHit = true;
            const baseDmg = equippedWeapon ? equippedWeapon.damage || 20 : 10;
            const reinforceBonus = equippedWeapon?.reinforceLevel ? equippedWeapon.reinforceLevel * 5 : 0;
            const dmg = baseDmg + reinforceBonus + Math.floor(Math.random() * 6);

            const nextHp = m.hp - dmg;
            sound.playHit();
            addFloatingText(m.x, m.y, `-${dmg}`, '#ef4444');
            addParticles(m.x, m.y, '#dc2626', 8);

            if (nextHp <= 0) {
              // Mob defeated
              gainExp(m.type === 'golem_boss' ? 300 : 40);
              const dropCoins = m.type === 'golem_boss' ? 150 : Math.floor(Math.random() * 15 + 10);
              setGold((g) => g + dropCoins);
              addFloatingText(m.x, m.y, `+${dropCoins} Emas`, '#facc15');

              if (m.isAnimal) {
                addItemToInventory(ITEMS['raw_meat'], 2);
                addItemToInventory(ITEMS['leather'], 1);
                addFloatingText(m.x, m.y, '+2 Daging, +1 Kulit', '#fb923c');
              } else {
                updateQuestProgress('kill_monster', 1);
                if (m.type === 'golem_boss') {
                  updateQuestProgress('kill_golem_boss', 1);
                  addItemToInventory(ITEMS['crystal_gem'], 3);
                }
              }
              return null;
            }

            return { ...m, hp: nextHp, targetPlayer: true };
          }
          return m;
        })
        .filter(Boolean) as Mob[];

      return { ...prev, mobs: nextMobs };
    });

    // 2. Check if chopping tree or mining rock at tile
    setWorldData((prev) => {
      const tile = prev.tiles[targetY]?.[targetX];
      if (!tile) return prev;

      let changed = false;
      const nextTiles = prev.tiles.map((row, ry) =>
        row.map((t, rx) => {
          if (rx === targetX && ry === targetY) {
            if (t.hasTree) {
              changed = true;
              sound.playChop();
              addParticles(rx, ry, '#78350f', 5);
              const nextTh = t.treeHealth - 1;
              if (nextTh <= 0) {
                addItemToInventory(ITEMS['wood'], 3);
                addItemToInventory(ITEMS['fiber'], 2);
                updateQuestProgress('wood', 3);
                gainExp(15);
                addFloatingText(rx, ry, '+3 Kayu, +2 Serat', '#22c55e');
                return { ...t, hasTree: false, treeHealth: 0 };
              }
              return { ...t, treeHealth: nextTh };
            }

            if (t.hasRock) {
              changed = true;
              sound.playMine();
              addParticles(rx, ry, '#64748b', 5);
              const nextRh = t.rockHealth - 1;
              if (nextRh <= 0) {
                if (t.rockType === 'stone') {
                  addItemToInventory(ITEMS['stone'], 3);
                  updateQuestProgress('stone', 3);
                  addFloatingText(rx, ry, '+3 Batu Kasar', '#94a3b8');
                } else if (t.rockType === 'iron') {
                  addItemToInventory(ITEMS['iron_ore'], 2);
                  addFloatingText(rx, ry, '+2 Bijih Besi', '#fb923c');
                } else if (t.rockType === 'gold') {
                  addItemToInventory(ITEMS['gold_ore'], 2);
                  addFloatingText(rx, ry, '+2 Bijih Emas', '#facc15');
                } else if (t.rockType === 'gem') {
                  addItemToInventory(ITEMS['crystal_gem'], 1);
                  addFloatingText(rx, ry, '+1 Kristal Mana', '#38bdf8');
                }
                gainExp(20);
                return { ...t, hasRock: false, rockHealth: 0 };
              }
              return { ...t, rockHealth: nextRh };
            }
          }
          return t;
        })
      );

      return changed ? { ...prev, tiles: nextTiles } : prev;
    });
  }, [
    isAttacking,
    playerPos,
    equippedWeapon,
    addItemToInventory,
    updateQuestProgress,
    gainExp,
  ]);

  // Main Interact Action (Harvest crops, Fish in water, Till soil, Sleep in bed)
  const handleInteract = useCallback(() => {
    const targetX = playerPos.x + (playerPos.facing === 'right' ? 1 : playerPos.facing === 'left' ? -1 : 0);
    const targetY = playerPos.y + (playerPos.facing === 'down' ? 1 : playerPos.facing === 'up' ? -1 : 0);

    const tile = worldData.tiles[targetY]?.[targetX];
    if (!tile) return;

    // 1. Structure interaction: Bed
    if (tile.structure?.type === 'bed') {
      sound.playLevelUp();
      setPlayerHp(playerMaxHp);
      setTimeOfDay(6.0); // skip to 6 AM morning
      addFloatingText(playerPos.x, playerPos.y, 'Tidur Nyenyak: HP Penuh!', '#38bdf8');
      return;
    }

    // 2. Structure interaction: Campfire
    if (tile.structure?.type === 'campfire') {
      setActiveModal('cooking');
      return;
    }

    // 3. Structure interaction: Forge
    if (tile.structure?.type === 'forge') {
      setActiveModal('crafting');
      return;
    }

    // 4. Structure interaction: Player Shop
    if (tile.structure?.type === 'shop_stall') {
      setActiveModal('shop');
      return;
    }

    // 5. Water tile: Fishing
    if (tile.baseType === 'water') {
      if (isFishing) {
        // Reel in
        if (fishingBite) {
          sound.playSplash();
          sound.playCoin();
          addItemToInventory(ITEMS['fresh_fish'], 1);
          updateQuestProgress('fresh_fish', 1);
          gainExp(25);
          addFloatingText(playerPos.x, playerPos.y, '+1 Ikan Gurame Segar!', '#38bdf8');
        } else {
          sound.playTone(300, 200, 'sine', 0.08);
        }
        setIsFishing(false);
        setFishingBite(false);
      } else {
        // Cast rod
        sound.playTone(400, 700, 'sine', 0.1);
        setIsFishing(true);
        setFishingBite(false);
        // Random bite timer between 1.5s and 3.5s
        setTimeout(() => {
          setIsFishing((current) => {
            if (current) {
              setFishingBite(true);
              sound.playFishBite();
            }
            return current;
          });
        }, Math.random() * 2000 + 1500);
      }
      return;
    }

    // 6. Farm plot / crop harvest
    if (tile.baseType === 'tilled_soil') {
      if (tile.crop && tile.crop.stage >= tile.crop.maxStage) {
        // Harvest mature crop
        sound.playTone(550, 750, 'sine', 0.08);
        addItemToInventory(ITEMS['wheat'], 2);
        addItemToInventory(ITEMS['wheat_seed'], 2);
        gainExp(15);
        addFloatingText(targetX, targetY, '+2 Gandum, +2 Bibit', '#facc15');

        setWorldData((prev) => ({
          ...prev,
          tiles: prev.tiles.map((row, ry) =>
            row.map((t, rx) =>
              rx === targetX && ry === targetY
                ? { ...t, crop: { type: 'wheat', stage: 0, maxStage: 3, watered: true, growthTimer: 10 } }
                : t
            )
          ),
        }));
        return;
      }
    }

    // 7. Till soil with hoe if player equipped hoe or has hoe in inventory
    const hasHoe = equippedTool?.toolType === 'hoe' || inventory.some((s) => s.item.id === 'hoe');
    if (hasHoe && tile.baseType === 'grass') {
      sound.playMine();
      addFloatingText(targetX, targetY, 'Lahan Tani Gembur!', '#a3e635');
      setWorldData((prev) => ({
        ...prev,
        tiles: prev.tiles.map((row, ry) =>
          row.map((t, rx) =>
            rx === targetX && ry === targetY
              ? {
                  ...t,
                  baseType: 'tilled_soil',
                  crop: { type: 'wheat', stage: 0, maxStage: 3, watered: true, growthTimer: 10 },
                }
              : t
          )
        ),
      }));
    }
  }, [
    playerPos,
    worldData.tiles,
    isFishing,
    fishingBite,
    playerMaxHp,
    equippedTool,
    inventory,
    addItemToInventory,
    updateQuestProgress,
    gainExp,
  ]);

  // Dash Action
  const handleDash = useCallback(() => {
    sound.playDash();
    const dashDistance = 2.5;
    const dx = playerPos.facing === 'right' ? dashDistance : playerPos.facing === 'left' ? -dashDistance : 0;
    const dy = playerPos.facing === 'down' ? dashDistance : playerPos.facing === 'up' ? -dashDistance : 0;

    const newX = Math.max(1, Math.min(WORLD_WIDTH - 2, playerPos.x + dx));
    const newY = Math.max(1, Math.min(WORLD_HEIGHT - 2, playerPos.y + dy));

    addParticles(playerPos.x, playerPos.y, '#38bdf8', 6);
    setPlayerPos((prev) => ({ ...prev, x: newX, y: newY }));
  }, [playerPos]);

  // Quick Eat Action
  const handleQuickEat = useCallback(() => {
    const foodSlot = inventory.find((s) => s.item.type === 'food');
    if (!foodSlot) {
      addFloatingText(playerPos.x, playerPos.y, 'Tidak ada makanan di tas!', '#f87171');
      return;
    }

    sound.playEat();
    const item = foodSlot.item;
    deductItemFromInventory(item.id, 1);

    if (item.hungerRestore) {
      setPlayerHunger((h) => Math.min(100, h + item.hungerRestore!));
    }
    if (item.thirstRestore) {
      setPlayerThirst((t) => Math.min(100, t + item.thirstRestore!));
    }
    if (item.healAmount) {
      setPlayerHp((hp) => Math.min(playerMaxHp, hp + item.healAmount!));
    }

    addFloatingText(
      playerPos.x,
      playerPos.y,
      `+${item.hungerRestore || 20}% Kenyang`,
      '#4ade80'
    );
  }, [inventory, playerPos, playerMaxHp, deductItemFromInventory]);

  // Cycle Equipped Tool
  const handleCycleTool = useCallback(() => {
    const tools = inventory.filter(
      (s) => s.item.type === 'tool' || s.item.type === 'weapon'
    );
    if (tools.length === 0) return;

    sound.playTone(600, 750, 'sine', 0.05);
    const currentIndex = tools.findIndex((s) => s.item.id === equippedTool?.id);
    const nextTool = tools[(currentIndex + 1) % tools.length].item;
    setEquippedTool(nextTool);
    if (nextTool.type === 'weapon') setEquippedWeapon(nextTool);
    addFloatingText(playerPos.x, playerPos.y, nextTool.nameId, '#fde047');
  }, [inventory, equippedTool, playerPos]);

  // Place Building Structure on World Tile
  const handlePlaceStructure = (tileX: number, tileY: number) => {
    if (!activePlacingType) return;

    const tile = worldData.tiles[tileY]?.[tileX];
    if (!tile || tile.baseType === 'water' || tile.structure) return;

    sound.playBuild();
    addParticles(tileX, tileY, '#b45309', 6);
    addFloatingText(tileX, tileY, 'Bangunan Berhasil Didirikan!', '#60a5fa');

    // Deduct structure item
    deductItemFromInventory(activePlacingType, 1);
    updateQuestProgress('build_structure', 1);

    setWorldData((prev) => ({
      ...prev,
      tiles: prev.tiles.map((row, ry) =>
        row.map((t, rx) =>
          rx === tileX && ry === tileY
            ? {
                ...t,
                hasTree: false,
                hasRock: false,
                structure: {
                  id: `st_${Date.now()}`,
                  type: activePlacingType,
                  x: tileX,
                  y: tileY,
                  hp: 100,
                  maxHp: 100,
                },
              }
            : t
        )
      ),
    }));

    setActivePlacingType(null);
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;

      keysPressed.current[e.key.toLowerCase()] = true;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleAttack();
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleInteract();
      } else if (e.key === 'Shift') {
        e.preventDefault();
        handleDash();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleQuickEat();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleCycleTool();
      } else if (e.key === 'Escape') {
        setGameState((s) => (s === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, handleAttack, handleInteract, handleDash, handleQuickEat, handleCycleTool]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let lastTime = performance.now();
    let animId: number;

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      // 1. Move Player from Keyboard or Touch D-Pad
      let dx = moveDirection.current.dx;
      let dy = moveDirection.current.dy;

      if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy = -1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy = 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx = -1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx = 1;

      if (dx !== 0 || dy !== 0) {
        const speed = 4.0; // tiles per second
        let nextFacing = playerPos.facing;
        if (Math.abs(dx) > Math.abs(dy)) {
          nextFacing = dx > 0 ? 'right' : 'left';
        } else {
          nextFacing = dy > 0 ? 'down' : 'up';
        }

        const nextX = Math.max(1, Math.min(WORLD_WIDTH - 2, playerPos.x + dx * speed * dt));
        const nextY = Math.max(1, Math.min(WORLD_HEIGHT - 2, playerPos.y + dy * speed * dt));

        // Basic collision with water and solid walls
        const targetTile = worldData.tiles[Math.floor(nextY)]?.[Math.floor(nextX)];
        const isBlocked =
          targetTile?.baseType === 'water' ||
          targetTile?.structure?.type === 'wall_wood' ||
          targetTile?.structure?.type === 'wall_stone';

        if (!isBlocked) {
          setPlayerPos({ x: nextX, y: nextY, facing: nextFacing });
        } else {
          setPlayerPos((p) => ({ ...p, facing: nextFacing }));
        }
      }

      // 2. Advance Day / Night Cycle (1 min in game = 1 sec in real life)
      setTimeOfDay((t) => (t + dt * 0.2) % 24);

      // 3. Update Floating Texts & Particles
      setFloatingTexts((prev) =>
        prev
          .map((ft) => ({ ...ft, y: ft.y - 20 * dt, lifetime: ft.lifetime - dt }))
          .filter((ft) => ft.lifetime > 0)
      );

      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            lifetime: p.lifetime - dt,
          }))
          .filter((p) => p.lifetime > 0)
      );

      // 4. Update Mobs AI (Aggressive chase player within range)
      setWorldData((prev) => {
        const updated = prev.mobs.map((mob) => {
          const distToPlayer = Math.hypot(playerPos.x - mob.x, playerPos.y - mob.y);

          // Attack player if within 1 tile
          if (distToPlayer < 1.1 && mob.attackCooldown <= 0 && mob.damage > 0) {
            const incomingDmg = Math.max(1, mob.damage - (equippedArmor?.defense || 0));
            setPlayerHp((hp) => {
              const nextHp = hp - incomingDmg;
              if (nextHp <= 0) setGameState('GAME_OVER');
              return Math.max(0, nextHp);
            });
            sound.playHit();
            addFloatingText(playerPos.x, playerPos.y, `-${incomingDmg} HP`, '#ef4444');
            return { ...mob, attackCooldown: 1.5 };
          }

          // Move towards player if aggressive and within 6 tiles
          if (mob.aggressive && distToPlayer < 6 && distToPlayer > 1.0) {
            const angle = Math.atan2(playerPos.y - mob.y, playerPos.x - mob.x);
            const mx = mob.x + Math.cos(angle) * mob.speed * dt;
            const my = mob.y + Math.sin(angle) * mob.speed * dt;
            return {
              ...mob,
              x: mx,
              y: my,
              attackCooldown: Math.max(0, mob.attackCooldown - dt),
            };
          }

          return {
            ...mob,
            attackCooldown: Math.max(0, mob.attackCooldown - dt),
          };
        });

        return { ...prev, mobs: updated };
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, playerPos, worldData.tiles, equippedArmor]);

  // Survival Hunger & Thirst Timer (Slow drain over time)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      setPlayerHunger((h) => {
        const next = Math.max(0, h - 1);
        if (next === 0) {
          // Hunger starvation drains HP
          setPlayerHp((hp) => Math.max(0, hp - 2));
        }
        return next;
      });

      setPlayerThirst((t) => Math.max(0, t - 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Player Market Stall: Simulated NPC Purchases while shop is open
  useEffect(() => {
    if (gameState !== 'PLAYING' || !playerShop.isOpen || playerShop.items.length === 0) return;

    const npcNames = [
      'NPC Pedagang Hasan',
      'NPC Petani Joko',
      'NPC Nelayan Udin',
      'Dewi_Craft',
      'Budi_Slayer',
    ];

    const shopInterval = setInterval(() => {
      // 50% chance an NPC buys a random stocked item
      if (Math.random() < 0.6 && playerShop.items.length > 0) {
        const randIndex = Math.floor(Math.random() * playerShop.items.length);
        const boughtItem = playerShop.items[randIndex];
        const randomCustomer = npcNames[Math.floor(Math.random() * npcNames.length)];

        sound.playCoin();
        addFloatingText(playerPos.x, playerPos.y, `Barang Toko Terjual: +${boughtItem.price} Emas!`, '#facc15');

        setPlayerShop((prev) => {
          const updatedItems = prev.items
            .map((item, idx) =>
              idx === randIndex ? { ...item, count: item.count - 1 } : item
            )
            .filter((item) => item.count > 0);

          const newLog = {
            id: `log_${Date.now()}`,
            buyerName: randomCustomer,
            itemName: boughtItem.item.nameId,
            price: boughtItem.price,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          return {
            ...prev,
            items: updatedItems,
            totalEarnings: prev.totalEarnings + boughtItem.price,
            customerLogs: [newLog, ...prev.customerLogs].slice(0, 8),
          };
        });
      }
    }, 12000);

    return () => clearInterval(shopInterval);
  }, [gameState, playerShop.isOpen, playerShop.items, playerPos]);

  // Crafting Handler
  const handleCraftRecipe = (recipe: CraftingRecipe) => {
    recipe.ingredients.forEach((ing) => {
      deductItemFromInventory(ing.itemId, ing.count);
    });
    const resultItem = ITEMS[recipe.resultId];
    if (resultItem) {
      addItemToInventory(resultItem, recipe.resultCount);
      gainExp(30);
      addFloatingText(playerPos.x, playerPos.y, `Berhasil Membuat ${resultItem.nameId}!`, '#4ade80');
    }
  };

  // Cooking Handler
  const handleCookRecipe = (recipeId: string) => {
    const recipe = COOKING_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;
    recipe.ingredients.forEach((ing) => {
      deductItemFromInventory(ing.itemId, ing.count);
    });
    const resultItem = ITEMS[recipe.resultId];
    if (resultItem) {
      addItemToInventory(resultItem, recipe.resultCount);
      gainExp(25);
      addFloatingText(playerPos.x, playerPos.y, `Matang: ${resultItem.nameId}!`, '#fb923c');
    }
  };

  // Tame / Feed Livestock Animal
  const handleTameOrFeedAnimal = (mobId: string) => {
    const wheatSlot = inventory.find((s) => s.item.id === 'wheat');
    if (!wheatSlot || wheatSlot.count <= 0) {
      addFloatingText(playerPos.x, playerPos.y, 'Butuh Gandum Panen (🌾) di tas!', '#f87171');
      return;
    }

    deductItemFromInventory('wheat', 1);

    setWorldData((prev) => ({
      ...prev,
      mobs: prev.mobs.map((m) => {
        if (m.id === mobId) {
          addFloatingText(m.x, m.y, 'Ternak Sangat Senang! ❤️', '#ec4899');
          if (m.type === 'cow') addItemToInventory(ITEMS['milk_bucket'], 1);
          if (m.type === 'chicken') addItemToInventory(ITEMS['egg'], 2);
          return { ...m, isTamed: true };
        }
        return m;
      }),
    }));
  };

  // Reinforce Equipment (+1..+5) at Blacksmith Anvil
  const handleReinforceItem = (item: Item) => {
    const ironOre = inventory.find((s) => s.item.id === 'iron_ore');
    const crystal = inventory.find((s) => s.item.id === 'crystal_gem');

    if (!ironOre || ironOre.count < 3) {
      addFloatingText(playerPos.x, playerPos.y, 'Butuh 3 Bijih Besi untuk memperkuat!', '#f87171');
      return;
    }

    const currentLevel = item.reinforceLevel || 0;
    if (currentLevel >= 5) {
      addFloatingText(playerPos.x, playerPos.y, 'Tingkat Maksimal (+5) Tercapai!', '#facc15');
      return;
    }

    // High level requires crystal gem
    if (currentLevel >= 3 && (!crystal || crystal.count < 1)) {
      addFloatingText(playerPos.x, playerPos.y, 'Butuh 1 Kristal Mana untuk memperkuat ke +4/+5!', '#38bdf8');
      return;
    }

    deductItemFromInventory('iron_ore', 3);
    if (currentLevel >= 3) deductItemFromInventory('crystal_gem', 1);

    sound.playTone(600, 900, 'sawtooth', 0.15);
    const nextLevel = currentLevel + 1;

    setInventory((prev) =>
      prev.map((s) =>
        s.item.id === item.id
          ? {
              ...s,
              item: {
                ...s.item,
                reinforceLevel: nextLevel,
                damage: s.item.damage ? s.item.damage + 6 : undefined,
                defense: s.item.defense ? s.item.defense + 4 : undefined,
              },
            }
          : s
      )
    );

    addFloatingText(playerPos.x, playerPos.y, `SENJATA DIPERKUAT KE +${nextLevel}! ⭐`, '#facc15');
  };

  // Skill Unlock Handler
  const handleUnlockSkill = (skillId: string) => {
    const node = skillNodes.find((n) => n.id === skillId);
    if (!node || skillPoints < node.cost) return;

    setSkillPoints((sp) => sp - node.cost);
    setSkillNodes((prev) =>
      prev.map((n) => (n.id === skillId ? { ...n, unlocked: true } : n))
    );

    if (node.bonusType === 'defense_bonus') {
      setPlayerMaxHp((hp) => hp + 30);
      setPlayerHp((hp) => hp + 30);
    }

    addFloatingText(playerPos.x, playerPos.y, `Keahlian Aktif: ${node.nameId}!`, '#a855f7');
  };

  // Quest Claim Handler
  const handleClaimQuest = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    setGold((g) => g + quest.rewardGold);
    gainExp(quest.rewardExp);

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, claimed: true } : q))
    );

    addFloatingText(playerPos.x, playerPos.y, `Hadiah Misi: +${quest.rewardGold} Emas!`, '#facc15');
  };

  // Toggle Sound Mute
  const handleToggleMute = () => {
    sound.isMuted = !sound.isMuted;
    setIsMuted(sound.isMuted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. TITLE SCREEN / MAIN MENU */}
      {gameState === 'TITLE_MENU' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-between p-6 bg-slate-950 text-white">
          {/* Background live cover */}
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/pixel_survival_cover_1793158498866.jpg"
              alt="PixelCraft Odyssey Cover"
              className="w-full h-full object-cover opacity-35 filter brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </div>

          {/* Top Info */}
          <div className="relative z-10 flex items-center justify-between w-full max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs text-emerald-300 font-mono">Server Aktif · 60 FPS</span>
            </div>
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Center Title Lockup */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-md">
            <div className="mb-2 p-3 bg-amber-500/20 border border-amber-500/50 rounded-2xl shadow-lg">
              <span className="text-4xl">⚔️ 🌲 🏡</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-pixel text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-400 to-cyan-400">
              PIXELCRAFT ODYSSEY
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
              Open-World 2D Pixel Survival · Bertani, Memancing, Toko Pemain & Guild
            </p>

            {/* Start Button */}
            <button
              onClick={() => {
                sound.playMorningChime();
                setGameState('PLAYING');
              }}
              className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Mulai Bertualang Sekarang</span>
            </button>

            <button
              onClick={() => setActiveModal('character')}
              className="mt-2.5 text-xs text-amber-300 hover:underline flex items-center gap-1 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kustomisasi Hero & Kosmetik (Pria / Wanita)</span>
            </button>
          </div>

          {/* Footer Controls Hint */}
          <div className="relative z-10 text-center text-[11px] text-slate-400 max-w-lg">
            <span>Kontrol Sentuh 1 Tangan HP & D-Pad Virtual · WASD / Spasi / E di Komputer</span>
          </div>
        </div>
      )}

      {/* 2. ACTIVE GAME VIEWPORT & LOW-OCCLUSION HUD */}
      <GameCanvas
        tiles={worldData.tiles}
        mobs={worldData.mobs}
        playerPos={playerPos}
        playerCustom={playerCustom}
        equippedItem={equippedWeapon || equippedTool}
        isAttacking={isAttacking}
        attackAngle={attackAngle}
        isFishing={isFishing}
        fishingBite={fishingBite}
        timeOfDay={timeOfDay}
        onlinePlayers={onlinePlayers}
        floatingTexts={floatingTexts}
        particles={particles}
        onTileClick={handlePlaceStructure}
        playerHp={playerHp}
        playerMaxHp={playerMaxHp}
        showHitStop={false}
      />

      {/* TOP IN-GAME HUD: Status Meters (HP, Hunger, Thirst, Gold, Time) */}
      <div className="absolute top-2 left-2 right-2 pointer-events-none flex items-start justify-between z-10">
        {/* Left Status Cluster */}
        <div className="flex flex-col gap-1 pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-2 shadow-lg">
          {/* HP Bar */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%` }}
              />
            </div>
            <span className="font-mono text-slate-200 tabular-nums text-[10px]">
              {playerHp}/{playerMaxHp}
            </span>
          </div>

          {/* Hunger Bar */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <Utensils className="w-3.5 h-3.5 text-amber-500" />
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${playerHunger}%` }}
              />
            </div>
            <span className="font-mono text-slate-200 tabular-nums text-[10px]">{playerHunger}%</span>
          </div>

          {/* Thirst Bar */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <Droplet className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all"
                style={{ width: `${playerThirst}%` }}
              />
            </div>
            <span className="font-mono text-slate-200 tabular-nums text-[10px]">{playerThirst}%</span>
          </div>
        </div>

        {/* Center Clock & Biome Readout */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800/90 px-3 py-1 rounded-2xl shadow-lg text-xs">
          {timeOfDay >= 6 && timeOfDay < 18 ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-300" />
          )}
          <span className="font-mono font-bold text-slate-200 tabular-nums">
            {Math.floor(timeOfDay).toString().padStart(2, '0')}:
            {Math.floor((timeOfDay % 1) * 60)
              .toString()
              .padStart(2, '0')}
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">
            {timeOfDay >= 19 || timeOfDay < 5 ? 'Malam Buas' : 'Siang Hari'}
          </span>
        </div>

        {/* Right Currency & Pause Cluster */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800/90 px-2.5 py-1 rounded-2xl shadow-lg text-xs text-amber-300 font-bold font-mono">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{gold}</span>
          </div>

          <button
            onClick={() => setGameState('PAUSED')}
            className="w-8 h-8 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shadow-lg active:scale-95"
            title="Jeda Permainan"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Structure Placement Active Banner */}
      {activePlacingType && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-blue-900/90 border border-blue-400 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2">
          <span>Mode Bangun: Ketuk petak tanah untuk mendirikan struktur!</span>
          <button
            onClick={() => setActivePlacingType(null)}
            className="bg-blue-950 px-2 py-0.5 rounded-full text-[10px] hover:bg-rose-900 text-slate-200"
          >
            Batal
          </button>
        </div>
      )}

      {/* 3. MOBILE ON-SCREEN CONTROLS (One-Handed Ergonomic Layout) */}
      <MobileControls
        onMoveChange={(dx, dy) => {
          moveDirection.current = { dx, dy };
        }}
        onAttack={handleAttack}
        onInteract={handleInteract}
        onDash={handleDash}
        onQuickEat={handleQuickEat}
        onCycleTool={handleCycleTool}
        onOpenModal={(modal) => setActiveModal(modal)}
        isRightHanded={isRightHanded}
        onToggleHandedness={() => setIsRightHanded((r) => !r)}
        equippedToolName={equippedTool?.nameId}
      />

      {/* 4. MODALS */}
      <InventoryModal
        isOpen={activeModal === 'inventory'}
        onClose={() => setActiveModal(null)}
        inventory={inventory}
        gold={gold}
        equippedWeapon={equippedWeapon}
        equippedArmor={equippedArmor}
        equippedTool={equippedTool}
        onEquipItem={(item) => {
          if (item.type === 'weapon') setEquippedWeapon(item);
          if (item.type === 'armor') setEquippedArmor(item);
          if (item.type === 'tool') setEquippedTool(item);
          addFloatingText(playerPos.x, playerPos.y, `Memakai ${item.nameId}`, '#38bdf8');
        }}
        onUseItem={(item) => {
          deductItemFromInventory(item.id, 1);
          if (item.hungerRestore) setPlayerHunger((h) => Math.min(100, h + item.hungerRestore!));
          if (item.thirstRestore) setPlayerThirst((t) => Math.min(100, t + item.thirstRestore!));
          if (item.healAmount) setPlayerHp((hp) => Math.min(playerMaxHp, hp + item.healAmount!));
        }}
        onDropItem={(item) => {
          deductItemFromInventory(item.id, 1);
          addFloatingText(playerPos.x, playerPos.y, `Membuang 1 ${item.nameId}`, '#94a3b8');
        }}
        onReinforceItem={handleReinforceItem}
        nearForge={true}
      />

      <CraftingModal
        isOpen={activeModal === 'crafting'}
        onClose={() => setActiveModal(null)}
        inventory={inventory}
        onCraftRecipe={handleCraftRecipe}
        nearForge={true}
      />

      <CookingFarmingModal
        isOpen={activeModal === 'cooking'}
        onClose={() => setActiveModal(null)}
        inventory={inventory}
        onCookRecipe={handleCookRecipe}
        mobs={worldData.mobs}
        onTameOrFeedAnimal={handleTameOrFeedAnimal}
      />

      <HousingBuildModal
        isOpen={activeModal === 'housing'}
        onClose={() => setActiveModal(null)}
        inventory={inventory}
        onSelectStructureToPlace={(type) => setActivePlacingType(type)}
        activePlacingType={activePlacingType}
      />

      <PlayerShopModal
        isOpen={activeModal === 'shop'}
        onClose={() => setActiveModal(null)}
        shop={playerShop}
        inventory={inventory}
        onUpdateShopName={(name) => {
          setPlayerShop((s) => ({ ...s, name }));
          updateQuestProgress('open_shop', 1);
        }}
        onToggleShopOpen={() =>
          setPlayerShop((s) => ({ ...s, isOpen: !s.isOpen }))
        }
        onAddItemToShop={(item, count, price) => {
          deductItemFromInventory(item.id, count);
          setPlayerShop((prev) => ({
            ...prev,
            items: [
              ...prev.items,
              { id: `stall_${Date.now()}`, item, count, price },
            ],
          }));
          updateQuestProgress('open_shop', 1);
        }}
        onRemoveItemFromShop={(shopItemId) => {
          const target = playerShop.items.find((i) => i.id === shopItemId);
          if (target) {
            addItemToInventory(target.item, target.count);
            setPlayerShop((prev) => ({
              ...prev,
              items: prev.items.filter((i) => i.id !== shopItemId),
            }));
          }
        }}
        onCollectEarnings={() => {
          const amt = playerShop.totalEarnings;
          setGold((g) => g + amt);
          setPlayerShop((s) => ({ ...s, totalEarnings: 0 }));
          addFloatingText(playerPos.x, playerPos.y, `Tarik +${amt} Emas!`, '#facc15');
        }}
      />

      <SkillTreeModal
        isOpen={activeModal === 'skills'}
        onClose={() => setActiveModal(null)}
        skillNodes={skillNodes}
        skillPoints={skillPoints}
        playerLevel={playerLevel}
        playerExp={playerExp}
        playerMaxExp={playerMaxExp}
        onUnlockSkill={handleUnlockSkill}
      />

      <MultiplayerGuildModal
        isOpen={activeModal === 'guild'}
        onClose={() => setActiveModal(null)}
        onlinePlayers={onlinePlayers}
        guild={guild}
        roomCode={roomCode}
        inventory={inventory}
        gold={gold}
        tradeOffer={tradeOffer}
        onInitiateTrade={(partnerName) => {
          setTradeOffer({
            active: true,
            partnerName,
            playerOfferedItems: [],
            playerOfferedGold: 0,
            partnerOfferedItems: [{ item: ITEMS['crystal_gem'], count: 1 }],
            partnerOfferedGold: 50,
            playerAccepted: false,
            partnerAccepted: false,
          });
        }}
        onOfferItemInTrade={(item, count) => {
          setTradeOffer((prev) =>
            prev
              ? {
                  ...prev,
                  playerOfferedItems: [...prev.playerOfferedItems, { item, count }],
                }
              : null
          );
        }}
        onOfferGoldInTrade={(amount) => {
          setTradeOffer((prev) =>
            prev
              ? {
                  ...prev,
                  playerOfferedGold: prev.playerOfferedGold + amount,
                }
              : null
          );
        }}
        onConfirmTrade={() => {
          if (!tradeOffer) return;
          // Execute barter transfer
          tradeOffer.partnerOfferedItems.forEach((slot) => {
            addItemToInventory(slot.item, slot.count);
          });
          setGold((g) => g + tradeOffer.partnerOfferedGold - tradeOffer.playerOfferedGold);
          tradeOffer.playerOfferedItems.forEach((slot) => {
            deductItemFromInventory(slot.item.id, slot.count);
          });
          setTradeOffer(null);
          addFloatingText(playerPos.x, playerPos.y, 'Barter Selesai dengan Sukses!', '#4ade80');
        }}
        onCancelTrade={() => setTradeOffer(null)}
        onDonateToGuild={(amount) => {
          setGold((g) => Math.max(0, g - amount));
          setGuild((g) => ({ ...g, treasury: g.treasury + amount }));
          gainExp(50);
        }}
        onCreateOrUpdateGuild={(name, motto) => {
          setGuild((g) => ({ ...g, name, motto }));
        }}
      />

      <VoiceNoteChatModal
        isOpen={activeModal === 'voice'}
        onClose={() => setActiveModal(null)}
        messages={messages}
        onSendMessage={(content, channel) => {
          const newMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            sender: playerName,
            channel,
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((m) => [...m, newMsg]);
        }}
        onSendVoiceNote={(voiceNote, channel) => {
          const newMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            sender: playerName,
            channel,
            voiceNote,
            timestamp: voiceNote.timestamp,
          };
          setMessages((m) => [...m, newMsg]);
        }}
        playerName={playerName}
      />

      <ModManagerModal
        isOpen={activeModal === 'mods'}
        onClose={() => setActiveModal(null)}
        mods={mods}
        onToggleMod={(modId) => {
          setMods((prev) =>
            prev.map((m) => (m.id === modId ? { ...m, enabled: !m.enabled } : m))
          );
        }}
        onCreateCustomMod={(newMod) => {
          setMods((prev) => [newMod, ...prev]);
          // Add custom mob to world
          if (newMod.customMobs[0]) {
            const cm = newMod.customMobs[0];
            setWorldData((prev) => ({
              ...prev,
              mobs: [
                ...prev.mobs,
                {
                  id: `custom_mob_${Date.now()}`,
                  type: cm.type as any,
                  name: cm.name,
                  nameId: cm.name,
                  x: playerPos.x + 3,
                  y: playerPos.y + 3,
                  hp: cm.hp,
                  maxHp: cm.hp,
                  speed: 1.0,
                  damage: cm.damage,
                  aggressive: cm.aggressive,
                  isAnimal: false,
                  facing: 'down',
                  animFrame: 0,
                  attackCooldown: 0,
                  targetPlayer: false,
                  customColor: cm.color,
                },
              ],
            }));
          }
        }}
        onImportModJson={(jsonStr) => {
          const parsed = JSON.parse(jsonStr) as GameMod;
          setMods((prev) => [parsed, ...prev]);
        }}
      />

      <CharacterCreatorModal
        isOpen={activeModal === 'character'}
        onClose={() => setActiveModal(null)}
        customization={playerCustom}
        onSaveCustomization={(newCust) => setPlayerCustom(newCust)}
        playerName={playerName}
        onChangePlayerName={(name) => setPlayerName(name)}
      />

      <QuestModal
        isOpen={activeModal === 'quest'}
        onClose={() => setActiveModal(null)}
        quests={quests}
        onClaimReward={handleClaimQuest}
      />

      {/* 5. PAUSE MODAL */}
      {gameState === 'PAUSED' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-2xl p-5 text-center flex flex-col gap-3 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-100">Permainan Dijeda</h3>
            <p className="text-xs text-slate-400">
              Istirahat sejenak atau atur preferensi petualanganmu.
            </p>

            <button
              onClick={() => setGameState('PLAYING')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow"
            >
              Lanjutkan Bertualang
            </button>

            <button
              onClick={handleToggleMute}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? 'Buka Suara (Unmute)' : 'Matikan Suara (Mute)'}</span>
            </button>

            <button
              onClick={() => {
                const { tiles, mobs } = generateWorld();
                setWorldData({ tiles, mobs });
                setPlayerHp(100);
                setPlayerHunger(85);
                setPlayerThirst(90);
                setPlayerPos({ x: 35, y: 35, facing: 'down' });
                setGameState('PLAYING');
              }}
              className="w-full py-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mulai Ulang Dunia Baru</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. GAME OVER MODAL */}
      {gameState === 'GAME_OVER' && (
        <div className="fixed inset-0 z-50 bg-red-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-red-700/80 rounded-2xl p-5 text-center flex flex-col gap-3 shadow-2xl">
            <span className="text-4xl">💀</span>
            <h3 className="font-bold text-lg text-red-400">Kamu Gugur di Alam Liar</h3>
            <p className="text-xs text-slate-400">
              Kerasnya bertahan hidup menuntut persiapan matang. Bangkitlah kembali ksatria!
            </p>

            <button
              onClick={() => {
                sound.playMorningChime();
                setPlayerHp(playerMaxHp);
                setPlayerHunger(70);
                setPlayerThirst(70);
                setPlayerPos({ x: 35, y: 35, facing: 'down' });
                setGameState('PLAYING');
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-lg"
            >
              Respawn di Rumah (Pondok Survival)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
