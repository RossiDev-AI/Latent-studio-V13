
import React, { useState, useRef, useEffect } from 'react';
import { TimelineBeat, CinemaProject, AgentStatus, VaultItem, SubtitleSettings, AppSettings } from '../types';
import { scriptToTimeline, scoutMediaForBeat, generateImageForBeat, matchVaultForBeat, getGlobalVisualPrompt } from '../geminiService';
import CinemaPreview from './cinemaLab/CinemaPreview';
import CinemaTimeline from './cinemaLab/CinemaTimeline';
import CinemaControls from './cinemaLab/CinemaControls';
import CinemaAssetModal from './cinemaLab/CinemaAssetModal';
import CinemaVaultModal from './cinemaLab/CinemaVaultModal';

interface CinemaLabProps {
  vault: VaultItem[];
  onSave: (item: VaultItem) => Promise<void>;
  currentSourceImage?: string | null;
  project: CinemaProject;
  setProject: React.Dispatch<React.SetStateAction<CinemaProject>>;
  script: string;
  setScript: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  credits: string;
  setCredits: (val: string) => void;
  logs: AgentStatus[];
  setLogs: React.Dispatch<React.SetStateAction<AgentStatus[]>>;
  activeBeatIndex: number;
  setActiveBeatIndex: (idx: number) => void;
  onReset: () => void;
  settings?: AppSettings;
}

const proHtmlToText = (html: string): string => {
  if (!html) return "";
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '');
  return text.trim();
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const sections = text.split('\n');
  const lines: string[] = [];
  sections.forEach(section => {
    const words = section.split(' ');
    let currentLine = '';
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
  });
  return lines;
};

