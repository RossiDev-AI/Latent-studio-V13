
import React from 'react';
import { VaultItem, LatentGrading } from '../../types';

interface GradingPreviewProps {
  selectedNode: VaultItem | null;
  grading: LatentGrading;
  sliderPosition: number;
  isResizing: boolean;
  onSliderMove: (e: React.MouseEvent | React.TouchEvent) => void;
  onStartResizing: () => void;
  onStopResizing: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const GradingPreview: React.FC<GradingPreviewProps> = ({
  selectedNode, grading, sliderPosition, isResizing, onSliderMove, onStartResizing, onStopResizing, containerRef
}) => {
  if (!selectedNode) {
    return (
      <div className="flex-1 min-h-[40vh] bg-black flex flex-col items-center justify-center border-b border-white/5 opacity-20">
        <svg className="w-10 h-10 mx-auto text-zinc-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20" strokeWidth={1}/></svg>
        <p className="text-[7px] uppercase font-black tracking-widest text-zinc-400">Target Node Required</p>
      </div>
    );
  }

  const imageUrl = selectedNode.originalImageUrl || selectedNode.imageUrl;

  return (
    <div className="flex-1 min-h-[40vh] bg-black flex flex-col items-center justify-center relative p-2 md:p-12 border-b border-white/5 overflow-hidden">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <div 
          ref={containerRef}
          className="relative group max-w-full max-h-full cursor-ew-resize select-none overflow-hidden rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5"
          onMouseMove={(e) => isResizing && onSliderMove(e)}
          onMouseDown={onStartResizing}
          onMouseUp={onStopResizing}
          onMouseLeave={onStopResizing}
          onTouchMove={(e) => onSliderMove(e)}
        >
          <img src={imageUrl} className="max-w-full max-h-[46vh] md:max-h-[70vh] w-auto h-auto block" alt="Raw" />
          
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
            <div className="relative w-full h-full">
                <img 
                  src={imageUrl} 
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
      </div>
    </div>
  );
};

export default GradingPreview;
