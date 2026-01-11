
import React from 'react';

interface StudioSidebarHeaderProps {
  onPurge: () => void;
  onZMode: () => void;
  onPose: () => void;
  onLGN: () => void;
  isPoseOpen: boolean;
  hasGrading: boolean;
}

const StudioSidebarHeader: React.FC<StudioSidebarHeaderProps> = ({ 
  onPurge, onZMode, onPose, onLGN, isPoseOpen, hasGrading 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <h2 className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Studio Console</h2>
        <span className="text-[7px] mono text-zinc-800 uppercase font-black">LCP-v12.2 MAD_CORE</span>
      </div>
      <div className="flex gap-1">
        <button 
          onClick={onPurge}
          className="bg-red-600/10 px-2 py-1.5 rounded-lg text-red-500 text-[8px] font-black uppercase border border-red-500/20"
        >
          RESET
        </button>
        <button onClick={onZMode} className="bg-indigo-600/10 px-2 py-1.5 rounded-lg text-indigo-400 text-[8px] font-black uppercase border border-indigo-500/30">Z-MODE</button>
        <button onClick={onPose} className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${isPoseOpen ? 'bg-pink-600 text-white' : 'bg-pink-600/10 text-pink-400 border-pink-500/30'}`}>RIGGING</button>
        <button 
          onClick={onLGN} 
          className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${hasGrading ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'}`}
        >
          LGN
        </button>
      </div>
    </div>
  );
};

export default StudioSidebarHeader;
