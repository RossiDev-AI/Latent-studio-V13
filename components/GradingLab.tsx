
import React, { useState, useEffect, useRef } from 'react';
import { VaultItem, LatentGrading } from '../types';

interface GradingLabProps {
  vault: VaultItem[];
  onSave: (item: VaultItem) => Promise<void>;
}

const INITIAL_GRADING: LatentGrading = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  sharpness: 0.5,
  blur: 0,
  hueRotate: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
  opacity: 1,
  vignette: 0,
  tint_r: 1,
  tint_g: 1,
  tint_b: 1,
  shadows: 0,
  midtones: 1,
  highlights: 1,
  bloom: 0,
  halation: 0,
  preset_name: 'MASTER_RAW',
  css_filter_string: 'none'
};

const FILM_STOCKS = [
  { name: 'KODAK_5219', filter: 'contrast(1.1) saturate(1.1) sepia(0.05) hue-rotate(-5deg) brightness(1.02)', shadows: 0.02, midtones: 1.1, highlights: 1.05, bloom: 0.1, halation: 0.1 },
  { name: 'FUJI_3513', filter: 'contrast(1.3) saturate(0.9) hue-rotate(5deg) brightness(0.95)', shadows: -0.05, midtones: 0.9, highlights: 1.1, bloom: 0.05, halation: 0.05 },
  { name: 'AGFA_VISTA', filter: 'saturate(1.4) contrast(1.1) brightness(1.05)', shadows: 0.01, midtones: 1.2, highlights: 1, bloom: 0.15, halation: 0.08 },
  { name: 'EKTACHROME', filter: 'contrast(1.5) saturate(1.3) brightness(1.1) hue-rotate(-2deg)', shadows: -0.08, midtones: 0.85, highlights: 1.2, bloom: 0, halation: 0 },
];

