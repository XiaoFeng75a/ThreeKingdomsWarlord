import React, { useState } from 'react';
import { Faction, City, General } from '../types';
import { BarChart3, Users, Network, Coins, Wheat, Handshake, Skull, Scroll, Search, Sword } from 'lucide-react';
import GeneralDetailModal from './GeneralDetailModal';

interface StatsModalProps {
  factions: Faction[];
  cities: City[];
  generals: General[];
  playerFactionId: string;
  onClose: () => void;
  onDiplomacy: (type: 'alliance' | 'war', targetFactionId: string) => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ factions, cities, generals, playerFactionId, onClose, onDiplomacy }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'diplomacy' | 'generals'>('overview');
  const [selectedFactionId, setSelectedFactionId] = useState<string | null>(null);
  const [selectedGeneralForDetail, setSelectedGeneralForDetail] = useState<General | null>(null);

  const playerFaction = factions.find(f => f.id === playerFactionId);
  const playerGenerals = generals.filter(g => g.factionId === playerFactionId);

  // Helper to calculate faction stats
  const getFactionStats = (factionId: string) => {
    const factionCities = cities.filter(c => c.factionId === factionId);
    const factionGenerals = generals.filter(g => g.factionId === factionId);
    const totalTroops = factionCities.reduce((sum, c) => sum + c.troops, 0);
    return {
      citiesCount: factionCities.length,
      generalsCount: factionGenerals.length,
      totalTroops
    };
  };

  const renderDiplomacyGraph = () => {
    // Determine positions in a circle
    const radius = 160;
    const centerX = 250;
    const centerY = 200;
    
    return (
        <div className="w-full h-[400px] flex items-center justify-center overflow-hidden relative bg-[#2a2622] border border-[#5d4037] rounded">
            <svg width="500" height="400" className="absolute top-0 left-0 w-full h-full">
                <defs>
                     <marker id="arrow" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
                     </marker>
                </defs>

                {/* Connections */}
                {factions.map((faction, i) => {
                    const angle = (i / factions.length) * 2 * Math.PI;
                    const x1 = centerX + radius * Math.cos(angle);
                    const y1 = centerY + radius * Math.sin(angle);

                    return (
                        <g key={`conns-${faction.id}`}>
                            {/* Allies Lines (Blue Dashed) */}
                            {faction.allies.map(allyId => {
                                const allyIndex = factions.findIndex(f => f.id === allyId);
                                if (allyIndex === -1 || allyIndex < i) return null;
                                const allyAngle = (allyIndex / factions.length) * 2 * Math.PI;
                                const x2 = centerX + radius * Math.cos(allyAngle);
                                const y2 = centerY + radius * Math.sin(allyAngle);
                                return (
                                    <line key={`ally-${faction.id}-${allyId}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                                );
                            })}
                             {/* Enemy Lines (Red Solid) */}
                             {faction.enemies.map(enemyId => {
                                const enemyIndex = factions.findIndex(f => f.id === enemyId);
                                if (enemyIndex === -1 || enemyIndex < i) return null;
                                const enemyAngle = (enemyIndex / factions.length) * 2 * Math.PI;
                                const x2 = centerX + radius * Math.cos(enemyAngle);
                                const y2 = centerY + radius * Math.sin(enemyAngle);
                                return (
                                    <line key={`war-${faction.id}-${enemyId}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ef4444" strokeWidth="1" opacity="0.6"/>
                                );
                            })}
                        </g>
                    );
                })}

                {/* Faction Nodes */}
                {factions.map((faction, i) => {
                    const angle = (i / factions.length) * 2 * Math.PI;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    
                    return (
                        <g key={faction.id}>
                            <circle cx={x} cy={y} r="20" className={`${faction.color.replace('bg-', 'text-')} fill-current drop-shadow-lg`} />
                            <circle cx={x} cy={y} r="20" stroke="#1f2937" strokeWidth="2" fill="none" />
                        </g>
                    );
                })}
            </svg>

            {/* Overlay Labels (HTML for better text rendering) */}
            {factions.map((faction, i) => {
                const angle = (i / factions.length) * 2 * Math.PI;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                
                return (
                    <div 
                        key={`label-${faction.id}`}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                        style={{ left: `${(x/500)*100}%`, top: `${(y/400)*100}%` }}
                    >
                        <div className="w-10 h-10 flex items-center justify-center font-bold text-white text-lg">
                            {faction.leaderName[0]}
                        </div>
                        <div className="text-xs text-stone-300 bg-black/50 px-1 rounded mt-6 whitespace-nowrap">
                            {faction.leaderName}
                        </div>
                    </div>
                );
            })}
            
            <div className="absolute bottom-2 left-2 text-xs text-stone-500 space-y-1">
                <div className="flex items-center"><span className="w-4 h-0.5 bg-blue-500 border-b-2 border-dashed mr-2"></span> Ally</div>
                <div className="flex items-center"><span className="w-4 h-0.5 bg-red-500 mr-2"></span> At War</div>
            </div>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#231f1b] border-2 border-[#8d6e63] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl rounded relative">
        <div className="p-4 border-b border-[#5d4037] flex justify-between items-center bg-[#2a2622]">
            <h2 className="text-2xl font-title text-yellow-500 flex items-center">
                <BarChart3 className="mr-2"/> World Statistics
            </h2>
            <button onClick={onClose} className="text-stone-400 hover:text-white">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#5d4037] bg-[#1a1714]">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 text-sm uppercase tracking-widest font-bold ${activeTab === 'overview' ? 'bg-[#3e3832] text-yellow-500' : 'text-stone-500 hover:text-stone-300'}`}
            >
                Faction Overview
            </button>
            <button 
                onClick={() => setActiveTab('diplomacy')}
                className={`flex-1 py-3 text-sm uppercase tracking-widest font-bold ${activeTab === 'diplomacy' ? 'bg-[#3e3832] text-yellow-500' : 'text-stone-500 hover:text-stone-300'}`}
            >
                Diplomacy Network
            </button>
            <button 
                onClick={() => setActiveTab('generals')}
                className={`flex-1 py-3 text-sm uppercase tracking-widest font-bold ${activeTab === 'generals' ? 'bg-[#3e3832] text-yellow-500' : 'text-stone-500 hover:text-stone-300'}`}
            >
                My Generals
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#1a1714]">
            {activeTab === 'overview' ? (
                <div className="flex gap-4 h-full">
                    {/* List */}
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-stone-500 border-b border-[#5d4037]">
                                    <th className="p-3 font-title">Faction</th>
                                    <th className="p-3 text-center">Cities</th>
                                    <th className="p-3 text-right">Troops</th>
                                    <th className="p-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {factions
                                .sort((a,b) => getFactionStats(b.id).totalTroops - getFactionStats(a.id).totalTroops)
                                .map(f => {
                                    const stats = getFactionStats(f.id);
                                    const isPlayer = f.id === playerFactionId;
                                    const isAlly = playerFaction?.allies.includes(f.id);
                                    const isEnemy = playerFaction?.enemies.includes(f.id);

                                    return (
                                        <tr 
                                            key={f.id} 
                                            onClick={() => setSelectedFactionId(f.id)}
                                            className={`border-b border-[#2c2722] cursor-pointer transition-colors ${selectedFactionId === f.id ? 'bg-[#3e3832] border-yellow-800' : 'hover:bg-[#2c2722]'}`}
                                        >
                                            <td className="p-3">
                                                <div className="flex items-center">
                                                    <div className={`w-3 h-3 rounded-full mr-2 ${f.color}`}></div>
                                                    <span className={`font-bold ${isPlayer ? 'text-yellow-500' : 'text-stone-200'}`}>{f.leaderName}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center text-stone-400">{stats.citiesCount}</td>
                                            <td className="p-3 text-right text-red-400 font-bold">{stats.totalTroops.toLocaleString()}</td>
                                            <td className="p-3 text-center">
                                                {isPlayer ? <span className="text-yellow-600 text-xs">YOU</span> : 
                                                 isAlly ? <span className="bg-blue-900 text-blue-300 text-[10px] px-2 py-0.5 rounded">ALLY</span> :
                                                 isEnemy ? <span className="bg-red-900 text-red-300 text-[10px] px-2 py-0.5 rounded">WAR</span> :
                                                 <span className="text-stone-600 text-[10px]">Neutral</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Detail Panel */}
                    <div className="w-1/3 bg-[#231f1b] border-l border-[#5d4037] p-4 flex flex-col">
                        {selectedFactionId ? (
                            (() => {
                                const f = factions.find(fac => fac.id === selectedFactionId)!;
                                const stats = getFactionStats(f.id);
                                const isPlayer = f.id === playerFactionId;
                                const isAlly = playerFaction?.allies.includes(f.id);
                                const isEnemy = playerFaction?.enemies.includes(f.id);

                                return (
                                    <>
                                        <div className="text-center mb-6">
                                            <div className={`w-16 h-16 mx-auto rounded-full shadow-lg mb-2 ${f.color} flex items-center justify-center text-2xl font-bold text-white`}>{f.leaderName[0]}</div>
                                            <h3 className="text-2xl font-title text-yellow-500">{f.leaderName}</h3>
                                            <p className="text-stone-500 text-sm">{f.name}</p>
                                        </div>
                                        
                                        <div className="space-y-3 mb-8">
                                            <div className="flex justify-between border-b border-[#3e3832] pb-1">
                                                <span className="text-stone-500">Gold</span>
                                                <span className="text-yellow-500">{f.gold}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[#3e3832] pb-1">
                                                <span className="text-stone-500">Food</span>
                                                <span className="text-green-500">{f.food}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[#3e3832] pb-1">
                                                <span className="text-stone-500">Total Army</span>
                                                <span className="text-red-400 font-bold">{stats.totalTroops}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[#3e3832] pb-1">
                                                <span className="text-stone-500">Generals</span>
                                                <span className="text-stone-300">{stats.generalsCount}</span>
                                            </div>
                                        </div>

                                        {!isPlayer && (
                                            <div className="mt-auto space-y-2">
                                                <div className="text-xs text-stone-500 uppercase tracking-widest mb-1 text-center">Diplomatic Actions</div>
                                                
                                                {/* Alliance Button */}
                                                {!isAlly && !isEnemy && (
                                                    <button 
                                                        onClick={() => onDiplomacy('alliance', f.id)}
                                                        className="w-full bg-blue-800 hover:bg-blue-700 text-white py-2 rounded border border-blue-600 flex items-center justify-center gap-2"
                                                    >
                                                        <Handshake size={16}/> Form Alliance
                                                        <span className="text-[10px] opacity-70">(500 Gold)</span>
                                                    </button>
                                                )}
                                                
                                                {/* War Button */}
                                                {!isEnemy && (
                                                    <button 
                                                        onClick={() => onDiplomacy('war', f.id)}
                                                        className="w-full bg-red-900 hover:bg-red-800 text-red-100 py-2 rounded border border-red-700 flex items-center justify-center gap-2"
                                                    >
                                                        <Skull size={16}/> Declare War
                                                        {isAlly && <span className="text-[10px] text-red-300">(Breaks Alliance)</span>}
                                                    </button>
                                                )}

                                                {isEnemy && <div className="text-center text-red-500 font-bold border border-red-900 bg-red-950/30 p-2 rounded">Currently at War</div>}
                                                {isAlly && <div className="text-center text-blue-400 font-bold border border-blue-900 bg-blue-950/30 p-2 rounded">Allied Forces</div>}
                                            </div>
                                        )}
                                    </>
                                );
                            })()
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-stone-600">
                                <Scroll size={48} className="mb-4 opacity-20"/>
                                <p>Select a faction to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'diplomacy' ? (
                <div className="flex flex-col items-center">
                    {renderDiplomacyGraph()}
                    <p className="text-center text-stone-500 text-sm mt-4 italic">
                        Lines represent official alliances. Absence of a line implies hostility or neutrality.
                    </p>
                </div>
            ) : (
                // GENERALS TAB
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playerGenerals.length === 0 && <div className="col-span-3 text-center text-stone-500">No generals found.</div>}
                    {playerGenerals.sort((a,b) => b.war - a.war).map(g => (
                        <div 
                            key={g.id} 
                            onClick={() => setSelectedGeneralForDetail(g)}
                            className="bg-[#2c2722] border border-[#5d4037] rounded flex items-center p-3 cursor-pointer hover:bg-[#3e3832] hover:border-yellow-600 transition-colors"
                        >
                            <div className="w-14 h-14 bg-stone-800 rounded-full border-2 border-stone-500 overflow-hidden mr-4 shrink-0">
                                <img src={g.portraitUrl} className="w-full h-full object-cover"/>
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-yellow-500">{g.name}</div>
                                <div className="flex gap-3 text-xs text-stone-400 mt-1">
                                    <span title="War"><span className="text-red-400">WAR</span> {g.war}</span>
                                    <span title="Intel"><span className="text-blue-400">INT</span> {g.intel}</span>
                                    <span title="Politics"><span className="text-green-400">POL</span> {g.pol}</span>
                                </div>
                                <div className="text-[10px] text-stone-500 mt-1 truncate">
                                    Loc: {cities.find(c => c.id === g.locationCityId)?.name || 'Unknown'} | {g.state}
                                </div>
                            </div>
                            {g.items.length > 0 && <Sword size={14} className="text-yellow-600"/>}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {selectedGeneralForDetail && (
          <GeneralDetailModal 
            general={selectedGeneralForDetail} 
            onClose={() => setSelectedGeneralForDetail(null)} 
          />
      )}
    </div>
  );
};

export default StatsModal;