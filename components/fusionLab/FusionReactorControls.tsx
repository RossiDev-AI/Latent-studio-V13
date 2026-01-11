
import React from 'react';

interface FusionReactorControlsProps {
  intent: string;
  onIntentChange: (val: string) => void;
  onRefine: () => void;
  isOptimizing: boolean;
  isAutoPilot: boolean;
  onAutoPilotToggle: () => void;
}

const FusionReactorControls: React.FC<FusionReactorControlsProps> = ({
  intent, onIntentChange, onRefine, isOptimizing, isAutoPilot, onAutoPilotToggle
}) => {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center gap-8 bg-zinc-950/50 p-8 rounded-[3rem] border border-white/5 shadow-inner">
      <div className="w-full md:min-w-[400px] space-y-3 relative group">
        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Neural Intent Directive</label>
        <textarea 
          value={intent}
          onChange={(e) => onIntentChange(e.target.value)}
          placeholder="Specify synthesis..."
          className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none h-24 resize-none transition-all focus:border-indigo-500/30"
        />
        <button 
          onClick={onRefine} 
          disabled={isOptimizing || !intent.trim()} 
          className="absolute bottom-3 right-3 p-2 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20 hover:bg-indigo-600/20 transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.5 3L11 8.5L5.5 11L11 13.5L13.5 19L16 13.5L21.5 11L16 8.5L13.5 3Z" strokeWidth={2}/></svg>
        </button>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">AutoPilot</span>
        <button 
          onClick={onAutoPilotToggle} 
          className={`relative w-14 h-7 rounded-full transition-all duration-500 ${isAutoPilot ? 'bg-indigo-600' : 'bg-zinc-800'}`}
        >
          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-500 ${isAutoPilot ? 'left-8' : 'left-1'}`} />
        </button>
      </div>
    </div>
  );
};

export default FusionReactorControls;
