
import React from 'react';
import { VaultItem, VaultDomain } from '../../types';

interface VaultNodeItemProps {
  item: VaultItem;
  isExpanded: boolean;
  onToggleExpand: (id: string | null) => void;
  onToggleFavorite: (id: string) => void;
  onReload: (item: VaultItem) => void;
  onDelete: (id: string) => void;
  getDNAColor: (domain?: VaultDomain) => string;
}

const VaultNodeItem: React.FC<VaultNodeItemProps> = ({ 
  item, isExpanded, onToggleExpand, onToggleFavorite, onReload, onDelete, getDNAColor 
}) => {
  return (
    <div className={`group bg-zinc-900/20 border rounded-[3rem] overflow-hidden flex flex-col transition-all duration-700 shadow-2xl relative ${item.isFavorite ? 'border-amber-500/50 ring-2 ring-amber-500/10' : 'border-white/5 hover:border-indigo-500/40'} ${isExpanded ? 'col-span-1 md:col-span-2 ring-1 ring-indigo-500/30' : ''}`}>
      <div className="relative aspect-square overflow-hidden bg-black">
        <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" alt="Node" />
        
        <div className="absolute top-5 right-5 flex gap-2 z-30">
          <button 
            onClick={() => onToggleExpand(isExpanded ? null : item.id)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all ${isExpanded ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'bg-black/40 text-white/50 hover:text-white'}`}
            title={isExpanded ? "Collapse" : "Inspect DNA"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isExpanded ? (
                <path d="M19 13l-7 7-7-7m14-8l-7 7-7-7" strokeWidth={2.5}/>
              ) : (
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2.5}/>
              )}
            </svg>
          </button>
          <button 
            onClick={() => onToggleFavorite(item.id)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all ${item.isFavorite ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110' : 'bg-black/40 text-white/50 hover:text-white'}`}
          >
            <svg className="w-4 h-4" fill={item.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.364-1.364a4.5 4.5 0 00-6.364 0z" strokeWidth={2.5}/></svg>
          </button>
        </div>

        {!isExpanded && (
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 p-8">
            <button onClick={() => onReload(item)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95">Reload Buffer</button>
            <button onClick={() => onDelete(item.id)} className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Purge Node</button>
          </div>
        )}
        
        <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
           <div className="flex flex-col">
              <span className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-t-lg text-[12px] mono font-black text-white border-x border-t border-white/10">
                  {item.shortId}
              </span>
              <span className={`px-3 py-1 rounded-b-lg text-[10px] mono font-black shadow-xl border-x border-b text-white ${getDNAColor(item.vaultDomain)}`}>
                  VAULT {item.vaultDomain}
              </span>
           </div>
        </div>
      </div>
      
      {!isExpanded && (
        <div className="p-8 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[8px] mono text-zinc-600 font-black uppercase">Neural Rank</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${item.isFavorite ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${item.neuralPreferenceScore}%` }} />
                  </div>
                  <span className={`text-[10px] mono font-bold ${item.isFavorite ? 'text-amber-400' : 'text-indigo-400'}`}>{item.neuralPreferenceScore}</span>
                </div>
            </div>
            <div className="text-right">
                <span className="text-[8px] mono text-zinc-600 font-black uppercase">Uses</span>
                <p className="text-[10px] mono text-zinc-400 font-bold">{item.usageCount}</p>
            </div>
          </div>
          <div className="min-h-[40px] pt-2 border-t border-white/5">
            <p className="text-[11px] text-zinc-400 line-clamp-2 italic leading-relaxed">"{item.prompt}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultNodeItem;
