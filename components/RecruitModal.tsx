import React, { useState } from 'react';
import { General } from '../types';
import { MessageCircle, X, Shield, Star } from 'lucide-react';

interface RecruitModalProps {
    recruiter: General;
    prisoner: General;
    onConfirm: () => void;
    onCancel: () => void;
}

const RecruitModal: React.FC<RecruitModalProps> = ({ recruiter, prisoner, onConfirm, onCancel }) => {
    const [step, setStep] = useState(0);
    
    const successChance = Math.min(100, Math.max(0, recruiter.chr - prisoner.loyalty + 20));

    // Simple dialog logic
    const dialogs = [
        {
            speaker: recruiter,
            text: `Join us, ${prisoner.name}. Your talents are wasted in a losing cause.`,
        },
        {
            speaker: prisoner,
            text: prisoner.loyalty > 60 
                ? "I swore an oath of loyalty. Do you take me for a traitor?" 
                : "The situation is indeed dire... perhaps it is time to reconsider my path.",
        },
        {
            speaker: recruiter,
            text: `The world is changing. With your help, we can bring order to this chaos. What say you?`,
        }
    ];

    const isFinished = step >= dialogs.length;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1714] border-2 border-yellow-700 w-full max-w-2xl rounded shadow-2xl relative flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="p-4 bg-[#231f1b] border-b border-[#5d4037] flex justify-between items-center">
                    <h2 className="text-xl font-title text-yellow-500 flex items-center gap-2">
                        <MessageCircle size={20}/> Persuasion
                    </h2>
                    <button onClick={onCancel} className="text-stone-500 hover:text-white"><X size={20}/></button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center">
                    
                    {/* Portraits */}
                    <div className="flex justify-between w-full mb-8 px-4">
                        <div className="flex flex-col items-center">
                             <div className="w-24 h-24 border-2 border-blue-500 rounded bg-stone-800 mb-2">
                                <img src={recruiter.portraitUrl} className="w-full h-full object-cover"/>
                             </div>
                             <div className="text-blue-400 font-bold">{recruiter.name}</div>
                             <div className="text-xs text-stone-500">CHR: {recruiter.chr}</div>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center">
                             <div className="text-stone-500 text-sm mb-1">Success Chance</div>
                             <div className={`text-3xl font-bold ${successChance > 60 ? 'text-green-500' : successChance > 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                                 {successChance}%
                             </div>
                        </div>

                        <div className="flex flex-col items-center">
                             <div className="w-24 h-24 border-2 border-red-500 rounded bg-stone-800 mb-2">
                                <img src={prisoner.portraitUrl} className="w-full h-full object-cover grayscale brightness-75"/>
                             </div>
                             <div className="text-red-400 font-bold">{prisoner.name}</div>
                             <div className="text-xs text-stone-500">Loyalty: {prisoner.loyalty}</div>
                        </div>
                    </div>

                    {/* Dialog Box */}
                    <div className="w-full bg-[#2c2722] border border-[#5d4037] p-6 rounded min-h-[120px] mb-6 relative">
                        {!isFinished ? (
                            <div className="animate-fade-in">
                                <div className="text-yellow-600 text-sm font-bold mb-2 uppercase tracking-widest">
                                    {dialogs[step].speaker.name}
                                </div>
                                <p className="text-stone-300 font-serif text-lg leading-relaxed">"{dialogs[step].text}"</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-stone-300 mb-4">The conversation has ended. Make your offer.</p>
                            </div>
                        )}
                        
                        {/* Next Arrow */}
                        {!isFinished && (
                            <div className="absolute bottom-2 right-4 text-stone-500 text-xs animate-bounce cursor-pointer" onClick={() => setStep(step + 1)}>
                                Click to continue ▼
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="w-full flex gap-4">
                        {!isFinished ? (
                             <button 
                                onClick={() => setStep(step + 1)}
                                className="w-full py-3 bg-stone-700 hover:bg-stone-600 text-white rounded border border-stone-500"
                            >
                                Continue
                            </button>
                        ) : (
                            <div className="flex w-full gap-4">
                                <button 
                                    onClick={onCancel}
                                    className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded border border-stone-600"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={onConfirm}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold rounded border border-blue-500 shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Star size={18} className="text-yellow-400 fill-current"/> Attempt Recruitment
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RecruitModal;