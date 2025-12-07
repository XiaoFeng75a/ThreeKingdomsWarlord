import { City, Faction, FactionColor, General, GeneralState, HistoricalEvent, Item, SubLocation, SubLocationType, Trait } from './types';

// Traits Library
export const TRAITS: Record<string, Trait> = {
  VALOR: { code: 'valor', name: 'Unparalleled', description: 'War stat cap increased to 300. Attack power bonus.', color: 'text-red-500' },
  MASTERMIND: { code: 'mastermind', name: 'Mastermind', description: 'Intel stat cap increased to 300. Stratagems are more effective.', color: 'text-blue-400' },
  IRON_WILL: { code: 'iron_will', name: 'Iron Will', description: 'Loyalty decays very slowly (-0.5) when captured.', color: 'text-stone-300' },
  GODSPEED: { code: 'godspeed', name: 'Godspeed', description: 'Travels to any connected city instantly.', color: 'text-yellow-400' },
  WEALTHY: { code: 'wealthy', name: 'Wealthy', description: 'Passively generates extra gold for the city.', color: 'text-amber-500' },
  CHARISMATIC: { code: 'charismatic', name: 'Charismatic', description: 'Higher success rate when recruiting prisoners.', color: 'text-purple-400' }
};

// Items Library
export const SHOP_ITEMS: Item[] = [
  { id: 'item_sword1', name: 'Iron Sword', type: 'Weapon', price: 500, description: 'A standard issue sword.', stats: { war: 5 } },
  { id: 'item_sword2', name: 'General Sword', type: 'Weapon', price: 1500, description: 'Finely crafted steel.', stats: { war: 10 } },
  { id: 'item_spear1', name: 'Serpent Spear', type: 'Weapon', price: 4000, description: 'Legendary spear. Strikes fear into enemies.', stats: { war: 18 } },
  { id: 'item_blade1', name: 'G. Dragon Blade', type: 'Weapon', price: 5000, description: 'Heavy glaive weighing 82 catties.', stats: { war: 20 } },
  { id: 'item_horse1', name: 'Battle Horse', type: 'Mount', price: 800, description: 'Reliable steed.', stats: { war: 2 } },
  { id: 'item_horse2', name: 'Red Hare', type: 'Mount', price: 6000, description: 'Fastest horse in the realm. Grants Godspeed trait effect.', stats: { war: 5 } },
  { id: 'item_book1', name: 'Art of War', type: 'Manual', price: 2000, description: 'Sun Tzu\'s strategies.', stats: { intel: 10 } },
  { id: 'item_book2', name: 'Spring & Autumn', type: 'Manual', price: 1200, description: 'Historical annals.', stats: { pol: 10 } },
  { id: 'item_jade', name: 'Imperial Jade', type: 'Accessory', price: 3000, description: 'Symbol of nobility.', stats: { chr: 15 } },
];

