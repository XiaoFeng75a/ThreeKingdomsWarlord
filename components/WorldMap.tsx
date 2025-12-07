import React, { useState, useEffect, useRef } from 'react';
import { City, Faction, FactionColor, SubLocation, SubLocationType, ActiveAttack } from '../types';
import { Crown, Shield, Users, Star, Home, Castle, Mountain, Tent, Swords } from 'lucide-react';

interface WorldMapProps {
  cities: City[];
  subLocations?: SubLocation[]; // Optional as it might be added later in state
  factions: Faction[];
  onCityClick: (city: City) => void;
  selectedCityId?: string;
  activeAttacks?: ActiveAttack[];
}

// 2.5D Isometric Han City
const HanCityIcon = ({ color, isCapital }: { color: string, isCapital: boolean }) => (
    <div className={`relative flex items-center justify-center ${isCapital ? 'scale-150' : 'scale-110'}`}>
        <svg width="64" height="64" viewBox="0 0 64 64" className="drop-shadow-2xl overflow-visible">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                    <feOffset dx="1" dy="2" result="offsetblur"/>
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5"/>
                    </feComponentTransfer>
                    <feMerge> 
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                </filter>
            </defs>
            <g filter="url(#shadow)">
                {/* Stone Base */}
                <path d="M10 42 L32 54 L54 42 L32 30 Z" fill="#57534e" stroke="#292524" strokeWidth="1"/>
                <path d="M10 42 L32 54 L32 60 L10 48 Z" fill="#44403c" stroke="#292524" strokeWidth="1"/>
                <path d="M32 54 L54 42 L54 48 L32 60 Z" fill="#292524" stroke="#292524" strokeWidth="1"/>

                {/* Building Body */}
                <path d="M18 36 L32 44 L46 36 L32 28 Z" fill="#7f1d1d" /> 
                <path d="M18 36 L32 44 L32 50 L18 42 Z" fill="#991b1b" />
                <path d="M32 44 L46 36 L46 42 L32 50 Z" fill="#450a0a" />

                {/* Main Roof */}
                <path d="M8 32 L32 44 L56 32 L32 20 Z" fill={isCapital ? '#eab308' : '#3f6212'} stroke="#1a2e05" strokeWidth="0.5" />
                <path d="M8 32 L32 44 L32 46 L8 34 Z" fill={isCapital ? '#ca8a04' : '#1a2e05'} />
                <path d="M32 44 L56 32 L56 34 L32 46 Z" fill={isCapital ? '#854d0e' : '#14532d'} />

                {/* Second Tier (Capital Only) */}
                {isCapital && (
                    <>
                        {/* Upper Body */}
                        <path d="M22 24 L32 30 L42 24 L32 18 Z" fill="#991b1b" />
                        <path d="M22 24 L32 30 L32 34 L22 28 Z" fill="#7f1d1d" />
                        <path d="M32 30 L42 24 L42 28 L32 34 Z" fill="#450a0a" />
                        
                        {/* Upper Roof */}
                        <path d="M16 20 L32 28 L48 20 L32 12 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="0.5"/>
                        <path d="M16 20 L32 28 L32 30 L16 22 Z" fill="#ca8a04" />
                        <path d="M32 28 L48 20 L48 22 L32 30 Z" fill="#854d0e" />
                        
                        {/* Top Ornament */}
                        <circle cx="32" cy="12" r="2" fill="#ef4444" stroke="#fcd34d" />
                    </>
                )}
                
                {/* Banner Flag */}
                <line x1="50" y1="42" x2="50" y2="15" stroke="#44403c" strokeWidth="1.5" />
                {/* Use currentColor and Tailwind text class to color the flag */}
                <path 
                    d="M50 16 L60 20 L50 24 Z" 
                    className={color.replace('bg-', 'text-')} 
                    fill="currentColor" 
                    stroke="none"
                />
            </g>
        </svg>
    </div>
);

