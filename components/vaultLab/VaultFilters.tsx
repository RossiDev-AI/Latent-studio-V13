
import React from 'react';
import { VaultDomain } from '../../types';

interface VaultFiltersProps {
  filterDomain: VaultDomain | 'ALL';
  setFilterDomain: (d: VaultDomain | 'ALL') => void;
}

const VaultFilters: React.FC<VaultFiltersProps> = ({ filterDomain, setFilterDomain }) => {
  const domains: { id: VaultDomain | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Kernels' },
    { id: 'X', label: 'Identity' },
    { id: 'Y', label: 'Environment' },
    { id: 'Z', label: 'Style' },
    { id: 'L', label: 'Lighting' }
  ];

  return (
    <div className="flex gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 self-center lg:self-start mb-8">
      {domains.map(d => (
        <button 
          key={d.id} 
          onClick={() => setFilterDomain(d.id)}
          className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterDomain === d.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
};

export default VaultFilters;