export const INITIAL_FACTIONS: Faction[] = [
  { 
    id: 'f1', name: 'Liu Bei', leaderName: 'Liu Bei', color: FactionColor.GREEN, 
    gold: 1000, food: 2000, wood: 500, stone: 200, influence: 100,
    description: "Benevolent ruler seeking to restore the Han Dynasty. Starts small but has capable generals.",
    difficulty: 'Hard', culture: 'Han', 
    allies: ['f10'], enemies: ['f4']
  },
  { 
    id: 'f2', name: 'Cao Cao', leaderName: 'Cao Cao', color: FactionColor.BLUE, 
    gold: 5000, food: 8000, wood: 2000, stone: 1000, influence: 500,
    description: "Ambitious hero of chaos controlling the Emperor and the central plains.",
    difficulty: 'Easy', culture: 'Han', 
    allies: ['f6'], enemies: ['f4']
  },
  { 
    id: 'f3', name: 'Sun Quan', leaderName: 'Sun Quan', color: FactionColor.RED, 
    gold: 3000, food: 4000, wood: 1000, stone: 800, influence: 300,
    description: "Defenders of the Southlands, protected by the Yangtze River.",
    difficulty: 'Medium', culture: 'Han', 
    allies: [], enemies: ['f4']
  },
  { 
    id: 'f4', name: 'Dong Zhuo', leaderName: 'Dong Zhuo', color: FactionColor.GREY, 
    gold: 8000, food: 6000, wood: 1500, stone: 1500, influence: 800,
    description: "Tyrant controlling the capital. Powerful army but hated by all.",
    difficulty: 'Easy', culture: 'Han', 
    allies: [], enemies: ['f1', 'f2', 'f3', 'f6', 'f8', 'f10']
  },
  { 
    id: 'f5', name: 'Yellow Turbans', leaderName: 'Zhang Jiao', color: FactionColor.YELLOW, 
    gold: 500, food: 1000, wood: 200, stone: 100, influence: 50,
    description: "Peasant rebellion. Numerous but poorly equipped.",
    difficulty: 'Hard', culture: 'Han', 
    allies: [], enemies: ['f1', 'f2', 'f3', 'f4', 'f6', 'f7', 'f8'] // Everyone hates rebels
  },
  {
    id: 'f6', name: 'Yuan Shao', leaderName: 'Yuan Shao', color: FactionColor.ORANGE,
    gold: 4000, food: 6000, wood: 1200, stone: 1000, influence: 600,
    description: "Noble leader of the North with vast resources.",
    difficulty: 'Medium', culture: 'Han', 
    allies: ['f2'], enemies: ['f4']
  },
  {
    id: 'f7', name: 'Ma Teng', leaderName: 'Ma Teng', color: FactionColor.TEAL,
    gold: 1500, food: 2000, wood: 600, stone: 400, influence: 200,
    description: "Warlords of the West, specializing in cavalry.",
    difficulty: 'Hard', culture: 'Han', 
    allies: [], enemies: []
  },
  {
    id: 'f8', name: 'Liu Biao', leaderName: 'Liu Biao', color: FactionColor.PURPLE,
    gold: 2500, food: 4500, wood: 900, stone: 600, influence: 300,
    description: "Governor of Jing Province, preserving peace in turmoil.",
    difficulty: 'Medium', culture: 'Han', 
    allies: [], enemies: ['f4']
  },
  {
    id: 'f9', name: 'Xiongnu', leaderName: 'Yufuluo', color: FactionColor.BROWN,
    gold: 1000, food: 5000, wood: 300, stone: 100, influence: 50,
    description: "Fierce nomads of the North. Masters of cavalry and raiding.",
    difficulty: 'Medium', culture: 'Nomad', 
    allies: [], enemies: []
  },
  {
    id: 'f10', name: 'Kong Rong', leaderName: 'Kong Rong', color: FactionColor.CYAN,
    gold: 2000, food: 3000, wood: 600, stone: 400, influence: 400,
    description: "Famous scholar and descendant of Confucius. Governs the North Sea.",
    difficulty: 'Medium', culture: 'Han', 
    allies: ['f1'], enemies: ['f4']
  }
];

export const HISTORICAL_EVENTS: HistoricalEvent[] = [
    {
        id: 'evt_190',
        year: 190,
        title: "Coalition against Dong Zhuo",
        description: "Warlords from across the realm have formed a coalition to remove the tyrant Dong Zhuo from the capital!",
        imageUrl: "https://images.unsplash.com/photo-1628260412297-a3377e45006f?q=80&w=1000&auto=format&fit=crop",
    },
    {
        id: 'evt_200',
        year: 200,
        title: "Conflict at Guandu",
        description: "The alliance between Cao Cao and Yuan Shao has crumbled! Ambition drives the two most powerful warlords of the north to war. Yuan Shao marches south to destroy Cao Cao.",
        imageUrl: "https://images.unsplash.com/photo-1599707367072-cd6ad66aa186?q=80&w=1000&auto=format&fit=crop",
        effects: {
            breakAlliance: ['f2', 'f6'],
            declareWar: ['f6', 'f2']
        }
    },
    {
        id: 'evt_208',
        year: 208,
        title: "Battle of Red Cliffs",
        description: "Cao Cao's massive fleet approaches the Yangtze. Sun Quan and Liu Bei must unite or perish!",
        imageUrl: "https://images.unsplash.com/photo-1500322969630-a26ab6eb64cc?q=80&w=1000&auto=format&fit=crop",
    }
];

