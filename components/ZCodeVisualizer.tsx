
import React, { useState, useCallback, useRef } from 'react';
import { LatentParams } from '../types';

interface ZCodeVisualizerProps {
  params: LatentParams;
  onParamChange?: (key: keyof LatentParams, value: number) => void;
}

const ZCodeVisualizer: React.FC<ZCodeVisualizerProps> = ({ params, onParamChange }) => {
  const { z_anatomy = 1.0, z_structure = 1.0, z_lighting = 0.5, z_texture = 0.5 } = params;
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const startY = useRef<number>(0);
  const startVal = useRef<number>(0);

  const handleStart = (e: React.MouseEvent | React.TouchEvent, layer: string, currentVal: number) => {
    e.preventDefault();
    setActiveLayer(layer);
    startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startVal.current = currentVal;
    document.body.style.userSelect = 'none';
  };

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!activeLayer || !onParamChange) return;

    const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = startY.current - currentY;
    const sensitivity = 0.005;
    
    let newVal = startVal.current + (deltaY * sensitivity);
    const maxVal = (activeLayer === 'z_structure' || activeLayer === 'z_anatomy') ? 1.5 : 1.0;
    newVal = Math.min(Math.max(newVal, 0), maxVal);

    onParamChange(activeLayer as keyof LatentParams, newVal);
  }, [activeLayer, onParamChange]);

  const handleEnd = useCallback(() => {
    setActiveLayer(null);
    document.body.style.userSelect = '';
  }, []);

  React.useEffect(() => {
    if (activeLayer) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [activeLayer, handleMove, handleEnd]);

  return (
    <div className="relative w-full aspect-video md:aspect-[21/9] flex items-center justify-center overflow-hidden bg-black/40 rounded-3xl border border-white/5 mb-8 group cursor-default">
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/40 rounded-full text-[8px] mono text-indigo-300 font-black uppercase tracking-[0.3em] transition-opacity duration-500 z-50 pointer-events-none ${activeLayer ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {activeLayer ? `Modulating ${activeLayer.replace('z_', '').toUpperCase()}...` : 'Drag layers vertically to modulate studio weights'}
      </div>

      <div className="relative w-full h-full perspective-[1200px] flex items-center justify-center">
        <div className={`relative transform-gpu transition-transform duration-1000 ease-out rotate-x-[60deg] rotate-z-[-25deg] scale-75 md:scale-90 ${activeLayer ? '' : 'group-hover:rotate-x-[55deg] group-hover:rotate-z-[-20deg]'}`}>
          
          {/* Z_ANATOMY (Deep Foundational Layer) */}
          <div 
            onMouseDown={(e) => handleStart(e, 'z_anatomy', z_anatomy)}
            onTouchStart={(e) => handleStart(e, 'z_anatomy', z_anatomy)}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[220px] border-2 backdrop-blur-sm transition-all duration-300 cursor-ns-resize ${activeLayer === 'z_anatomy' ? 'border-pink-400 bg-pink-500/30 scale-105 shadow-[0_0_50px_rgba(236,72,153,0.2)]' : 'border-pink-500/40 bg-pink-500/10 hover:border-pink-400/60'}`}
            style={{ 
              transform: `translate3d(-50%, -50%, -40px)`,
              opacity: 0.2 + (z_anatomy * 0.4)
            }}
          >
            <div className="absolute -top-6 -left-6 text-[8px] mono font-black uppercase tracking-widest transition-colors text-pink-400">
              Z_ANATOMY [Pose/DNA]
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] font-black text-pink-400/20 select-none">BONE</div>
          </div>

          {/* Z_STRUCTURE */}
          <div 
            onMouseDown={(e) => handleStart(e, 'z_structure', z_structure)}
            onTouchStart={(e) => handleStart(e, 'z_structure', z_structure)}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] border-2 backdrop-blur-sm transition-all duration-300 cursor-ns-resize ${activeLayer === 'z_structure' ? 'border-indigo-400 bg-indigo-500/30 scale-105 shadow-[0_0_50px_rgba(99,102,241,0.2)]' : 'border-indigo-500/40 bg-indigo-500/10 hover:border-indigo-400/60'}`}
            style={{ 
              transform: `translate3d(-50%, -50%, 20px)`,
              opacity: 0.2 + (z_structure * 0.5)
            }}
          >
            <div className={`absolute -top-6 -left-6 text-[8px] mono font-black uppercase tracking-widest transition-colors text-indigo-400`}>
              Z_STRUCTURE [Geometry]
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] font-black text-indigo-400/20 select-none">GEOM</div>
          </div>

          {/* Z_LIGHTING */}
          <div 
            onMouseDown={(e) => handleStart(e, 'z_lighting', z_lighting)}
            onTouchStart={(e) => handleStart(e, 'z_lighting', z_lighting)}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[180px] border-2 backdrop-blur-sm transition-all duration-300 cursor-ns-resize ${activeLayer === 'z_lighting' ? 'border-amber-400 bg-amber-500/30 scale-105 shadow-[0_0_50px_rgba(245,158,11,0.2)]' : 'border-amber-500/40 bg-amber-500/10 hover:border-amber-400/60'}`}
            style={{ 
              transform: `translate3d(-50%, -50%, 80px)`,
              opacity: 0.1 + (z_lighting * 0.6)
            }}
          >
             <div className={`absolute -top-6 -left-6 text-[8px] mono font-black uppercase tracking-widest transition-colors text-amber-400`}>
              Z_LIGHTING [Photons]
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] font-black text-amber-400/20 select-none">RAD</div>
          </div>

          {/* Z_TEXTURE */}
          <div 
            onMouseDown={(e) => handleStart(e, 'z_texture', z_texture)}
            onTouchStart={(e) => handleStart(e, 'z_texture', z_texture)}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[160px] border-2 backdrop-blur-sm transition-all duration-300 cursor-ns-resize ${activeLayer === 'z_texture' ? 'border-emerald-400 bg-emerald-500/30 scale-105 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : 'border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400/60'}`}
            style={{ 
              transform: `translate3d(-50%, -50%, 140px)`,
              opacity: 0.1 + (z_texture * 0.7)
            }}
          >
            <div className={`absolute -top-6 -left-6 text-[8px] mono font-black uppercase tracking-widest transition-colors text-emerald-400`}>
              Z_TEXTURE [Pores]
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] font-black text-emerald-400/20 select-none">TEX</div>
          </div>
        </div>

        {/* Dynamic Frequency Bars */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 space-y-4 opacity-50 group-hover:opacity-100 transition-opacity">
           <div className={`w-1 transition-all duration-300 ${activeLayer === 'z_anatomy' ? 'h-16' : 'h-12'} bg-white/5 rounded-full overflow-hidden`}>
              <div className="w-full bg-pink-500 transition-all" style={{ height: `${(z_anatomy / 1.5) * 100}%` }} />
           </div>
           <div className={`w-1 transition-all duration-300 ${activeLayer === 'z_structure' ? 'h-16' : 'h-12'} bg-white/5 rounded-full overflow-hidden`}>
              <div className="w-full bg-indigo-500 transition-all" style={{ height: `${(z_structure / 1.5) * 100}%` }} />
           </div>
           <div className={`w-1 transition-all duration-300 ${activeLayer === 'z_lighting' ? 'h-16' : 'h-12'} bg-white/5 rounded-full overflow-hidden`}>
              <div className="w-full bg-amber-500 transition-all" style={{ height: `${z_lighting * 100}%` }} />
           </div>
           <div className={`w-1 transition-all duration-300 ${activeLayer === 'z_texture' ? 'h-16' : 'h-12'} bg-white/5 rounded-full overflow-hidden`}>
              <div className="w-full bg-emerald-500 transition-all" style={{ height: `${z_texture * 100}%` }} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default ZCodeVisualizer;
