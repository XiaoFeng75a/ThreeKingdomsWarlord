import React from 'react';
import { HistoricalEvent } from '../types';

interface EventModalProps {
    event: HistoricalEvent;
    onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 animate-fade-in backdrop-blur-sm">
            <div className="max-w-3xl w-full bg-[#1a1714] border-4 border-yellow-700 shadow-[0_0_60px_rgba(234,179,8,0.3)] relative flex flex-col items-center text-center overflow-hidden">
                {/* Image Header */}
                <div className="w-full h-64 relative">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1714] to-transparent"></div>
                    <div className="absolute bottom-4 left-0 right-0">
                         <h2 className="text-4xl font-title text-yellow-500 tracking-widest drop-shadow-lg uppercase">{event.title}</h2>
                         <div className="text-stone-400 font-serif italic">Year {event.year} AD</div>
                    </div>
                </div>

                <div className="p-8">
                    <p className="text-xl text-stone-300 font-serif leading-relaxed mb-8">
                        {event.description}
                    </p>
                    
                    {event.effects && (
                        <div className="bg-[#2c2722] p-4 border border-[#5d4037] mb-8 inline-block text-left">
                            <h4 className="text-stone-500 text-xs uppercase tracking-widest mb-2 border-b border-[#5d4037] pb-1">Consequences</h4>
                            <ul className="text-sm space-y-1">
                                {event.effects.breakAlliance && <li className="text-red-400">► Alliance Broken</li>}
                                {event.effects.declareWar && <li className="text-red-500 font-bold">► War Declared</li>}
                            </ul>
                        </div>
                    )}

                    <button 
                        onClick={onClose}
                        className="bg-yellow-800 hover:bg-yellow-700 text-yellow-100 px-10 py-3 rounded border border-yellow-600 font-bold tracking-widest transition-all hover:scale-105"
                    >
                        CONTINUE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;