// Helper to create a city quickly
const createCity = (id: string, name: string, x: number, y: number, factionId: string, isCapital: boolean, connections: string[]): City => ({
  id, name, x, y, factionId, isCapital,
  goldIncome: isCapital ? 150 : Math.floor(50 + Math.random() * 50),
  foodIncome: isCapital ? 200 : Math.floor(60 + Math.random() * 60),
  woodIncome: Math.floor(20 + Math.random() * 30),
  stoneIncome: Math.floor(10 + Math.random() * 20),
  defense: isCapital ? 1500 : 500,
  maxDefense: isCapital ? 2000 : 1000,
  troops: isCapital ? 8000 : 2000,
  morale: 80,
  population: isCapital ? 80000 : 20000 + Math.floor(Math.random() * 20000),
  connections
});

// Map Coordinates (0-100%)
export const INITIAL_CITIES: City[] = [
  // --- Xiongnu (North) ---
  createCity('c42', 'Dai Jun', 60, 5, 'f9', false, ['c2', 'c5', 'c43']),
  createCity('c43', 'Yun Zhong', 45, 8, 'f9', true, ['c5', 'c42', 'c20']),
  createCity('c45', 'Wu Yuan', 35, 12, 'f9', false, ['c43', 'c22', 'c20']),

  // --- North (Yuan Shao f6, Gongsun Zan) ---
  createCity('c1', 'Xiang Ping', 85, 5, 'f6', false, ['c2']),
  createCity('c2', 'Bei Ping', 75, 10, 'f6', false, ['c1', 'c3', 'c4', 'c42']),
  createCity('c3', 'Ji', 70, 15, 'f6', false, ['c2', 'c4', 'c5']),
  createCity('c4', 'Nan Pi', 72, 22, 'f6', false, ['c2', 'c3', 'c5', 'c6']), 
  createCity('c5', 'Jin Yang', 60, 20, 'f6', false, ['c3', 'c4', 'c7', 'c42', 'c43']),
  createCity('c6', 'Ping Yuan', 75, 28, 'f6', false, ['c4', 'c8', 'c13']),
  createCity('c7', 'Ye', 62, 28, 'f6', true, ['c5', 'c8', 'c9']), 

  // --- Central Plains / Cao Cao (f2) ---
  createCity('c8', 'Pu Yang', 65, 35, 'f2', false, ['c6', 'c7', 'c10', 'c13']),
  createCity('c9', 'He Nei', 55, 32, 'f2', false, ['c7', 'c10', 'c11']),
  createCity('c10', 'Chen Liu', 62, 40, 'f2', false, ['c8', 'c9', 'c11', 'c12', 'c14']),
  createCity('c11', 'Luo Yang', 50, 40, 'f4', false, ['c9', 'c10', 'c16', 'c17']), 
  createCity('c12', 'Xu Chang', 58, 48, 'f2', true, ['c10', 'c14', 'c15', 'c18']), 
  // Kong Rong (f10) Cities
  createCity('c13', 'Bei Hai', 82, 32, 'f10', true, ['c6', 'c8', 'c14']),
  createCity('c14', 'Xia Pi', 78, 42, 'f10', false, ['c10', 'c12', 'c13', 'c25']),
  
  createCity('c15', 'Ru Nan', 55, 55, 'f2', false, ['c12', 'c18', 'c19']),
  createCity('c25', 'Xiao Pei', 75, 45, 'f1', false, ['c14', 'c26']),

  // --- North West / Dong Zhuo (f4) / Ma Teng (f7) ---
  createCity('c16', 'Chang An', 35, 42, 'f4', true, ['c11', 'c17', 'c20', 'c21', 'c37']), 
  createCity('c17', 'Wan', 50, 50, 'f2', false, ['c11', 'c16', 'c18', 'c44']),
  createCity('c20', 'An Ding', 30, 35, 'f4', false, ['c16', 'c21', 'c22', 'c43', 'c45']),
  createCity('c21', 'Tian Shui', 25, 40, 'f7', false, ['c16', 'c20', 'c22', 'c23']),
  createCity('c22', 'Wu Wei', 15, 30, 'f7', true, ['c20', 'c21', 'c23', 'c45']), 
  createCity('c23', 'Xi Ping', 10, 40, 'f7', false, ['c21', 'c22']),

  // --- Jing Province / Liu Biao (f8) / Liu Bei (f1) ---
  createCity('c18', 'Xin Ye', 52, 58, 'f1', false, ['c12', 'c17', 'c19']), 
  createCity('c19', 'Xiang Yang', 48, 62, 'f8', true, ['c15', 'c18', 'c24', 'c30', 'c44']), 
  createCity('c24', 'Jiang Ling', 45, 68, 'f8', false, ['c19', 'c30', 'c31', 'c34', 'c40']),
  createCity('c30', 'Jiang Xia', 55, 65, 'f8', false, ['c19', 'c24', 'c27', 'c29', 'c31']),
  createCity('c31', 'Chang Sha', 50, 75, 'f8', false, ['c24', 'c30', 'c32', 'c33']),
  createCity('c32', 'Ling Ling', 45, 82, 'f8', false, ['c31', 'c33']),
  createCity('c33', 'Gui Yang', 52, 85, 'f8', false, ['c31', 'c32']),
  createCity('c34', 'Wu Ling', 40, 72, 'f8', false, ['c24', 'c38', 'c40']),

  // --- East / Sun Quan (f3) ---
  createCity('c26', 'Shou Chun', 70, 52, 'f2', false, ['c14', 'c25', 'c27']),
  createCity('c27', 'Lu Jiang', 65, 60, 'f3', false, ['c26', 'c28', 'c30']),
  createCity('c28', 'Jian Ye', 75, 62, 'f3', true, ['c26', 'c27', 'c29', 'c35']), 
  createCity('c29', 'Wu', 80, 65, 'f3', false, ['c28', 'c30', 'c35']),
  createCity('c35', 'Hui Ji', 82, 72, 'f3', false, ['c28', 'c29', 'c36']),
  createCity('c36', 'Jian An', 78, 80, 'f3', false, ['c35']),
  createCity('c29b', 'Chai Sang', 60, 70, 'f3', false, ['c27', 'c30', 'c31']), 

  // --- South West / Yi Province / Liu Zhang (Yellow Turbans f5 for now) ---
  createCity('c37', 'Han Zhong', 32, 55, 'f5', false, ['c16', 'c38', 'c39', 'c44']),
  createCity('c38', 'Zi Tong', 28, 60, 'f5', false, ['c34', 'c37', 'c39']),
  createCity('c39', 'Cheng Du', 22, 65, 'f5', true, ['c37', 'c38', 'c40', 'c41']),
  createCity('c40', 'Jiang Zhou', 28, 70, 'f5', false, ['c24', 'c34', 'c39', 'c41']),
  createCity('c41', 'Yong An', 35, 65, 'f5', false, ['c39', 'c40']),
  createCity('c44', 'Shang Yong', 42, 52, 'f2', false, ['c17', 'c19', 'c37']), // Added Shang Yong
];

