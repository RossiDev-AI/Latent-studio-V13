
import React, { useState, useEffect, useRef } from 'react';
import { VaultItem, LatentGrading } from '../types';

// Subcomponents
import GradingPreview from './gradingLab/GradingPreview';
import GradingToolbar from './gradingLab/GradingToolbar';
import GradingNavigation from './gradingLab/GradingNavigation';
import GradingControls from './gradingLab/GradingControls';
import GradingQueue from './gradingLab/GradingQueue';

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
    try {
      const url = await bakeImage();
      const link = document.createElement('a');
      link.href = url;
      link.download = `LCP_MASTER_${selectedNode.shortId}_${grading.preset_name}.png`;
      link.click();
    } catch (e) { console.error(e); }
  };

  const handleCommit = async () => {
    if (!selectedNode || isSaving) return;
    setIsSaving(true);
    try {
      const bakedImageUrl = await bakeImage();
      const updatedNode = { ...selectedNode, imageUrl: bakedImageUrl, grading };
      await onSave(updatedNode);
      window.alert("Grade committed to node.");
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

      <GradingPreview 
        selectedNode={selectedNode} 
        grading={grading} 
        sliderPosition={sliderPosition} 
        isResizing={isResizing} 
        onSliderMove={handleSliderMove} 
        onStartResizing={() => setIsResizing(true)} 
        onStopResizing={() => setIsResizing(false)} 
        containerRef={containerRef} 
      />

      <GradingToolbar 
        onCommit={handleCommit} 
        onDownload={handleDownload} 
        onReset={() => setGrading(INITIAL_GRADING)} 
        isSaving={isSaving} 
        disabled={!selectedNode} 
      />

      <div className="bg-[#0b0b0d] border-t border-white/5 flex flex-col h-auto">
        <GradingNavigation 
          categories={categories} 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
        />

        <GradingControls 
          activeCategory={activeCategory} 
          grading={grading} 
          updateParam={updateParam} 
          applyPreset={applyPreset} 
          filmStocks={FILM_STOCKS} 
          customLuts={customLuts} 
          handleSaveLut={handleSaveLut} 
          handleRemoveLut={handleRemoveLut} 
          newLutName={newLutName} 
          setNewLutName={setNewLutName} 
          controls={controls} 
        />

        <GradingQueue 
          favoriteNodes={vault.filter(item => item.isFavorite)} 
          selectedNodeId={selectedNode?.id} 
          onSelectNode={setSelectedNode} 
        />
      </div>
    </div>
  );
};

export default GradingLab;
