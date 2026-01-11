
import React, { useRef } from 'react';

interface CreationActionProps {
  isProcessing: boolean;
  onProcess: () => void;
  prompt: string;
}

const CreationAction: React.FC<CreationActionProps> = ({ isProcessing, onProcess, prompt }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="bg-zinc-950 border border-white/5 p-8 rounded-[3rem] space-y-5 shadow-2xl flex-1 flex flex-col transition-all hover:border-indigo-500/20 overflow-hidden relative">
      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Synthesis Anchor</label>
      <div onClick={() => fileRef.current?.click()} className="flex-1 min-h-[140px] bg-black/40 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all relative overflow-hidden group">
        <div className="text-center space-y-3 opacity-30">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth={1}/></svg>
          <p className="text-[9px] font-black uppercase tracking-widest">Inject Base DNA</p>
        </div>
        <input type="file" ref={fileRef} className="hidden" accept="image/*" />
      </div>
      <button 
        onClick={onProcess}
        disabled={isProcessing || !prompt.trim()}
        className="w-full py-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-[0.8em] text-[11px] shadow-2xl active:scale-95 transition-all"
      >
        {isProcessing ? 'SYNAPSING...' : 'EXECUTE MAD SYNTH V12.5'}
      </button>
    </div>
  );
};

export default CreationAction;