// Re-seed generals for variety
export const INITIAL_GENERALS: General[] = [
  { id: 'g1', name: 'Guan Yu', factionId: 'f1', locationCityId: 'c18', war: 97, intel: 75, pol: 62, chr: 93, loyalty: 100, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GuanYu&clothing=graphicShirt', traits: [TRAITS.VALOR, TRAITS.IRON_WILL], items: [SHOP_ITEMS[3]] },
  { id: 'g2', name: 'Zhang Fei', factionId: 'f1', locationCityId: 'c18', war: 98, intel: 30, pol: 22, chr: 45, loyalty: 100, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangFei&clothing=collarAndSweater', traits: [TRAITS.VALOR], items: [SHOP_ITEMS[2]] },
  { id: 'g3', name: 'Zhuge Liang', factionId: 'f1', locationCityId: 'c18', war: 38, intel: 100, pol: 95, chr: 92, loyalty: 100, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhugeLiang&accessories=round', traits: [TRAITS.MASTERMIND, TRAITS.WEALTHY], items: [] },
  { id: 'g4', name: 'Zhao Yun', factionId: 'f1', locationCityId: 'c25', war: 96, intel: 76, pol: 65, chr: 81, loyalty: 100, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoYun', traits: [TRAITS.GODSPEED, TRAITS.VALOR], items: [] },
  { id: 'g5', name: 'Cao Cao', factionId: 'f2', locationCityId: 'c12', war: 72, intel: 91, pol: 94, chr: 96, loyalty: 100, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CaoCao', traits: [TRAITS.MASTERMIND, TRAITS.CHARISMATIC], items: [SHOP_ITEMS[6]] },
  { id: 'g6', name: 'Xiahou Dun', factionId: 'f2', locationCityId: 'c12', war: 90, intel: 58, pol: 70, chr: 81, loyalty: 95, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=XiahouDun&eyepatch=true', traits: [TRAITS.VALOR], items: [] },
  { id: 'g7', name: 'Guo Jia', factionId: 'f2', locationCityId: 'c12', war: 15, intel: 98, pol: 84, chr: 78, loyalty: 95, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GuoJia', traits: [TRAITS.MASTERMIND], items: [] },
  { id: 'g8', name: 'Zhou Yu', factionId: 'f3', locationCityId: 'c28', war: 71, intel: 96, pol: 86, chr: 93, loyalty: 100, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhouYu', traits: [TRAITS.MASTERMIND, TRAITS.CHARISMATIC], items: [] },
  { id: 'g9', name: 'Lu Bu', factionId: 'f4', locationCityId: 'c16', war: 100, intel: 26, pol: 13, chr: 15, loyalty: 50, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LuBu', traits: [TRAITS.VALOR, TRAITS.GODSPEED], items: [SHOP_ITEMS[5]] },
  { id: 'g10', name: 'Diao Chan', factionId: 'f4', locationCityId: 'c16', war: 10, intel: 81, pol: 65, chr: 100, loyalty: 90, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DiaoChan', traits: [TRAITS.CHARISMATIC], items: [SHOP_ITEMS[8]] },
  // Xiongnu Generals
  { id: 'gX1', name: 'Yufuluo', factionId: 'f9', locationCityId: 'c43', war: 88, intel: 40, pol: 30, chr: 70, loyalty: 90, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yufuluo&facialHair=beardMajestic', traits: [TRAITS.GODSPEED], items: [] },
  { id: 'gX2', name: 'Hu Chuquan', factionId: 'f9', locationCityId: 'c43', war: 82, intel: 45, pol: 35, chr: 60, loyalty: 90, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HuChuquan', traits: [], items: [] },
  // Kong Rong Generals
  { id: 'gK1', name: 'Kong Rong', factionId: 'f10', locationCityId: 'c13', war: 30, intel: 88, pol: 92, chr: 95, loyalty: 100, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KongRong', traits: [TRAITS.WEALTHY], items: [] },
  { id: 'gK2', name: 'Taishi Ci', factionId: 'f10', locationCityId: 'c13', war: 93, intel: 66, pol: 58, chr: 79, loyalty: 92, state: GeneralState.IDLE, portraitUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TaishiCi', traits: [TRAITS.VALOR, TRAITS.IRON_WILL], items: [] },
];

export const SURNAMES = ['Li', 'Wang', 'Zhang', 'Liu', 'Chen', 'Yang', 'Zhao', 'Huang', 'Zhou', 'Wu', 'Xu', 'Sun', 'Ma', 'Zhu', 'Hu', 'Guo', 'He', 'Gao', 'Lin', 'Luo'];
export const FIRST_NAMES = ['Wei', 'Fang', 'Yuan', 'Ming', 'Lei', 'Feng', 'Long', 'Hu', 'Jun', 'Yi', 'Tian', 'Hua', 'Gang', 'Jian', 'Ping', 'Cheng', 'Xin', 'Bo', 'Kai', 'Sheng'];
export const RANDOM_TITLES = ['Captain', 'Scholar', 'Merchant', 'Swordsman', 'Strategist', 'Official', 'Bandit', 'Guard'];

export const RECRUITABLE_HISTORICAL_GENERALS: Omit<General, 'id' | 'factionId' | 'locationCityId' | 'state' | 'loyalty' | 'traits' | 'items'>[] = [
    { name: 'Pang Tong', war: 34, intel: 97, pol: 85, chr: 69 },
    { name: 'Sima Yi', war: 63, intel: 98, pol: 93, chr: 87 },
    { name: 'Jiang Wei', war: 89, intel: 90, pol: 67, chr: 80 },
    { name: 'Huang Zhong', war: 93, intel: 60, pol: 52, chr: 75 },
    { name: 'Wei Yan', war: 92, intel: 69, pol: 45, chr: 34 },
    { name: 'Lu Xun', war: 69, intel: 95, pol: 87, chr: 90 },
    { name: 'Gan Ning', war: 94, intel: 76, pol: 18, chr: 55 },
    { name: 'Zhang Liao', war: 93, intel: 78, pol: 72, chr: 84 },
    { name: 'Xu Huang', war: 91, intel: 74, pol: 48, chr: 71 },
    { name: 'Dian Wei', war: 95, intel: 29, pol: 22, chr: 56 },
    { name: 'Xu Chu', war: 96, intel: 36, pol: 20, chr: 59 },
    { name: 'Xun Yu', war: 14, intel: 95, pol: 99, chr: 92 },
    { name: 'Sun Ce', war: 92, intel: 72, pol: 70, chr: 92 },
    // Taishi Ci removed from here as he is now a starting general for Kong Rong
    { name: 'Yan Liang', war: 89, intel: 42, pol: 31, chr: 50 },
    { name: 'Wen Chou', war: 88, intel: 25, pol: 24, chr: 45 },
];

export const generateSubLocations = (cities: City[]): SubLocation[] => {
  const subLocations: SubLocation[] = [];
  
  cities.forEach(city => {
    // Generate 2-3 sublocations per city
    const count = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < count; i++) {
      const typeRoll = Math.random();
      let type = SubLocationType.VILLAGE;
      if (typeRoll > 0.6) type = SubLocationType.FORT;
      if (typeRoll > 0.9) type = SubLocationType.PASS;

      // Random offset around city (approx 2-5% map distance)
      const angle = Math.random() * Math.PI * 2;
      const distance = 2.5 + Math.random() * 2.5; 
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;

      subLocations.push({
        id: `sub_${city.id}_${i}`,
        name: `${city.name} ${type}`,
        type,
        parentCityId: city.id,
        generalId: null,
        offsetX,
        offsetY
      });
    }
  });
  
  return subLocations;
};