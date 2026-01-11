
import React from 'react';

const SettingsHeader: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 border-b border-white/5 pb-8">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10">
             <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth={2}/></svg>
          </div>
          <div>
             <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Terminal Config</h2>
             <p className="text-[10px] mono text-zinc-500 uppercase tracking-[0.5em]">LCP-v13 Dynamic API Orchestration</p>
          </div>
       </div>
    </div>
  );
};

export default SettingsHeader;
