import React, { useState } from 'react';
import { City, General, GeneralState, Task, SubLocation, SubLocationType } from '../types';
import { Sword, Coins, Wheat, Shield, Hammer, Search, UserPlus, Eye, Trees, Pickaxe, Zap, Crown, Wine, ArrowRight, MapPin, Skull, Package, Home, Castle, Mountain, BicepsFlexed, Lock, HeartHandshake, UserX, ShoppingBag } from 'lucide-react';
import { SHOP_ITEMS } from '../constants';

interface CityModalProps {
  city: City;
  generals: General[];
  subLocations: SubLocation[];
  isPlayerOwned: boolean;
  playerCities: City[]; 
  allCities: City[]; 
  onClose: () => void;
  onAssignTask: (type: Task['type'], generalId: string) => void;
  onSearch: (generalId: string) => void;
  onTavernRecruit: () => void;
  onMoveGeneral: (generalId: string, targetCityId: string) => void;
  onAttack: (generalIds: string[], targetCityId: string) => void;
  onTransport: (generalId: string, targetCityId: string, payload: { gold: number, food: number, troops: number }) => void;
  onGarrisonSubLocation: (generalId: string, subLocationId: string) => void;
  onRecruitPrisoner: (recruiterId: string, prisonerId: string) => void;
  onBribePrisoner: (prisonerId: string) => void;
  onBuyItem: (generalId: string, itemId: string) => void;
}

