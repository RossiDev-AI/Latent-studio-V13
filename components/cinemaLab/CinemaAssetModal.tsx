
import React from 'react';
import { TimelineBeat, VaultItem } from '../../types';

interface CinemaAssetModalProps {
  beat: TimelineBeat;
  index: number;
  onClose: () => void;
  onUpdateCaption: (val: string) => void;
  onUpdateYOffset: (val: number) => void;
  onAction: (mode: any, provider?: any) => void;
  onOpenVault: () => void;
}

const CinemaAssetModal: React.FC<CinemaAssetModalProps> = ({ 
  beat, index, onClose, onUpdateCaption, onUpdateYOffset, onAction, onOpenVault 
}) => {
  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-zinc-900 border border-white/10 rounded-[4rem] p-10 md:p-16 space-y-10 shadow-2xl animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="text-center space-y-3">
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Direção de Cena {index + 1}</h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Configure o visual e ajuste o enquadramento.</p>
        </div>

        <div className="space-y-3">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Editar Legenda da Cena</label>
          <div 
            contentEditable onBlur={(e) => onUpdateCaption(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: beat.caption }}
            className="w-full bg-black/60 border border-white/10 rounded-[2rem] px-8 py-6 text-sm text-white outline-none min-h-[120px] focus:border-indigo-500/30 overflow-y-auto"
          />
        </div>

        <div className="bg-zinc-950 p-8 rounded-[3rem] border border-white/5 space-y-6">
          <div className="flex justify-between items-center px-1">
            <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Ajuste de Enquadramento (Y-Offset)</label>
            <span className="text-[10px] mono text-white font-bold">{beat.yOffset || 0}%</span>
          </div>
          <input 
            type="range" min="-50" max="50" step="1" 
            value={beat.yOffset || 0} 
            onChange={(e) => onUpdateYOffset(parseInt(e.target.value))} 
            className="w-full h-2 bg-zinc-800 rounded-full appearance-none accent-emerald-500 cursor-pointer" 
          />
          <div className="flex justify-between text-[7px] text-zinc-600 font-black uppercase">
            <span>Subir Imagem (-Y)</span>
            <span>Descer Imagem (+Y)</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Web Reference Scout (Escolha o Provedor)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['PEXELS', 'UNSPLASH', 'PIXABAY', 'GEMINI'].map((provider: any) => (
              <button 
                key={provider} 
                onClick={() => onAction('SCOUT', provider)} 
                className={`py-6 bg-zinc-800 text-white rounded-3xl border border-white/5 transition-all flex flex-col items-center gap-2 group hover:bg-indigo-600`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">{provider}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
          <button onClick={() => onAction('AI')} className="py-8 bg-zinc-800 hover:bg-indigo-500 text-white rounded-[2rem] border border-white/5 transition-all flex flex-col items-center gap-4 group text-center">
            <svg className="w-5 h-5 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.5 3L11 8.5L5.5 11L11 13.5L13.5 19L16 13.5L21.5 11L16 8.5L13.5 3Z" strokeWidth={2.5}/></svg>
            <span className="text-[9px] font-black uppercase tracking-widest">AI Synth</span>
          </button>
          <button onClick={onOpenVault} className="py-8 bg-zinc-800 hover:bg-emerald-600 text-white rounded-[2rem] border border-white/5 transition-all flex flex-col items-center gap-4 group text-center">
            <svg className="w-5 h-5 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" strokeWidth={2.5}/></svg>
            <span className="text-[9px] font-black uppercase tracking-widest">Vault Node</span>
          </button>
          <button onClick={() => onAction('UPLOAD')} className="py-8 bg-zinc-800 hover:bg-amber-600 text-white rounded-[2rem] border border-white/5 transition-all flex flex-col items-center gap-4 group text-center">
            <svg className="w-5 h-5 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth={2.5}/></svg>
            <span className="text-[9px] font-black uppercase tracking-widest">Upload</span>
          </button>
        </div>
        <button onClick={onClose} className="w-full py-5 bg-white text-black rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] active:scale-95 transition-all">Fechar Edição</button>
      </div>
    </div>
  );
};

export default CinemaAssetModal;
