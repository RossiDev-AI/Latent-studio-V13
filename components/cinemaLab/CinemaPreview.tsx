
import React from 'react';
import { TimelineBeat, SubtitleSettings } from '../../types';

interface CinemaPreviewProps {
  currentBeat: TimelineBeat | null;
  aspectRatio: '16:9' | '9:16' | '1:1';
  subtitleSettings: SubtitleSettings;
  title: string;
  credits: string;
  isRendering: boolean;
  renderProgress: number;
  renderStatus: string;
}

const CinemaPreview: React.FC<CinemaPreviewProps> = ({
  currentBeat, aspectRatio, subtitleSettings, title, credits, isRendering, renderProgress, renderStatus
}) => {
  const subs = subtitleSettings;
  
  return (
    <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
      <div className={`relative bg-zinc-950 shadow-2xl overflow-hidden rounded-[2rem] border border-white/5 transition-all duration-700 ${aspectRatio === '16:9' ? 'w-full max-w-5xl aspect-video' : aspectRatio === '1:1' ? 'h-full max-h-[80vh] aspect-square' : 'h-full max-h-[80vh] aspect-[9/16]'}`}>
        {currentBeat ? (
          <div className="w-full h-full relative">
            {currentBeat.assetUrl ? (
              <img 
                src={currentBeat.assetUrl} 
                className="w-full h-full object-cover origin-top animate-ken-burns" 
                style={{ transform: `translateY(${currentBeat.yOffset || 0}%)` }}
              />
            ) : (
              <div className="w-full h-full bg-zinc-900/50 flex flex-col items-center justify-center gap-4">
                <svg className="w-12 h-12 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={1.5}/></svg>
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Searching Web References...</span>
              </div>
            )}
            
            <div className={`absolute left-0 right-0 px-10 flex justify-center ${currentBeat.id.startsWith('title') || currentBeat.id.startsWith('credits') ? 'inset-0 items-center' : 'bottom-[15%]'}`}>
              <div 
                style={{ 
                  fontSize: `${(currentBeat.id.startsWith('credits') || currentBeat.id.startsWith('title')) ? subs.fontSize * 0.85 : subs.fontSize}px`, 
                  color: subs.fontColor, 
                  backgroundColor: subs.backgroundColor, 
                  opacity: subs.bgOpacity, 
                  borderRadius: `${subs.fontSize * subs.radiusMult}px`, 
                  padding: `${subs.fontSize * subs.paddingVMult}px ${subs.fontSize * subs.paddingHMult}px`, 
                  textAlign: subs.textAlign, 
                  maxWidth: '90%', 
                  lineHeight: '1.4', 
                  fontWeight: 600, 
                  fontFamily: subs.fontFamily,
                  border: '1px solid rgba(255,255,255,0.1)',
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}
                dangerouslySetInnerHTML={{ __html: currentBeat.id.startsWith('title') ? title : currentBeat.id.startsWith('credits') ? credits : currentBeat.caption }}
              />
            </div>

            {currentBeat.sourceLink && (
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-indigo-400 mono">Web Source: {currentBeat.sourceLink}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Execute o Protocolo de Roteiro</p>
          </div>
        )}

        {isRendering && (
          <div className="absolute inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in">
            <div className="w-48 h-48 border-[12px] border-indigo-500/10 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 border-[12px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-4xl font-black text-white mono">{renderProgress}%</span>
            </div>
            <h4 className="mt-8 text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400">{renderStatus}</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaPreview;