// 2.5D Isometric Nomad Tent
const NomadCityIcon = ({ color, isCapital }: { color: string, isCapital: boolean }) => (
    <div className={`relative flex items-center justify-center ${isCapital ? 'scale-150' : 'scale-110'}`}>
        <svg width="64" height="64" viewBox="0 0 64 64" className="drop-shadow-2xl overflow-visible">
             <defs>
                <filter id="shadowN" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                    <feOffset dx="1" dy="2" result="offsetblur"/>
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5"/>
                    </feComponentTransfer>
                    <feMerge> 
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                </filter>
            </defs>
            <g filter="url(#shadowN)">
                {/* Base Grass/Ground */}
                <ellipse cx="32" cy="48" rx="20" ry="10" fill="#4a5d23" />
                
                {/* Main Tent Cylinder Base */}
                <path d="M16 44 Q 32 54 48 44 L 48 30 Q 32 40 16 30 Z" fill="#e5e5e5" stroke="#78350f" strokeWidth="0.5" />
                
                {/* Roof Cone */}
                <path d="M14 30 L 32 6 L 50 30 Q 32 40 14 30 Z" fill="#f5f5f4" stroke="#78350f" strokeWidth="0.5"/>
                
                {/* Pattern on Roof */}
                <path d="M32 6 L 32 35" stroke={color.replace('bg-', 'text-')} strokeWidth="3" opacity="0.8"/>
                <path d="M18 28 L 32 6 L 46 28" stroke={color.replace('bg-', 'text-')} strokeWidth="2" opacity="0.8"/>

                {/* Doorway */}
                <path d="M28 44 Q 32 46 36 44 L 36 34 Q 32 36 28 34 Z" fill="#1c1917" />
                
                {/* Fence (if Capital) */}
                {isCapital && (
                    <path d="M10 46 L 10 38 M 54 46 L 54 38 M 10 42 Q 32 56 54 42" stroke="#78350f" strokeWidth="2" fill="none" />
                )}
            </g>
        </svg>
    </div>
);

