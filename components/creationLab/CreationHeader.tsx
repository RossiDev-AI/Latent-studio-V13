
import React from 'react';

interface CreationHeaderProps {
  onReset: () => void;
}

const CreationHeader: React.FC<CreationHeaderProps> = ({ onReset }) => {
  return (
    <div className="flex justify-between items-start">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Nexus Creation Hub</h2>
        <p className="text-[10px] mono text-zinc-500 uppercase tracking-[0.5em]">LCP-v12.5 MAD_INDUSTRIAL CORE</p>
      </div>
      <button 
        onClick={onReset}
        className="p-3 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-600/20 transition-all flex items-center gap-2"
        title="Reset Protocol"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2}/></svg>
      </button>
    </div>
  );
};

export default CreationHeader;
