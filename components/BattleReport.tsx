import React from 'react';
import { BattleResult } from '../types';
import { Skull, Shield, Sword, Flag } from 'lucide-react';

interface BattleReportProps {
    results: BattleResult[];
    onClose: () => void;
}

const BattleReport: React.FC<BattleReportProps> = ({ results, onClose }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1a1714] border-2 border-red-900 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(220,38,38,0.3)] relative">
                <div className="p-6 border-b border-red-900 bg-red-950/30 flex justify-between items-center">
                    <h2 className="text-3xl font-title text-red-500 tracking-widest flex items-center">
                        <Skull size={32} className="mr-3"/> BATTLE REPORT
                    </h2>
                    <button onClick={onClose} className="text-stone-500 hover:text-white">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {results.map((result) => (
                        <div key={result.id} className="bg-[#2a2622] border border-[#5d4037] p-6 rounded relative overflow-hidden">
                            {/* Header */}
                            <div className="flex justify-between items-end mb-4 border-b border-[#3e3832] pb-2 relative z-10">
                                <div className="text-xl font-bold text-stone-200">{result.locationName}</div>
                                <div className={`text-2xl font-title font-bold ${result.winner === 'attacker' ? 'text-green-500' : 'text-red-500'}`}>
                                    {result.winner === 'attacker' ? 'VICTORY' : 'DEFEAT'}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 relative z-10">
                                {/* Attacker Side */}
                                <div className="text-center">
                                    <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Attacker</div>
                                    <div className="text-lg font-bold text-red-400 mb-2">{result.attackerName}</div>
                                    <div className="flex justify-center items-center gap-2 bg-black/30 p-2 rounded">
                                        <Skull size={16} className="text-stone-500"/>
                                        <span className="text-red-300">-{result.attackerTroopsLost} Troops</span>
                                    </div>
                                </div>

                                {/* Defender Side */}
                                <div className="text-center">
                                    <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Defender</div>
                                    <div className="text-lg font-bold text-blue-400 mb-2">{result.defenderName}</div>
                                    <div className="flex flex-col gap-2">
                                         <div className="flex justify-center items-center gap-2 bg-black/30 p-2 rounded">
                                            <Skull size={16} className="text-stone-500"/>
                                            <span className="text-red-300">-{result.defenderTroopsLost} Troops</span>
                                        </div>
                                        <div className="flex justify-center items-center gap-2 bg-black/30 p-2 rounded">
                                            <Shield size={16} className="text-stone-500"/>
                                            <span className="text-stone-300">-{result.defenseDamage} Defense</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Result Summary */}
                            <div className="mt-6 pt-4 border-t border-[#3e3832] text-center relative z-10">
                                {result.captured ? (
                                    <div className="text-yellow-500 font-bold flex items-center justify-center animate-pulse">
                                        <Flag size={20} className="mr-2"/>
                                        CITY CAPTURED!
                                    </div>
                                ) : (
                                    <div className="text-stone-400 italic">
                                        The defenders held their ground.
                                    </div>
                                )}
                            </div>

                            {/* Background decoration */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-r from-red-900/0 via-red-900/40 to-red-900/0"></div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-[#231f1b] border-t border-red-900 text-center">
                    <button 
                        onClick={onClose}
                        className="bg-red-800 hover:bg-red-700 text-white px-8 py-3 rounded uppercase font-bold tracking-widest"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BattleReport;