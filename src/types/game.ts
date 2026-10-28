/**
 * Core Game Types for PixelCraft Odyssey
 */

export type BiomeType = 'plains' | 'forest' | 'desert' | 'snow' | 'dungeon';

export type ItemType =
  | 'tool'
  | 'weapon'
  | 'armor'
  | 'resource'
  | 'food'
  | 'seed'
  | 'structure'
  | 'fish'
  | 'potion'
  | 'gem';

export interface Item {
  id: string;
  name: string;
  nameId: string; // Indonesian display name
  type: ItemType;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  description: string;
  descriptionId: string;
  damage?: number;
  defense?: number;
  hungerRestore?: number;
  thirstRestore?: number;
  energyRestore?: number;
  healAmount?: number;
  sellPrice: number;
  stackable: boolean;
  maxStack?: number;
  reinforceLevel?: number; // 0 to 5
  toolType?: 'axe' | 'pickaxe' | 'sword' | 'hoe' | 'rod';
  structureType?: StructureType;
  cropSeedType?: CropType;
}

export interface InventorySlot {
  item: Item;
  count: number;
}

export type StructureType =
  | 'wall_wood'
  | 'wall_stone'
  | 'floor_wood'
  | 'door'
  | 'campfire'
  | 'bed'
  | 'chest'
  | 'forge'
  | 'cooking_pot'
  | 'shop_stall'
  | 'fence'
  | 'farm_plot';

export type CropType = 'wheat' | 'carrot' | 'berry' | 'pumpkin';

export interface PlacedCrop {
  type: CropType;
  stage: number; // 0 (seed), 1 (sprout), 2 (growing), 3 (mature)
  maxStage: number;
  watered: boolean;
  growthTimer: number;
}

export interface PlacedStructure {
  id: string;
  type: StructureType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  customData?: any;
}

export interface PlayerCustomization {
  gender: 'pria' | 'wanita';
  hairStyle: 'pendek' | 'cepak' | 'gondrong' | 'kuncir' | 'ekor_kuda';
  hairColor: string;
  skinColor: string;
  outfitColor: string;
  hat: 'none' | 'topi_jerami' | 'helm_ksatria' | 'mahkota';
  aura: 'none' | 'api' | 'daun' | 'kristal' | 'emas';
}

export interface SkillNode {
  id: string;
  name: string;
  nameId: string;
  tree: 'mining' | 'combat' | 'farming' | 'hunting' | 'crafting';
  description: string;
  descriptionId: string;
  unlocked: boolean;
  cost: number;
  icon: string;
  bonusType: string;
  bonusValue: number;
}

export type MobType =
  | 'slime'
  | 'goblin'
  | 'wolf'
  | 'skeleton'
  | 'spider'
  | 'golem_boss'
  | 'boar'
  | 'deer'
  | 'chicken'
  | 'cow'
  | 'sheep';

export interface Mob {
  id: string;
  type: MobType;
  name: string;
  nameId: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  aggressive: boolean;
  isAnimal: boolean;
  isTamed?: boolean;
  petName?: string;
  facing: 'left' | 'right' | 'up' | 'down';
  animFrame: number;
  attackCooldown: number;
  targetPlayer: boolean;
  customColor?: string;
}

export interface PlayerShopItem {
  id: string;
  item: Item;
  price: number;
  count: number;
}

export interface ShopCustomerLog {
  id: string;
  buyerName: string;
  itemName: string;
  price: number;
  timestamp: string;
}

export interface PlayerShop {
  isOpen: boolean;
  name: string;
  items: PlayerShopItem[];
  totalEarnings: number;
  customerLogs: ShopCustomerLog[];
}

export interface GuildMember {
  name: string;
  role: 'Ketua' | 'Wakil' | 'Anggota';
  level: number;
  online: boolean;
}

export interface Guild {
  id: string;
  name: string;
  motto: string;
  bannerColor: string;
  level: number;
  exp: number;
  maxExp: number;
  members: GuildMember[];
  treasury: number;
  perks: {
    expBonus: number;
    harvestBonus: number;
    combatBonus: number;
  };
}

export interface VoiceNote {
  id: string;
  sender: string;
  duration: number; // in seconds
  timestamp: string;
  waveHeights: number[]; // visual waveform bars 0..1
  audioDataUri?: string;
  textSnippet?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  channel: 'world' | 'guild' | 'party';
  content?: string;
  voiceNote?: VoiceNote;
  timestamp: string;
  isNpc?: boolean;
}

export interface ModItemDef {
  id: string;
  name: string;
  type: ItemType;
  damage?: number;
  defense?: number;
  icon: string;
  sellPrice: number;
}

export interface ModMobDef {
  type: string;
  name: string;
  hp: number;
  damage: number;
  color: string;
  aggressive: boolean;
}

export interface ModRecipeDef {
  resultItemId: string;
  resultCount: number;
  ingredients: { itemId: string; count: number }[];
}

export interface GameMod {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  enabled: boolean;
  customItems: ModItemDef[];
  customMobs: ModMobDef[];
  customRecipes: ModRecipeDef[];
}

export interface Quest {
  id: string;
  title: string;
  category: 'survival' | 'hunting' | 'farming' | 'boss';
  description: string;
  targetType: string;
  currentCount: number;
  requiredCount: number;
  rewardExp: number;
  rewardGold: number;
  rewardItem?: { item: Item; count: number };
  completed: boolean;
  claimed: boolean;
}

export interface PeerPlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  gender: 'pria' | 'wanita';
  hairColor: string;
  outfitColor: string;
  hp: number;
  maxHp: number;
  action: 'idle' | 'walk' | 'attack' | 'mine' | 'fish';
  currentWeapon: string;
}

export interface TradeOffer {
  active: boolean;
  partnerName: string;
  playerOfferedItems: InventorySlot[];
  playerOfferedGold: number;
  partnerOfferedItems: InventorySlot[];
  partnerOfferedGold: number;
  playerAccepted: boolean;
  partnerAccepted: boolean;
}
