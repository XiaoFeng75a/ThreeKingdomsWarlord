import React, { useState, useEffect } from 'react';
import { Faction, FactionColor } from '../types';
import { Shield, Sword, Crown, Map, Volume2, VolumeX } from 'lucide-react';

interface MainMenuProps {
  factions: Faction[];
  onStartGame: (factionId: string) => void;
}

// Placeholder images for the gallery. You can replace these with your own URLs.
const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1516546453174-5e1098a4b4af?q=80&w=2232&auto=format&fit=crop", // Mountains
  "https://images.unsplash.com/photo-1533157787106-913a36d877b1?q=80&w=2070&auto=format&fit=crop", // Ancient Landscape
  "https://images.unsplash.com/photo-1461301214746-1e790926d323?q=80&w=2000&auto=format&fit=crop", // Old Paper/Texture vibe
  "https://images.unsplash.com/photo-1599707367072-cd6ad66aa186?q=80&w=2000&auto=format&fit=crop"  // Red/Gold aesthetic
];

const MainMenu: React.FC<MainMenuProps> = ({ factions, onStartGame }) => {
  const [view, setView] = useState<'home' | 'select'>('home');
  const [selectedFactionId, setSelectedFactionId] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const selectedFaction = factions.find(f => f.id === selectedFactionId);

  // Background Carousel Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 8000); // Change image every 8 seconds
    return () => clearInterval(interval);
  }, []);

  if (view === 'home') {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-[#1a1714] text-[#d6cbb6] relative overflow-hidden">
        
        {/* Background Gallery */}
        {BACKGROUND_IMAGES.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[3000ms] ease-in-out ${index === bgIndex ? 'opacity-40' : 'opacity-0'}`}
            style={{ backgroundImage: `url("${img}")` }}
          />
        ))}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1714] via-[#1a1714]/60 to-[#1a1714]/40"></div>

        {/* Music Embed (Hidden) - 16Bit Dawn of Heroes */}
        {!isMuted && (
            <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
                 <iframe 
                    width="1" 
                    height="1" 
                    src="https://www.youtube.com/embed/nboZWYvPXaM?autoplay=1&loop=1&playlist=nboZWYvPXaM&controls=0&showinfo=0" 
                    title="BGM" 
                    frameBorder="0" 
                    allow="autoplay; encrypted-media" 
                    allowFullScreen
                ></iframe>
            </div>
        )}

        {/* Music Toggle */}
        <button 
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-4 right-4 z-50 text-stone-400 hover:text-white p-2 bg-black/30 rounded-full"
        >
            {isMuted ? <VolumeX size={24}/> : <Volume2 size={24}/>}
        </button>

        <div className="z-10 text-center p-8 max-w-4xl animate-fade-in-up">
          <div className="relative inline-block">
             <Crown size={80} className="mx-auto mb-6 text-yellow-600 animate-pulse drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          </div>
          <h1 className="text-5xl md:text-8xl font-title text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-700 mb-4 tracking-widest drop-shadow-lg filter">
            THREE KINGDOMS
          </h1>
          <h2 className="text-2xl md:text-3xl font-serif text-stone-300 mb-12 tracking-[0.5em] border-t border-b border-stone-600 py-4 inline-block">
            DAWN OF HEROES
          </h2>
          
          <button 
            onClick={() => setView('select')}
            className="group relative px-16 py-5 bg-[#3e3832] hover:bg-[#5d4037] border-2 border-[#8d6e63] text-2xl font-bold uppercase tracking-[0.2em] transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-4 text-yellow-100 group-hover:text-white">
              <Sword size={28} className="group-hover:rotate-45 transition-transform duration-300" />
              START GAME
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/0 via-red-900/40 to-red-900/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
          
          <p className="mt-12 text-stone-500 text-sm italic font-serif">
            "The empire, long divided, must unite; long united, must divide."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#1a1714] text-[#d6cbb6] overflow-hidden">
       {/* Music Embed (Hidden) - Persist music across views if not muted */}
       {!isMuted && (
            <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
                 <iframe 
                    width="1" 
                    height="1" 
                    src="https://www.youtube.com/embed/nboZWYvPXaM?autoplay=1&loop=1&playlist=nboZWYvPXaM&controls=0&showinfo=0" 
                    title="BGM" 
                    frameBorder="0" 
                    allow="autoplay; encrypted-media" 
                    allowFullScreen
                ></iframe>
            </div>
        )}

      {/* Left List */}
      <div className="w-1/3 border-r border-[#5d4037] flex flex-col bg-[#231f1b] z-20 shadow-2xl">
        <div className="p-6 border-b border-[#5d4037] bg-[#2a2622]">
           <button onClick={() => setView('home')} className="text-xs uppercase tracking-widest text-stone-500 hover:text-white mb-4 flex items-center gap-1 transition-colors">
             <span>←</span> Back
           </button>
           <h2 className="text-2xl font-title text-yellow-600">Select Faction</h2>
           <p className="text-stone-400 text-sm">Choose your destiny</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {factions.map(faction => (
            <button
              key={faction.id}
              onClick={() => setSelectedFactionId(faction.id)}
              className={`w-full text-left p-4 border-b border-[#3e3832] transition-all flex items-center gap-4 ${selectedFactionId === faction.id ? 'bg-[#3e3832] border-l-4 border-l-yellow-600 pl-6' : 'hover:bg-[#2c2722] border-l-4 border-l-transparent'}`}
            >
              <div className={`w-12 h-12 rounded flex items-center justify-center text-white font-bold shadow-md ${faction.color}`}>
                {faction.leaderName[0]}
              </div>
              <div>
                <div className="font-bold text-lg">{faction.leaderName}</div>
                <div className="text-xs text-stone-500">{faction.name}</div>
              </div>
              {faction.id === selectedFactionId && <Sword size={16} className="ml-auto text-yellow-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Right Details */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1a1714] relative overflow-hidden">
        {/* Reuse background effect lightly here */}
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
            style={{ backgroundImage: `url("${BACKGROUND_IMAGES[bgIndex]}")` }}
        />
        
        {selectedFaction ? (
          <div className="max-w-2xl w-full text-center z-10 animate-fade-in">
             <div className={`w-32 h-32 mx-auto rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] border-4 border-[#8d6e63] flex items-center justify-center text-5xl text-white font-title mb-6 ${selectedFaction.color} transform transition-transform hover:scale-105`}>
                {selectedFaction.leaderName[0]}
             </div>
             
             <h2 className="text-6xl font-title text-yellow-600 mb-2 drop-shadow-md">{selectedFaction.leaderName}</h2>
             <div className="text-xl text-stone-400 mb-8 font-serif tracking-wide">{selectedFaction.name}</div>
             
             <div className="bg-[#2c2722]/90 backdrop-blur-sm border border-[#5d4037] p-8 rounded-lg shadow-2xl mb-8 relative">
                <p className="text-xl italic text-stone-300 leading-relaxed font-serif">"{selectedFaction.description}"</p>
                
                <div className="grid grid-cols-3 gap-8 mt-8 pt-6 border-t border-[#3e3832]">
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-stone-500 uppercase tracking-widest mb-1">Difficulty</span>
                        <span className={`text-lg font-bold ${selectedFaction.difficulty === 'Easy' ? 'text-green-500' : selectedFaction.difficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                            {selectedFaction.difficulty || 'Normal'}
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-stone-500 uppercase tracking-widest mb-1">Starting Gold</span>
                        <span className="text-lg font-bold text-yellow-500">{selectedFaction.gold}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-stone-500 uppercase tracking-widest mb-1">Influence</span>
                        <span className="text-lg font-bold text-purple-400">{selectedFaction.influence}</span>
                    </div>
                </div>
             </div>

             <button 
               onClick={() => onStartGame(selectedFaction.id)}
               className="bg-gradient-to-b from-yellow-700 to-yellow-800 hover:from-yellow-600 hover:to-yellow-700 text-yellow-100 px-16 py-4 rounded-sm text-xl font-bold uppercase tracking-widest shadow-lg border border-yellow-500 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
             >
               Start Campaign
             </button>
          </div>
        ) : (
          <div className="text-stone-600 text-center z-10">
            <Map size={80} className="mx-auto mb-4 opacity-30"/>
            <p className="text-2xl font-serif opacity-50">Select a warlord to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenu;