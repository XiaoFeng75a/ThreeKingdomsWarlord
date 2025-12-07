import { City, Faction, General, GeneralState, Task } from "../types";

export interface AIAction {
    tasks: Task[];
    logs: string[];
}

export const generateAITurn = (
    cities: City[], 
    factions: Faction[], 
    generals: General[],
    playerFactionId: string
): AIAction => {
    const aiTasks: Task[] = [];
    const aiLogs: string[] = [];

    // Filter AI Factions
    const aiFactions = factions.filter(f => f.id !== playerFactionId);

    aiFactions.forEach(faction => {
        // 1. Get Faction Assets
        const myCities = cities.filter(c => c.factionId === faction.id);
        const myGenerals = generals.filter(g => g.factionId === faction.id && g.state === GeneralState.IDLE);
        
        // Skip if no capacity
        if (myCities.length === 0 || myGenerals.length === 0) return;

        // 2. Evaluate Threats and Opportunities
        myCities.forEach(city => {
            // Check connected hostile cities
            const connectedCities = cities.filter(c => city.connections.includes(c.id));
            
            // Prioritize declared enemies, then non-allies
            const enemies = connectedCities.filter(c => {
                if (c.factionId === faction.id) return false;
                if (faction.allies.includes(c.factionId)) return false;
                
                // If in enemy list, always valid target
                if (faction.enemies.includes(c.factionId)) return true;
                
                // If not ally and not enemy, neutral?
                // For now, AI attacks anyone not an ally, but prioritizes enemies
                return true; 
            });
            
            enemies.forEach(target => {
                // Determine attack feasibility
                // Rule: Attack if troops > 1.3x enemy equivalent strength (Troops + Defense*2)
                const myStrength = city.troops * (city.morale / 100);
                const enemyStrength = (target.troops * (target.morale / 100)) + (target.defense * 2);

                // More aggressive if declared war
                const isDeclaredEnemy = faction.enemies.includes(target.factionId);
                let aggressionFactor = faction.difficulty === 'Hard' ? 1.1 : faction.difficulty === 'Medium' ? 1.3 : 1.5;
                if (isDeclaredEnemy) aggressionFactor -= 0.2; // 20% easier threshold to attack enemies

                if (myStrength > enemyStrength * aggressionFactor && city.troops > 2000) {
                    // Find a general in this city to lead
                    const commander = myGenerals.find(g => g.locationCityId === city.id);
                    
                    if (commander) {
                        aiTasks.push({
                            id: `ai_atk_${Date.now()}_${commander.id}`,
                            type: 'attack',
                            generalId: commander.id,
                            cityId: city.id,
                            targetCityId: target.id,
                            turnsRemaining: 1
                        });
                        
                        // Mark general as busy so they don't do double duty
                        commander.state = GeneralState.CAMPAIGNING;
                        aiLogs.push(`${faction.name} is launching an attack from ${city.name} to ${target.name}!`);
                    }
                }
            });

            // 3. If not attacking, maybe develop? (Simplified: AI just gets resource bonuses automatically in constants, 
            // but we could add tasks here for flavor or mechanics if needed. For now, we strictly focus on aggression).
        });
    });

    return { tasks: aiTasks, logs: aiLogs };
};