export enum FactionColor {
  BLUE = 'bg-blue-600',
  RED = 'bg-red-600',
  GREEN = 'bg-green-600',
  GREY = 'bg-stone-600',
  YELLOW = 'bg-yellow-600',
  PURPLE = 'bg-purple-600',
  ORANGE = 'bg-orange-600',
  TEAL = 'bg-teal-600',
  BROWN = 'bg-[#5d4037]',
  CYAN = 'bg-cyan-600'
}

export interface Faction {
  id: string;
  name: string;
  leaderName: string;
  color: FactionColor;
  gold: number;
  food: number;
  wood: number;
  stone: number;
  influence: number; // 2nd tier resource
  description?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  culture: 'Han' | 'Nomad';
  allies: string[]; // List of faction IDs
  enemies: string[]; // List of faction IDs (At War)
}

export interface HistoricalEvent {
  id: string;
  year: number;
  month?: number; // 1-12
  title: string;
  description: string;
  imageUrl?: string;
  effects?: {
    breakAlliance?: [string, string]; // Faction IDs
    declareWar?: [string, string]; // Faction IDs
    resourceChange?: { factionId: string, gold?: number, food?: number }[];
  }
}

export enum GeneralState {
  IDLE = 'Idle',
  WORKING = 'Working',
  TRAINING = 'Training',
  SEARCHING = 'Searching',
  TRAVELING = 'Traveling',
  CAMPAIGNING = 'Campaigning',
  GARRISONED = 'Garrisoned',
  CAPTURED = 'Captured'
}

export type TraitCode = 'valor' | 'mastermind' | 'iron_will' | 'godspeed' | 'wealthy' | 'charismatic';

export interface Trait {
  code: TraitCode;
  name: string;
  description: string;
  color: string; // Tailwind text color class
}

export type ItemType = 'Weapon' | 'Mount' | 'Accessory' | 'Manual';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  description: string;
  stats: {
    war?: number;
    intel?: number;
    pol?: number;
    chr?: number;
  };
}

export interface General {
  id: string;
  name: string;
  factionId: string;
  locationCityId: string;
  war: number; // Military capability
  intel: number; // Search/Strategy capability
  pol: number; // Internal affairs capability
  chr: number; // Recruitment/Diplomacy
  loyalty: number; // 0-100
  state: GeneralState;
  portraitUrl?: string;
  bio?: string;
  traits: Trait[];
  items: Item[];
}

export interface City {
  id: string;
  name: string;
  x: number; // Map percentage X
  y: number; // Map percentage Y
  factionId: string;
  isCapital: boolean; // Capital status
  goldIncome: number;
  foodIncome: number;
  woodIncome: number; // New resource
  stoneIncome: number; // New resource
  defense: number;
  maxDefense: number;
  troops: number;
  morale: number; // 0-100
  population: number;
  connections: string[]; // IDs of connected cities
}

export enum SubLocationType {
  VILLAGE = 'Village',
  FORT = 'Fort',
  PASS = 'Pass'
}

export interface SubLocation {
  id: string;
  name: string;
  type: SubLocationType;
  parentCityId: string;
  generalId: string | null;
  offsetX: number; // Relative visual offset X
  offsetY: number; // Relative visual offset Y
}

export interface GameLog {
  id: string;
  turn: number;
  message: string;
  type: 'info' | 'war' | 'event' | 'gain';
}

export interface Task {
  id: string;
  type: 'develop_gold' | 'develop_food' | 'fortify' | 'conscript' | 'harvest_wood' | 'quarry_stone' | 'patrol' | 'build_siege' | 'train' | 'move' | 'attack' | 'transport' | 'garrison';
  cityId: string;
  generalId: string;
  targetCityId?: string; // Specific for move/attack/transport tasks
  subLocationId?: string; // Specific for garrison tasks
  turnsRemaining: number;
  payload?: {
    gold?: number;
    food?: number;
    wood?: number;
    stone?: number;
    troops?: number;
  };
}

export interface ActiveAttack {
  id: string;
  sourceCityId: string;
  targetCityId: string;
  factionColor: string;
}

export interface BattleResult {
  id: string;
  locationName: string;
  attackerName: string;
  defenderName: string;
  attackerTroopsLost: number;
  defenderTroopsLost: number;
  defenseDamage: number;
  winner: 'attacker' | 'defender';
  captured: boolean;
  duelInfo?: string;
}

export interface DuelData {
  attackerId: string;
  defenderId: string;
  locationId: string;
  taskIds: string[]; // Related tasks to update
}