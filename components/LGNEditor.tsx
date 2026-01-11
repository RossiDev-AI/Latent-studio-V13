
import React from 'react';
import { LatentGrading } from '../types';

interface LGNEditorProps {
  isOpen: boolean;
  onClose: () => void;
  grading: LatentGrading;
  onChange: (newGrading: LatentGrading) => void;
}

const LGNEditor: React.FC<LGNEditorProps> = ({ isOpen, onClose, grading, onChange }) => {
  if (!isOpen) return null;

  const updateParam = (key: keyof LatentGrading, val: any) => {
    const next = { ...grading, [key]: val };
    next.css_filter_string = `brightness(${next.brightness}) contrast(${next.contrast}) saturate(${next.saturation}) blur(${next.blur}px) sepia(${next.sepia}) hue-rotate(${next.hueRotate}deg)`;
    onChange(next);
  };

  const applyPreset = (name: string, filter: string) => {
    onChange({
      ...grading,
      preset_name: name,
      css_filter_string: filter
    });
  };

  const controls = [
    { key: 'brightness', label: 'Exposure', min: 0.5, max: 1.5, step: 0.01 },
    { key: 'contrast', label: 'Contrast', min: 0.5, max: 1.5, step: 0.01 },
    { key: 'saturation', label: 'Saturation', min: 0, max: 2.0, step: 0.01 },
    { key: 'blur', label: 'Haze / Focus', min: 0, max: 5, step: 0.1 },
    { key: 'sepia', label: 'Warmth', min: 0, max: 1, step: 0.01 },
    { key: 'hueRotate', label: 'Hue Rotate', min: -180, max: 180, step: 1 },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-[#0b0b0d] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/10">
          <div className="flex flex-col">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">LGN_LOW_LEVEL_MASTERING</h3>
            <p className="text-[8px] mono text-zinc-600 uppercase font-bold tracking-widest">Industrial Core v12.1</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="space-y-3">
             <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">LUT Presets</label>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Cinema_Noir', 'Teal_Orange', 'Cyber_Neon'].map(preset => (
                   <button 
                    key={preset}
                    onClick={() => {
                       if(preset === 'Cinema_Noir') applyPreset(preset, 'grayscale(1) contrast(1.2)');
                       if(preset === 'Teal_Orange') applyPreset(preset, 'hue-rotate(-20deg) saturate(1.5)');
                       if(preset === 'Cyber_Neon') applyPreset(preset, 'saturate(2) brightness(1.1)');
                    }}
                    className={`py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${grading.preset_name === preset ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                   >
                     {preset.replace('_', ' ')}
                   </button>
                ))}
                <button onClick={() => updateParam('brightness', 1)} className="py-2.5 bg-zinc-950 border border-white/5 rounded-xl text-[8px] font-black uppercase text-red-500 tracking-widest">Reset</button>
             </div>
          </div>

          <div className="space-y-6">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Low-Level Sliders</label>
            {controls.map((ctrl) => (
              <div key={ctrl.key} className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{ctrl.label}</span>
                  <span className="text-[10px] mono text-indigo-400 font-bold">{(grading as any)[ctrl.key]}</span>
                </div>
                <input 
                  type="range" 
                  min={ctrl.min} 
                  max={ctrl.max} 
                  step={ctrl.step} 
                  value={(grading as any)[ctrl.key]} 
                  onChange={(e) => updateParam(ctrl.key as any, parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
          
          <div className="p-5 bg-black/40 border border-white/5 rounded-2xl">
             <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest block mb-2">CSS Manifest</span>
             <div className="text-[9px] mono text-zinc-500 break-all bg-black/20 p-3 rounded-lg border border-white/5">
                {grading.css_filter_string}
             </div>
          </div>
        </div>

        <div className="p-8 bg-[#0e0e11] border-t border-white/5">
           <button 
            onClick={onClose}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl active:scale-95 transition-all"
           >
             Commit Master Grading
           </button>
        </div>
      </div>
    </div>
  );
};

export default LGNEditor;
