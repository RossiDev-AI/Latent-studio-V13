
import React from 'react';
import { TimelineBeat } from '../../types';

interface CinemaTimelineProps {
  beats: TimelineBeat[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onOpenOrchestrator: (index: number) => void;
  loadingBeats: Record<string, boolean>;
}

const CinemaTimeline: React.FC<CinemaTimelineProps> = ({ 
  beats, activeIndex, onSelect, onOpenOrchestrator, loadingBeats 
}) => {
  return (
    <div className="h-64 bg-zinc-950/50 p-6 overflow-y-auto border-t border-white/5 custom-scrollbar">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {beats.map((beat, i) => (
          <div 
            key={beat.id} 
            onClick={() => onSelect(i)} 
            className={`relative aspect-video rounded-2xl border-2 transition-all cursor-pointer overflow-hidden group ${activeIndex === i ? 'border-indigo-500 scale-[1.03] z-10 shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'border-white/5 opacity-50 hover:opacity-100'}`}
          >
            {beat.assetUrl ? (
              <img src={beat.assetUrl} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-[8px] text-zinc-700 font-black uppercase`}>
                <span>{beat.id.startsWith('title') ? 'TITLE' : beat.id.startsWith('credits') ? 'CREDITS' : i+1}</span>
                {beat.sourceLink && <span className="text-indigo-600 mt-1">WEB LINK</span>}
              </div>
            )}
            {loadingBeats[beat.id] && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenOrchestrator(i); }} 
              className="absolute bottom-2 right-2 p-1.5 bg-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3}/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CinemaTimeline;
