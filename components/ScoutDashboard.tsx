
import React from 'react';
// Updated imports to include ScoutData from types.ts
import { ScoutCandidate, ScoutData } from '../types';

interface ScoutDashboardProps {
  // Switched to using ScoutData type for better structure and fixing member error
  scoutData: ScoutData;
}

const ScoutDashboard: React.FC<ScoutDashboardProps> = ({ scoutData }) => {
  if (!scoutData || !scoutData.candidates) return null;

  return (
    <div className="bg-zinc-950/80 border border-white/10 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-3xl animate-in fade-in zoom-in duration-700 shadow-[0_0_100px_rgba(79,70,229,0.1)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
            <h3 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em]">LCP v2.9.5 Visual Scout Engine</h3>
          </div>
          <p className="text-zinc-500 text-[11px] uppercase tracking-widest max-w-lg leading-relaxed">{scoutData.consensus_report}</p>
        </div>
        
        <div className="flex gap-4">
           <div className="flex flex-col items-end">
              <span className="text-[7px] mono text-zinc-600 font-bold uppercase tracking-widest">Premium Hits</span>
              <span className="text-lg font-black text-white mono">{scoutData.search_stats.premium_hits}</span>
           </div>
           <div className="flex flex-col items-end border-l border-white/10 pl-4">
              <span className="text-[7px] mono text-zinc-600 font-bold uppercase tracking-widest">Internal Sync</span>
              <span className="text-lg font-black text-white mono">{scoutData.search_stats.internal_hits}</span>
           </div>
           <div className="flex flex-col items-end border-l border-white/10 pl-4">
              <span className="text-[7px] mono text-indigo-500 font-bold uppercase tracking-widest">Winner ID</span>
              <span className="text-lg font-black text-indigo-400 mono">{scoutData.winner_id}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scoutData.candidates.map((c) => (
          <div 
            key={c.id} 
            className={`p-6 rounded-[2rem] border transition-all duration-500 flex flex-col gap-5 relative overflow-hidden group ${c.id === scoutData.winner_id ? 'bg-indigo-500/10 border-indigo-500/60 shadow-[0_0_40px_rgba(79,70,229,0.1)] scale-[1.02]' : 'bg-black/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/20'}`}
          >
            {c.id === scoutData.winner_id && (
              <div className="absolute top-0 right-0 p-3 bg-indigo-500 text-black text-[8px] font-black uppercase tracking-[0.2em] rounded-bl-2xl z-10">LCP_WINNER</div>
            )}
            
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-black text-white uppercase truncate pr-4">{c.title}</span>
                <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 mono font-bold uppercase">{c.source_layer}</span>
              </div>
              <div className="flex gap-2">
                 <div className="h-0.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/60" style={{ width: `${c.quality_metrics.technical * 100}%` }} />
                 </div>
                 <div className="h-0.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500/60" style={{ width: `${c.quality_metrics.aesthetic * 100}%` }} />
                 </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
               <div className="flex justify-between items-baseline">
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Specialist Consenus</p>
                  <span className="text-[10px] mono font-bold text-indigo-400">{(c.composite_score * 100).toFixed(1)}%</span>
               </div>
               <div className="space-y-2.5">
                 {c.votes.map((v, i) => (
                   <div key={i} className="flex flex-col gap-1.5 border-l-2 border-white/5 pl-3 group-hover:border-indigo-500/20 transition-colors">
                     <div className="flex justify-between items-center">
                        <span className="text-[7px] font-black text-zinc-300 uppercase tracking-tighter">{v.agent}</span>
                        <div className="flex items-center gap-1.5">
                           <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${v.score * 100}%` }} />
                           </div>
                           <span className="text-[7px] mono text-white">{(v.score * 10).toFixed(1)}</span>
                        </div>
                     </div>
                     <p className="text-[9px] text-zinc-500 line-clamp-2 italic leading-tight">"{v.critique}"</p>
                   </div>
                 ))}
               </div>
            </div>

            <div className="pt-5 border-t border-white/10 grid grid-cols-4 gap-1.5 h-10 items-end">
               <div className="bg-pink-500/40 rounded-sm hover:bg-pink-400 transition-colors" style={{ height: `${(c.dna_preview.z_anatomy || 0.5) * 80}%` }} title="Anatomy DNA" />
               <div className="bg-indigo-500/40 rounded-sm hover:bg-indigo-400 transition-colors" style={{ height: `${(c.dna_preview.z_structure || 0.5) * 80}%` }} title="Structure DNA" />
               <div className="bg-amber-500/40 rounded-sm hover:bg-amber-400 transition-colors" style={{ height: `${(c.dna_preview.z_lighting || 0.5) * 80}%` }} title="Lighting DNA" />
               <div className="bg-emerald-500/40 rounded-sm hover:bg-emerald-400 transition-colors" style={{ height: `${(c.dna_preview.z_texture || 0.5) * 80}%` }} title="Texture DNA" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoutDashboard;
