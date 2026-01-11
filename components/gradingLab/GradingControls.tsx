
import React from 'react';
import { LatentGrading } from '../../types';

interface GradingControlsProps {
  activeCategory: string;
  grading: LatentGrading;
  updateParam: (key: keyof LatentGrading, val: any) => void;
  applyPreset: (preset: any) => void;
  filmStocks: any[];
  customLuts: any[];
  handleSaveLut: () => void;
  handleRemoveLut: (name: string) => void;
  newLutName: string;
  setNewLutName: (val: string) => void;
  controls: any[];
}

const GradingControls: React.FC<GradingControlsProps> = ({
  activeCategory, grading, updateParam, applyPreset, filmStocks, customLuts, handleSaveLut, handleRemoveLut, newLutName, setNewLutName, controls
}) => {
  if (activeCategory === 'FILM') {
    return (
      <div className="space-y-4 p-3 md:p-6 overflow-y-auto max-h-[30vh] custom-scrollbar">
        <div className="flex gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
           <input 
            type="text" 
            value={newLutName} 
            onChange={(e) => setNewLutName(e.target.value.toUpperCase())} 
            placeholder="NEW PRESET NAME..." 
            className="flex-1 bg-transparent text-[8px] mono text-white outline-none font-black px-2" 
           />
           <button onClick={handleSaveLut} disabled={!newLutName.trim()} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[7px] font-black uppercase tracking-widest active:scale-95">Save</button>
        </div>

        <div className="grid grid-cols-2 gap-2 pb-4">
           <div className="col-span-2 text-[7px] font-black text-zinc-600 uppercase tracking-widest px-1">Industry Emulations</div>
           {filmStocks.map((stock) => (
             <button 
              key={stock.name} 
              onClick={() => applyPreset(stock)} 
              className={`relative h-11 rounded-lg border transition-all overflow-hidden flex flex-col items-center justify-center ${grading.preset_name === stock.name ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-zinc-900/40'}`}
             >
                <span className={`text-[8px] font-black uppercase tracking-widest relative z-10 ${grading.preset_name === stock.name ? 'text-white' : 'text-zinc-500'}`}>{stock.name}</span>
             </button>
           ))}
           
           {customLuts.length > 0 && (
             <>
                <div className="col-span-2 text-[7px] font-black text-zinc-600 uppercase tracking-widest px-1 mt-2">Vault Presets</div>
                {customLuts.map((lut, idx) => (
                  <div key={idx} className="relative group">
                    <button 
                      onClick={() => applyPreset(lut)} 
                      className={`w-full h-11 rounded-lg border transition-all overflow-hidden flex flex-col items-center justify-center ${grading.preset_name === lut.name ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-zinc-900/40'}`}
                    >
                       <span className={`text-[8px] font-black uppercase tracking-widest relative z-10 ${grading.preset_name === lut.name ? 'text-white' : 'text-zinc-500'}`}>{lut.name}</span>
                    </button>
                    <button 
                      onClick={() => handleRemoveLut(lut.name)} 
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
                    </button>
                  </div>
                ))}
             </>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 overflow-y-auto max-h-[30vh] custom-scrollbar pb-4">
      {controls.filter(c => c.group === activeCategory).map((ctrl) => (
         <div key={ctrl.key} className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{ctrl.label}</span>
              <span className="text-[8px] mono text-indigo-400 font-bold">{(grading as any)[ctrl.key].toFixed(3)}</span>
            </div>
            <input 
              type="range" 
              min={ctrl.min} 
              max={ctrl.max} 
              step={ctrl.step} 
              value={(grading as any)[ctrl.key]} 
              onChange={(e) => updateParam(ctrl.key as any, parseFloat(e.target.value))} 
              className="w-full h-1 bg-zinc-900 rounded-full appearance-none accent-indigo-500 cursor-pointer" 
            />
         </div>
      ))}
    </div>
  );
};

export default GradingControls;
