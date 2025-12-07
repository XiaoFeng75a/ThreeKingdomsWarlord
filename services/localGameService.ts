import { General, GeneralState } from "../types";
import { RECRUITABLE_HISTORICAL_GENERALS, SURNAMES, FIRST_NAMES, RANDOM_TITLES } from "../constants";

export interface SearchResult {
  eventDescription: string;
  foundGold?: number;
  foundFood?: number;
  foundWood?: number;
  foundStone?: number;
  foundGeneral?: Omit<General, 'id' | 'factionId' | 'locationCityId' | 'state' | 'loyalty'>;
}

// Generate a random generic general
const generateRandomGeneral = (bonusStats: number = 0): Omit<General, 'id' | 'factionId' | 'locationCityId' | 'state' | 'loyalty'> => {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const firstname = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const name = `${surname} ${firstname}`;
  
  // Random stats usually lower than historical figures (average around 50-60)
  // Bonus stats for Tavern recruits
  const base = 30 + bonusStats;
  return {
    name,
    war: Math.floor(base + Math.random() * 50),
    intel: Math.floor(base + Math.random() * 50),
    pol: Math.floor(base + Math.random() * 50),
    chr: Math.floor(base + Math.random() * 50),
    bio: `A ${RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)]} recruited from the local populace.`,
    traits: [],
    items: []
  };
};

export const performLocalSearch = (
  cityName: string, 
  generalName: string, 
  currentGenerals: General[]
): SearchResult => {
  const roll = Math.random();

  // 15% Chance to find a General
  if (roll < 0.15) {
    // Check if any historical generals are available (not already in the game)
    const existingNames = new Set(currentGenerals.map(g => g.name));
    const availableHistorical = RECRUITABLE_HISTORICAL_GENERALS.filter(g => !existingNames.has(g.name));

    // 40% chance to get a historical one IF available
    if (availableHistorical.length > 0 && Math.random() < 0.4) {
      const found = availableHistorical[Math.floor(Math.random() * availableHistorical.length)];
      return {
        eventDescription: `You discovered a famous talent, ${found.name}, living in seclusion within ${cityName}!`,
        foundGeneral: { ...found, traits: [], items: [] }
      };
    } else {
      // Otherwise find a random general
      const found = generateRandomGeneral();
      return {
        eventDescription: `You recruited a capable local named ${found.name} in ${cityName}.`,
        foundGeneral: found
      };
    }
  } 
  
  // 85% Chance for Resources or Flavor
  const subRoll = Math.random();
  if (subRoll < 0.3) {
    const amount = Math.floor(100 + Math.random() * 200);
    return {
      eventDescription: `Your search in ${cityName} uncovered a hidden stash of gold!`,
      foundGold: amount
    };
  } else if (subRoll < 0.6) {
    const amount = Math.floor(200 + Math.random() * 300);
    return {
      eventDescription: `Merchants in ${cityName} donated food to your cause.`,
      foundFood: amount
    };
  } else if (subRoll < 0.75) {
     const amount = Math.floor(50 + Math.random() * 100);
     return {
         eventDescription: `You found a high quality timber yard in ${cityName}.`,
         foundWood: amount
     }
  } else if (subRoll < 0.9) {
      const amount = Math.floor(30 + Math.random() * 50);
      return {
          eventDescription: `Masons in ${cityName} offered stone for fortifications.`,
          foundStone: amount
      }
  } else {
    return {
      eventDescription: `General ${generalName} patrolled ${cityName} but found nothing of value this time.`,
    };
  }
};

// New function for Tavern Recruitment
export const generateTavernGeneral = (currentGenerals: General[]): Omit<General, 'id' | 'factionId' | 'locationCityId' | 'state' | 'loyalty'> => {
    const existingNames = new Set(currentGenerals.map(g => g.name));
    const availableHistorical = RECRUITABLE_HISTORICAL_GENERALS.filter(g => !existingNames.has(g.name));
    
    // High chance (60%) for Historical if available
    if (availableHistorical.length > 0 && Math.random() < 0.6) {
        const historical = availableHistorical[Math.floor(Math.random() * availableHistorical.length)];
        return { ...historical, traits: [], items: [] };
    }
    
    // Otherwise a "Heroic" random general (better stats +20 base)
    return generateRandomGeneral(20);
};