
import React, { useState, useRef, useEffect } from 'react';
import { TimelineBeat, CinemaProject, AgentStatus, VaultItem, SubtitleSettings } from '../types';
import { scriptToTimeline, scoutMediaForBeat, generateImageForBeat, matchVaultForBeat, getGlobalVisualPrompt } from '../geminiService';
import AgentFeed from './AgentFeed';

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
}

type ExportResolution = '1080p' | '2K' | '4K';

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

const CinemaLab: React.FC<CinemaLabProps> = ({ 
  vault, onSave, project, setProject, script, setScript, 
  title, setTitle, credits, setCredits, logs, setLogs, 
  activeBeatIndex, setActiveBeatIndex, onReset 
}) => {
  const [globalDuration, setGlobalDuration] = useState(5);
  const [wordCountPref, setWordCountPref] = useState(30); 
  const [fidelityMode, setFidelityMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatus, setRenderStatus] = useState('');
  const [showAssetOrchestrator, setShowAssetOrchestrator] = useState<number | null>(null);
  const [showVaultGallery, setShowVaultGallery] = useState(false);
  const [exportRes, setExportRes] = useState<ExportResolution>('1080p');
  const [loadingBeats, setLoadingBeats] = useState<Record<string, boolean>>({});
  
  const currentBeat = project.beats[activeBeatIndex];
  const subs = project.subtitleSettings!;

  const updateBeatCaption = (val: string) => {
    setProject(prev => {
      const updated = [...prev.beats];
      if (showAssetOrchestrator !== null) {
        updated[showAssetOrchestrator] = { ...updated[showAssetOrchestrator], caption: val };
      }
      return { ...prev, beats: updated };
    });
  };

  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project.beats.length > 0) {
      setProject(prev => ({
        ...prev,
        beats: prev.beats.map(beat => ({ ...beat, duration: globalDuration }))
      }));
    }
  }, [globalDuration]);

  const handleAnalyzeScript = async () => {
    const plainScript = proHtmlToText(script);
    if (!plainScript.trim()) return;
    setIsGenerating(true);
    setLogs([{ type: 'Script Analyzer', status: 'processing', message: `Orquestrando narrativa industrial...`, timestamp: Date.now() }]);
    
    try {
      let beats = await scriptToTimeline(plainScript, wordCountPref, fidelityMode);
      
      if (proHtmlToText(title).trim()) {
        const globalScout = await getGlobalVisualPrompt(plainScript);
        const titleBeat: TimelineBeat = {
          id: 'title-' + crypto.randomUUID(),
          timestamp: Date.now(),
          duration: globalDuration,
          assetUrl: null, 
          caption: title, 
          assetType: 'IMAGE',
          scoutQuery: globalScout,
          yOffset: 0
        };
        beats = [titleBeat, ...beats];
      }

      const creditsBeat: TimelineBeat = {
        id: 'credits-' + crypto.randomUUID(),
        timestamp: Date.now(),
        duration: globalDuration,
        assetUrl: null, 
        caption: credits,
        assetType: 'IMAGE',
        scoutQuery: 'Cinema credits on dark background',
        yOffset: 0
      };
      beats = [...beats, creditsBeat];

      setProject(prev => ({ 
        ...prev, 
        beats: beats.map(b => ({ ...b, duration: globalDuration, yOffset: 0 })) 
      }));
      setLogs(prev => [...prev, { type: 'Director', status: 'completed', message: 'Timeline gerada com sucesso.', timestamp: Date.now() }]);
    } catch (e) {
      setLogs(prev => [...prev, { type: 'Director', status: 'error', message: 'Falha na orquestração.', timestamp: Date.now() }]);
    } finally { setIsGenerating(false); }
  };

  const handleAssetAction = async (index: number, mode: 'SCOUT' | 'AI' | 'VAULT_AUTO' | 'VAULT_MANUAL' | 'UPLOAD', forcedVaultItem?: VaultItem) => {
    const beat = project.beats[index];
    if (!beat) return;
    
    setLoadingBeats(prev => ({ ...prev, [beat.id]: true }));
    
    try {
      let assetUrl: string | null = "";
      let sourceLink = "";
      
      if (mode === 'SCOUT') {
        const res = await scoutMediaForBeat(beat.scoutQuery || '', proHtmlToText(beat.caption));
        assetUrl = res.assetUrl; // Pode ser uma URL de imagem real ou null
        sourceLink = res.source; 
      } else if (mode === 'AI') {
        assetUrl = await generateImageForBeat(proHtmlToText(beat.caption), beat.scoutQuery || '');
      } else if (mode === 'VAULT_AUTO') {
        const match = await matchVaultForBeat(proHtmlToText(beat.caption), vault);
        if (match) assetUrl = match.imageUrl;
      } else if (mode === 'VAULT_MANUAL' && forcedVaultItem) {
        assetUrl = forcedVaultItem.imageUrl;
      } else if (mode === 'UPLOAD') {
        fileInputRef.current?.click();
        return;
      }

      setProject(prev => {
        const updated = [...prev.beats];
        updated[index] = { ...updated[index], assetUrl, assetType: 'IMAGE', sourceLink };
        return { ...prev, beats: updated };
      });
    } catch (e) {
      console.error(e);
    } finally { 
      setLoadingBeats(prev => ({ ...prev, [beat.id]: false }));
    }
  };

  const handleBatchGenerate = async (mode: 'SCOUT' | 'AI') => {
    if (project.beats.length === 0) return;
    setIsGenerating(true);
    for (let i = 0; i < project.beats.length; i++) {
      if (project.beats[i].id.startsWith('credits') || project.beats[i].id.startsWith('title')) continue;
      await handleAssetAction(i, mode);
    }
    setIsGenerating(false);
  };

  const handleLocalRender = async () => {
    if (project.beats.length === 0) return;
    const canvas = renderCanvasRef.current;
    if (!canvas) return;

    setIsRendering(true);
    setRenderProgress(0);
    setRenderStatus('Despertando Motor de Renderização UHD...');

    try {
      const currentSubs = project.subtitleSettings!;
      let width = 3840, height = 2160;
      if (exportRes === '2K') { width = 2560; height = 1440; }
      else if (exportRes === '1080p') { width = 1920; height = 1080; }
      
      if (project.aspectRatio === '9:16') { const t = width; width = height; height = t; }
      else if (project.aspectRatio === '1:1') { width = height; }
      
      canvas.width = width;
      canvas.height = height;

      const stream = canvas.captureStream(30); 
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm', videoBitsPerSecond: 40000000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      
      const finishPromise = new Promise<void>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Cinema_Master_${project.aspectRatio.replace(':', 'x')}.webm`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          resolve();
        };
      });

      recorder.start();
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      for (let i = 0; i < project.beats.length; i++) {
        const beat = project.beats[i];
        const isCredits = beat.id.startsWith('credits');
        const isTitle = beat.id.startsWith('title');

        let img: HTMLImageElement | null = null;
        if (beat.assetUrl) {
          img = await new Promise<HTMLImageElement>((res) => {
            const image = new Image(); image.crossOrigin = "anonymous";
            image.src = beat.assetUrl!; image.onload = () => res(image);
            image.onerror = () => res(new Image()); // Safe fallback
          });
        }

        const totalFrames = (beat.duration || globalDuration) * 30;
        for (let f = 0; f < totalFrames; f++) {
          const fp = f / totalFrames;
          setRenderProgress(Math.round(((i / project.beats.length) + (fp / project.beats.length)) * 100));
          
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (img && img.src) {
            const scale = 1 + (fp * 0.12);
            const baseScale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const finalScale = baseScale * scale;
            const drawW = img.width * finalScale;
            const drawH = img.height * finalScale;
            const drawX = (canvas.width - drawW) / 2;
            const drawY = (beat.yOffset || 0) * (height / 100);
            ctx.drawImage(img, drawX, drawY, drawW, drawH);
          }

          if (beat.sourceLink && !isCredits && !isTitle) {
            ctx.font = `400 ${Math.round(24 * (width/1920))}px monospace`;
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.textAlign = 'right';
            ctx.fillText(`Source: ${beat.sourceLink}`, canvas.width - 30, canvas.height - 30);
          }

          const scaleFactor = canvas.width / 800;
          let adjustedFS = Math.max(Math.round(currentSubs.fontSize * scaleFactor), 40);
          
          // Estilo unificado: Capa (Título) e Créditos usam fonte ajustada
          if (isCredits || isTitle) adjustedFS *= 0.85; 

          const padH = Math.round(adjustedFS * currentSubs.paddingHMult);
          const padV = Math.round(adjustedFS * currentSubs.paddingVMult);
          const margH = Math.round(adjustedFS * currentSubs.marginMult);

          ctx.font = `600 ${adjustedFS}px ${currentSubs.fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = "middle";

          const rawCaption = isTitle ? title : isCredits ? credits : beat.caption;
          const plainCaption = proHtmlToText(rawCaption);
          const wrapped = wrapText(ctx, plainCaption, canvas.width - (margH * 2) - (padH * 2));
          
          const lineH = adjustedFS * 1.4;
          const bH = (wrapped.length * lineH) + (padV * 2);
          
          // Posicionamento Central para Capa e Créditos
          const bY = (isTitle || isCredits) ? (canvas.height - bH) / 2 : canvas.height - (canvas.height * 0.15) - bH;
          
          let maxW = 0;
          wrapped.forEach(l => { const w = ctx.measureText(l).width; if (w > maxW) maxW = w; });
          const bW = maxW + (padH * 2);
          const bX = (canvas.width - bW) / 2;

          ctx.fillStyle = currentSubs.backgroundColor;
          ctx.globalAlpha = currentSubs.bgOpacity;
          ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, Math.round(adjustedFS * currentSubs.radiusMult)); ctx.fill();

          ctx.globalAlpha = 1.0;
          ctx.fillStyle = currentSubs.fontColor;
          wrapped.forEach((l, idx) => ctx.fillText(l, canvas.width/2, bY + padV + (idx * lineH) + (adjustedFS * 0.5)));

          await new Promise(requestAnimationFrame);
        }
      }
      
      recorder.stop();
      await finishPromise;
    } catch (e) {
      console.error(e);
    } finally { setIsRendering(false); }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] overflow-hidden min-h-full">
      <canvas ref={renderCanvasRef} className="fixed -left-[10000px] pointer-events-none" />

      <div className="flex-1 flex flex-col lg:flex-row relative">
        <div className="flex-1 bg-black flex flex-col relative border-r border-white/5 overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
             <div className={`relative bg-zinc-950 shadow-2xl overflow-hidden rounded-[2rem] border border-white/5 transition-all duration-700 ${project.aspectRatio === '16:9' ? 'w-full max-w-5xl aspect-video' : project.aspectRatio === '1:1' ? 'h-full max-h-[80vh] aspect-square' : 'h-full max-h-[80vh] aspect-[9/16]'}`}>
                {currentBeat ? (
                   <div className="w-full h-full relative">
                      {currentBeat.assetUrl ? (
                         <img 
                          src={currentBeat.assetUrl} 
                          className="w-full h-full object-cover origin-top animate-ken-burns" 
                          style={{ transform: `translateY(${currentBeat.yOffset || 0}%)` }}
                         />
                      ) : (
                         <div className="w-full h-full bg-zinc-900/50 flex flex-col items-center justify-center gap-4">
                            <svg className="w-12 h-12 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={1.5}/></svg>
                            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Searching Web References...</span>
                         </div>
                      )}
                      
                      {/* Box Style Unificado para Título e Créditos no Preview */}
                      <div className={`absolute left-0 right-0 px-10 flex justify-center ${currentBeat.id.startsWith('title') || currentBeat.id.startsWith('credits') ? 'inset-0 items-center' : 'bottom-[15%]'}`}>
                         <div 
                           style={{ 
                            fontSize: `${(currentBeat.id.startsWith('credits') || currentBeat.id.startsWith('title')) ? subs.fontSize * 0.85 : subs.fontSize}px`, 
                            color: subs.fontColor, 
                            backgroundColor: subs.backgroundColor, 
                            opacity: subs.bgOpacity, 
                            borderRadius: `${subs.fontSize * subs.radiusMult}px`, 
                            padding: `${subs.fontSize * subs.paddingVMult}px ${subs.fontSize * subs.paddingHMult}px`, 
                            textAlign: subs.textAlign, 
                            maxWidth: '90%', 
                            lineHeight: '1.4', 
                            fontWeight: 600, 
                            fontFamily: subs.fontFamily,
                            border: '1px solid rgba(255,255,255,0.1)',
                            whiteSpace: 'pre-wrap',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                           }}
                           dangerouslySetInnerHTML={{ __html: currentBeat.id.startsWith('title') ? title : currentBeat.id.startsWith('credits') ? credits : currentBeat.caption }}
                         />
                      </div>

                      {currentBeat.sourceLink && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                          <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                          <span className="text-[9px] text-indigo-400 mono">Web Source: {currentBeat.sourceLink}</span>
                        </div>
                      )}
                   </div>
                ) : (
                   <div className="w-full h-full flex items-center justify-center opacity-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">Execute o Protocolo de Roteiro</p>
                   </div>
                )}

                {isRendering && (
                  <div className="absolute inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in">
                      <div className="w-48 h-48 border-[12px] border-indigo-500/10 rounded-full flex items-center justify-center relative">
                         <div className="absolute inset-0 border-[12px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                         <span className="text-4xl font-black text-white mono">{renderProgress}%</span>
                      </div>
                      <h4 className="mt-8 text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400">{renderStatus}</h4>
                  </div>
                )}
             </div>
          </div>

          <div className="h-64 bg-zinc-950/50 p-6 overflow-y-auto border-t border-white/5 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {project.beats.map((beat, i) => (
                    <div key={beat.id} onClick={() => setActiveBeatIndex(i)} className={`relative aspect-video rounded-2xl border-2 transition-all cursor-pointer overflow-hidden group ${activeBeatIndex === i ? 'border-indigo-500 scale-[1.03] z-10 shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'border-white/5 opacity-50 hover:opacity-100'}`}>
                       {beat.assetUrl ? (
                         <img src={beat.assetUrl} className="w-full h-full object-cover" />
                       ) : (
                         <div className={`w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-[8px] text-zinc-700 font-black uppercase`}>
                           <span>{beat.id.startsWith('title') ? 'TITLE' : beat.id.startsWith('credits') ? 'CREDITS' : i+1}</span>
                           {beat.sourceLink && <span className="text-indigo-600 mt-1">WEB LINK</span>}
                         </div>
                       )}
                       {loadingBeats[beat.id] && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}
                       <button onClick={(e) => { e.stopPropagation(); setShowAssetOrchestrator(i); }} className="absolute bottom-2 right-2 p-1.5 bg-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95">
                         <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3}/></svg>
                       </button>
                    </div>
                  ))}
              </div>
          </div>
        </div>

        <div className="w-full lg:w-[440px] bg-[#0e0e11] border-l border-white/5 flex flex-col p-8 space-y-8 overflow-y-auto pb-40 custom-scrollbar shadow-2xl">
           
           <div className="space-y-6 bg-zinc-950 p-6 rounded-[2.5rem] border border-white/5">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Protocol</h3>
                <button onClick={onReset} className="px-3 py-1 bg-red-600/10 text-red-500 text-[8px] font-black uppercase rounded-lg border border-red-500/20 hover:bg-red-600/20 transition-all">Full Reset</button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Capa (Título HTML)</label>
                   <div 
                    contentEditable 
                    onBlur={(e) => setTitle(e.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: title }}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none min-h-[60px] focus:border-indigo-500/30 overflow-y-auto custom-scrollbar" 
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Aspect Ratio</label>
                      <select 
                        value={project.aspectRatio} 
                        onChange={(e) => setProject(prev => ({ ...prev, aspectRatio: e.target.value as any }))}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-black text-white outline-none"
                      >
                         <option value="16:9">Widescreen 16:9</option>
                         <option value="9:16">Portrait 9:16</option>
                         <option value="1:1">Square 1:1</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Export Res</label>
                      <select 
                        value={exportRes} 
                        onChange={(e) => setExportRes(e.target.value as ExportResolution)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-black text-white outline-none"
                      >
                         <option value="1080p">HD 1080p</option>
                         <option value="2K">2K Cinema</option>
                         <option value="4K">UHD 4K</option>
                      </select>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Créditos (HTML)</label>
                   <div 
                    contentEditable 
                    onBlur={(e) => setCredits(e.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: credits }}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none min-h-[80px] focus:border-indigo-500/30 overflow-y-auto custom-scrollbar" 
                   />
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1"><span>Duração Global</span><span className="text-white mono">{globalDuration}s</span></div>
                 <input type="range" min="1" max="20" value={globalDuration} onChange={(e) => setGlobalDuration(parseInt(e.target.value))} className="w-full h-1 bg-zinc-900 rounded-full appearance-none accent-indigo-500" />
              </div>
           </div>

           <div className="space-y-4">
              <div className="bg-zinc-950 p-6 rounded-[3rem] border border-white/5 space-y-4 shadow-2xl">
                 <div className="flex justify-between items-center px-1 mb-2">
                    <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Roteiro / Script (HTML)</label>
                    <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-full border border-white/5">
                       <span className={`text-[7px] font-black uppercase ${fidelityMode ? 'text-indigo-400' : 'text-zinc-600'}`}>Fidelidade</span>
                       <button 
                        onClick={() => setFidelityMode(!fidelityMode)} 
                        className={`relative w-8 h-4 rounded-full transition-all duration-300 ${fidelityMode ? 'bg-indigo-600' : 'bg-zinc-800'}`}
                       >
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${fidelityMode ? 'left-4.5' : 'left-0.5'}`} />
                       </button>
                    </div>
                 </div>
                 <div 
                    contentEditable 
                    onBlur={(e) => setScript(e.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: script }}
                    className="w-full h-40 bg-black/50 border border-white/5 rounded-2xl p-5 text-sm text-zinc-300 focus:outline-none resize-none transition-all overflow-y-auto custom-scrollbar" 
                 />
                 <button onClick={handleAnalyzeScript} disabled={isGenerating || !script.trim()} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.5em] transition-all active:scale-95 shadow-xl">Analisar & Orquestrar</button>
              </div>
              <button onClick={handleLocalRender} disabled={isRendering || project.beats.length === 0} className="w-full py-8 bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-black uppercase tracking-[0.6em] rounded-[3rem] shadow-xl transition-all relative overflow-hidden group">
                <span className="relative z-10">{isRendering ? 'MASTERIZANDO...' : 'MASTERIZAR UHD'}</span>
              </button>
           </div>
           
           <div className="bg-zinc-950 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block text-center">Batch Processing</span>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => handleBatchGenerate('SCOUT')} className="py-3 bg-zinc-900 text-[8px] font-black uppercase rounded-xl border border-white/5 hover:border-indigo-500 transition-all">All Scout (Web)</button>
                 <button onClick={() => handleBatchGenerate('AI')} className="py-3 bg-zinc-900 text-[8px] font-black uppercase rounded-xl border border-white/5 hover:border-pink-500 transition-all">All Synth (IA)</button>
              </div>
           </div>

           <AgentFeed logs={logs} isProcessing={isGenerating || isRendering} />
        </div>
      </div>

      {showAssetOrchestrator !== null && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[4rem] p-10 md:p-16 space-y-12 shadow-2xl animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="text-center space-y-3">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Direção de Cena {showAssetOrchestrator + 1}</h3>
                 <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Configure o visual e a narrativa individual da cena.</p>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Editar Legenda (HTML / BR)</label>
                    {project.beats[showAssetOrchestrator].sourceLink && <span className="text-[8px] mono text-indigo-400 font-bold">Web Link Ativo</span>}
                 </div>
                 <div 
                   contentEditable
                   onBlur={(e) => updateBeatCaption(e.currentTarget.innerHTML)}
                   dangerouslySetInnerHTML={{ __html: project.beats[showAssetOrchestrator].caption }}
                   className="w-full bg-black/60 border border-white/10 rounded-[2rem] px-8 py-6 text-sm text-white outline-none min-h-[140px] focus:border-indigo-500/30 overflow-y-auto"
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => handleAssetAction(showAssetOrchestrator, 'SCOUT')} className="p-8 bg-zinc-800 hover:bg-indigo-600 text-white rounded-[2.5rem] border border-white/5 transition-all flex flex-col items-center gap-4 group text-center">
                    <svg className="w-6 h-6 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2.5}/></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Web Reference Scout</span>
                 </button>
                 <button onClick={() => handleAssetAction(showAssetOrchestrator, 'AI')} className="p-8 bg-zinc-800 hover:bg-pink-600 text-white rounded-[2.5rem] border border-white/5 transition-all flex flex-col items-center gap-4 group text-center">
                    <svg className="w-6 h-6 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.5 3L11 8.5L5.5 11L11 13.5L13.5 19L16 13.5L21.5 11L16 8.5L13.5 3Z" strokeWidth={2.5}/></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Generative AI Synth</span>
                 </button>
                 <button onClick={() => setShowVaultGallery(true)} className="p-8 bg-zinc-800 hover:bg-emerald-600 text-white rounded-[2.5rem] border border-white/5 transition-all flex flex-col items-center gap-4 group text-center">
                    <svg className="w-6 h-6 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" strokeWidth={2.5}/></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Inject Vault Node</span>
                 </button>
                 <button onClick={() => handleAssetAction(showAssetOrchestrator, 'UPLOAD')} className="p-8 bg-zinc-800 hover:bg-amber-600 text-white rounded-[2.5rem] border border-white/5 transition-all flex flex-col items-center gap-4 group text-center">
                    <svg className="w-6 h-6 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth={2.5}/></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Local Asset Upload</span>
                 </button>
              </div>
              <button onClick={() => setShowAssetOrchestrator(null)} className="w-full py-5 bg-white text-black rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] active:scale-95 transition-all">Finalizar Edição de Cena</button>
           </div>
        </div>
      )}

      {showVaultGallery && (
        <div className="fixed inset-0 z-[600] bg-black/98 backdrop-blur-3xl flex flex-col p-12 animate-in slide-in-from-bottom-10 duration-700">
           <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto w-full">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Vault Favorites</h3>
              <button onClick={() => setShowVaultGallery(false)} className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Voltar</button>
           </div>
           <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full pb-20 custom-scrollbar"><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">{vault.filter(v => v.isFavorite).map(item => (<div key={item.id} onClick={() => { handleAssetAction(showAssetOrchestrator !== null ? showAssetOrchestrator : activeBeatIndex, 'VAULT_MANUAL', item); setShowVaultGallery(false); setShowAssetOrchestrator(null); }} className="aspect-square bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer hover:border-indigo-500 hover:scale-[1.03] transition-all group relative shadow-2xl"><img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-[10px] font-black text-white uppercase tracking-widest bg-indigo-600 px-4 py-2 rounded-xl">Selecionar Node</span></div></div>))}</div></div>
        </div>
      )}

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const result = ev.target?.result as string;
              const idx = showAssetOrchestrator !== null ? showAssetOrchestrator : activeBeatIndex;
              setProject(prev => {
                const updated = [...prev.beats];
                updated[idx] = { ...updated[idx], assetUrl: result, assetType: 'UPLOAD' };
                return { ...prev, beats: updated };
              });
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
