import React, { useState, useEffect } from 'react';
import WorldMap from './components/WorldMap';
import CityModal from './components/CityModal';
import MainMenu from './components/MainMenu';
import BattleReport from './components/BattleReport';
import DuelModal from './components/DuelModal';
import StatsModal from './components/StatsModal';
import EventModal from './components/EventModal';
import RecruitModal from './components/RecruitModal';
import { City, Faction, General, GeneralState, GameLog, Task, FactionColor, BattleResult, SubLocation, SubLocationType, DuelData, HistoricalEvent, ActiveAttack, TraitCode, Item } from './types';
import { INITIAL_CITIES, INITIAL_FACTIONS, INITIAL_GENERALS, generateSubLocations, HISTORICAL_EVENTS, SHOP_ITEMS } from './constants';
import { generateRumor } from './services/geminiService';
import { performLocalSearch, generateTavernGeneral } from './services/localGameService';
import { generateAITurn } from './services/aiService'; // Import AI Service
import { Scroll, Users, Coins, Wheat, Activity, Calendar, Trees, Pickaxe, Flag, BarChart3, PieChart } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [playerFactionId, setPlayerFactionId] = useState<string>('f1');
  
  const [cities, setCities] = useState<City[]>(INITIAL_CITIES);
  const [subLocations, setSubLocations] = useState<SubLocation[]>([]);
  const [factions, setFactions] = useState<Faction[]>(INITIAL_FACTIONS);
  const [generals, setGenerals] = useState<General[]>(INITIAL_GENERALS);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  
  // Battle Results State
  const [battleResults, setBattleResults] = useState<BattleResult[]>([]);
  const [showBattleReport, setShowBattleReport] = useState(false);

  // Duel State
  const [pendingDuels, setPendingDuels] = useState<DuelData[]>([]);
  const [duelBonuses, setDuelBonuses] = useState<Record<string, { winner: 'attacker' | 'defender', amount: number }>>({});
  const [currentDuel, setCurrentDuel] = useState<DuelData | null>(null);

  // Active Attack Visuals
  const [activeAttacks, setActiveAttacks] = useState<ActiveAttack[]>([]);

  // Stats Modal
  const [showStats, setShowStats] = useState(false);

  // Events
  const [currentEvent, setCurrentEvent] = useState<HistoricalEvent | null>(null);
  
  // Recruitment Modal
  const [recruitmentData, setRecruitmentData] = useState<{ recruiterId: string, prisonerId: string } | null>(null);

  const playerFaction = factions.find(f => f.id === playerFactionId)!;
  const playerCities = cities.filter(c => c.factionId === playerFactionId);

  // Init Sublocations once on load
  useEffect(() => {
     setSubLocations(generateSubLocations(INITIAL_CITIES));
  }, []);

  const handleStartGame = (factionId: string) => {
    setPlayerFactionId(factionId);
    setGameState('playing');
    setLogs([{ id: 'init', turn: 1, message: `The year is 184 AD. You lead the ${factions.find(f => f.id === factionId)?.name} faction.`, type: 'event' }]);
  };

  const addLog = (message: string, type: GameLog['type'] = 'info') => {
    setLogs(prev => [{ id: Date.now().toString() + Math.random(), turn: currentTurn, message, type }, ...prev]);
  };

  const updateFactionResource = (factionId: string, resource: 'gold' | 'food' | 'wood' | 'stone' | 'influence', amount: number) => {
    setFactions(prev => prev.map(f => {
      if (f.id === factionId) {
        return { ...f, [resource]: Math.max(0, f[resource] + amount) };
      }
      return f;
    }));
  };

  // Helper: Get Stats with Items
  const getEffectiveGeneralStats = (general: General) => {
      const bonus = general.items.reduce((acc, item) => ({
          war: acc.war + (item.stats.war || 0),
          intel: acc.intel + (item.stats.intel || 0),
          pol: acc.pol + (item.stats.pol || 0),
          chr: acc.chr + (item.stats.chr || 0)
      }), { war: 0, intel: 0, pol: 0, chr: 0 });

      return {
          ...general,
          war: general.war + bonus.war,
          intel: general.intel + bonus.intel,
          pol: general.pol + bonus.pol,
          chr: general.chr + bonus.chr
      };
  };

  const handleDiplomacy = (type: 'alliance' | 'war', targetFactionId: string) => {
      const targetFaction = factions.find(f => f.id === targetFactionId);
      if (!targetFaction) return;

      setFactions(prev => prev.map(f => {
          if (f.id === playerFactionId) {
              if (type === 'alliance') {
                  // Cost 500 gold
                  if (f.gold < 500) {
                      addLog("Insufficient gold for alliance tribute.", 'info');
                      return f;
                  }
                  addLog(`Alliance formed with ${targetFaction.name}.`, 'event');
                  return { ...f, gold: f.gold - 500, allies: [...f.allies, targetFactionId] };
              } else {
                  addLog(`Declared WAR on ${targetFaction.name}!`, 'war');
                  const newAllies = f.allies.filter(a => a !== targetFactionId); // Break alliance
                  return { ...f, allies: newAllies, enemies: [...f.enemies, targetFactionId] };
              }
          }
          if (f.id === targetFactionId) {
              if (type === 'alliance') {
                   return { ...f, allies: [...f.allies, playerFactionId] };
              } else {
                   const newAllies = f.allies.filter(a => a !== playerFactionId);
                   return { ...f, allies: newAllies, enemies: [...f.enemies, playerFactionId] };
              }
          }
          return f;
      }));
  };

  const handleAssignTask = (type: Task['type'], generalId: string) => {
    if (!selectedCity) return;
    
    // Check costs
    if (type === 'fortify' && playerFaction.stone < 100) { addLog("Not enough stone to fortify!", 'info'); return; }
    if (type === 'conscript' && (playerFaction.gold < 100 || playerFaction.food < 200)) { addLog("Not enough resources to conscript!", 'info'); return; }
    if (type === 'patrol' && playerFaction.food < 50) { addLog("Not enough food for patrols.", 'info'); return; }
    if (type === 'build_siege' && (playerFaction.wood < 300 || playerFaction.gold < 200)) { addLog("Not enough Wood (300) or Gold (200) for Siege Engines.", 'info'); return; }
    if (type === 'train' && playerFaction.food < 100) { addLog("Not enough food (100) to train troops.", 'info'); return; }

    setGenerals(prev => prev.map(g => g.id === generalId ? { ...g, state: GeneralState.WORKING } : g));
    
    const newTask: Task = {
      id: Date.now().toString(),
      type,
      generalId,
      cityId: selectedCity.id,
      turnsRemaining: 1
    };
    
    setTasks(prev => [...prev, newTask]);
    
    const general = generals.find(g => g.id === generalId);
    let taskName = type.replace('_', ' ').toUpperCase();
    addLog(`${general?.name} assigned to ${taskName} in ${selectedCity.name}.`);
  };

  const handleMoveGeneral = (generalId: string, targetCityId: string) => {
      if (!selectedCity) return;
      const targetCity = cities.find(c => c.id === targetCityId);
      const general = generals.find(g => g.id === generalId);
      if (!targetCity || !general) return;

      // Trait Check: Godspeed
      // Check if general has godspeed trait OR is equipped with Red Hare (which grants effect in description but lets hardcode logic)
      const hasGodspeed = general.traits.some(t => t.code === 'godspeed') || general.items.some(i => i.id === 'item_horse2');

      if (hasGodspeed) {
          // Instant Movement
          setGenerals(prev => prev.map(g => g.id === generalId ? { ...g, locationCityId: targetCityId } : g));
          addLog(`${general.name} used Godspeed to arrive instantly at ${targetCity.name}!`, 'info');
      } else {
          // Normal Movement
          setGenerals(prev => prev.map(g => g.id === generalId ? { ...g, state: GeneralState.TRAVELING } : g));
          
          const newTask: Task = {
              id: Date.now().toString(),
              type: 'move',
              generalId,
              cityId: selectedCity.id, 
              targetCityId: targetCityId, 
              turnsRemaining: 1
          };
          
          setTasks(prev => [...prev, newTask]);
          addLog(`${general.name} departed for ${targetCity.name}.`);
      }
  };

  const handleAttack = (generalIds: string[], targetCityId: string) => {
      if (!selectedCity) return;
      
      const targetCity = cities.find(c => c.id === targetCityId);
      if (!targetCity) return;

      const newTasks: Task[] = [];
      generalIds.forEach(gid => {
          newTasks.push({
            id: Date.now().toString() + gid,
            type: 'attack',
            generalId: gid,
            cityId: selectedCity.id,
            targetCityId: targetCityId,
            turnsRemaining: 1
          });
      });

      setGenerals(prev => prev.map(g => generalIds.includes(g.id) ? { ...g, state: GeneralState.CAMPAIGNING } : g));
      setTasks(prev => [...prev, ...newTasks]);
      
      addLog(`Army mobilized from ${selectedCity.name} to attack ${targetCity.name}!`, 'war');
  };

  const handleTransport = (generalId: string, targetCityId: string, payload: { gold: number, food: number, troops: number }) => {
      if (!selectedCity) return;
      if (playerFaction.gold < payload.gold || playerFaction.food < payload.food) {
          addLog("Insufficient faction resources for transport.", 'info');
          return;
      }
      if (selectedCity.troops < payload.troops) {
           addLog("Insufficient city troops for transport.", 'info');
           return;
      }

      // Deduct immediately
      updateFactionResource(playerFactionId, 'gold', -payload.gold);
      updateFactionResource(playerFactionId, 'food', -payload.food);
      setCities(prev => prev.map(c => c.id === selectedCity.id ? { ...c, troops: c.troops - payload.troops } : c));
      
      const general = generals.find(g => g.id === generalId);
      setGenerals(prev => prev.map(g => g.id === generalId ? { ...g, state: GeneralState.TRAVELING } : g));

      const newTask: Task = {
          id: Date.now().toString(),
          type: 'transport',
          generalId,
          cityId: selectedCity.id,
          targetCityId,
          turnsRemaining: 1,
          payload
      };
      setTasks(prev => [...prev, newTask]);
      addLog(`${general?.name} is transporting supplies to ${cities.find(c=>c.id===targetCityId)?.name}.`);
  };

  const handleGarrisonSubLocation = (generalId: string, subLocationId: string) => {
      if (!subLocationId) {
          const sub = subLocations.find(s => s.generalId === generalId);
          if (sub) {
              setSubLocations(prev => prev.map(s => s.id === sub.id ? { ...s, generalId: null } : s));
              setGenerals(prev => prev.map(g => g.id === generalId ? { ...g, state: GeneralState.IDLE } : g));
              addLog(`General recalled from ${sub.name}.`);
          }
          return;
      }

      const general = generals.find(g => g.id === generalId);
      const sub = subLocations.find(s => s.id === subLocationId);
      if (general && sub) {
          setSubLocations(prev => prev.map(s => s.id === subLocationId ? { ...s, generalId } : s));
          setGenerals(prev => prev.map(g => g.id === generalId ? { ...g, state: GeneralState.GARRISONED } : g));
          addLog(`${general.name} garrisoned at ${sub.name}.`);
      }
  };

  const handleTavernRecruit = () => {
    if (!selectedCity || !selectedCity.isCapital) return;
    if (playerFaction.gold < 800) {
        addLog("Not enough Gold (800) to host a banquet.", 'info');
        return;
    }

    updateFactionResource(playerFactionId, 'gold', -800);
    
    const newGeneralData = generateTavernGeneral(generals);
    const newGeneral: General = {
        ...newGeneralData,
        id: `gen_${Date.now()}`,
        factionId: playerFactionId,
        locationCityId: selectedCity.id,
        state: GeneralState.IDLE,
        loyalty: 100,
        portraitUrl: `https://picsum.photos/100/100?random=${Date.now()}`,
        traits: [],
        items: []
    };

    setGenerals(prev => [...prev, newGeneral]);
    addLog(`TAVERN: A grand banquet attracted ${newGeneral.name} (WAR:${newGeneral.war} INT:${newGeneral.intel}) to your cause!`, 'gain');
  };

  const handleSearch = async (generalId: string) => {
    if (!selectedCity) return;
    const general = generals.find(g => g.id === generalId);
    if (!general) return;

    setLoadingMessage("Scouting the city...");
    
    setTimeout(() => {
        try {
            const result = performLocalSearch(selectedCity.name, general.name, generals);
            if (result.foundGold) updateFactionResource(playerFactionId, 'gold', result.foundGold);
            if (result.foundFood) updateFactionResource(playerFactionId, 'food', result.foundFood);
            if (result.foundWood) updateFactionResource(playerFactionId, 'wood', result.foundWood);
            if (result.foundStone) updateFactionResource(playerFactionId, 'stone', result.foundStone);
            
            if (result.foundGeneral) {
                const newGeneral: General = {
                    ...result.foundGeneral,
                    id: `gen_${Date.now()}`,
                    factionId: playerFactionId,
                    locationCityId: selectedCity.id,
                    state: GeneralState.IDLE,
                    loyalty: 90,
                    portraitUrl: `https://picsum.photos/100/100?random=${Date.now()}`,
                    traits: [],
                    items: []
                };
                setGenerals(prev => [...prev, newGeneral]);
                addLog(`RECRUITMENT: ${newGeneral.name} joined your faction!`, 'gain');
            }

            setGenerals(prev => prev.map(g => g.id === generalId ? { ...g, state: GeneralState.SEARCHING } : g));
            setTasks(prev => [...prev, {
                id: Date.now().toString(),
                type: 'develop_gold', 
                generalId: generalId,
                cityId: selectedCity.id,
                turnsRemaining: 1
            }]);

            let gains = [];
            if (result.foundGold) gains.push(`+${result.foundGold} G`);
            if (result.foundFood) gains.push(`+${result.foundFood} F`);
            if (result.foundWood) gains.push(`+${result.foundWood} W`);
            if (result.foundStone) gains.push(`+${result.foundStone} S`);
            const gainStr = gains.length > 0 ? `(${gains.join(', ')})` : '';

            addLog(`SEARCH: ${result.eventDescription} ${gainStr}`, 'event');
        } catch (e) {
            console.error(e);
            addLog("Search failed.", 'info');
        } finally {
            setLoadingMessage(null);
        }
    }, 800);
  };

  const handleCityClick = (city: City) => {
    setSelectedCity(city);
  };

  const handleDuelComplete = (winnerId: string) => {
      if (!currentDuel) return;
      const winner = generals.find(g => g.id === winnerId);
      const isAttackerWinner = winnerId === currentDuel.attackerId;
      
      addLog(`DUEL: ${winner?.name} was victorious! The army is inspired!`, 'war');
      
      // Store Bonus
      setDuelBonuses(prev => ({
          ...prev,
          [currentDuel.locationId]: { 
              winner: isAttackerWinner ? 'attacker' : 'defender', 
              amount: 0.5 // 50% damage boost
          }
      }));

      // Next duel or Finish
      const nextQueue = pendingDuels.slice(1);
      setPendingDuels(nextQueue);
      
      if (nextQueue.length > 0) {
          setCurrentDuel(nextQueue[0]);
      } else {
          setCurrentDuel(null);
          // Resume turn processing with bonuses
          processTurn(true); 
      }
  };

  const handleRecruitPrisoner = (recruiterId: string, prisonerId: string) => {
     setRecruitmentData({ recruiterId, prisonerId });
  };

  const handleConfirmRecruitment = () => {
    if (!recruitmentData) return;
    const { recruiterId, prisonerId } = recruitmentData;
    const recruiter = generals.find(g => g.id === recruiterId);
    const prisoner = generals.find(g => g.id === prisonerId);
    
    if (!recruiter || !prisoner) return;

    const effRecruiter = getEffectiveGeneralStats(recruiter);

    // Persuasion Logic: (Recruiter CHR - Prisoner Loyalty + 20)%
    let chance = Math.min(100, Math.max(0, effRecruiter.chr - prisoner.loyalty + 20));
    
    // Charismatic Trait Bonus
    const isCharismatic = recruiter.traits.some(t => t.code === 'charismatic');
    if (isCharismatic) chance += 15;

    const roll = Math.random() * 100;

    if (roll < chance) {
        addLog(`SUCCESS! ${prisoner.name} has defected to your faction!`, 'gain');
        setGenerals(prev => prev.map(g => {
            if (g.id === prisonerId) {
                return { ...g, factionId: playerFactionId, state: GeneralState.IDLE, loyalty: 80 };
            }
            if (g.id === recruiterId) {
                return { ...g, state: GeneralState.WORKING }; // Consumes turn
            }
            return g;
        }));
    } else {
        addLog(`FAILED: ${prisoner.name} refused to join. Loyalty slightly reduced.`, 'info');
        setGenerals(prev => prev.map(g => {
             if (g.id === prisonerId) {
                 return { ...g, loyalty: Math.max(0, g.loyalty - 5) };
             }
             if (g.id === recruiterId) {
                 return { ...g, state: GeneralState.WORKING }; // Consumes turn
             }
             return g;
        }));
    }
    setRecruitmentData(null);
  };

  const handleBribePrisoner = (prisonerId: string) => {
      if (playerFaction.gold < 200) {
          addLog("Insufficient gold (200) to bribe.", 'info');
          return;
      }
      const prisoner = generals.find(g => g.id === prisonerId);
      if (!prisoner) return;

      updateFactionResource(playerFactionId, 'gold', -200);
      setGenerals(prev => prev.map(g => g.id === prisonerId ? { ...g, loyalty: Math.max(0, g.loyalty - 10) } : g));
      addLog(`You bribed the guards to torment ${prisoner.name}. Loyalty decreased (-10).`, 'info');
  };

  const handleBuyItem = (generalId: string, itemId: string) => {
      const general = generals.find(g => g.id === generalId);
      const item = SHOP_ITEMS.find(i => i.id === itemId);
      const faction = factions.find(f => f.id === playerFactionId);

      if (!general || !item || !faction) return;

      if (faction.gold < item.price) {
          addLog("Insufficient funds to purchase item.", 'info');
          return;
      }

      updateFactionResource(playerFactionId, 'gold', -item.price);
      
      setGenerals(prev => prev.map(g => {
          if (g.id === generalId) {
              return { ...g, items: [...g.items, item] };
          }
          return g;
      }));
      
      addLog(`MARKET: Purchased ${item.name} for ${general.name}.`, 'gain');
  };

  // Turn Processing Logic
  // if isResume is true, skip the pre-calculation and jump to battle resolution
  const processTurn = async (isResume = false) => {
    if (!isResume) {
        setIsProcessingTurn(true);
        setLoadingMessage("Processing Turn...");
    }

    // --- CHECK FOR HISTORICAL EVENTS ---
    if (!isResume) {
        const year = 184 + Math.floor(currentTurn / 12);
        const event = HISTORICAL_EVENTS.find(e => e.year === year && !e.month); 
        
        if (year === 200 && currentTurn % 12 === 0) { 
            const guandu = HISTORICAL_EVENTS.find(e => e.id === 'evt_200');
            if (guandu) {
                setCurrentEvent(guandu);
                setFactions(prev => prev.map(f => {
                    if (f.id === 'f2' || f.id === 'f6') {
                        const enemyId = f.id === 'f2' ? 'f6' : 'f2';
                        return { 
                            ...f, 
                            allies: f.allies.filter(a => a !== enemyId), 
                            enemies: [...f.enemies, enemyId] 
                        };
                    }
                    return f;
                }));
                addLog("EVENT: The Yuan-Cao Alliance has collapsed!", 'event');
            }
        }
    }

    // 1. CALCULATE AI MOVES (Only if not resuming)
    let aiTasks: Task[] = [];
    if (!isResume) {
        const aiResult = generateAITurn(cities, factions, generals, playerFactionId);
        aiTasks = aiResult.tasks;
        // Log AI announcements
        aiResult.logs.forEach(log => addLog(log, 'war'));

        // --- VISUALIZE ATTACKS BEFORE RESOLUTION ---
        const activeAttacksList: ActiveAttack[] = [];
        
        // Player Attacks
        tasks.filter(t => t.type === 'attack').forEach(t => {
            const general = generals.find(g => g.id === t.generalId);
            if (general && t.targetCityId) {
                 const faction = factions.find(f => f.id === general.factionId);
                 activeAttacksList.push({
                     id: t.id,
                     sourceCityId: t.cityId,
                     targetCityId: t.targetCityId,
                     factionColor: faction?.color || 'bg-red-500'
                 });
            }
        });

        // AI Attacks
        aiTasks.filter(t => t.type === 'attack').forEach(t => {
             const general = generals.find(g => g.id === t.generalId);
             if (general && t.targetCityId) {
                 const faction = factions.find(f => f.id === general.factionId);
                 activeAttacksList.push({
                     id: t.id,
                     sourceCityId: t.cityId,
                     targetCityId: t.targetCityId,
                     factionColor: faction?.color || 'bg-red-500'
                 });
            }
        });

        setActiveAttacks(activeAttacksList);

        if (activeAttacksList.length > 0) {
            // Pause to show attacks
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Combine Player Tasks with AI Tasks for processing
    const allTasks = [...tasks, ...aiTasks];

    // Identify all active tasks that are ready to execute
    const activeTasks = allTasks.filter(t => t.turnsRemaining <= 1);
    const attackGroups: Record<string, Task[]> = {}; 
    
    activeTasks.forEach(task => {
        if (task.type === 'attack' && task.targetCityId) {
            if (!attackGroups[task.targetCityId]) attackGroups[task.targetCityId] = [];
            attackGroups[task.targetCityId].push(task);
        }
    });

    // Check for Duels (Only if not resuming)
    if (!isResume) {
        const potentialDuels: DuelData[] = [];
        Object.keys(attackGroups).forEach(targetId => {
             const attackTasks = attackGroups[targetId];
             const attackerId = attackTasks[0].generalId;
             const targetCity = cities.find(c => c.id === targetId);
             
             // Check if defender has generals
             const defendingGeneral = generals.find(g => g.locationCityId === targetId && g.factionId === targetCity?.factionId && g.state !== GeneralState.CAPTURED);
             
             const isPlayerAttacking = generals.find(g => g.id === attackerId)?.factionId === playerFactionId;
             const isPlayerDefending = targetCity?.factionId === playerFactionId;

             if ((isPlayerAttacking || isPlayerDefending) && attackerId && defendingGeneral && Math.random() > 0.5) {
                 potentialDuels.push({
                     attackerId,
                     defenderId: defendingGeneral.id,
                     locationId: targetId,
                     taskIds: attackTasks.map(t => t.id)
                 });
             }
        });

        if (potentialDuels.length > 0) {
            // Persist AI tasks so they don't get lost when resuming
            setTasks(prev => [...prev, ...aiTasks]); 
            setPendingDuels(potentialDuels);
            
            // NOTE: Before setting current duel, we must ensure we pass effective stats
            // The DuelModal renders based on the general object passed to it. 
            // Since we find the general by ID in the Render method of DuelModal (in the return block), 
            // we should make sure we hydrate stats there.
            // But wait, the return block calls `generals.find`. We should update `getEffectiveGeneralStats` 
            // usage in the render method below or here. 
            // For simplicity, the DuelModal in render() will fetch from `generals` state.
            // We need to modify the DuelModal component usage in the return block to use `getEffectiveGeneralStats`.
            
            setCurrentDuel(potentialDuels[0]);
            setLoadingMessage(null);
            // NOTE: We do NOT clear activeAttacks here, so they persist during the Duel!
            return; // STOP HERE and wait for duels
        }
    }

    // --- CONTINUE PROCESSING ---

    const remainingTasks: Task[] = [];
    const completedTasks: Task[] = [];
    
    allTasks.forEach(task => {
        if (task.turnsRemaining <= 1) completedTasks.push(task);
        else remainingTasks.push({ ...task, turnsRemaining: task.turnsRemaining - 1 });
    });

    const updatedCities = [...cities];
    let updatedGenerals = [...generals];
    const freedGeneralIds = new Set<string>();

    completedTasks.forEach(task => {
        if (task.type === 'attack') return; // Handled in batch later

        freedGeneralIds.add(task.generalId);
        
        const cityIndex = updatedCities.findIndex(c => c.id === task.cityId);
        if (cityIndex !== -1) {
            const general = generals.find(g => g.id === task.generalId);
            // Can use effective stats here for bonuses if desired, keeping base for now for economy balance
            const polEff = general ? Math.max(0.5, (general.pol || 50) / 100) : 1;
            const warEff = general ? Math.max(0.5, (general.war || 50) / 100) : 1;
            
            const isPlayerAction = general?.factionId === playerFactionId;

            if (task.type === 'develop_gold') updatedCities[cityIndex].goldIncome += Math.floor(5 * polEff);
            else if (task.type === 'develop_food') updatedCities[cityIndex].foodIncome += Math.floor(5 * polEff);
            else if (task.type === 'harvest_wood') updatedCities[cityIndex].woodIncome += Math.floor(5 * polEff);
            else if (task.type === 'quarry_stone') updatedCities[cityIndex].stoneIncome += Math.floor(5 * polEff);
            else if (task.type === 'fortify') {
                updatedCities[cityIndex].defense = Math.min(updatedCities[cityIndex].maxDefense, updatedCities[cityIndex].defense + Math.floor(50 * warEff));
                if (isPlayerAction) updateFactionResource(playerFactionId, 'stone', -100);
            } else if (task.type === 'conscript') {
                updatedCities[cityIndex].troops += Math.floor(200 * warEff);
                updatedCities[cityIndex].morale = Math.max(0, updatedCities[cityIndex].morale - 5);
                if (isPlayerAction) {
                    updateFactionResource(playerFactionId, 'gold', -100);
                    updateFactionResource(playerFactionId, 'food', -200);
                }
            } else if (task.type === 'patrol') {
                updatedCities[cityIndex].morale = Math.min(100, updatedCities[cityIndex].morale + Math.floor(10 * warEff));
                if (isPlayerAction) updateFactionResource(playerFactionId, 'food', -50);
            } else if (task.type === 'build_siege') {
                updatedCities[cityIndex].defense = Math.min(updatedCities[cityIndex].maxDefense, updatedCities[cityIndex].defense + Math.floor(150 * warEff));
                updatedCities[cityIndex].troops += 50; 
                if (isPlayerAction) {
                    updateFactionResource(playerFactionId, 'wood', -300);
                    updateFactionResource(playerFactionId, 'gold', -200);
                }
            } else if (task.type === 'train') {
                updatedCities[cityIndex].morale = Math.min(120, updatedCities[cityIndex].morale + Math.floor(20 * warEff)); 
                updatedCities[cityIndex].troops += Math.floor(20 * warEff);
                if (isPlayerAction) updateFactionResource(playerFactionId, 'food', -100);
            } else if (task.type === 'transport' && task.targetCityId && task.payload) {
                 const destIndex = updatedCities.findIndex(c => c.id === task.targetCityId);
                 const genIndex = updatedGenerals.findIndex(g => g.id === task.generalId);
                 if (destIndex !== -1) {
                     if (isPlayerAction) {
                        updateFactionResource(playerFactionId, 'gold', task.payload.gold || 0);
                        updateFactionResource(playerFactionId, 'food', task.payload.food || 0);
                     }
                     updatedCities[destIndex].troops += (task.payload.troops || 0);
                     if (genIndex !== -1) updatedGenerals[genIndex].locationCityId = task.targetCityId;
                     if (isPlayerAction) addLog(`Transport arrived at ${updatedCities[destIndex].name}.`);
                 }
            } else if (task.type === 'move' && task.targetCityId) {
                 const targetCity = updatedCities.find(c => c.id === task.targetCityId);
                 const generalIndex = updatedGenerals.findIndex(g => g.id === task.generalId);
                 if (targetCity && generalIndex !== -1) {
                     updatedGenerals[generalIndex] = { ...updatedGenerals[generalIndex], locationCityId: targetCity.id };
                     if (isPlayerAction) addLog(`${updatedGenerals[generalIndex].name} arrived in ${targetCity.name}.`);
                 }
            }
        }
    });

    // --- BATTLE RESOLUTION ---
    const newBattleResults: BattleResult[] = [];
    const capturedGenerals: string[] = []; // Track IDs of generals captured this turn
    
    Object.keys(attackGroups).forEach(targetId => {
        const attackTasks = attackGroups[targetId];
        const targetCityIndex = updatedCities.findIndex(c => c.id === targetId);
        if (targetCityIndex === -1) return;

        const targetCity = updatedCities[targetCityIndex];
        const defenderFaction = factions.find(f => f.id === targetCity.factionId);
        
        let attackerTroops = 0;
        let attackerPower = 0;
        let attackerNames: string[] = [];
        let attackerFactionId = "";

        attackTasks.forEach(task => {
             const general = generals.find(g => g.id === task.generalId);
             const originCityIndex = updatedCities.findIndex(c => c.id === task.cityId);
             if (general && originCityIndex !== -1) {
                 const effGeneral = getEffectiveGeneralStats(general); // Use effective stats!
                 attackerFactionId = general.factionId;
                 const troopsTaken = Math.min(2000, updatedCities[originCityIndex].troops);
                 updatedCities[originCityIndex].troops -= troopsTaken;
                 attackerTroops += troopsTaken;
                 attackerPower += (troopsTaken * (updatedCities[originCityIndex].morale/100)) + (effGeneral.war * 10);
                 attackerNames.push(general.name);
                 freedGeneralIds.add(general.id);
             }
        });

        if (attackerTroops === 0) return;

        // Apply Duel Bonuses
        let duelMessage = "";
        const bonus = duelBonuses[targetId];
        if (bonus) {
            if (bonus.winner === 'attacker') {
                attackerPower *= (1 + bonus.amount);
                duelMessage = " (Attackers boosted by Duel victory!)";
            } else {
                attackerPower *= (1 - 0.2); 
                duelMessage = " (Attackers demoralized by Duel loss)";
            }
        }

        const defenderPower = (targetCity.troops * (targetCity.morale/100)) + (targetCity.defense * 2);
        const victory = attackerPower > defenderPower;
        const damageToAttacker = Math.floor(defenderPower * 0.15);
        const damageToDefender = Math.floor(attackerPower * 0.2);
        
        const finalAttackerTroopsLost = Math.min(attackerTroops, damageToAttacker);
        const finalDefenderTroopsLost = Math.min(targetCity.troops, damageToDefender);
        const defenseDamage = Math.floor(attackerPower * 0.05);

        updatedCities[targetCityIndex].troops = Math.max(0, updatedCities[targetCityIndex].troops - finalDefenderTroopsLost);
        updatedCities[targetCityIndex].defense = Math.max(0, updatedCities[targetCityIndex].defense - defenseDamage);
        
        const originCityId = attackTasks[0].cityId;
        const originIndex = updatedCities.findIndex(c => c.id === originCityId);
        if (originIndex !== -1) {
             updatedCities[originIndex].troops += (attackerTroops - finalAttackerTroopsLost);
        }

        let captured = false;
        const attackerFaction = factions.find(f => f.id === attackerFactionId);

        if (victory && (updatedCities[targetCityIndex].troops === 0 || attackerPower > defenderPower * 2)) {
            captured = true;
            updatedCities[targetCityIndex].factionId = attackerFactionId; 
            updatedCities[targetCityIndex].troops = (attackerTroops - finalAttackerTroopsLost);
            updatedCities[targetCityIndex].morale = 50; 
            updatedCities[targetCityIndex].defense = Math.floor(updatedCities[targetCityIndex].defense / 2); 

            if (originIndex !== -1) {
                updatedCities[originIndex].troops -= (attackerTroops - finalAttackerTroopsLost);
            }

            attackTasks.forEach(task => {
                const gIndex = updatedGenerals.findIndex(g => g.id === task.generalId);
                if (gIndex !== -1) {
                    updatedGenerals[gIndex] = { ...updatedGenerals[gIndex], locationCityId: targetId };
                }
            });

            // Handle Capture of Enemy Generals
            // Any general in this city belonging to the defender faction is now captured
            updatedGenerals = updatedGenerals.map(g => {
                if (g.locationCityId === targetId && g.factionId === defenderFaction?.id) {
                    capturedGenerals.push(g.id);
                    return { ...g, state: GeneralState.CAPTURED };
                }
                return g;
            });

            if (attackerFactionId === playerFactionId || targetCity.factionId === playerFactionId) {
                 addLog(`VICTORY! ${targetCity.name} has been conquered by ${attackerFaction?.name}!${duelMessage}`, 'war');
                 if (capturedGenerals.length > 0) {
                    addLog(`${capturedGenerals.length} enemy officers were captured!`, 'gain');
                 }
            }
        } else {
             if (attackerFactionId === playerFactionId || targetCity.factionId === playerFactionId) {
                addLog(`Battle at ${targetCity.name}: Attackers repelled.${duelMessage}`, 'war');
             }
        }

        if (attackerFactionId === playerFactionId || defenderFaction?.id === playerFactionId) {
            newBattleResults.push({
                id: Date.now().toString(),
                locationName: targetCity.name,
                attackerName: attackerNames[0] + (attackerNames.length > 1 ? ` & ${attackerNames.length - 1} others` : ''),
                defenderName: defenderFaction?.name || 'Rebels',
                attackerTroopsLost: finalAttackerTroopsLost,
                defenderTroopsLost: finalDefenderTroopsLost,
                defenseDamage: defenseDamage,
                winner: captured ? 'attacker' : (victory ? 'attacker' : 'defender'),
                captured: captured,
                duelInfo: duelMessage
            });
        }
    });

    if (newBattleResults.length > 0) {
        setBattleResults(newBattleResults);
        setShowBattleReport(true);
    }
    // --- END BATTLE RESOLUTION ---

    setCities(updatedCities);
    setTasks(remainingTasks.filter(t => !t.id.startsWith('ai_')));
    
    // Update Generals State
    // Decay loyalty of prisoners
    setGenerals(updatedGenerals.map(g => {
        if (freedGeneralIds.has(g.id)) return { ...g, state: GeneralState.IDLE };
        if (g.state === GeneralState.CAPTURED) {
            // Iron Will Trait Check
            const decay = g.traits.some(t => t.code === 'iron_will') ? 0.5 : 2.0;
            return { ...g, loyalty: Math.max(0, g.loyalty - decay) };
        }
        return g;
    }));

    // 2. Faction Incomes
    const newFactions = factions.map(f => {
        let goldGain = 0, foodGain = 0, woodGain = 0, stoneGain = 0;
        
        updatedCities.filter(c => c.factionId === f.id).forEach(c => {
            goldGain += c.goldIncome;
            foodGain += c.foodIncome;
            woodGain += c.woodIncome;
            stoneGain += c.stoneIncome;

            const citySubs = subLocations.filter(sl => sl.parentCityId === c.id && sl.generalId);
            citySubs.forEach(sl => {
                if (sl.type === SubLocationType.VILLAGE) {
                    goldGain += 50;
                    foodGain += 100;
                }
            });
        });

        if (updatedCities.find(c => c.factionId === f.id && c.isCapital)) {
             goldGain += 100;
             foodGain += 100;
        }

        // Wealthy Trait Check
        const myGenerals = updatedGenerals.filter(g => g.factionId === f.id);
        const wealthyCount = myGenerals.filter(g => g.traits.some(t => t.code === 'wealthy')).length;
        if (wealthyCount > 0) {
            goldGain += (wealthyCount * 50);
        }

        let upkeep = 0;
        updatedCities.filter(c => c.factionId === f.id).forEach(c => {
            upkeep += Math.floor(c.troops / 100);
        });

        const myCityIds = updatedCities.filter(c => c.factionId === f.id).map(c => c.id);
        const myGarrisonedSubs = subLocations.filter(sl => myCityIds.includes(sl.parentCityId) && sl.generalId);
        upkeep += myGarrisonedSubs.length * 50;

        return {
            ...f,
            gold: f.gold + goldGain,
            food: Math.max(0, f.food + foodGain - upkeep),
            wood: f.wood + woodGain,
            stone: f.stone + stoneGain,
            influence: f.influence + 2
        };
    });
    setFactions(newFactions);
    
    const pf = newFactions.find(f => f.id === playerFactionId)!;
    const prevPf = factions.find(f => f.id === playerFactionId)!;
    addLog(`Income: +${pf.gold - prevPf.gold} Gold, +${pf.food - prevPf.food} Food.`, 'gain');

    // 3. AI Fluff
    if (currentTurn % 3 === 0) {
        const rumor = await generateRumor(currentTurn);
        addLog(`RUMOR: ${rumor}`, 'info');
    }

    setCurrentTurn(prev => prev + 1);
    setIsProcessingTurn(false);
    setLoadingMessage(null);
    setDuelBonuses({}); 
    setActiveAttacks([]); // Clear active attacks after resolution
  };

  if (gameState === 'menu') {
      return <MainMenu factions={factions} onStartGame={handleStartGame} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#1a1714] text-[#d6cbb6] font-serif overflow-hidden relative">
      
      {/* Background Music Iframe (Hidden) - Only active in gameplay */}
      {gameState === 'playing' && (
           <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
             <iframe 
                width="1" 
                height="1" 
                src="https://www.youtube.com/embed/7C_Yp3c2f0g?autoplay=1&loop=1&playlist=7C_Yp3c2f0g&controls=0&showinfo=0" 
                title="Gameplay BGM" 
                frameBorder="0" 
                allow="autoplay; encrypted-media" 
                allowFullScreen
            ></iframe>
           </div>
      )}

      {/* Top Bar */}
      <header className="h-20 bg-[#231f1b] border-b border-[#5d4037] flex items-center justify-between px-4 md:px-6 shadow-md z-20 overflow-x-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mr-4">
            <h1 className="text-lg md:text-xl font-title text-yellow-600 tracking-wider whitespace-nowrap">THREE KINGDOMS</h1>
            <span className="bg-[#3e3832] px-2 py-0.5 rounded text-xs border border-[#5d4037] flex items-center whitespace-nowrap">
                <Calendar size={12} className="mr-2 text-stone-400"/>
                Year {184 + Math.floor(currentTurn / 12)} / {(currentTurn % 12) + 1}
            </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-1.5" title="Gold">
                <Coins className="text-yellow-500" size={16} />
                <span className="font-bold">{playerFaction.gold}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Food">
                <Wheat className="text-green-500" size={16} />
                <span className="font-bold">{playerFaction.food}</span>
            </div>
             <div className="flex items-center gap-1.5 hidden md:flex" title="Wood">
                <Trees className="text-emerald-500" size={16} />
                <span className="font-bold">{playerFaction.wood}</span>
            </div>
             <div className="flex items-center gap-1.5 hidden md:flex" title="Stone">
                <Pickaxe className="text-stone-400" size={16} />
                <span className="font-bold">{playerFaction.stone}</span>
            </div>
             <div className="flex items-center gap-1.5" title="Influence">
                <Flag className="text-purple-400" size={16} />
                <span className="font-bold">{playerFaction.influence}</span>
            </div>
            
            <button 
                onClick={() => setShowStats(true)}
                className="ml-2 bg-[#3e3832] hover:bg-[#5d4037] text-stone-300 p-2 rounded border border-[#5d4037] shadow transition-all"
                title="World Statistics"
            >
                <PieChart size={18} />
            </button>

            <button 
                onClick={() => processTurn()}
                disabled={isProcessingTurn || !!currentDuel}
                className={`ml-2 bg-red-800 hover:bg-red-700 text-red-100 px-4 py-2 rounded border border-red-600 shadow-lg font-bold tracking-widest transition-all whitespace-nowrap ${isProcessingTurn || !!currentDuel ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            >
                {isProcessingTurn ? '...' : 'END TURN'}
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-80 bg-[#231f1b] border-r border-[#5d4037] flex flex-col z-10 hidden md:flex">
            <div className="p-4 border-b border-[#5d4037] bg-[#2a2622]">
                <h2 className="text-yellow-600 font-bold mb-2 flex items-center"><Activity size={18} className="mr-2"/> Recent Events</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {logs.map(log => (
                    <div key={log.id} className={`text-sm p-3 rounded border ${
                        log.type === 'war' ? 'bg-red-900/20 border-red-800/50 text-red-200' : 
                        log.type === 'gain' ? 'bg-green-900/20 border-green-800/50 text-green-200' :
                        log.type === 'event' ? 'bg-purple-900/20 border-purple-800/50 text-purple-200' :
                        'bg-[#2c2722] border-[#3e3832] text-stone-400'
                    }`}>
                        <span className="text-xs opacity-50 block mb-1">Turn {log.turn}</span>
                        {log.message}
                    </div>
                ))}
            </div>
            
            <div className="p-4 border-t border-[#5d4037] bg-[#2a2622]">
                <h3 className="text-stone-300 font-bold mb-2 text-sm uppercase">My Faction</h3>
                <div className="flex items-center mb-2">
                    <div className={`w-8 h-8 rounded mr-3 border border-stone-400 ${playerFaction.color}`}></div>
                    <div>
                        <div className="font-bold text-white">{playerFaction.leaderName}</div>
                        <div className="text-xs text-stone-500">Ruler</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-400 mt-2">
                    <div>Cities: {playerCities.length}</div>
                    <div>Generals: {generals.filter(g => g.factionId === playerFactionId).length}</div>
                    <div>Allies: {playerFaction.allies.length}</div>
                </div>
            </div>
        </aside>

        {/* Main Map Area */}
        <main className="flex-1 relative">
            <WorldMap 
                cities={cities} 
                subLocations={subLocations}
                factions={factions} 
                onCityClick={handleCityClick}
                selectedCityId={selectedCity?.id}
                activeAttacks={activeAttacks}
            />
            
            {/* Loading Overlay */}
            {loadingMessage && (
                 <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="text-2xl text-white font-title animate-pulse flex flex-col items-center">
                        <Scroll size={48} className="mb-4 text-yellow-500"/>
                        {loadingMessage}
                    </div>
                </div>
            )}
        </main>
      </div>

      {/* City Dialog */}
      {selectedCity && (
        <CityModal 
            city={selectedCity}
            generals={generals}
            subLocations={subLocations}
            isPlayerOwned={selectedCity.factionId === playerFactionId}
            playerCities={playerCities}
            allCities={cities}
            onClose={() => setSelectedCity(null)}
            onAssignTask={handleAssignTask}
            onMoveGeneral={handleMoveGeneral}
            onTavernRecruit={handleTavernRecruit}
            onSearch={handleSearch}
            onAttack={handleAttack}
            onTransport={handleTransport}
            onGarrisonSubLocation={handleGarrisonSubLocation}
            onRecruitPrisoner={handleRecruitPrisoner}
            onBribePrisoner={handleBribePrisoner}
            onBuyItem={handleBuyItem}
        />
      )}

      {/* Battle Report Overlay */}
      {showBattleReport && (
          <BattleReport 
              results={battleResults}
              onClose={() => {
                  setShowBattleReport(false);
                  setBattleResults([]);
              }}
          />
      )}

      {/* Duel Overlay */}
      {currentDuel && (() => {
          const att = generals.find(g => g.id === currentDuel.attackerId);
          const def = generals.find(g => g.id === currentDuel.defenderId);
          // Hydrate with effective stats for the Duel View
          if (att && def) {
              const effAtt = getEffectiveGeneralStats(att);
              const effDef = getEffectiveGeneralStats(def);
              return (
                  <DuelModal 
                    attacker={effAtt}
                    defender={effDef}
                    onComplete={handleDuelComplete}
                  />
              );
          }
          return null;
      })()}

      {/* Recruitment Overlay */}
      {recruitmentData && (() => {
          const recruiter = generals.find(g => g.id === recruitmentData.recruiterId);
          const prisoner = generals.find(g => g.id === recruitmentData.prisonerId);
          if (recruiter && prisoner) {
              return (
                  <RecruitModal 
                    recruiter={getEffectiveGeneralStats(recruiter)}
                    prisoner={prisoner}
                    onConfirm={handleConfirmRecruitment}
                    onCancel={() => setRecruitmentData(null)}
                  />
              );
          }
          return null;
      })()}

      {/* Stats Modal */}
      {showStats && (
          <StatsModal 
              factions={factions}
              cities={cities}
              generals={generals.map(g => getEffectiveGeneralStats(g))} // Pass effective stats for display
              playerFactionId={playerFactionId}
              onClose={() => setShowStats(false)}
              onDiplomacy={handleDiplomacy}
          />
      )}

      {/* Historical Event Modal */}
      {currentEvent && (
          <EventModal 
            event={currentEvent} 
            onClose={() => setCurrentEvent(null)}
          />
      )}
    </div>
  );
};

export default App;