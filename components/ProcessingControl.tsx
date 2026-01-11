
import React from 'react';
import { ProcessingSpeed } from '../types';

interface ProcessingControlProps {
  speed: ProcessingSpeed;
  setSpeed: (speed: ProcessingSpeed) => void;
}

const ProcessingControl: React.FC<ProcessingControlProps> = ({ speed, setSpeed }) => {
  const modes: { id: ProcessingSpeed; label: string; desc: string; icon: string; color: string }[] = [
    { id: 'Fast', label: 'Fast', desc: 'Minimal reflection.', icon: '⚡', color: 'text-amber-400' },
    { id: 'Balanced', label: 'Balanced', desc: 'Standard analysis.', icon: '⚖️', color: 'text-indigo-400' },
    { id: 'Deliberate', label: 'Deliberate', desc: 'Deep reflection.', icon: '🎯', color: 'text-emerald-400' },
    { id: 'Debug', label: 'Debug', desc: 'Full telemetry.', icon: '🐛', color: 'text-pink-400' },
  ];

  return (
    <div className="bg-[#111114] border border-white/5 rounded-2xl md:rounded-[2rem] p-3 md:p-6 space-y-3 md:space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[8px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-none">🧠 Pacing Engine</h3>
        <span className="text-[6px] md:text-[8px] mono text-zinc-700 font-bold uppercase tracking-widest">v2.5</span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSpeed(mode.id)}
            className={`flex flex-col gap-1 md:gap-2 p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all text-left group ${
              speed === mode.id 
                ? 'bg-zinc-800/50 border-white/20 shadow-xl' 
                : 'bg-black/20 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm">{mode.icon}</span>
              {speed === mode.id && <div className="w-0.5 h-0.5 bg-white rounded-full animate-pulse" />}
            </div>
            <div className="space-y-0.5">
              <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none ${speed === mode.id ? mode.color : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                {mode.label}
              </p>
              <p className="text-[6px] md:text-[7px] text-zinc-700 font-bold leading-tight uppercase group-hover:text-zinc-500">
                {mode.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-1 flex items-center justify-between">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`h-0.5 rounded-full transition-all duration-500 ${
                i <= (speed === 'Fast' ? 1 : speed === 'Balanced' ? 2 : speed === 'Deliberate' ? 3 : 4)
                  ? 'w-3 bg-indigo-500'
                  : 'w-1.5 bg-zinc-800'
              }`}
            />
          ))}
        </div>
        <span className="text-[6px] md:text-[7px] mono text-zinc-700 uppercase font-black">Reflection: {speed === 'Fast' ? 1 : speed === 'Balanced' ? 3 : speed === 'Deliberate' ? 8 : 16}c</span>
      </div>
    </div>
  );
};

export default ProcessingControl;