const CityModal: React.FC<CityModalProps> = ({ 
  city, generals, subLocations, isPlayerOwned, playerCities, allCities,
  onClose, onAssignTask, onSearch, onTavernRecruit, onMoveGeneral, onAttack, onTransport, onGarrisonSubLocation, onRecruitPrisoner, onBribePrisoner, onBuyItem
}) => {
  const [activeTab, setActiveTab] = useState<'internal' | 'military' | 'personnel' | 'outposts' | 'tavern' | 'prison' | 'market'>('internal');
  const [movingGeneralId, setMovingGeneralId] = useState<string | null>(null);
  
  // Sortie State
  const [isSortieMode, setIsSortieMode] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedAttackers, setSelectedAttackers] = useState<Set<string>>(new Set());

  // Transport State
  const [isTransportMode, setIsTransportMode] = useState(false);
  const [transportTargetId, setTransportTargetId] = useState<string>('');
  const [transportGeneralId, setTransportGeneralId] = useState<string>('');
  const [transportPayload, setTransportPayload] = useState({ gold: 0, food: 0, troops: 0 });

  // Recruit Prisoner State
  const [selectedPrisonerId, setSelectedPrisonerId] = useState<string | null>(null);

  // Shop State
  const [buyingItem, setBuyingItem] = useState<string | null>(null); // Item ID

  // Filter generals present in this city and idle
  const availableGenerals = generals.filter(g => g.locationCityId === city.id && g.state === GeneralState.IDLE && g.factionId === city.factionId);
  const workingGenerals = generals.filter(g => g.locationCityId === city.id && g.state !== GeneralState.IDLE && g.state !== GeneralState.CAPTURED);
  
  // Captured generals in this city
  const prisoners = generals.filter(g => g.locationCityId === city.id && g.state === GeneralState.CAPTURED);

  // Filter sublocations for this city
  const citySubLocations = subLocations.filter(sl => sl.parentCityId === city.id);
  // Also get generals garrisoned in these sublocations for display
  const garrisonedGenerals = generals.filter(g => citySubLocations.some(sl => sl.generalId === g.id));

  // Find hostile neighbors for attack
  const hostileNeighbors = allCities.filter(c => 
    city.connections.includes(c.id) && c.factionId !== city.factionId
  );
  
  // Find friendly connected cities for transport
  const friendlyNeighbors = playerCities.filter(c => city.connections.includes(c.id));

  const toggleAttacker = (id: string) => {
    const newSet = new Set(selectedAttackers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedAttackers(newSet);
  };

  const handleLaunchAttack = () => {
    if (selectedTargetId && selectedAttackers.size > 0) {
        onAttack(Array.from(selectedAttackers), selectedTargetId);
        setIsSortieMode(false);
        onClose(); 
    }
  };

  const handleLaunchTransport = () => {
      if (transportTargetId && transportGeneralId) {
          onTransport(transportGeneralId, transportTargetId, transportPayload);
          setIsTransportMode(false);
          onClose();
      }
  };

  if (!isPlayerOwned) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-[#2c2722] border-2 border-[#8d6e63] rounded-lg p-6 max-w-md w-full text-center relative shadow-2xl">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">✕</button>
                <div className="flex items-center justify-center gap-2 mb-2">
                     {city.isCapital && <Crown size={24} className="text-yellow-500" />}
                    <h2 className="text-2xl font-title text-yellow-500">{city.name}</h2>
                </div>
                <p className="text-stone-300">Controlled by enemy forces.</p>
                
                <div className="grid grid-cols-2 gap-4 mt-6 text-left bg-stone-900/50 p-4 rounded">
                    <div className="flex items-center text-stone-300"><Shield size={16} className="mr-2 text-blue-400"/> Def: {city.defense}</div>
                    <div className="flex items-center text-stone-300"><Sword size={16} className="mr-2 text-red-400"/> Troops: {city.troops}</div>
                </div>
            </div>
        </div>
      )
  }

  // Recruiter Selection Overlay (For Prison)
  if (selectedPrisonerId) {
    const prisoner = generals.find(g => g.id === selectedPrisonerId);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="bg-[#2c2722] border-2 border-[#8d6e63] rounded-lg w-full max-w-md p-6 relative shadow-2xl">
                <h3 className="text-xl text-yellow-500 font-title mb-4 flex items-center">
                    <HeartHandshake className="mr-2"/> Select Recruiter
                </h3>
                <p className="text-stone-400 mb-4 text-sm">Who will attempt to persuade {prisoner?.name}?</p>
                
                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 mb-4">
                    {availableGenerals.length === 0 && <p className="text-stone-500 italic">No idle generals available.</p>}
                    {availableGenerals.map(g => (
                        <button 
                            key={g.id}
                            onClick={() => {
                                onRecruitPrisoner(g.id, selectedPrisonerId);
                                setSelectedPrisonerId(null);
                            }}
                            className="w-full text-left p-3 bg-[#3e3832] hover:bg-[#4e453e] rounded border border-[#5d4037] flex justify-between items-center group"
                        >
                            <span className="text-stone-200 font-bold">{g.name}</span>
                            <span className="text-xs text-stone-500 group-hover:text-yellow-500 flex items-center gap-2">
                                CHR: {g.chr} <ArrowRight size={12}/>
                            </span>
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setSelectedPrisonerId(null)}
                    className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
  }

  // General Buy Item Modal
  if (buyingItem) {
      const item = SHOP_ITEMS.find(i => i.id === buyingItem);
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="bg-[#2c2722] border-2 border-[#8d6e63] rounded-lg w-full max-w-md p-6 relative shadow-2xl">
                <h3 className="text-xl text-yellow-500 font-title mb-2 flex items-center">
                    <ShoppingBag className="mr-2"/> Purchase {item?.name}
                </h3>
                <p className="text-stone-400 mb-4 text-sm">Who will receive this item?</p>
                
                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 mb-4">
                    {availableGenerals.length === 0 && <p className="text-stone-500 italic">No idle generals available.</p>}
                    {availableGenerals.map(g => (
                        <button 
                            key={g.id}
                            onClick={() => {
                                onBuyItem(g.id, buyingItem);
                                setBuyingItem(null);
                            }}
                            className="w-full text-left p-3 bg-[#3e3832] hover:bg-[#4e453e] rounded border border-[#5d4037] flex justify-between items-center group"
                        >
                            <span className="text-stone-200 font-bold">{g.name}</span>
                            <span className="text-xs text-stone-500 group-hover:text-yellow-500 flex items-center">Select <ArrowRight size={12} className="ml-1"/></span>
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setBuyingItem(null)}
                    className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded"
                >
                    Cancel
                </button>
            </div>
        </div>
      );
  }

  // General Move Selection Modal Overlay
  if (movingGeneralId) {
      const movingGeneral = generals.find(g => g.id === movingGeneralId);
      const destinations = playerCities.filter(c => c.id !== city.id);

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="bg-[#2c2722] border-2 border-[#8d6e63] rounded-lg w-full max-w-md p-6 relative shadow-2xl">
                <h3 className="text-xl text-yellow-500 font-title mb-4 flex items-center">
                    <MapPin className="mr-2"/> Dispatch {movingGeneral?.name}
                </h3>
                <p className="text-stone-400 mb-4 text-sm">Select a destination city. The general will arrive next turn.</p>
                
                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 mb-4">
                    {destinations.length === 0 && <p className="text-stone-500 italic">No other cities available.</p>}
                    {destinations.map(dest => (
                        <button 
                            key={dest.id}
                            onClick={() => {
                                onMoveGeneral(movingGeneralId, dest.id);
                                setMovingGeneralId(null);
                            }}
                            className="w-full text-left p-3 bg-[#3e3832] hover:bg-[#4e453e] rounded border border-[#5d4037] flex justify-between items-center group"
                        >
                            <span className="text-stone-200 font-bold">{dest.name}</span>
                            <span className="text-xs text-stone-500 group-hover:text-yellow-500 flex items-center">Select <ArrowRight size={12} className="ml-1"/></span>
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setMovingGeneralId(null)}
                    className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded"
                >
                    Cancel
                </button>
            </div>
        </div>
      );
  }

  const renderGeneralRow = (g: General, action?: React.ReactNode) => (
      <div key={g.id} className="flex items-center justify-between bg-[#3e3832] p-2 rounded mb-2 border border-[#5d4037]">
          <div className="flex items-center">
             <div className="w-10 h-10 bg-stone-700 rounded-full overflow-hidden mr-3 border border-stone-500 shrink-0">
                <img src={g.portraitUrl} alt={g.name} className="w-full h-full object-cover"/>
             </div>
             <div>
                 <div className="font-bold text-stone-200">{g.name}</div>
                 <div className="text-xs text-stone-400 flex gap-2">
                    <span title="War">W:{g.war}</span>
                    <span title="Intel">I:{g.intel}</span>
                    <span title="Politics">P:{g.pol}</span>
                 </div>
             </div>
          </div>
          <div>{action}</div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-[#2c2722] border-2 border-[#8d6e63] rounded-lg w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }}></div>

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#5d4037] bg-[#231f1b] z-10">
          <div>
            <div className="flex items-center gap-2">
                {city.isCapital && <Crown size={20} className="text-yellow-500 fill-yellow-500/20" />}
                <h2 className="text-3xl font-title text-yellow-500">{city.name}</h2>
            </div>
            <div className="text-xs text-stone-400 uppercase tracking-widest">{city.isCapital ? 'Faction Capital' : 'Prefecture City'}</div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-full p-2 transition-colors">
            ✕
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 p-4 bg-[#36302a] border-b border-[#5d4037] z-10 overflow-x-auto">
            <div className="flex flex-col items-center p-2 bg-[#2c2722] rounded border border-[#4a403a] min-w-[70px]">
                <span className="text-[10px] text-stone-500 mb-1">DEF</span>
                <span className="font-bold text-stone-200 flex items-center text-xs"><Shield size={12} className="mr-1 text-blue-400"/> {city.defense}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-[#2c2722] rounded border border-[#4a403a] min-w-[70px]">
                <span className="text-[10px] text-stone-500 mb-1">TROOPS</span>
                <span className="font-bold text-stone-200 flex items-center text-xs"><Sword size={12} className="mr-1 text-red-400"/> {city.troops}</span>
            </div>
             <div className="flex flex-col items-center p-2 bg-[#2c2722] rounded border border-[#4a403a] min-w-[70px]">
                <span className="text-[10px] text-stone-500 mb-1">MORALE</span>
                <span className="font-bold text-stone-200 flex items-center text-xs"><Zap size={12} className="mr-1 text-orange-400"/> {city.morale}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-[#2c2722] rounded border border-[#4a403a] min-w-[70px]">
                <span className="text-[10px] text-stone-500 mb-1">GOLD</span>
                <span className="font-bold text-stone-200 flex items-center text-xs"><Coins size={12} className="mr-1 text-yellow-400"/> +{city.goldIncome}</span>
            </div>
             <div className="flex flex-col items-center p-2 bg-[#2c2722] rounded border border-[#4a403a] min-w-[70px]">
                <span className="text-[10px] text-stone-500 mb-1">WOOD</span>
                <span className="font-bold text-stone-200 flex items-center text-xs"><Trees size={12} className="mr-1 text-emerald-400"/> +{city.woodIncome}</span>
            </div>
             <div className="flex flex-col items-center p-2 bg-[#2c2722] rounded border border-[#4a403a] min-w-[70px]">
                <span className="text-[10px] text-stone-500 mb-1">STONE</span>
                <span className="font-bold text-stone-200 flex items-center text-xs"><Pickaxe size={12} className="mr-1 text-stone-400"/> +{city.stoneIncome}</span>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#5d4037] bg-[#2a2622] z-10 overflow-x-auto">
            {[
                { id: 'internal', label: 'Internal', icon: Hammer },
                { id: 'military', label: 'Military', icon: Sword },
                { id: 'personnel', label: 'Personnel', icon: UserPlus },
                { id: 'market', label: 'Market', icon: ShoppingBag },
                { id: 'outposts', label: 'Outposts', icon: Castle },
                ...(city.isCapital ? [{ id: 'tavern', label: 'Tavern', icon: Wine }] : []),
                ...(prisoners.length > 0 ? [{ id: 'prison', label: 'Prison', icon: Lock }] : [])
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setIsSortieMode(false); setIsTransportMode(false); }}
                    className={`flex-1 py-3 px-4 flex items-center justify-center transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-[#3e3832] text-yellow-500 border-b-2 border-yellow-500' : 'text-stone-400 hover:bg-[#332e29]'}`}
                >
                    <tab.icon size={16} className="mr-2"/>
                    <span className="hidden md:inline">{tab.label}</span>
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 z-10 custom-scrollbar">
            
            {/* --- INTERNAL TAB --- */}
            {activeTab === 'internal' && (
                <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="bg-[#25211d] p-3 rounded border border-[#443b35]">
                            <h3 className="text-stone-300 font-bold mb-2 flex items-center text-sm"><Coins size={14} className="mr-2"/> Commerce</h3>
                            {availableGenerals.map(g => renderGeneralRow(g, 
                                <button onClick={() => onAssignTask('develop_gold', g.id)} className="px-2 py-1 bg-yellow-900 text-yellow-100 text-[10px] rounded border border-yellow-700">Dev</button>
                            ))}
                         </div>
                         <div className="bg-[#25211d] p-3 rounded border border-[#443b35]">
                            <h3 className="text-stone-300 font-bold mb-2 flex items-center text-sm"><Wheat size={14} className="mr-2"/> Agriculture</h3>
                            {availableGenerals.map(g => renderGeneralRow(g, 
                                 <button onClick={() => onAssignTask('develop_food', g.id)} className="px-2 py-1 bg-green-900 text-green-100 text-[10px] rounded border border-green-700">Dev</button>
                            ))}
                         </div>
                         <div className="bg-[#25211d] p-3 rounded border border-[#443b35]">
                            <h3 className="text-stone-300 font-bold mb-2 flex items-center text-sm"><Trees size={14} className="mr-2"/> Forestry</h3>
                            {availableGenerals.map(g => renderGeneralRow(g, 
                                 <button onClick={() => onAssignTask('harvest_wood', g.id)} className="px-2 py-1 bg-emerald-900 text-emerald-100 text-[10px] rounded border border-emerald-700">Harvest</button>
                            ))}
                         </div>
                         <div className="bg-[#25211d] p-3 rounded border border-[#443b35]">
                            <h3 className="text-stone-300 font-bold mb-2 flex items-center text-sm"><Pickaxe size={14} className="mr-2"/> Quarry</h3>
                            {availableGenerals.map(g => renderGeneralRow(g, 
                                 <button onClick={() => onAssignTask('quarry_stone', g.id)} className="px-2 py-1 bg-stone-600 text-stone-100 text-[10px] rounded border border-stone-500">Quarry</button>
                            ))}
                         </div>
                     </div>
                </div>
            )}

            {/* --- MILITARY TAB --- */}
            {activeTab === 'military' && (
                 <div className="space-y-4">
                     {!isSortieMode && !isTransportMode ? (
                        <>
                            {/* Campaign Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#3e2e28] p-4 rounded border border-red-900/50 flex flex-col items-center text-center shadow-lg">
                                    <h3 className="text-red-400 font-title text-md mb-2 flex items-center"><Skull size={18} className="mr-2"/> Sortie</h3>
                                    <button 
                                        onClick={() => setIsSortieMode(true)}
                                        disabled={city.troops < 500}
                                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all w-full ${city.troops < 500 ? 'bg-stone-700 text-stone-500 cursor-not-allowed' : 'bg-red-800 hover:bg-red-700 text-white'}`}
                                    >
                                        Attack
                                    </button>
                                </div>
                                <div className="bg-[#2e343e] p-4 rounded border border-blue-900/50 flex flex-col items-center text-center shadow-lg">
                                    <h3 className="text-blue-400 font-title text-md mb-2 flex items-center"><Package size={18} className="mr-2"/> Transport</h3>
                                    <button 
                                        onClick={() => setIsTransportMode(true)}
                                        className="px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all w-full bg-blue-800 hover:bg-blue-700 text-white"
                                    >
                                        Supply
                                    </button>
                                </div>
                            </div>

                            <div className="bg-[#25211d] p-4 rounded border border-[#443b35]">
                                <h3 className="text-stone-300 font-bold mb-3 flex items-center"><Hammer size={16} className="mr-2"/> Siege Engineering</h3>
                                <p className="text-xs text-stone-500 mb-4">Fabricate catapults and rams. Greatly increases <span className="text-blue-300">Defense & Siege Power</span>. Costs <span className="text-emerald-400">300 Wood</span> & <span className="text-yellow-400">200 Gold</span>.</p>
                                {availableGenerals.map(g => renderGeneralRow(g, 
                                        <button onClick={() => onAssignTask('build_siege', g.id)} className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs rounded border border-stone-500">Build</button>
                                    ))}
                            </div>
                            
                            <div className="bg-[#25211d] p-4 rounded border border-[#443b35]">
                                <h3 className="text-stone-300 font-bold mb-3 flex items-center"><UserPlus size={16} className="mr-2"/> Conscript Troops</h3>
                                <p className="text-xs text-stone-500 mb-4">Draft soldiers. Costs <span className="text-yellow-400">100 Gold</span>, <span className="text-green-400">200 Food</span>.</p>
                                {availableGenerals.map(g => renderGeneralRow(g, 
                                        <button onClick={() => onAssignTask('conscript', g.id)} className="px-3 py-1 bg-red-700 hover:bg-red-600 text-red-100 text-xs rounded border border-red-500">Draft</button>
                                    ))}
                            </div>

                             <div className="bg-[#25211d] p-4 rounded border border-[#443b35]">
                                <h3 className="text-stone-300 font-bold mb-3 flex items-center"><Sword size={16} className="mr-2"/> Train Troops</h3>
                                <p className="text-xs text-stone-500 mb-4">Drill the army to increase <span className="text-orange-400">Morale & Efficiency</span>. Costs <span className="text-green-400">100 Food</span>.</p>
                                {availableGenerals.map(g => renderGeneralRow(g, 
                                        <button onClick={() => onAssignTask('train', g.id)} className="px-3 py-1 bg-orange-700 hover:bg-orange-600 text-orange-100 text-xs rounded border border-orange-500">Train</button>
                                    ))}
                            </div>
                        </>
                     ) : isSortieMode ? (
                        // SORTIE UI
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-red-500 font-title text-xl">Campaign Planning</h3>
                                <button onClick={() => setIsSortieMode(false)} className="text-stone-500 hover:text-white text-xs underline">Cancel</button>
                            </div>
                            
                            {/* Target Selection */}
                            <div className="bg-[#2c2722] p-4 rounded border border-[#5d4037]">
                                <h4 className="text-stone-300 font-bold mb-2 text-sm uppercase">1. Select Target</h4>
                                {hostileNeighbors.length === 0 ? <p className="text-stone-500 italic text-sm">No valid targets.</p> : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {hostileNeighbors.map(hn => (
                                            <button 
                                                key={hn.id} onClick={() => setSelectedTargetId(hn.id)}
                                                className={`p-3 rounded border text-left ${selectedTargetId === hn.id ? 'bg-red-900/40 border-red-500 text-red-200' : 'bg-[#3e3832] border-[#5d4037] text-stone-400'}`}
                                            >
                                                <div className="font-bold">{hn.name}</div>
                                                <div className="text-[10px] text-stone-500">Def: {hn.defense} Troops: {hn.troops}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Attacker Selection */}
                            {selectedTargetId && (
                                <div className="bg-[#2c2722] p-4 rounded border border-[#5d4037]">
                                    <h4 className="text-stone-300 font-bold mb-2 text-sm uppercase">2. Select Commanders</h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                        {availableGenerals.map(g => (
                                            <div key={g.id} onClick={() => toggleAttacker(g.id)} className={`flex items-center justify-between p-2 rounded border cursor-pointer ${selectedAttackers.has(g.id) ? 'bg-yellow-900/30 border-yellow-600' : 'bg-[#3e3832] border-[#5d4037]'}`}>
                                                <div className="flex items-center">
                                                    <input type="checkbox" checked={selectedAttackers.has(g.id)} readOnly className="mr-3 accent-yellow-600" />
                                                    <div>
                                                        <div className="text-stone-200 font-bold">{g.name}</div>
                                                        <div className="text-xs text-stone-500">War: {g.war}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             <button onClick={handleLaunchAttack} disabled={!selectedTargetId || selectedAttackers.size === 0} className="w-full py-3 bg-red-800 hover:bg-red-700 text-white font-bold rounded flex items-center justify-center gap-2">
                                <Sword size={18}/> MARCH TO BATTLE
                             </button>
                        </div>
                     ) : (
                        // TRANSPORT UI
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-blue-500 font-title text-xl">Supply Transport</h3>
                                <button onClick={() => setIsTransportMode(false)} className="text-stone-500 hover:text-white text-xs underline">Cancel</button>
                            </div>

                            {/* Target */}
                            <div className="bg-[#2c2722] p-4 rounded border border-[#5d4037]">
                                <h4 className="text-stone-300 font-bold mb-2 text-sm uppercase">1. Destination</h4>
                                {friendlyNeighbors.length === 0 ? <p className="text-stone-500 italic text-sm">No connected friendly cities.</p> : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {friendlyNeighbors.map(fn => (
                                            <button key={fn.id} onClick={() => setTransportTargetId(fn.id)} className={`p-2 rounded border text-left ${transportTargetId === fn.id ? 'bg-blue-900/40 border-blue-500 text-blue-200' : 'bg-[#3e3832] border-[#5d4037] text-stone-400'}`}>
                                                <div className="font-bold">{fn.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* General */}
                            <div className="bg-[#2c2722] p-4 rounded border border-[#5d4037]">
                                <h4 className="text-stone-300 font-bold mb-2 text-sm uppercase">2. Escort General (Required)</h4>
                                <select 
                                    className="w-full bg-[#3e3832] border border-[#5d4037] text-stone-200 p-2 rounded"
                                    value={transportGeneralId}
                                    onChange={(e) => setTransportGeneralId(e.target.value)}
                                >
                                    <option value="">Select General...</option>
                                    {availableGenerals.map(g => <option key={g.id} value={g.id}>{g.name} (Pol: {g.pol})</option>)}
                                </select>
                            </div>

                            {/* Payload */}
                            <div className="bg-[#2c2722] p-4 rounded border border-[#5d4037]">
                                <h4 className="text-stone-300 font-bold mb-2 text-sm uppercase">3. Resources</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs text-stone-400 mb-1">
                                            <span>Gold</span>
                                            <span>Max: ?</span> {/* Simplify for now, assumes player checks header */}
                                        </div>
                                        <input type="number" className="w-full bg-[#3e3832] border border-[#5d4037] text-white p-1 rounded" 
                                            placeholder="Amount" value={transportPayload.gold} 
                                            onChange={(e) => setTransportPayload({...transportPayload, gold: parseInt(e.target.value) || 0})} 
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-stone-400 mb-1"><span>Food</span></div>
                                        <input type="number" className="w-full bg-[#3e3832] border border-[#5d4037] text-white p-1 rounded" 
                                            placeholder="Amount" value={transportPayload.food} 
                                            onChange={(e) => setTransportPayload({...transportPayload, food: parseInt(e.target.value) || 0})} 
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-stone-400 mb-1"><span>Troops (City Garrison)</span></div>
                                        <input type="number" className="w-full bg-[#3e3832] border border-[#5d4037] text-white p-1 rounded" 
                                            placeholder="Max: City Troops" value={transportPayload.troops} max={city.troops}
                                            onChange={(e) => setTransportPayload({...transportPayload, troops: parseInt(e.target.value) || 0})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleLaunchTransport} disabled={!transportTargetId || !transportGeneralId} className="w-full py-3 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded">DISPATCH CONVOY</button>
                        </div>
                     )}
                 </div>
            )}

            {/* --- OUTPOSTS TAB --- */}
            {activeTab === 'outposts' && (
                <div className="space-y-4">
                    <div className="bg-[#3e2e28]/50 p-4 rounded border border-stone-600 text-stone-300 text-sm">
                        <p>Outposts provide bonuses but require a garrison commander. Garrisons consume <strong>50 Food</strong> per turn.</p>
                    </div>

                    {citySubLocations.map(sl => {
                         const Icon = sl.type === SubLocationType.VILLAGE ? Home : sl.type === SubLocationType.FORT ? Castle : Mountain;
                         const bonusText = sl.type === SubLocationType.VILLAGE ? "+Gold/Food" : sl.type === SubLocationType.FORT ? "+Defense/Morale" : "+Strategy";
                         const garrison = generals.find(g => g.id === sl.generalId);

                         return (
                             <div key={sl.id} className="bg-[#2c2722] border border-[#5d4037] p-4 rounded flex flex-col gap-3">
                                 <div className="flex justify-between items-center">
                                     <div className="flex items-center gap-2">
                                         <div className="p-2 bg-stone-800 rounded text-stone-400"><Icon size={16}/></div>
                                         <div>
                                             <div className="font-bold text-stone-200">{sl.name}</div>
                                             <div className="text-xs text-stone-500">{bonusText}</div>
                                         </div>
                                     </div>
                                     {garrison ? (
                                         <div className="text-right">
                                             <div className="text-xs text-green-500 font-bold uppercase">Active</div>
                                             <div className="text-xs text-stone-400">{garrison.name}</div>
                                         </div>
                                     ) : (
                                         <div className="text-xs text-stone-600 uppercase">Empty</div>
                                     )}
                                 </div>
                                 
                                 <div className="flex gap-2 mt-2 pt-2 border-t border-[#3e3832]">
                                     <select 
                                         className="flex-1 bg-[#3e3832] border border-[#5d4037] text-xs text-stone-300 p-1 rounded"
                                         disabled={!!garrison}
                                         onChange={(e) => {
                                             if (e.target.value) onGarrisonSubLocation(e.target.value, sl.id);
                                         }}
                                         value=""
                                     >
                                         <option value="">Assign Commander...</option>
                                         {availableGenerals.map(g => <option key={g.id} value={g.id}>{g.name} (War:{g.war})</option>)}
                                     </select>
                                     {garrison && (
                                         <button 
                                            onClick={() => onGarrisonSubLocation(garrison.id, "")} // Empty string implies remove/return
                                            className="bg-red-900/50 hover:bg-red-900 text-red-200 px-3 rounded text-xs border border-red-800"
                                         >
                                             Recall
                                         </button>
                                     )}
                                 </div>
                             </div>
                         );
                    })}
                </div>
            )}

            {/* --- PERSONNEL TAB --- */}
            {activeTab === 'personnel' && (
                <div className="space-y-4">
                     <div className="bg-[#25211d] p-4 rounded border border-[#443b35]">
                       <h3 className="text-stone-300 font-bold mb-3 flex items-center"><Search size={16} className="mr-2"/> Search City</h3>
                       <p className="text-xs text-stone-500 mb-4">Scout the city for hidden talents or treasure.</p>
                       {availableGenerals.map(g => renderGeneralRow(g, 
                             <button onClick={() => onSearch(g.id)} className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-purple-100 text-xs rounded border border-purple-500 flex items-center gap-1"><Eye size={12}/> Search</button>
                        ))}
                    </div>
                    <div className="bg-[#25211d] p-4 rounded border border-[#443b35]">
                       <h3 className="text-stone-300 font-bold mb-3 flex items-center"><MapPin size={16} className="mr-2"/> Dispatch General</h3>
                       <p className="text-xs text-stone-500 mb-4">Send a general to another city (Arrives next turn).</p>
                       {availableGenerals.map(g => renderGeneralRow(g, 
                             <button onClick={() => setMovingGeneralId(g.id)} className="px-3 py-1 bg-stone-600 hover:bg-stone-500 text-stone-200 text-xs rounded border border-stone-400 flex items-center gap-1"><ArrowRight size={12}/> Move</button>
                        ))}
                    </div>
                </div>
            )}

            {/* --- MARKET TAB --- */}
            {activeTab === 'market' && (
                <div className="space-y-4">
                    <div className="bg-[#3e2e28]/50 p-4 rounded border border-stone-600 text-stone-300 text-sm flex items-center gap-3">
                        <ShoppingBag size={20} className="text-yellow-500"/>
                        <p>Purchase fine equipment for your officers. Equipment boosts stats and may provide unique effects.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {SHOP_ITEMS.map(item => (
                            <div key={item.id} className="bg-[#2a2622] border border-[#5d4037] p-3 rounded flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="text-yellow-500 font-bold">{item.name}</div>
                                        <div className="text-[10px] text-stone-500 uppercase tracking-wider">{item.type}</div>
                                    </div>
                                    <div className="bg-black/30 px-2 py-1 rounded text-yellow-300 text-xs font-bold border border-yellow-900/50">
                                        {item.price} G
                                    </div>
                                </div>
                                <div className="text-xs text-stone-400 mb-2 min-h-[30px]">{item.description}</div>
                                <div className="text-xs text-green-400 font-mono mb-3">
                                    {item.stats.war && <span>War +{item.stats.war} </span>}
                                    {item.stats.intel && <span>Int +{item.stats.intel} </span>}
                                    {item.stats.pol && <span>Pol +{item.stats.pol} </span>}
                                    {item.stats.chr && <span>Chr +{item.stats.chr} </span>}
                                </div>
                                <button 
                                    onClick={() => setBuyingItem(item.id)}
                                    className="w-full py-1 bg-stone-700 hover:bg-yellow-800 text-stone-200 hover:text-yellow-100 rounded text-xs border border-stone-600 hover:border-yellow-600 transition-colors"
                                >
                                    Purchase
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAVERN TAB --- */}
            {activeTab === 'tavern' && city.isCapital && (
                <div className="space-y-4">
                     <div className="bg-[#25211d] p-6 rounded border border-[#443b35] text-center">
                        <Wine size={48} className="mx-auto text-yellow-600 mb-4"/>
                        <h3 className="text-xl text-yellow-500 font-title mb-2">Grand Banquet</h3>
                        <p className="text-stone-400 mb-6 text-sm">Host a lavish feast to attract legendary heroes from across the land. High chance of famous generals.</p>
                        
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="bg-black/40 px-4 py-2 rounded text-yellow-400 border border-yellow-900/50 flex items-center">
                                <Coins size={16} className="mr-2"/> Cost: 800 Gold
                            </div>
                        </div>

                        <button 
                            onClick={onTavernRecruit}
                            className="bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white px-8 py-3 rounded border border-red-500 font-bold tracking-widest shadow-lg transform hover:scale-105 transition-all"
                        >
                            RECRUIT HERO
                        </button>
                     </div>
                </div>
            )}

            {/* --- PRISON TAB --- */}
            {activeTab === 'prison' && prisoners.length > 0 && (
                <div className="space-y-4">
                    <div className="bg-[#3e2e28]/50 p-4 rounded border border-stone-600 text-stone-300 text-sm flex items-center gap-3">
                        <Lock size={20} className="text-stone-400"/>
                        <p>Captured enemy officers lose <strong>Loyalty</strong> every turn. Persuade them to join your cause, or use gold to erode their will.</p>
                    </div>

                    <div className="space-y-2">
                    {prisoners.map(prisoner => (
                        <div key={prisoner.id} className="flex flex-col md:flex-row md:items-center justify-between bg-[#2a2622] p-3 rounded border border-[#5d4037] gap-3">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-stone-700 rounded mr-3 border-2 border-red-900 overflow-hidden shrink-0 relative">
                                    <img src={prisoner.portraitUrl} alt={prisoner.name} className="w-full h-full object-cover grayscale brightness-75"/>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Lock size={16} className="text-white drop-shadow-md"/>
                                    </div>
                                </div>
                                <div>
                                    <div className="font-bold text-stone-200">{prisoner.name}</div>
                                    <div className="text-xs text-stone-500">Faction: {allCities.find(c => c.factionId === prisoner.factionId)?.factionId.toUpperCase() || "Enemy"}</div>
                                    <div className="flex gap-3 text-xs mt-1">
                                        <span className={`font-bold ${prisoner.loyalty < 50 ? 'text-green-500' : 'text-red-400'}`}>Loyalty: {prisoner.loyalty}</span>
                                        <span className="text-stone-400" title="Charisma">CHR: {prisoner.chr}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onBribePrisoner(prisoner.id)}
                                    className="flex-1 md:flex-none px-3 py-1 bg-yellow-900/50 hover:bg-yellow-900 text-yellow-200 text-xs rounded border border-yellow-700 flex items-center justify-center gap-1"
                                    title="Cost: 200 Gold. Reduces Loyalty."
                                >
                                    <Coins size={12}/> Bribe (-200G)
                                </button>
                                <button 
                                    onClick={() => setSelectedPrisonerId(prisoner.id)}
                                    className="flex-1 md:flex-none px-3 py-1 bg-blue-900/50 hover:bg-blue-900 text-blue-200 text-xs rounded border border-blue-700 flex items-center justify-center gap-1"
                                >
                                    <UserPlus size={12}/> Persuade
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            )}

            {/* Currently Active Tasks */}
            {workingGenerals.length > 0 && (
                <div className="mt-6 border-t border-[#5d4037] pt-4">
                    <h3 className="text-stone-400 text-sm font-bold uppercase mb-2">Active Duties</h3>
                    {workingGenerals.map(g => (
                        <div key={g.id} className="flex items-center justify-between text-xs bg-[#2c2722] p-2 rounded mb-1 border border-dashed border-stone-600">
                            <span className="text-stone-300">{g.name}</span>
                            <span className={`font-bold ${g.state === GeneralState.CAMPAIGNING ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>{g.state}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CityModal;