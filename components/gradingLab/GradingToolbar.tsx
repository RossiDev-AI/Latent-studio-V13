
import React from 'react';

interface GradingToolbarProps {
  onCommit: () => void;
  onDownload: () => void;
  onReset: () => void;
  isSaving: boolean;
  disabled: boolean;
}

const GradingToolbar: React.FC<GradingToolbarProps> = ({ onCommit, onDownload, onReset, isSaving, disabled }) => {
  return (
    <div className="flex gap-2 justify-center py-3 bg-[#0b0b0d] border-b border-white/5 z-50">
       <button 
        onClick={onCommit} 
        disabled={disabled || isSaving} 
        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all disabled:opacity-30"
       >
         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3}/></svg>
         {isSaving ? 'Baking...' : 'Commit Master'}
       </button>
       <button 
        onClick={onDownload} 
        disabled={disabled}
        className="px-3 py-2 bg-zinc-100 text-black rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all disabled:opacity-30"
       >
         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2}/></svg>
         Export PNG
       </button>
       <button 
        onClick={onReset} 
        disabled={disabled}
        className="px-2 py-2 bg-zinc-900 border border-white/5 text-zinc-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:text-white transition-all disabled:opacity-30"
       >
         Reset
       </button>
    </div>
  );
};

export default GradingToolbar;
