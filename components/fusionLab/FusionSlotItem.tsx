
import React from 'react';
import { VaultItem } from '../../types';

interface FusionSlotItemProps {
  label: string;
  color: string;
  currentId: string;
  vault: VaultItem[];
  onSelect: (id: string) => void;
  isOptimizing: boolean;
}

const FusionSlotItem: React.FC<FusionSlotItemProps> = ({ label, color, currentId, vault, onSelect, isOptimizing }) => {
  const selectedItem = vault.find(v => v.shortId === currentId);
  
  return (
    <div className={`bg-zinc-950/40 border-2 rounded-[2.5rem] p-6 transition-all duration-700 relative overflow-hidden group ${selectedItem ? 'border-indigo-500/30 ring-1 ring-indigo-500/20' : 'border-white/5 hover:border-white/10'}`}>
      <div className="flex justify-between items-center mb-5">
        <div className="flex flex-col">
          <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${color}`}>{label}</span>
        </div>
        {selectedItem && (
           <button onClick={() => onSelect('')} className="text-zinc-600 hover:text-white p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
           </button>
        )}
      </div>
      
      <div className="relative aspect-square rounded-[2rem] bg-black/60 overflow-hidden border border-white/5 mb-6 group-hover:scale-[1.02] transition-transform">
        {selectedItem ? (
          <>
            <img src={selectedItem.imageUrl} className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700" alt="Preview" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
               <span className="text-[8px] mono text-indigo-400 font-bold">R:{selectedItem.neuralPreferenceScore || 0}</span>
               {selectedItem.usageCount >= 10 && <span className="text-[10px]">⭐</span>}
            </div>

            <div className="absolute bottom-4 left-4 right-4 space-y-2">
               <div className="flex gap-1">
                  <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-500" style={{ width: `${(selectedItem.neuralPreferenceScore || 0)}%` }} />
                  </div>
               </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-10">
             <svg className={`w-10 h-10 mb-2 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={2}/></svg>
             <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Component</span>
          </div>
        )}
      </div>

      <select 
        value={currentId} 
        onChange={(e) => onSelect(e.target.value)}
        disabled={isOptimizing}
        className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl p-4 text-[11px] text-zinc-400 font-bold outline-none hover:border-indigo-500/20 transition-all appearance-none text-center"
      >
        <option value="">Neural Select...</option>
        {vault
          .sort((a, b) => (b.neuralPreferenceScore || 0) - (a.neuralPreferenceScore || 0))
          .map(v => (
          <option key={v.id} value={v.shortId}>
            {v.neuralPreferenceScore >= 80 ? '⭐ ' : ''}{v.shortId} (Score: {v.neuralPreferenceScore || 0})
          </option>
        ))}
      </select>
    </div>
  );
};

export default FusionSlotItem;
