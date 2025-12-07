import React from 'react';
import { General, Trait, Item } from '../types';
import { X, Sword, Brain, Scroll, Crown, Shield, Star, Zap } from 'lucide-react';

interface GeneralDetailModalProps {
    general: General;
    onClose: () => void;
}

const GeneralDetailModal: React.FC<GeneralDetailModalProps> = ({ general, onClose }) => {
    
    // Calculate totals including items
    const bonus = general.items.reduce((acc, item) => ({
        war: acc.war + (item.stats.war || 0),
        intel: acc.intel + (item.stats.intel || 0),
        pol: acc.pol + (item.stats.pol || 0),
        chr: acc.chr + (item.stats.chr || 0)
    }), { war: 0, intel: 0, pol: 0, chr: 0 });

    const totalWar = general.war + bonus.war;
    const totalIntel = general.intel + bonus.intel;
    const totalPol = general.pol + bonus.pol;
    const totalChr = general.chr + bonus.chr;

    const renderStatBar = (label: string, val: number, max: number, bonusVal: number, color: string, Icon: any) => {
        const percent = Math.min(100, (val / 120) * 100); // 120 as visual soft cap
        return (
            <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-stone-400 text-sm flex items-center gap-2"><Icon size={14}/> {label}</span>
                    <div className="flex items-center">
                        <span className={`text-xl font-bold ${color}`}>{val}</span>
                        {bonusVal > 0 && <span className="text-xs text-green-400 ml-1">(+{bonusVal})</span>}
                    </div>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${color.replace('text-', 'bg-')}`} style={{ width: `${percent}%` }}></div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1714] border-2 border-[#8d6e63] w-full max-w-4xl h-[85vh] flex flex-col md:flex-row shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden rounded-lg">
                <button onClick={onClose} className="absolute top-4 right-4 z-50 text-stone-400 hover:text-white bg-black/50 rounded-full p-2">
                    <X size={24}/>
                </button>

                {/* Left: Portrait & Core Info */}
                <div className="w-full md:w-1/3 bg-[#231f1b] border-r border-[#5d4037] flex flex-col p-6 items-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#231f1b] via-[#231f1b] to-black/80 pointer-events-none"></div>
                    <div className="relative z-10 w-full flex flex-col items-center h-full">
                        <div className="w-48 h-48 border-4 border-[#8d6e63] shadow-2xl rounded-lg overflow-hidden mb-6 bg-stone-800">
                            <img src={general.portraitUrl} alt={general.name} className="w-full h-full object-cover"/>
                        </div>
                        
                        <h2 className="text-3xl font-title text-yellow-500 text-center mb-2">{general.name}</h2>
                        <div className={`px-3 py-1 rounded border ${general.loyalty > 80 ? 'border-green-800 bg-green-900/20 text-green-400' : 'border-red-800 bg-red-900/20 text-red-400'} text-xs font-bold mb-6`}>
                            Loyalty: {general.loyalty}
                        </div>

                        <div className="w-full bg-[#2c2722] p-4 rounded border border-[#3e3832] mb-auto">
                            <h3 className="text-stone-500 text-xs uppercase tracking-widest mb-2 border-b border-[#3e3832] pb-1">Biography</h3>
                            <p className="text-stone-300 text-sm italic font-serif leading-relaxed">
                                {general.bio || "A capable officer serving in the chaotic times of the Three Kingdoms. Their history is yet to be written in blood and ink."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Stats & Details */}
                <div className="flex-1 bg-[#1a1714] p-8 overflow-y-auto custom-scrollbar">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            {renderStatBar("War", totalWar, 100, bonus.war, "text-red-500", Sword)}
                            {renderStatBar("Intel", totalIntel, 100, bonus.intel, "text-blue-400", Brain)}
                        </div>
                        <div>
                            {renderStatBar("Politics", totalPol, 100, bonus.pol, "text-green-500", Scroll)}
                            {renderStatBar("Charisma", totalChr, 100, bonus.chr, "text-purple-400", Crown)}
                        </div>
                    </div>

                    {/* Traits Section */}
                    <div className="mb-8">
                        <h3 className="text-xl font-title text-stone-300 mb-4 flex items-center gap-2">
                            <Star size={20} className="text-yellow-600"/> Traits
                        </h3>
                        {general.traits.length === 0 ? (
                            <p className="text-stone-600 italic">No special traits.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {general.traits.map((trait, idx) => (
                                    <div key={idx} className="bg-[#2c2722] border border-[#3e3832] p-3 rounded flex items-start gap-3 group hover:border-stone-500 transition-colors">
                                        <div className={`mt-1 ${trait.color}`}><Zap size={16}/></div>
                                        <div>
                                            <div className={`font-bold text-sm ${trait.color}`}>{trait.name}</div>
                                            <div className="text-xs text-stone-400">{trait.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Equipment Section */}
                    <div>
                        <h3 className="text-xl font-title text-stone-300 mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-stone-400"/> Equipment
                        </h3>
                        {general.items.length === 0 ? (
                            <div className="text-stone-600 italic border border-dashed border-stone-800 p-4 rounded text-center">
                                No equipment equipped.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {general.items.map((item, idx) => (
                                    <div key={idx} className="bg-[#2c2722] border border-[#5d4037] p-3 rounded flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-black/40 rounded flex items-center justify-center border border-stone-700">
                                                {item.type === 'Weapon' ? <Sword size={16} className="text-stone-400"/> : 
                                                 item.type === 'Mount' ? <span className="text-xs">🐎</span> : 
                                                 item.type === 'Manual' ? <Scroll size={16} className="text-stone-400"/> : <Star size={16} className="text-stone-400"/>}
                                            </div>
                                            <div>
                                                <div className="text-yellow-500 font-bold">{item.name}</div>
                                                <div className="text-xs text-stone-500">{item.description}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-green-400 font-mono">
                                            {item.stats.war && <div>WAR +{item.stats.war}</div>}
                                            {item.stats.intel && <div>INT +{item.stats.intel}</div>}
                                            {item.stats.pol && <div>POL +{item.stats.pol}</div>}
                                            {item.stats.chr && <div>CHR +{item.stats.chr}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GeneralDetailModal;