const GradingLab: React.FC<GradingLabProps> = ({ vault, onSave }) => {
  const [selectedNode, setSelectedNode] = useState<VaultItem | null>(null);
  const [grading, setGrading] = useState<LatentGrading>(INITIAL_GRADING);
  const [customLuts, setCustomLuts] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('LGG');
  const [newLutName, setNewLutName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('studio_custom_luts_v2');
    if (saved) setCustomLuts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (selectedNode) {
      setGrading(selectedNode.grading || INITIAL_GRADING);
    } else {
      setGrading(INITIAL_GRADING);
    }
  }, [selectedNode]);

  const updateParam = (key: keyof LatentGrading, val: any) => {
    const next = { ...grading, [key]: val };
    const baseFilters = [
      `brightness(${next.brightness})`,
      `contrast(${next.contrast})`,
      `saturate(${next.saturation})`,
      `blur(${next.blur}px)`,
      `sepia(${next.sepia})`,
      `hue-rotate(${next.hueRotate}deg)`,
      `grayscale(${next.grayscale})`,
    ].join(' ');
    
    const proFilter = `url(#pro-grading-${selectedNode?.shortId || 'global'})`;
    next.css_filter_string = `${baseFilters} ${proFilter}`;
    setGrading(next);
  };

  const applyPreset = (preset: any) => {
    setGrading({
      ...grading,
      ...preset,
      preset_name: preset.name || preset.preset_name,
    });
  };

  const handleSaveLut = () => {
    if (!newLutName.trim()) return;
    const newLut = { ...grading, name: newLutName.toUpperCase() };
    const updated = [...customLuts, newLut];
    setCustomLuts(updated);
    localStorage.setItem('studio_custom_luts_v2', JSON.stringify(updated));
    setNewLutName('');
  };

  const handleRemoveLut = (name: string) => {
    const updated = customLuts.filter(l => l.name !== name);
    setCustomLuts(updated);
    localStorage.setItem('studio_custom_luts_v2', JSON.stringify(updated));
  };

  const bakeImage = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!selectedNode) return reject("No node selected");
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = selectedNode.originalImageUrl || selectedNode.imageUrl;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("Canvas failure");
        
        ctx.filter = grading.css_filter_string;
        ctx.drawImage(img, 0, 0);

        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgb(${grading.tint_r * 255}, ${grading.tint_g * 255}, ${grading.tint_b * 255})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.globalCompositeOperation = 'source-over';
        
        if (grading.halation > 0) {
            ctx.globalAlpha = grading.halation;
            ctx.filter = 'blur(4px) saturate(2)';
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = 'rgba(255, 30, 0, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        }

        if (grading.bloom > 0) {
            ctx.globalAlpha = grading.bloom;
            ctx.filter = 'blur(12px) brightness(1.5)';
            ctx.globalCompositeOperation = 'screen';
            ctx.drawImage(canvas, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        }

        if (grading.vignette > 0) {
          const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, Math.sqrt((canvas.width/2)**2 + (canvas.height/2)**2));
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(1, `rgba(0,0,0,${grading.vignette})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        resolve(canvas.toDataURL('image/png', 0.95));
      };
      img.onerror = (e) => reject(e);
    });
  };

  const handleDownload = async () => {
    if (!selectedNode) return;
    const url = await bakeImage();
    const link = document.createElement('a');
    link.href = url;
    link.download = `LCP_MASTER_${selectedNode.shortId}_${grading.preset_name}.png`;
    link.click();
  };

  const handleCommit = async () => {
    if (!selectedNode || isSaving) return;
    setIsSaving(true);
    try {
      const bakedImageUrl = await bakeImage();
      const updatedNode = { ...selectedNode, imageUrl: bakedImageUrl, grading };
      await onSave(updatedNode);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  const categories = [
    { id: 'LGG', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20" strokeWidth={2}/></svg>, label: 'LGG' },
    { id: 'FILM', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" strokeWidth={2}/></svg>, label: 'Film' },
    { id: 'COLOR', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343" strokeWidth={2}/></svg>, label: 'Tint' },
    { id: 'LENS', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" strokeWidth={2}/></svg>, label: 'FX' },
    { id: 'OPTICAL', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" strokeWidth={2}/></svg>, label: 'Exp' },
  ];

  const controls = [
    { key: 'shadows', label: 'Shadows (Lift)', min: -0.2, max: 0.2, step: 0.001, group: 'LGG' },
    { key: 'midtones', label: 'Midtones (Gamma)', min: 0.5, max: 2.0, step: 0.01, group: 'LGG' },
    { key: 'highlights', label: 'Highlights (Gain)', min: 0.5, max: 1.5, step: 0.01, group: 'LGG' },
    { key: 'saturation', label: 'Global Sat.', min: 0, max: 2.5, step: 0.01, group: 'COLOR' },
    { key: 'tint_r', label: 'R-Balance', min: 0.5, max: 1.5, step: 0.01, group: 'COLOR' },
    { key: 'tint_g', label: 'G-Balance', min: 0.5, max: 1.5, step: 0.01, group: 'COLOR' },
    { key: 'tint_b', label: 'B-Balance', min: 0.5, max: 1.5, step: 0.01, group: 'COLOR' },
    { key: 'bloom', label: 'Optical Bloom', min: 0, max: 0.8, step: 0.01, group: 'LENS' },
    { key: 'halation', label: 'Film Halation', min: 0, max: 0.5, step: 0.01, group: 'LENS' },
    { key: 'vignette', label: 'Edge Vignette', min: 0, max: 1, step: 0.01, group: 'LENS' },
    { key: 'blur', label: 'Haze', min: 0, max: 8, step: 0.1, group: 'LENS' },
    { key: 'brightness', label: 'Exposure', min: 0.5, max: 1.8, step: 0.01, group: 'OPTICAL' },
    { key: 'contrast', label: 'Contrast', min: 0.5, max: 1.8, step: 0.01, group: 'OPTICAL' },
    { key: 'sepia', label: 'Sepia / Aging', min: 0, max: 1, step: 0.01, group: 'OPTICAL' },
    { key: 'grayscale', label: 'Tonal Value', min: 0, max: 1, step: 0.01, group: 'OPTICAL' },
  ];

  const favoriteNodes = vault.filter(item => item.isFavorite);

  return (
    <div className="h-full flex flex-col bg-[#050505] overflow-hidden min-h-full safe-area-inset-bottom">
      
      <svg className="hidden">
        <filter id={`pro-grading-${selectedNode?.shortId || 'global'}`}>
            <feComponentTransfer>
                <feFuncR type="gamma" exponent={1/grading.midtones} amplitude={grading.highlights} offset={grading.shadows} />
                <feFuncG type="gamma" exponent={1/grading.midtones} amplitude={grading.highlights} offset={grading.shadows} />
                <feFuncB type="gamma" exponent={1/grading.midtones} amplitude={grading.highlights} offset={grading.shadows} />
            </feComponentTransfer>
        </filter>
      </svg>

      {/* Preview Section */}
      <div className="flex-1 min-h-[40vh] bg-black flex flex-col items-center justify-center relative p-2 md:p-12 border-b border-white/5 overflow-hidden">
        {!selectedNode ? (
          <div className="text-center opacity-20">
            <svg className="w-10 h-10 mx-auto text-zinc-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20" strokeWidth={1}/></svg>
            <p className="text-[7px] uppercase font-black tracking-widest text-zinc-400">Target Node Required</p>
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div 
              ref={containerRef}
              className="relative group max-w-full max-h-full cursor-ew-resize select-none overflow-hidden rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5"
              onMouseMove={(e) => isResizing && handleSliderMove(e)}
              onMouseDown={() => setIsResizing(true)}
              onMouseUp={() => setIsResizing(false)}
              onMouseLeave={() => setIsResizing(false)}
              onTouchMove={(e) => handleSliderMove(e)}
            >
              <img src={selectedNode.originalImageUrl || selectedNode.imageUrl} className="max-w-full max-h-[46vh] md:max-h-[70vh] w-auto h-auto block" alt="Raw" />
              <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                <div className="relative w-full h-full">
                    <img 
                      src={selectedNode.originalImageUrl || selectedNode.imageUrl} 
                      className="max-w-none max-h-[46vh] md:max-h-[70vh] w-auto h-auto block" 
                      style={{ filter: grading.css_filter_string, width: containerRef.current?.clientWidth, height: containerRef.current?.clientHeight }} 
                      alt="Master" 
                    />
                    <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20" style={{ background: `radial-gradient(circle, white 0%, transparent 70%)`, opacity: grading.bloom * 0.4, filter: 'blur(20px)' }} />
                    <div className="absolute inset-0 pointer-events-none mix-blend-multiply" style={{ backgroundColor: `rgb(${grading.tint_r * 255}, ${grading.tint_g * 255}, ${grading.tint_b * 255})`, opacity: 0.25 }} />
                    <div className="absolute inset-0 transition-opacity pointer-events-none" style={{ opacity: grading.vignette, background: 'radial-gradient(circle, transparent 20%, black 140%)' }} />
                </div>
              </div>
              <div className="absolute inset-y-0 w-[1px] bg-white/40 backdrop-blur-md z-50 pointer-events-none" style={{ left: `${sliderPosition}%` }} />
            </div>

            {/* Compact Action Bar */}
            <div className="flex gap-2 mt-3 z-50">
               <button onClick={handleCommit} disabled={isSaving} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3}/></svg>
                 Commit
               </button>
               <button onClick={handleDownload} className="px-3 py-2 bg-zinc-100 text-black rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2}/></svg>
                 Export
               </button>
               <button onClick={() => setGrading(INITIAL_GRADING)} className="px-2 py-2 bg-zinc-900 border border-white/5 text-zinc-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:text-white transition-all">
                 Reset
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls Area */}
      <div className="bg-[#0b0b0d] border-t border-white/5 flex flex-col h-auto">
        <div className="flex justify-around border-b border-white/5 py-1 bg-black/40">
           {categories.map((cat) => (
             <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex flex-col items-center p-2 transition-all flex-1 ${activeCategory === cat.id ? 'text-indigo-400' : 'text-zinc-600'}`}>
                {cat.icon}
                <span className="text-[7px] font-black uppercase mt-1 tracking-tighter">{cat.label}</span>
                {activeCategory === cat.id && <div className="w-4 h-0.5 bg-indigo-400 mt-1 rounded-full" />}
             </button>
           ))}
        </div>

        <div className="p-3 md:p-6 space-y-3 overflow-y-auto max-h-[30vh] custom-scrollbar">
           {activeCategory === 'FILM' ? (
             <div className="space-y-4">
                {/* Save LUT Section */}
                <div className="flex gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
                   <input type="text" value={newLutName} onChange={(e) => setNewLutName(e.target.value.toUpperCase())} placeholder="NEW PRESET NAME..." className="flex-1 bg-transparent text-[8px] mono text-white outline-none font-black px-2" />
                   <button onClick={handleSaveLut} disabled={!newLutName.trim()} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[7px] font-black uppercase tracking-widest active:scale-95">Save</button>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-4">
                   <div className="col-span-2 text-[7px] font-black text-zinc-600 uppercase tracking-widest px-1">Industry Emulations</div>
                   {FILM_STOCKS.map((stock) => (
                     <button key={stock.name} onClick={() => applyPreset(stock)} className={`relative h-11 rounded-lg border transition-all overflow-hidden flex flex-col items-center justify-center ${grading.preset_name === stock.name ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-zinc-900/40'}`}>
                        <span className={`text-[8px] font-black uppercase tracking-widest relative z-10 ${grading.preset_name === stock.name ? 'text-white' : 'text-zinc-500'}`}>{stock.name}</span>
                     </button>
                   ))}
                   
                   {customLuts.length > 0 && (
                     <>
                        <div className="col-span-2 text-[7px] font-black text-zinc-600 uppercase tracking-widest px-1 mt-2">Vault Presets</div>
                        {customLuts.map((lut, idx) => (
                          <div key={idx} className="relative group">
                            <button onClick={() => applyPreset(lut)} className={`w-full h-11 rounded-lg border transition-all overflow-hidden flex flex-col items-center justify-center ${grading.preset_name === lut.name ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-zinc-900/40'}`}>
                               <span className={`text-[8px] font-black uppercase tracking-widest relative z-10 ${grading.preset_name === lut.name ? 'text-white' : 'text-zinc-500'}`}>{lut.name}</span>
                            </button>
                            <button onClick={() => handleRemoveLut(lut.name)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg></button>
                          </div>
                        ))}
                     </>
                   )}
                </div>
             </div>
           ) : (
             <div className="space-y-4 pb-4">
                {controls.filter(c => c.group === activeCategory).map((ctrl) => (
                   <div key={ctrl.key} className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{ctrl.label}</span>
                        <span className="text-[8px] mono text-indigo-400 font-bold">{(grading as any)[ctrl.key].toFixed(3)}</span>
                      </div>
                      <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={(grading as any)[ctrl.key]} onChange={(e) => updateParam(ctrl.key as any, parseFloat(e.target.value))} className="w-full h-1 bg-zinc-900 rounded-full appearance-none accent-indigo-500 cursor-pointer" />
                   </div>
                ))}
             </div>
           )}
        </div>

        {/* Injection Queue */}
        <div className="p-2 bg-black border-t border-white/5">
           <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar scroll-smooth">
              {favoriteNodes.map(item => (
                <button key={item.id} onClick={() => setSelectedNode(item)} className={`flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden border transition-all ${selectedNode?.id === item.id ? 'border-indigo-500 scale-105 shadow-lg' : 'border-white/10 opacity-40 hover:opacity-100'}`}>
                   <img src={item.imageUrl} className="w-full h-full object-cover" alt="T" />
                </button>
              ))}
              {favoriteNodes.length === 0 && <div className="w-full py-2 flex items-center justify-center opacity-10"><p className="text-[7px] text-zinc-500 uppercase tracking-widest">Mark favorites in Vault to inject</p></div>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default GradingLab;
