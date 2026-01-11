
import React from 'react';
import { AgentAuthority } from '../../types';

interface CreationAuthorityProps {
  authority: AgentAuthority;
  onChange: (key: keyof AgentAuthority, val: number) => void;
}

const CreationAuthority: React.FC<CreationAuthorityProps> = ({ authority, onChange }) => {
  return (
    <div className="bg-zinc-950 border border-white/5 p-8 rounded-[3rem] space-y-6 shadow-2xl relative">
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Agent Authority Sliders</label>
        <span className="text-[8px] font-black text-zinc-600 uppercase">Priority Control</span>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] mono font-bold text-amber-400"><span>Lighting Architect</span> <span>{authority.lighting}%</span></div>
          <input type="range" min="0" max="100" value={authority.lighting} onChange={(e) => onChange('lighting', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-amber-500" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] mono font-bold text-emerald-400"><span>Texture Master</span> <span>{authority.texture}%</span></div>
          <input type="range" min="0" max="100" value={authority.texture} onChange={(e) => onChange('texture', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-emerald-500" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] mono font-bold text-pink-400"><span>Anatomy Specialist</span> <span>{authority.anatomy}%</span></div>
          <input type="range" min="0" max="100" value={authority.anatomy} onChange={(e) => onChange('anatomy', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-pink-500" />
        </div>
      </div>
    </div>
  );
};

export default CreationAuthority;
