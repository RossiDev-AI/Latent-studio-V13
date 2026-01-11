
import React from 'react';

interface StudioActionPanelProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onProcess: () => void;
  onCommit: () => void;
  isProcessing: boolean;
  isSaving: boolean;
  hasImage: boolean;
}

const StudioActionPanel: React.FC<StudioActionPanelProps> = ({
  prompt, setPrompt, onProcess, onCommit, isProcessing, isSaving, hasImage
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-black/95 backdrop-blur-3xl border-t border-white/5 space-y-3 z-[100]">
      <div className="relative">
         <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="Enter synthesis directive (Kernel v12.2)..." 
            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-[10px] md:text-sm h-16 md:h-24 resize-none text-zinc-200 outline-none focus:border-indigo-500/40 transition-all custom-scrollbar" 
         />
         <button 
            onClick={onProcess} 
            disabled={isProcessing || !prompt.trim()} 
            className={`absolute bottom-3 right-3 p-2 rounded-lg border transition-all ${isProcessing ? 'bg-indigo-600/40 border-indigo-400 animate-pulse' : 'bg-white/5 border-white/10 text-indigo-400 hover:bg-white/10'}`} 
         >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" strokeWidth={2}/></svg>
         </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={onProcess} 
          disabled={isProcessing} 
          className="rounded-xl bg-indigo-600 text-white p-3 md:p-4 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl shadow-indigo-900/20"
        >
          Execute Synth
        </button>
        <button 
          onClick={onCommit} 
          disabled={!hasImage || isSaving} 
          className="rounded-xl bg-zinc-100 text-black text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
        >
          Commit Node
        </button>
      </div>
    </div>
  );
};

export default StudioActionPanel;
