
import React, { useState, useRef, useEffect } from 'react';
import { AgentStatus, LatentParams, VaultItem, CategorizedDNA, VaultDomain, LatentGrading, VisualAnchor, DeliberationStep, AgentAuthority, PoseData } from '../types';
import { orchestratePrompt, extractDeepDNA, executeGroundedSynth } from '../geminiService';
import AgentFeed from './AgentFeed';
import ZModeModal from './ZModeModal';
import LGNEditor from './LGNEditor';
import MetricsDashboard from './MetricsDashboard';
import ProcessingControl from './ProcessingControl';
import PoseControlPanel from './PoseControlPanel';

interface WorkspaceProps {
  onSave: (item: VaultItem) => Promise<void>;
  vault: VaultItem[];
  prompt: string;
  setPrompt: (val: string) => void;
  currentImage: string | null;
  setCurrentImage: (val: string | null) => void;
  originalSource: string | null;
  setOriginalSource: (val: string | null) => void;
  logs: AgentStatus[];
  setLogs: React.Dispatch<React.SetStateAction<AgentStatus[]>>;
  params: LatentParams;
  setParams: React.Dispatch<React.SetStateAction<LatentParams>>;
  onReloadApp: () => void;
  grading?: LatentGrading;
  visualAnchor?: VisualAnchor;
}

