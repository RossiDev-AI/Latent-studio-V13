
import React from 'react';
import { CategorizedDNA } from '../../types';

interface IndexerDnaBiopsyProps {
  dna: CategorizedDNA | null;
}

const IndexerDnaBiopsy: React.FC<IndexerDnaBiopsyProps> = ({ dna }) => {
  if (!dna) return null;

  return (
    <div className="flex-1 bg-zinc-950/40 border border-white/5 rounded-[3rem] p-8 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar">
      <div className="space-y-1">
        <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Neural Biopsy Results</h4>
        <p className="text-[12px] text-white font-black uppercase leading-tight">{dna.character || dna.environment || 'Analyzed Node'}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Core Attribute</span>
          <p className="text-[10px] text-zinc-300 italic">"{dna.pose || dna.environment || 'N/A'}"</p>
        </div>

        <div className="space-y-3">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block px-1">Technical Spec Tags</span>
          <div className="flex flex-wrap gap-2">
            {dna.technical_tags?.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-full text-[8px] mono text-zinc-400 font-bold uppercase">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="space-y-1">
            <span className="text-[7px] font-black text-zinc-600 uppercase">Camera</span>
            <p className="text-[9px] text-white mono font-bold uppercase">{dna.spatial_metadata?.camera_angle || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[7px] font-black text-zinc-600 uppercase">Lighting</span>
            <p className="text-[9px] text-white mono font-bold uppercase">{dna.aesthetic_dna?.lighting_setup?.split(' ').slice(0, 2).join(' ') || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexerDnaBiopsy;
