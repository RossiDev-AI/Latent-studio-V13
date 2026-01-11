
import React from 'react';
import { AgentAuthority } from '../../types';

interface StudioAuthorityPanelProps {
  authority: AgentAuthority;
  onChange: (key: keyof AgentAuthority, val: number) => void;
}

const StudioAuthorityPanel: React.FC<StudioAuthorityPanelProps> = ({ authority, onChange }) => {
  const configs = [
    { key: 'lighting' as keyof AgentAuthority, label: 'Lighting Architect', color: 'accent-amber-500' },
    { key: 'texture' as keyof AgentAuthority, label: 'Texture Master', color: 'accent-emerald-500' },
    { key: 'anatomy' as keyof AgentAuthority, label: 'Anatomy Specialist', color: 'accent-pink-500' }
  ];

  return (
    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5 space-y-4">
      <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Agent Authority Weights</span>
      <div className="space-y-4">
          {configs.map(auth => (
            <div key={auth.key} className="space-y-1.5">
              <div className="flex justify-between items-center text-[7px] font-black uppercase">
                  <span className="text-zinc-600">{auth.label}</span>
                  <span className="text-white">{authority[auth.key]}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={authority[auth.key]} 
                onChange={(e) => onChange(auth.key, parseInt(e.target.value))} 
                className={`w-full h-0.5 bg-zinc-800 appearance-none rounded-full cursor-pointer ${auth.color}`} 
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default StudioAuthorityPanel;
