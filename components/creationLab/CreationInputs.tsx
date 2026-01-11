
import React from 'react';

interface CreationInputsProps {
  prompt: string;
  setPrompt: (val: string) => void;
  refinedPrompt: string;
  isOptimizing: boolean;
  onMagicWand: () => void;
}

const CreationInputs: React.FC<CreationInputsProps> = ({ prompt, setPrompt, refinedPrompt, isOptimizing, onMagicWand }) => {
  return (
    <div className="space-y-8">
      <div className="bg-zinc-950 border border-white/5 p-8 rounded-[3rem] space-y-5 shadow-2xl transition-all relative group">
        <div className="flex justify-between items-center px-1">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">User Intent</label>
          <button 
            onClick={onMagicWand}
            disabled={isOptimizing || !prompt.trim()}
            className={`p-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 transition-all ${isOptimizing ? 'animate-pulse' : ''}`}
            title="Meta-Prompt Optimize"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.5 3L11 8.5L5.5 11L11 13.5L13.5 19L16 13.5L21.5 11L16 8.5L13.5 3Z" strokeWidth={2}/></svg>
          </button>
        </div>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Specify your visual intent (Portuguese or English)..."
          className="w-full h-32 bg-black/50 border border-white/5 rounded-3xl p-6 text-[13px] text-white focus:outline-none focus:border-indigo-500/30 resize-none transition-all placeholder:text-zinc-800"
        />
      </div>

      {refinedPrompt && (
        <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-[3rem] space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Meta-Prompt (Industrial English)</span>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          </div>
          <p className="text-[11px] text-zinc-400 mono italic leading-relaxed">"{refinedPrompt}"</p>
        </div>
      )}
    </div>
  );
};

export default CreationInputs;
