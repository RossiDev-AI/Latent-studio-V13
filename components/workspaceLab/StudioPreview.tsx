
import React from 'react';
import { LatentParams, LatentGrading, VaultDomain, VaultItem } from '../../types';

interface StudioPreviewProps {
  currentImage: string | null;
  isProcessing: boolean;
  isBiopsyActive: boolean;
  loadingMessage: string;
  localGrading?: LatentGrading;
  params: LatentParams;
  vault: VaultItem[];
  onUploadClick: () => void;
  onSlotClick: (domain: VaultDomain) => void;
}

const StudioPreview: React.FC<StudioPreviewProps> = ({
  currentImage, isProcessing, isBiopsyActive, loadingMessage, localGrading, params, vault, onUploadClick, onSlotClick
}) => {
  const renderSlot = (domain: VaultDomain, label: string, color: string) => {
    const activeId = params.active_slots?.[domain];
    const item = vault.find(v => v.shortId === activeId);
    
    return (
      <div className={`relative flex flex-col items-center gap-1 group`}>
        <div 
          className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 transition-all cursor-pointer overflow-hidden bg-black/40 flex items-center justify-center ${item ? `border-${color}-500 shadow-[0_0_15px_rgba(255,255,255,0.1)]` : 'border-white/5 hover:border-white/20'}`}
          onClick={() => onSlotClick(domain)}
        >
           {item ? (
              <img src={item.imageUrl} className="w-full h-full object-cover" />
           ) : (
              <span className={`text-[10px] font-black uppercase text-zinc-800`}>{domain}</span>
           )}
        </div>
        <span className={`text-[6px] font-black uppercase tracking-tighter ${item ? `text-${color}-400` : 'text-zinc-600'}`}>{label}</span>
      </div>
    );
  };

  return (
    <div className={`flex-[1.4] relative bg-[#08080a] flex flex-col items-center justify-center border-r border-white/5 overflow-hidden min-h-[300px] md:min-h-0`}>
      {(isProcessing || isBiopsyActive) && (
        <div className="absolute inset-0 z-[160] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4 text-center px-6 transition-opacity duration-300">
          <div className="relative w-12 h-12 md:w-32 md:h-32">
              <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-t-indigo-500 rounded-full animate-spin" />
          </div>
          <p className="text-indigo-400 font-black text-[8px] md:text-xs uppercase tracking-[0.3em] animate-pulse">
            {loadingMessage}
          </p>
        </div>
      )}

      <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
        {!currentImage ? (
          <div onClick={onUploadClick} className="w-full h-full bg-zinc-900/10 border-2 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/40 transition-all">
                <svg className="w-10 h-10 text-zinc-800 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span className="text-[10px] mono uppercase text-zinc-600 font-bold tracking-widest">Inject Base DNA</span>
          </div>
        ) : (
          <div className={`relative w-full h-full flex items-center justify-center bg-[#050505]`}>
            <div className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden">
                <img 
                  src={currentImage!} 
                  className={`max-w-full max-h-full w-auto h-auto object-contain transition-all duration-1000 shadow-2xl relative z-10`}
                  style={{ filter: localGrading?.css_filter_string || 'none' }}
                />
                {localGrading && (
                   <div 
                    className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply"
                    style={{ 
                      backgroundColor: `rgb(${localGrading.tint_r * 255 || 255}, ${localGrading.tint_g * 255 || 255}, ${localGrading.tint_b * 255 || 255})`,
                      opacity: 0.3
                    }}
                   />
                )}
            </div>
            
            <div className="absolute top-8 left-8 flex flex-col gap-2 z-[100]">
                <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                   <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">MAD_v12.2 ACTIVE</span>
                </div>
                {localGrading && (
                  <div className="bg-emerald-600/80 backdrop-blur-md px-4 py-1.5 rounded-xl border border-emerald-400/30 flex items-center gap-2">
                     <span className="text-[7px] font-black text-white uppercase tracking-widest">MASTERED_GRADIENT: {localGrading.preset_name}</span>
                  </div>
                )}
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-black/80 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-white/10 z-[150] shadow-2xl">
               {renderSlot('X', 'Identity', 'emerald')}
               {renderSlot('Y', 'Env', 'pink')}
               {renderSlot('Z', 'Style', 'cyan')}
               {renderSlot('L', 'Light', 'amber')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioPreview;
