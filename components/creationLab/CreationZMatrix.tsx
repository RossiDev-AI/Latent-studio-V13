
import React from 'react';

interface CreationZMatrixProps {
  zAnatomy: number;
  setZAnatomy: (v: number) => void;
  zStructure: number;
  setZStructure: (v: number) => void;
  zLighting: number;
  setZLighting: (v: number) => void;
  zTexture: number;
  setZTexture: (v: number) => void;
}

const CreationZMatrix: React.FC<CreationZMatrixProps> = ({ 
  zAnatomy, setZAnatomy, zStructure, setZStructure, zLighting, setZLighting, zTexture, setZTexture 
}) => {
  return (
    <div className="bg-zinc-950 border border-white/5 p-8 rounded-[3rem] space-y-6 shadow-2xl relative">
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Latent Z-Matrix Regulation</label>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-black text-zinc-600 uppercase">Immutability Lock</span>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] mono font-bold text-pink-400"><span>Z_ANATOMY (DNA)</span> <span>{Math.round(zAnatomy * 100)}%</span></div>
          <input type="range" min="0" max="1.5" step="0.01" value={zAnatomy} onChange={(e) => setZAnatomy(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-pink-500" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] mono font-bold text-indigo-400"><span>Z_STRUCTURE (Geom)</span> <span>{Math.round(zStructure * 100)}%</span></div>
          <input type="range" min="0" max="1.5" step="0.01" value={zStructure} onChange={(e) => setZStructure(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-indigo-500" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] mono font-bold text-amber-400"><span>Z_LIGHTING (Rad)</span> <span>{Math.round(zLighting * 100)}%</span></div>
          <input type="range" min="0" max="1" step="0.01" value={zLighting} onChange={(e) => setZLighting(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-amber-500" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] mono font-bold text-emerald-400"><span>Z_TEXTURE (Pores)</span> <span>{Math.round(zTexture * 100)}%</span></div>
          <input type="range" min="0" max="1" step="0.01" value={zTexture} onChange={(e) => setZTexture(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-emerald-500" />
        </div>
      </div>
    </div>
  );
};

export default CreationZMatrix;
