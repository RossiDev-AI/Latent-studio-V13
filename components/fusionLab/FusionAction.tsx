
import React from 'react';

interface FusionActionProps {
  onFusion: () => void;
  isProcessing: boolean;
  isOptimizing: boolean;
}

const FusionAction: React.FC<FusionActionProps> = ({ onFusion, isProcessing, isOptimizing }) => {
  return (
    <button 
      onClick={onFusion} 
      disabled={isProcessing || isOptimizing} 
      className="w-full py-12 bg-white text-black rounded-[4rem] font-black uppercase tracking-[1em] text-sm shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:bg-zinc-100 transition-all active:scale-[0.98] disabled:opacity-30 relative overflow-hidden group"
    >
      {isProcessing && <div className="absolute inset-0 bg-indigo-600/20 animate-pulse" />}
      <span className="relative z-10">{isProcessing ? 'TRANSPLANTING IDENTITY...' : 'EXECUTE NEURAL SYNTH'}</span>
    </button>
  );
};

export default FusionAction;
