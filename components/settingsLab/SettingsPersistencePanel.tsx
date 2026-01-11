
import React from 'react';

const SettingsPersistencePanel: React.FC = () => {
  return (
    <div className="bg-indigo-600/5 border border-indigo-500/10 p-8 rounded-[3rem] space-y-4 relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
       </div>
       <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          Protocolo de Persistência Local
       </h3>
       <p className="text-xs text-zinc-500 leading-relaxed uppercase max-w-2xl">
         As chaves inseridas acima são persistidas exclusivamente no **IndexedDB** do seu navegador. 
         O sistema prioriza estas chaves para todas as operações do Nexus Creation Hub e do Visual Scout. 
         Se um campo estiver vazio, o Kernel utilizará as chaves padrão injetadas via environment variables.
       </p>
       <div className="pt-4 flex gap-6">
          <div className="flex flex-col">
             <span className="text-[7px] font-black text-zinc-700 uppercase">Encryption</span>
             <span className="text-[9px] font-bold text-zinc-500 uppercase">AES-256 Buffer</span>
          </div>
          <div className="flex flex-col">
             <span className="text-[7px] font-black text-zinc-700 uppercase">Storage Mode</span>
             <span className="text-[9px] font-bold text-zinc-500 uppercase">Browser Native</span>
          </div>
       </div>
    </div>
  );
};

export default SettingsPersistencePanel;
