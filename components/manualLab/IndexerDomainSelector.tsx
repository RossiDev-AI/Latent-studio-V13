
import React from 'react';
import { VaultDomain } from '../../types';

interface IndexerDomainSelectorProps {
  selectedDomain: VaultDomain;
  onSelect: (domain: VaultDomain) => void;
}

const IndexerDomainSelector: React.FC<IndexerDomainSelectorProps> = ({ selectedDomain, onSelect }) => {
  const domains: { id: VaultDomain; label: string }[] = [
    { id: 'X', label: 'Identity' },
    { id: 'Y', label: 'Environment' },
    { id: 'Z', label: 'Style' },
    { id: 'L', label: 'Lighting' }
  ];

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Select Target Domain</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {domains.map(d => (
          <button 
            key={d.id}
            onClick={() => onSelect(d.id)}
            className={`flex flex-col items-center justify-center gap-2 py-5 rounded-3xl border transition-all relative overflow-hidden ${selectedDomain === d.id ? `bg-white text-black border-white shadow-2xl scale-105` : `bg-black/40 border-white/5 text-zinc-600 hover:text-zinc-400`}`}
          >
            <span className="text-[13px] font-black">{d.id}</span>
            <span className="text-[7px] font-black uppercase tracking-widest">{d.label}</span>
            {selectedDomain === d.id && <div className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-bl-lg" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IndexerDomainSelector;