const Workspace: React.FC<WorkspaceProps> = ({ 
  onSave, vault, prompt, setPrompt, currentImage, setCurrentImage,
  originalSource, setOriginalSource, logs, setLogs, params, setParams,
  onReloadApp, grading: initialGrading, visualAnchor
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isZModeOpen, setIsZModeOpen] = useState(false);
  const [isLGNOpen, setIsLGNOpen] = useState(false);
  const [isPoseOpen, setIsPoseOpen] = useState(false);
  const [isBiopsyActive, setIsBiopsyActive] = useState(false);
  const [collisionReport, setCollisionReport] = useState<{logic: string, prompt: string} | null>(null);
  const [localGrading, setLocalGrading] = useState<LatentGrading | undefined>(initialGrading);
  const [deliberationFlow, setDeliberationFlow] = useState<DeliberationStep[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "Kernel Initiating: Calling Meta-Prompt Translator...", 
    "Consulting Visual Scout for Optical Truth...", 
    "Lighting Architect calculating photon bounce...", 
    "Texture Master biopsying material surfaces...",
    "Merging consensus into Final Directive..."
  ];

  useEffect(() => {
    setLocalGrading(initialGrading);
  }, [initialGrading]);

  useEffect(() => {
    let interval: any;
    if (isProcessing || isBiopsyActive) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isProcessing, isBiopsyActive]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const result = ev.target?.result as string;
        setCurrentImage(result);
        setOriginalSource(result);
        setIsBiopsyActive(true);
        setLogs([{ type: 'Attribute Mapper', status: 'processing', message: 'V12.2 Neural Biopsy initialized...', timestamp: Date.now(), department: 'Advanced' }]);
        try {
          const dna = await extractDeepDNA(result);
          setParams(prev => ({ ...prev, dna }));
          setLogs(prev => [...prev, { type: 'Attribute Mapper', status: 'completed', message: `Vault DNA Biopsy successful.`, timestamp: Date.now(), department: 'Advanced' }]);
        } catch (err) { console.error(err); } finally { setIsBiopsyActive(false); }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setLogs([]);
    setDeliberationFlow([]);
    try {
      const weights = { X: 50, Y: 50, Z: 50 };
      const auth = params.agent_authority || { lighting: 50, texture: 50, structure: 50, anatomy: 50 };
      
      // Se houver pose ativa, incluímos na diretiva via prompt
      const poseContext = params.pose_control?.enabled ? `\n[POSE_RIG_ACTIVE]: ${params.pose_control.technicalDescription || 'Follow skeleton structure.'}` : '';
      const contextPrompt = prompt + poseContext;

      let result = await executeGroundedSynth(contextPrompt, weights, vault, auth);
      
      if (result.imageUrl) {
        setCurrentImage(result.imageUrl);
        setLogs(result.logs);
        setDeliberationFlow(result.deliberation_flow || []);
        setParams(prev => ({ ...prev, agent_authority: auth }));
        setCollisionReport({ logic: result.collision_logic || 'Multi-Agent Consensus (V12.2)', prompt: result.consolidated_prompt || '' });
        if (result.grading) setLocalGrading(result.grading);
      }
    } catch (error: any) { console.error(error); } finally { setIsProcessing(false); }
  };

  const handlePurgeBuffer = () => {
    setCollisionReport(null);
    setLocalGrading(undefined);
    setDeliberationFlow([]);
    onReloadApp();
  };

  const handleCommit = async () => {
    if (!currentImage || isSaving) return;
    setIsSaving(true);
    try {
      const item: VaultItem = {
        id: crypto.randomUUID(),
        shortId: `LCP-${Math.floor(10000 + Math.random() * 90000)}`,
        name: prompt.split(' ').slice(0, 3).join('_'),
        imageUrl: currentImage,
        originalImageUrl: originalSource || currentImage,
        prompt: prompt,
        agentHistory: logs,
        params: { ...params },
        dna: params.dna,
        rating: 5,
        timestamp: Date.now(),
        usageCount: 0,
        neuralPreferenceScore: 50,
        isFavorite: false,
        vaultDomain: params.vault_domain || 'X',
        grading: localGrading
      };
      await onSave(item);
      window.alert(`V12.2 Node committed to Vault.`);
    } catch (e: any) { console.error(e); } finally { setIsSaving(false); }
  };

  const handleAuthorityChange = (key: keyof AgentAuthority, val: number) => {
    setParams(prev => ({
       ...prev,
       agent_authority: {
         ...(prev.agent_authority || { lighting: 50, texture: 50, structure: 50, anatomy: 50 }),
         [key]: val
       }
    }));
  };

  const setPoseControl = (pose?: PoseData) => {
    setParams(prev => ({ ...prev, pose_control: pose }));
  };

  const renderSlot = (domain: VaultDomain, label: string, color: string) => {
    const activeId = params.active_slots?.[domain];
    const item = vault.find(v => v.shortId === activeId);
    
    return (
      <div className={`relative flex flex-col items-center gap-1 group`}>
        <div 
          className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 transition-all cursor-pointer overflow-hidden bg-black/40 flex items-center justify-center ${item ? `border-${color}-500 shadow-[0_0_15px_rgba(255,255,255,0.1)]` : 'border-white/5 hover:border-white/20'}`}
          onClick={() => setParams(prev => ({ ...prev, active_slots: { ...(prev.active_slots || {}), [domain]: null } }))}
        >
           {item ? (
              <img src={item.imageUrl} className="w-full h-full object-cover" />
           ) : (
              <span className={`text-[10px] font-black uppercase text-zinc-800`}>{domain}</span>
           )}
        </div>
        <span className={`text-[6px] font-black uppercase tracking-tighter ${item ? `text-${color}-400` : 'text-zinc-600'}`}>{label}</span>
      </div>
    );
  };

  const getStyleWithGrading = () => {
    if (!localGrading) return { filter: 'none' };
    
    const tintColor = `rgb(${localGrading.tint_r * 255 || 255}, ${localGrading.tint_g * 255 || 255}, ${localGrading.tint_b * 255 || 255})`;
    
    return {
      filter: localGrading.css_filter_string || 'none',
      backgroundColor: tintColor,
      backgroundBlendMode: 'multiply' as any,
    };
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0c0e] relative overflow-hidden min-h-full">
      <div className="hidden md:block">
        <MetricsDashboard params={params} />
      </div>
      <div className="flex-1 flex flex-col md:flex-row relative">
        <div className={`flex-[1.4] relative bg-[#08080a] flex flex-col items-center justify-center border-r border-white/5 overflow-hidden min-h-[300px] md:min-h-0`}>
          
          {(isProcessing || isBiopsyActive) && (
            <div className="absolute inset-0 z-[160] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4 text-center px-6 transition-opacity duration-300">
              <div className="relative w-12 h-12 md:w-32 md:h-32">
                  <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-indigo-500 rounded-full animate-spin" />
              </div>
              <p className="text-indigo-400 font-black text-[8px] md:text-xs uppercase tracking-[0.3em] animate-pulse">
                {loadingMessages[loadingStep]}
              </p>
            </div>
          )}

          <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
            {!currentImage ? (
              <div onClick={() => fileInputRef.current?.click()} className="w-full h-full bg-zinc-900/10 border-2 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/40 transition-all">
                    <svg className="w-10 h-10 text-zinc-800 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span className="text-[10px] mono uppercase text-zinc-600 font-bold tracking-widest">Inject Base DNA</span>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
            ) : (
              <div className={`relative w-full h-full flex items-center justify-center bg-[#050505]`}>
                <div className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={currentImage!} 
                      className={`max-w-full max-h-full w-auto h-auto object-contain transition-all duration-1000 shadow-2xl relative z-10`}
                      style={{ filter: localGrading?.css_filter_string || 'none' }}
                    />
                    {localGrading && (
                       <div 
                        className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply"
                        style={{ 
                          backgroundColor: `rgb(${localGrading.tint_r * 255 || 255}, ${localGrading.tint_g * 255 || 255}, ${localGrading.tint_b * 255 || 255})`,
                          opacity: 0.3
                        }}
                       />
                    )}
                </div>
                
                <div className="absolute top-8 left-8 flex flex-col gap-2 z-[100]">
                    <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                       <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">MAD_v12.2 ACTIVE</span>
                    </div>
                    {localGrading && (
                      <div className="bg-emerald-600/80 backdrop-blur-md px-4 py-1.5 rounded-xl border border-emerald-400/30 flex items-center gap-2">
                         <span className="text-[7px] font-black text-white uppercase tracking-widest">MASTERED_GRADIENT: {localGrading.preset_name}</span>
                      </div>
                    )}
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-black/80 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-white/10 z-[150] shadow-2xl">
                   {renderSlot('X', 'Identity', 'emerald')}
                   {renderSlot('Y', 'Env', 'pink')}
                   {renderSlot('Z', 'Style', 'cyan')}
                   {renderSlot('L', 'Light', 'amber')}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-[380px] lg:w-[440px] flex flex-col bg-[#0e0e11] border-l border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5 md:space-y-8 pb-40 md:pb-96 custom-scrollbar">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Studio Console</h2>
                <span className="text-[7px] mono text-zinc-800 uppercase font-black">LCP-v12.2 MAD_CORE</span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={handlePurgeBuffer}
                  className="bg-red-600/10 px-2 py-1.5 rounded-lg text-red-500 text-[8px] font-black uppercase border border-red-500/20"
                >
                  RESET
                </button>
                <button onClick={() => setIsZModeOpen(true)} className="bg-indigo-600/10 px-2 py-1.5 rounded-lg text-indigo-400 text-[8px] font-black uppercase border border-indigo-500/30">Z-MODE</button>
                <button onClick={() => setIsPoseOpen(!isPoseOpen)} className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${isPoseOpen ? 'bg-pink-600 text-white' : 'bg-pink-600/10 text-pink-400 border-pink-500/30'}`}>RIGGING</button>
                <button 
                  onClick={() => setIsLGNOpen(true)} 
                  className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${localGrading ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'}`}
                >
                  LGN
                </button>
              </div>
            </div>

            {isPoseOpen ? (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <PoseControlPanel 
                  poseControl={params.pose_control} 
                  setPoseControl={setPoseControl} 
                  vault={vault} 
                  sourceImage={currentImage} 
                  onExecuteSurgical={handleProcess}
                />
              </div>
            ) : (
              <>
                <div className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5 space-y-4">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Agent Authority Weights</span>
                  <div className="space-y-4">
                      {[
                        { key: 'lighting' as keyof AgentAuthority, label: 'Lighting Architect', color: 'accent-amber-500' },
                        { key: 'texture' as keyof AgentAuthority, label: 'Texture Master', color: 'accent-emerald-500' },
                        { key: 'anatomy' as keyof AgentAuthority, label: 'Anatomy Specialist', color: 'accent-pink-500' }
                      ].map(auth => (
                        <div key={auth.key} className="space-y-1.5">
                          <div className="flex justify-between items-center text-[7px] font-black uppercase">
                              <span className="text-zinc-600">{auth.label}</span>
                              <span className="text-white">{(params.agent_authority?.[auth.key] || 50)}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={params.agent_authority?.[auth.key] || 50} 
                            onChange={(e) => handleAuthorityChange(auth.key, parseInt(e.target.value))} 
                            className={`w-full h-0.5 bg-zinc-800 appearance-none rounded-full cursor-pointer ${auth.color}`} 
                          />
                        </div>
                      ))}
                  </div>
                </div>

                {collisionReport && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="bg-zinc-950 border border-white/5 p-5 rounded-2xl">
                        <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Multi-Agent Deliberation Result</span>
                        <div className="text-[8px] mono text-zinc-600 h-24 overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed">
                            {collisionReport.prompt}
                        </div>
                      </div>
                  </div>
                )}

                <ProcessingControl speed={params.processing_speed || 'Balanced'} setSpeed={(val) => setParams(prev => ({ ...prev, processing_speed: val }))} />
                <AgentFeed logs={logs} isProcessing={isProcessing} deliberation_flow={deliberationFlow} />
              </>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-black/95 backdrop-blur-3xl border-t border-white/5 space-y-3 z-[100]">
            <div className="relative">
               <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter synthesis directive (Kernel v12.2)..." className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-[10px] md:text-sm h-16 md:h-24 resize-none text-zinc-200 outline-none focus:border-indigo-500/40 transition-all custom-scrollbar" />
               <button onClick={handleProcess} disabled={isProcessing || !prompt.trim()} className={`absolute bottom-3 right-3 p-2 rounded-lg border transition-all ${isProcessing ? 'bg-indigo-600/40 border-indigo-400 animate-pulse' : 'bg-white/5 border-white/10 text-indigo-400 hover:bg-white/10'}`} >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" strokeWidth={2}/></svg>
               </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleProcess} disabled={isProcessing} className="rounded-xl bg-indigo-600 text-white p-3 md:p-4 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl shadow-indigo-900/20">Execute Synth</button>
              <button onClick={handleCommit} disabled={!currentImage || isSaving} className="rounded-xl bg-zinc-100 text-black text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Commit Node</button>
            </div>
          </div>
        </div>
      </div>
      
      <ZModeModal isOpen={isZModeOpen} onClose={() => setIsZModeOpen(false)} params={params} setParams={setParams} onAutoTune={() => {}} />
      
      {localGrading && (
        <LGNEditor 
          isOpen={isLGNOpen} 
          onClose={() => setIsLGNOpen(false)} 
          grading={localGrading} 
          onChange={(next) => setLocalGrading(next)} 
        />
      )}
    </div>
  );
};

export default Workspace;