const WorldMap: React.FC<WorldMapProps> = ({ cities, subLocations = [], factions, onCityClick, selectedCityId, activeAttacks = [] }) => {
  // Camera Position (viewport offset)
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  
  // Ref for the animation loop
  const requestRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());
  
  // Constants for map movement
  // INCREASED TO 300% to spread out the city nodes
  const MAP_WIDTH_PERCENT = 300; 
  const MAP_HEIGHT_PERCENT = 300; 
  const MOVE_SPEED = 15;

  const getFactionColor = (factionId: string) => {
    const faction = factions.find(f => f.id === factionId);
    return faction?.color || 'bg-gray-500';
  };
  
  const getFactionCulture = (factionId: string) => {
      const faction = factions.find(f => f.id === factionId);
      return faction?.culture || 'Han';
  };

  // Keyboard Listeners for WASD / Arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        keysPressed.current.add(e.code);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        keysPressed.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Animation Loop for Smooth Movement
  const animate = () => {
    setCamera(prev => {
        let newX = prev.x;
        let newY = prev.y;

        // Check keys
        if (keysPressed.current.has('KeyW') || keysPressed.current.has('ArrowUp')) {
            newY -= MOVE_SPEED;
        }
        if (keysPressed.current.has('KeyS') || keysPressed.current.has('ArrowDown')) {
            newY += MOVE_SPEED;
        }
        if (keysPressed.current.has('KeyA') || keysPressed.current.has('ArrowLeft')) {
            newX -= MOVE_SPEED;
        }
        if (keysPressed.current.has('KeyD') || keysPressed.current.has('ArrowRight')) {
            newX += MOVE_SPEED;
        }

        // Clamp logic
        const maxX = window.innerWidth * 2.5; 
        const maxY = window.innerHeight * 2.5;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        return { x: newX, y: newY };
    });
    
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const renderSubLocationIcon = (type: SubLocationType, culture: 'Han' | 'Nomad') => {
      switch(type) {
          case SubLocationType.VILLAGE: return culture === 'Nomad' ? <Tent size={10} className="text-stone-300" fill="currentColor"/> : <Home size={10} className="text-emerald-800" fill="currentColor"/>;
          case SubLocationType.FORT: return <Castle size={12} className="text-stone-800" fill="currentColor"/>;
          case SubLocationType.PASS: return <Mountain size={12} className="text-stone-600" fill="currentColor"/>;
          default: return <div className="w-2 h-2 bg-stone-500 rounded-full"/>;
      }
  };

  return (
    <div className="relative w-full h-full bg-[#1a1714] overflow-hidden border-4 border-[#5d4037] shadow-2xl select-none">
      {/* 
        Inner Map Container 
      */}
      <div 
        className="absolute top-0 left-0 bg-[#dcc9a6]"
        style={{ 
            width: `${MAP_WIDTH_PERCENT}%`, 
            height: `${MAP_HEIGHT_PERCENT}%`,
            transform: `translate3d(-${camera.x}px, -${camera.y}px, 0)`
        }}
      >
        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
        
        {/* Decorative Grid/Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            {cities.map(city => 
                city.connections.map(targetId => {
                    const target = cities.find(c => c.id === targetId);
                    if (!target) return null;
                    if (city.id > target.id) return null; 
                    return (
                        <line 
                            key={`${city.id}-${target.id}`}
                            x1={`${city.x}%`} y1={`${city.y}%`}
                            x2={`${target.x}%`} y2={`${target.y}%`}
                            stroke="#5d4037"
                            strokeWidth={city.isCapital && target.isCapital ? "4" : "2"}
                            strokeDasharray={city.isCapital && target.isCapital ? "" : "8,8"}
                        />
                    );
                })
            )}
        </svg>

        {/* Attack Markers */}
        {activeAttacks.map(attack => {
            const source = cities.find(c => c.id === attack.sourceCityId);
            const target = cities.find(c => c.id === attack.targetCityId);
            if (!source || !target) return null;

            // Calculate Midpoint
            const mx = (source.x + target.x) / 2;
            const my = (source.y + target.y) / 2;

            // Calculate Angle (Optional, if we want to rotate icon to point to target)
            // atan2 returns radians
            const angle = Math.atan2(target.y - source.y, target.x - source.x) * (180 / Math.PI);

            return (
                <div 
                    key={attack.id}
                    className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-lg"
                    style={{ left: `${mx}%`, top: `${my}%` }}
                >
                    <div 
                        className={`p-2 rounded-full border-2 border-white ${attack.factionColor} animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]`}
                        style={{ transform: `rotate(${angle + 90}deg)` }}
                    >
                        <Swords size={20} className="text-white fill-current"/>
                    </div>
                </div>
            );
        })}
        
        {/* Render Lines from City to SubLocations */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            {subLocations.map(sl => {
                const parent = cities.find(c => c.id === sl.parentCityId);
                if (!parent) return null;
                const targetX = parent.x + sl.offsetX;
                const targetY = parent.y + sl.offsetY;
                return (
                    <line 
                        key={`line-${sl.id}`}
                        x1={`${parent.x}%`} y1={`${parent.y}%`}
                        x2={`${targetX}%`} y2={`${targetY}%`}
                        stroke="#8d6e63"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                    />
                );
            })}
        </svg>

        {/* SubLocations */}
        {subLocations.map(sl => {
            const parent = cities.find(c => c.id === sl.parentCityId);
            if (!parent) return null;
            const x = parent.x + sl.offsetX;
            const y = parent.y + sl.offsetY;
            const culture = getFactionCulture(parent.factionId);
            
            return (
                <div 
                    key={sl.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-0"
                    style={{ left: `${x}%`, top: `${y}%` }}
                >
                     <div className={`p-1 rounded-full ${sl.generalId ? 'bg-blue-400/50 ring-1 ring-blue-500' : 'bg-[#a1887f]/30'}`}>
                         {renderSubLocationIcon(sl.type, culture)}
                     </div>
                     {sl.generalId && <div className="w-2 h-2 bg-blue-500 rounded-full mt-0.5 animate-pulse"></div>}
                </div>
            )
        })}

        {/* Cities */}
        {cities.map((city) => {
            const colorClass = getFactionColor(city.factionId);
            const culture = getFactionCulture(city.factionId);
            const isSelected = selectedCityId === city.id;
            
            // Adjust z-index if capital
            const zIndex = city.isCapital ? 'z-20' : 'z-10';

            return (
            <div
                key={city.id}
                onClick={() => onCityClick(city)}
                className={`absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-transform duration-300 hover:-translate-y-2 ${zIndex}`}
                style={{ left: `${city.x}%`, top: `${city.y}%` }}
            >
                {/* Visual Icon */}
                <div className={`relative ${isSelected ? 'drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]' : ''}`}>
                    {culture === 'Nomad' ? (
                        <NomadCityIcon color={colorClass} isCapital={city.isCapital} />
                    ) : (
                        <HanCityIcon color={colorClass} isCapital={city.isCapital} />
                    )}
                    
                    {/* Capital Star Overlay */}
                    {city.isCapital && (
                         <div className="absolute -top-4 right-0 text-yellow-400 animate-pulse drop-shadow-md">
                             <Star size={24} fill="currentColor"/>
                         </div>
                    )}
                </div>

                {/* City Label */}
                <div className={`mt-0 bg-[#2c2722]/90 backdrop-blur-sm text-[#e5e5e5] ${city.isCapital ? 'text-sm md:text-base px-3 py-1 border-yellow-700' : 'text-[10px] px-2 py-0.5 border-[#8d6e63]'} rounded border font-bold shadow-lg whitespace-nowrap text-center z-30 transform -translate-y-4`}>
                    <div className={city.isCapital ? 'text-yellow-500' : 'text-stone-300'}>{city.name}</div>
                </div>

                {/* Stats Preview (visible on hover) */}
                <div className="absolute top-full mt-0 hidden group-hover:flex bg-black/80 text-white text-xs p-2 rounded gap-3 z-50 pointer-events-none backdrop-blur-md">
                    <div className="flex items-center"><Shield size={12} className="mr-1 text-blue-400"/>{city.defense}</div>
                    <div className="flex items-center"><Users size={12} className="mr-1 text-red-400"/>{city.troops}</div>
                </div>
            </div>
            );
        })}
      </div>
      
      {/* Controls Hint */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded text-xs pointer-events-none backdrop-blur-sm z-40 border border-white/10">
        Use <span className="font-bold text-yellow-400">WASD</span> or <span className="font-bold text-yellow-400">Arrows</span> to Move Map
      </div>
    </div>
  );
};

export default WorldMap;