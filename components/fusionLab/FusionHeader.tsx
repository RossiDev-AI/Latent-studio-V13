
import React from 'react';

const FusionHeader: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-12">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)] animate-pulse">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2a5 5 0 00-5 5v3a5 5 0 0010 0V7a5 5 0 00-5-5z" strokeWidth={2.5}/></svg>
           </div>
           <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Fusion Reactor</h2>
              <p className="text-[11px] mono text-zinc-500 uppercase tracking-[0.5em]">Adaptive Synaptic Logic v10.2</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FusionHeader;
