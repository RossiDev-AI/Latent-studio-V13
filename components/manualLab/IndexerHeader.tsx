
import React from 'react';

interface IndexerHeaderProps {
  onBiopsy: () => void;
  isScanning: boolean;
  hasImage: boolean;
}

const IndexerHeader: React.FC<IndexerHeaderProps> = ({ onBiopsy, isScanning, hasImage }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group">
            <svg className="w-6 h-6 text-indigo-500 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={2.5}/></svg>
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Neural Biopsy Station</h2>
            <p className="text-[10px] mono text-zinc-500 uppercase tracking-[0.5em]">LCP_v11.11 AUTOMATED INDEXING</p>
          </div>
        </div>
      </div>
      
      {hasImage && (
        <button 
          onClick={onBiopsy}
          disabled={isScanning}
          className={`group flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600/20 transition-all ${isScanning ? 'animate-pulse' : ''}`}
        >
          <svg className="w-4 h-4 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.5 3L11 8.5L5.5 11L11 13.5L13.5 19L16 13.5L21.5 11L16 8.5L13.5 3Z" strokeWidth={2}/></svg>
          {isScanning ? 'Sequencing DNA...' : 'Neural Biopsy (Magic Wand)'}
        </button>
      )}
    </div>
  );
};

export default IndexerHeader;
