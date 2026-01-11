
import React, { useRef } from 'react';

interface VaultHeaderProps {
  nodeCount: number;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VaultHeader: React.FC<VaultHeaderProps> = ({ nodeCount, onExport, onImport }) => {
  const importFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-white/5 pb-12 gap-8">
      <div className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Vault Repository</h2>
        <p className="text-[10px] md:text-[11px] mono text-zinc-500 uppercase tracking-[0.4em]">V11.11 Multi-Domain Logic: {nodeCount} Nodes Indexed</p>
      </div>
      
      <div className="flex gap-2">
        <button onClick={onExport} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2.5}/></svg>
           Export Package
        </button>
        <button onClick={() => importFileRef.current?.click()} className="px-5 py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all flex items-center gap-2">
           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth={2.5}/></svg>
           Sync External
        </button>
        <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={onImport} />
      </div>
    </div>
  );
};

export default VaultHeader;