const CinemaLab: React.FC<CinemaLabProps> = (props) => {
  const [globalDuration, setGlobalDuration] = useState(5);
  const [fidelityMode, setFidelityMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatus, setRenderStatus] = useState('');
  const [showAssetOrchestrator, setShowAssetOrchestrator] = useState<number | null>(null);
  const [showVaultGallery, setShowVaultGallery] = useState(false);
  const [exportRes, setExportRes] = useState('1080p');
  const [loadingBeats, setLoadingBeats] = useState<Record<string, boolean>>({});
  
  const currentBeat = props.project.beats[props.activeBeatIndex];
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.project.beats.length > 0) {
      props.setProject(prev => ({
        ...prev,
        beats: prev.beats.map(beat => ({ ...beat, duration: globalDuration }))
      }));
    }
  }, [globalDuration]);

  const handleUpdateSubtitle = (key: keyof SubtitleSettings, val: any) => {
    props.setProject(prev => ({
      ...prev,
      subtitleSettings: { ...prev.subtitleSettings!, [key]: val }
    }));
  };

  const handleAnalyzeScript = async () => {
    const plainScript = proHtmlToText(props.script);
    if (!plainScript.trim()) return;
    setIsGenerating(true);
    props.setLogs([{ type: 'Script Analyzer', status: 'processing', message: `Iniciando orquestração narrativa...`, timestamp: Date.now() }]);
    try {
      let beats = await scriptToTimeline(plainScript, 30, fidelityMode, props.settings);
      if (proHtmlToText(props.title).trim()) {
        const globalScout = await getGlobalVisualPrompt(plainScript, props.settings);
        beats = [{ id: 'title-' + crypto.randomUUID(), timestamp: Date.now(), duration: globalDuration, assetUrl: null, caption: props.title, assetType: 'IMAGE', scoutQuery: globalScout, yOffset: 0 }, ...beats];
      }
      beats.push({ id: 'credits-' + crypto.randomUUID(), timestamp: Date.now(), duration: globalDuration, assetUrl: null, caption: props.credits, assetType: 'IMAGE', scoutQuery: 'Cinema credits background', yOffset: 0 });
      props.setProject(prev => ({ ...prev, beats: beats.map(b => ({ ...b, duration: globalDuration, yOffset: 0 })) }));
      props.setLogs(prev => [...prev, { type: 'Director', status: 'completed', message: 'Timeline gerada.', timestamp: Date.now() }]);
    } catch (e) { props.setLogs(prev => [...prev, { type: 'Director', status: 'error', message: 'Falha na orquestração.', timestamp: Date.now() }]); }
    finally { setIsGenerating(false); }
  };

  const handleAssetAction = async (index: number, mode: string, provider?: any, forcedVaultItem?: VaultItem) => {
    const beat = props.project.beats[index];
    if (!beat) return;
    setLoadingBeats(prev => ({ ...prev, [beat.id]: true }));
    try {
      let assetUrl: string | null = null;
      let sourceLink = "";
      if (mode === 'SCOUT') {
        const res = await scoutMediaForBeat(beat.scoutQuery || '', proHtmlToText(beat.caption), props.settings, provider);
        assetUrl = res.assetUrl; sourceLink = res.source;
      } else if (mode === 'AI') {
        assetUrl = await generateImageForBeat(proHtmlToText(beat.caption), beat.scoutQuery || '', props.settings);
      } else if (mode === 'VAULT_AUTO') {
        const match = await matchVaultForBeat(proHtmlToText(beat.caption), props.vault, props.settings);
        if (match) assetUrl = match.imageUrl;
      } else if (mode === 'VAULT_MANUAL' && forcedVaultItem) {
        assetUrl = forcedVaultItem.imageUrl;
      } else if (mode === 'UPLOAD') {
        fileInputRef.current?.click();
        return;
      }
      props.setProject(prev => {
        const updated = [...prev.beats];
        updated[index] = { ...updated[index], assetUrl, assetType: 'IMAGE', sourceLink };
        return { ...prev, beats: updated };
      });
    } catch (e) { console.error(e); }
    finally { setLoadingBeats(prev => ({ ...prev, [beat.id]: false })); }
  };

  const handleBatchGenerate = async (mode: 'SCOUT' | 'AI') => {
    setIsGenerating(true);
    for (let i = 0; i < props.project.beats.length; i++) {
      if (props.project.beats[i].id.startsWith('credits') || props.project.beats[i].id.startsWith('title')) continue;
      await handleAssetAction(i, mode);
    }
    setIsGenerating(false);
  };

  const handleLocalRender = async () => {
    if (props.project.beats.length === 0) return;
    const canvas = renderCanvasRef.current;
    if (!canvas) return;
    setIsRendering(true); setRenderProgress(0); setRenderStatus('Motor de Renderização Iniciado...');
    try {
      const subs = props.project.subtitleSettings!;
      let width = 1920, height = 1080;
      if (exportRes === '4K') { width = 3840; height = 2160; }
      else if (exportRes === '2K') { width = 2560; height = 1440; }
      if (props.project.aspectRatio === '9:16') { [width, height] = [height, width]; }
      else if (props.project.aspectRatio === '1:1') { width = height; }
      canvas.width = width; canvas.height = height;
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm', videoBitsPerSecond: 40000000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      const finishPromise = new Promise<void>((res) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `Cinema_Master.webm`; a.click(); res();
        };
      });
      recorder.start();
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;
      for (let i = 0; i < props.project.beats.length; i++) {
        const beat = props.project.beats[i];
        const image = new Image(); image.crossOrigin = "anonymous";
        if (beat.assetUrl) {
          await new Promise(r => { image.src = beat.assetUrl!; image.onload = r; image.onerror = r; });
        }
        const frames = (beat.duration || globalDuration) * 30;
        for (let f = 0; f < frames; f++) {
          const fp = f / frames;
          setRenderProgress(Math.round(((i / props.project.beats.length) + (fp / props.project.beats.length)) * 100));
          ctx.fillStyle = "black"; ctx.fillRect(0, 0, width, height);
          if (image.src) {
            const scale = 1 + (fp * 0.12);
            const baseScale = Math.max(width / image.width, height / image.height);
            const finalScale = baseScale * scale;
            const dW = image.width * finalScale; const dH = image.height * finalScale;
            ctx.drawImage(image, (width - dW) / 2, (beat.yOffset || 0) * (height / 100), dW, dH);
          }
          const scaleFactor = width / 800;
          const adjFS = Math.max(Math.round(subs.fontSize * scaleFactor), 40);
          ctx.font = `600 ${adjFS}px ${subs.fontFamily}`; ctx.textAlign = 'center'; ctx.textBaseline = "middle";
          const wrapped = wrapText(ctx, proHtmlToText(beat.caption), width - (adjFS * subs.marginMult * 2));
          const lineH = adjFS * 1.4; const bH = (wrapped.length * lineH) + (adjFS * subs.paddingVMult * 2);
          const bY = height - (height * 0.15) - bH;
          let maxW = 0; wrapped.forEach(l => { const w = ctx.measureText(l).width; if (w > maxW) maxW = w; });
          const bW = maxW + (adjFS * subs.paddingHMult * 2); const bX = (width - bW) / 2;
          ctx.fillStyle = subs.backgroundColor; ctx.globalAlpha = subs.bgOpacity;
          ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, Math.round(adjFS * subs.radiusMult)); ctx.fill();
          ctx.globalAlpha = 1.0; ctx.fillStyle = subs.fontColor;
          wrapped.forEach((l, idx) => ctx.fillText(l, width/2, bY + (adjFS * subs.paddingVMult) + (idx * lineH) + (adjFS * 0.5)));
          await new Promise(requestAnimationFrame);
        }
      }
      recorder.stop(); await finishPromise;
    } catch (e) { console.error(e); }
    finally { setIsRendering(false); }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] overflow-hidden min-h-full">
      <canvas ref={renderCanvasRef} className="fixed -left-[10000px] pointer-events-none" />
      <div className="flex-1 flex flex-col lg:flex-row relative">
        <div className="flex-1 bg-black flex flex-col relative border-r border-white/5 overflow-hidden">
          <CinemaPreview 
            currentBeat={currentBeat} 
            aspectRatio={props.project.aspectRatio} 
            subtitleSettings={props.project.subtitleSettings!} 
            title={props.title} 
            credits={props.credits} 
            isRendering={isRendering} 
            renderProgress={renderProgress} 
            renderStatus={renderStatus} 
          />
          <CinemaTimeline 
            beats={props.project.beats} 
            activeIndex={props.activeBeatIndex} 
            onSelect={props.setActiveBeatIndex} 
            onOpenOrchestrator={setShowAssetOrchestrator} 
            loadingBeats={loadingBeats} 
          />
        </div>
        <CinemaControls 
          {...props} 
          aspectRatio={props.project.aspectRatio}
          setAspectRatio={(val) => props.setProject(prev => ({ ...prev, aspectRatio: val }))}
          exportRes={exportRes} setExportRes={setExportRes} 
          globalDuration={globalDuration} setGlobalDuration={setGlobalDuration} 
          subtitleSettings={props.project.subtitleSettings!} 
          onUpdateSubtitle={handleUpdateSubtitle} 
          fidelityMode={fidelityMode} setFidelityMode={setFidelityMode} 
          isGenerating={isGenerating} isRendering={isRendering} 
          onAnalyze={handleAnalyzeScript} onRender={handleLocalRender} 
          onBatch={handleBatchGenerate} 
        />
      </div>

      {showAssetOrchestrator !== null && (
        <CinemaAssetModal 
          beat={props.project.beats[showAssetOrchestrator]} 
          index={showAssetOrchestrator} 
          onClose={() => setShowAssetOrchestrator(null)} 
          onUpdateCaption={(val) => {
            const updated = [...props.project.beats];
            updated[showAssetOrchestrator] = { ...updated[showAssetOrchestrator], caption: val };
            props.setProject(prev => ({ ...prev, beats: updated }));
          }}
          onUpdateYOffset={(val) => {
            const updated = [...props.project.beats];
            updated[showAssetOrchestrator] = { ...updated[showAssetOrchestrator], yOffset: val };
            props.setProject(prev => ({ ...prev, beats: updated }));
          }}
          onAction={(mode, provider) => handleAssetAction(showAssetOrchestrator, mode, provider)}
          onOpenVault={() => setShowVaultGallery(true)}
        />
      )}

      {showVaultGallery && (
        <CinemaVaultModal 
          items={props.vault} 
          onClose={() => setShowVaultGallery(false)} 
          onSelect={(item) => {
            handleAssetAction(showAssetOrchestrator || 0, 'VAULT_MANUAL', undefined, item);
            setShowVaultGallery(false); setShowAssetOrchestrator(null);
          }} 
        />
      )}

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const res = ev.target?.result as string;
            const idx = showAssetOrchestrator ?? props.activeBeatIndex;
            const updated = [...props.project.beats];
            updated[idx] = { ...updated[idx], assetUrl: res, assetType: 'UPLOAD' };
            props.setProject(prev => ({ ...prev, beats: updated }));
            setShowAssetOrchestrator(null);
          };
          reader.readAsDataURL(file);
        }
      }} />

      <style>{`
        @keyframes ken-burns { from { transform: scale(1) translateY(var(--tw-translate-y, 0)); } to { transform: scale(1.15) translate(1%, 1%) translateY(var(--tw-translate-y, 0)); } }
        .animate-ken-burns { animation: ken-burns 15s ease-in-out infinite alternate; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        [contenteditable]:empty:before { content: attr(placeholder); color: #444; }
      `}</style>
    </div>
  );
};

export default CinemaLab;
