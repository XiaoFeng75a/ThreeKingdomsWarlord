import React, { useState, useEffect, useRef } from 'react';
import { General } from '../types';
import { Sword, Shield, Zap } from 'lucide-react';

interface DuelModalProps {
  attacker: General;
  defender: General;
  onComplete: (winnerId: string) => void;
}

const DuelModal: React.FC<DuelModalProps> = ({ attacker, defender, onComplete }) => {
  const [attackerHp, setAttackerHp] = useState(attacker.war * 10);
  const [defenderHp, setDefenderHp] = useState(defender.war * 10);
  const maxAttackerHp = attacker.war * 10;
  const maxDefenderHp = defender.war * 10;
  
  const [combatLog, setCombatLog] = useState<string[]>(["Duel Started!"]);
  const [lastHit, setLastHit] = useState<'attacker' | 'defender' | null>(null);

  const defenderInterval = useRef<number>(0);

  // AI Logic
  useEffect(() => {
    // Enemy attacks periodically based on War stat (higher war = faster attacks)
    // Base 1000ms, minus (War * 5). Min 300ms.
    const speed = Math.max(300, 1000 - (defender.war * 5));
    
    defenderInterval.current = window.setInterval(() => {
      const dmg = Math.floor((defender.war / 8) + Math.random() * 5);
      setAttackerHp(prev => Math.max(0, prev - dmg));
      setLastHit('defender');
      addLog(`${defender.name} strikes for ${dmg} dmg!`);
    }, speed);

    return () => clearInterval(defenderInterval.current);
  }, [defender.war, defender.name]);

  useEffect(() => {
      if (attackerHp <= 0) {
          clearInterval(defenderInterval.current);
          setTimeout(() => onComplete(defender.id), 1000);
      }
      if (defenderHp <= 0) {
          clearInterval(defenderInterval.current);
          setTimeout(() => onComplete(attacker.id), 1000);
      }
  }, [attackerHp, defenderHp, onComplete, attacker.id, defender.id]);

  const addLog = (msg: string) => {
      setCombatLog(prev => [msg, ...prev].slice(0, 3));
  };

  const handlePlayerAttack = () => {
      if (attackerHp <= 0 || defenderHp <= 0) return;
      const crit = Math.random() > 0.8;
      const baseDmg = Math.floor((attacker.war / 8) + Math.random() * 5);
      const finalDmg = crit ? baseDmg * 2 : baseDmg;
      
      setDefenderHp(prev => Math.max(0, prev - finalDmg));
      setLastHit('attacker');
      addLog(`${attacker.name} ${crit ? 'CRITS' : 'hits'} for ${finalDmg}!`);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="w-full max-w-4xl h-[600px] bg-[#1a1714] border-4 border-yellow-700 relative flex flex-col overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)]">
            {/* Background */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
            
            {/* Header */}
            <div className="relative z-10 flex justify-center py-4 bg-gradient-to-b from-black/80 to-transparent">
                <h2 className="text-4xl font-title text-yellow-500 drop-shadow-md tracking-widest">GENERAL DUEL</h2>
            </div>

            {/* Battle Area */}
            <div className="flex-1 flex justify-between items-center px-8 md:px-16 relative z-10">
                
                {/* Attacker (Player) */}
                <div className="flex flex-col items-center w-64">
                    <div className={`relative transition-transform duration-100 ${lastHit === 'defender' ? 'translate-x-[-10px] text-red-500' : ''}`}>
                         <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-blue-500 rounded-full overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.5)] bg-stone-800">
                             <img src={attacker.portraitUrl} alt={attacker.name} className="w-full h-full object-cover"/>
                         </div>
                         <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-900 px-4 py-1 rounded border border-blue-500 whitespace-nowrap font-bold text-white">
                             {attacker.name}
                         </div>
                    </div>
                    {/* HP Bar */}
                    <div className="w-full h-4 bg-stone-800 mt-8 rounded border border-stone-600 relative overflow-hidden">
                        <div 
                            className="h-full bg-blue-600 transition-all duration-200"
                            style={{ width: `${(attackerHp / maxAttackerHp) * 100}%` }}
                        ></div>
                    </div>
                    <div className="text-blue-400 font-bold mt-1 text-xl">{attackerHp} / {maxAttackerHp}</div>
                </div>

                {/* VS / Log */}
                <div className="flex flex-col items-center justify-center w-64 h-full">
                     <div className="text-6xl font-title text-red-600 italic font-bold opacity-30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">VS</div>
                     
                     <div className="space-y-1 text-center w-full mb-8">
                         {combatLog.map((log, i) => (
                             <div key={i} className={`text-sm font-bold ${i===0 ? 'text-white scale-110' : 'text-stone-500'}`}>
                                 {log}
                             </div>
                         ))}
                     </div>

                     <button 
                        onClick={handlePlayerAttack}
                        className="w-32 h-32 rounded-full bg-red-700 hover:bg-red-600 border-4 border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.6)] flex flex-col items-center justify-center active:scale-95 transition-all group"
                     >
                         <Sword size={40} className="text-white mb-2 group-hover:rotate-12 transition-transform"/>
                         <span className="font-title font-bold text-xl text-white tracking-widest">ATTACK</span>
                     </button>
                     <p className="text-stone-500 text-xs mt-2">Click rapidly!</p>
                </div>

                {/* Defender (AI) */}
                <div className="flex flex-col items-center w-64">
                    <div className={`relative transition-transform duration-100 ${lastHit === 'attacker' ? 'translate-x-[10px] text-red-500' : ''}`}>
                         <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-red-500 rounded-full overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.5)] bg-stone-800">
                             <img src={defender.portraitUrl} alt={defender.name} className="w-full h-full object-cover"/>
                         </div>
                         <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-red-900 px-4 py-1 rounded border border-red-500 whitespace-nowrap font-bold text-white">
                             {defender.name}
                         </div>
                    </div>
                    {/* HP Bar */}
                    <div className="w-full h-4 bg-stone-800 mt-8 rounded border border-stone-600 relative overflow-hidden">
                        <div 
                            className="h-full bg-red-600 transition-all duration-200"
                            style={{ width: `${(defenderHp / maxDefenderHp) * 100}%` }}
                        ></div>
                    </div>
                    <div className="text-red-400 font-bold mt-1 text-xl">{defenderHp} / {maxDefenderHp}</div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 text-center text-stone-500 text-xs uppercase tracking-widest border-t border-yellow-900/30">
                A duel to the death determines the morale of the army
            </div>
        </div>
    </div>
  );
};

export default DuelModal;