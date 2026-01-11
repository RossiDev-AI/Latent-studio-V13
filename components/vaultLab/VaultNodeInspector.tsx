
import React from 'react';
import { VaultItem } from '../../types';

interface VaultNodeInspectorProps {
  item: VaultItem;
  onReload: (item: VaultItem) => void;
  onClose: () => void;
}

const VaultNodeInspector: React.FC<VaultNodeInspectorProps> = ({ item, onReload, onClose }) => {
  const dna = item.dna;

  return (
    <div className="flex-1 bg-zinc-950 p-8 flex flex-col md:flex-row gap-8 animate-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex-1 space-y-6">
        <div className="space-y-1">
          <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Neural Biopsy Results</h4>
          <p className="text-[14px] text-white font-black uppercase leading-tight">{dna?.character || dna?.environment || 'Unknown Subject'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Core Attribute / Pose</span>
            <p className="text-[10px] text-zinc-300 italic">"{dna?.pose || 'Identity Stable'}"</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Environment Context</span>
            <p className="text-[10px] text-zinc-300 italic">"{dna?.environment || 'Neutral Latent Space'}"</p>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block px-1">Technical Spec Tags</span>
          <div className="flex flex-wrap gap-2">
            {dna?.technical_tags?.map((tag: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-full text-[8px] mono text-zinc-400 font-bold uppercase">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full md:w-[200px] space-y-6 border-l border-white/5 pl-0 md:pl-8">
         <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[7px] font-black text-zinc-600 uppercase block">Camera Sync</span>
              <p className="text-[10px] text-white mono font-bold uppercase">{dna?.spatial_metadata?.camera_angle || 'Eye-Level'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[7px] font-black text-zinc-600 uppercase block">Lighting Setup</span>
              <p className="text-[10px] text-white mono font-bold uppercase">{dna?.aesthetic_dna?.lighting_setup || 'Natural'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[7px] font-black text-zinc-600 uppercase block">Neural Score</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${item.neuralPreferenceScore}%` }} />
                </div>
                <span className="text-[10px] mono text-indigo-400">{item.neuralPreferenceScore}</span>
              </div>
            </div>
         </div>

         <div className="pt-4 border-t border-white/5 space-y-4">
            <button onClick={() => onReload(item)} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Reload Node</button>
            <button onClick={onClose} className="w-full py-3 bg-white/5 border border-white/10 text-zinc-400 rounded-xl text-[9px] font-black uppercase">Collapse</button>
         </div>
      </div>
    </div>
  );
};

export default VaultNodeInspector;
