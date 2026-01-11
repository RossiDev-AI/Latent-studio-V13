
import React from 'react';
import { LatentParams } from '../types';
import ZCodeVisualizer from './ZCodeVisualizer';

interface ZModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: LatentParams;
  setParams: React.Dispatch<React.SetStateAction<LatentParams>>;
  onAutoTune: () => void;
}

const ZModeModal: React.FC<ZModeModalProps> = ({ isOpen, onClose, params, setParams }) => {
  if (!isOpen) return null;

  const sliders = [
    { key: 'z_anatomy', label: 'Z_ANATOMY (DNA/Pose Lock)', min: 0, max: 1.5, step: 0.01, hz: '< 0.1 Hz' },
    { key: 'z_structure', label: 'Z_STRUCTURE (Geometry)', min: 0, max: 1.5, step: 0.01, hz: '0.1 - 5 Hz' },
    { key: 'z_lighting', label: 'Z_LIGHTING (Shadows)', min: 0, max: 1, step: 0.01, hz: '5 - 30 Hz' },
    { key: 'z_texture', label: 'Z_TEXTURE (Surface)', min: 0, max: 1, step: 0.01, hz: '30 - 128 Hz' },
  ];

  const handleParamChange = (key: keyof LatentParams, value: number) => {
    if (params.auto_tune_active) return; // Bloqueia se piloto automático estiver ligado
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const toggleAutoTune = () => {
    setParams(prev => ({ ...prev, auto_tune_active: !prev.auto_tune_active }));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl h-full md:h-auto max-h-[95vh] md:max-h-[85vh] bg-[#121215] border-x md:border border-white/10 md:rounded-[3rem] overflow-hidden shadow-[0_0_120px_rgba(79,70,229,0.15)] flex flex-col">
        
        <div className="px-6 py-4 md:px-10 md:py-8 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#121215] z-[10000]">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="flex items-center gap-4 bg-zinc-900/50 px-5 py-2 rounded-full border border-white/10">
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none">Neural Override</span>
                 <span className={`text-[7px] font-bold uppercase transition-colors ${params.auto_tune_active ? 'text-indigo-400' : 'text-zinc-700'}`}>
                    {params.auto_tune_active ? 'Active Pilot' : 'Manual Mode'}
                 </span>
              </div>
              <button 
                onClick={toggleAutoTune}
                className={`relative w-10 h-5 rounded-full transition-all duration-500 ${params.auto_tune_active ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-zinc-800'}`}
              >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-500 ${params.auto_tune_active ? 'left-6' : 'left-1'}`} />
              </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 scroll-smooth pb-24 relative">
          {params.auto_tune_active && (
             <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-[3rem]">
                <div className="w-full h-full bg-indigo-500/5 backdrop-blur-[1px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent animate-scan-y opacity-30" />
             </div>
          )}

          <ZCodeVisualizer 
            params={params} 
            onParamChange={handleParamChange}
          />

          <div className="space-y-8">
            {params.auto_tune_active && (
              <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl animate-pulse">
                <h3 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full" />
                  Agent Regulation Active
                </h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed uppercase">
                   {params.pose_control?.enabled 
                    ? 'Puppeteer Engine detected. Anatomy & Structure weights anchored for skeletal integrity.' 
                    : 'Prompt-adaptive regulation enabled. Fine-tuning frequencies for semantic fidelity.'}
                </p>
              </div>
            )}

            {sliders.map((s) => (
              <div key={s.key} className={`space-y-4 transition-all duration-700 ${params.auto_tune_active ? 'opacity-40 saturate-0' : 'opacity-100'}`}>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                      <label className="text-[11px] font-black text-zinc-200 uppercase tracking-wider">{s.label}</label>
                      <span className="text-[8px] mono text-indigo-400 font-bold uppercase">{s.hz}</span>
                  </div>
                  <span className="text-sm font-black text-indigo-400 mono tracking-tighter">
                      {((params as any)[s.key] * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="relative h-6 flex items-center">
                    <div className="absolute inset-0 h-1 my-auto bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${params.auto_tune_active ? 'bg-zinc-600' : 'bg-indigo-500/40'}`} style={{ width: `${Math.min(((params as any)[s.key] / s.max) * 100, 100)}%` }} />
                    </div>
                    <input
                      type="range"
                      disabled={params.auto_tune_active}
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={(params as any)[s.key]}
                      onChange={(e) => handleParamChange(s.key as keyof LatentParams, parseFloat(e.target.value))}
                      className={`relative w-full h-full bg-transparent appearance-none z-10 ${params.auto_tune_active ? 'cursor-not-allowed' : 'cursor-pointer accent-white'}`}
                    />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-[#121215]/95 backdrop-blur-xl border-t border-white/10 sticky bottom-0 z-[10000]">
          <button
            onClick={onClose}
            className="w-full py-5 bg-white text-black hover:bg-zinc-100 rounded-2xl text-[11px] font-black tracking-[0.4em] uppercase transition-all shadow-2xl active:scale-95"
          >
            Confirm Configuration
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan-y {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan-y {
          animation: scan-y 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ZModeModal;
