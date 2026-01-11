
import React, { useState, useEffect } from 'react';
import { VaultItem, FusionManifest, LatentParams, AgentStatus } from '../types';
import { executeFusion, autoOptimizeFusion, visualAnalysisJudge, refinePromptDNA } from '../geminiService';
import AgentFeed from './AgentFeed';

interface FusionLabProps {
  vault: VaultItem[];
  onResult: (imageUrl: string, params: LatentParams, logs: any[]) => void;
}

const FusionLab: React.FC<FusionLabProps> = ({ vault, onResult }) => {
  const [manifest, setManifest] = useState<FusionManifest>({
    pep_id: '',
    pop_id: '',
    pov_id: '',
    amb_id: '',
    weights: { pep: 1.0, pop: 1.0, pov: 1.0, amb: 1.0 },
    style_modifiers: [],
    surgicalSwap: false,
    fusionIntent: '',
    protectionStrength: 1.5
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [alchemistLogs, setAlchemistLogs] = useState<AgentStatus[]>([]);
  const [autoRefine, setAutoRefine] = useState(false);
  const [fusionResultUrl, setFusionResultUrl] = useState<string | null>(null);

  const handleFusion = async () => {
    if (!manifest.pep_id && !manifest.pop_id) {
      alert("PEP (Identity) and POP (Pose) nodes are required for a stable reactor start.");
      return;
    }
    setIsProcessing(true);
    setAlchemistLogs([{ type: 'Neural Alchemist', status: 'processing', message: 'Warping Reactor for Identity Migration...', timestamp: Date.now(), department: 'Advanced' }]);
    
    try {
      const result = await executeFusion(manifest, vault);
      setFusionResultUrl(result.imageUrl);
      setAlchemistLogs(prev => [...prev, ...result.logs]);

      if (autoRefine && result.imageUrl) {
        setAlchemistLogs(prev => [...prev, { type: 'Visual Quality Judge', status: 'processing', message: 'Analyzing Character Migration Integrity...', timestamp: Date.now(), department: 'Advanced' }]);
        const popItem = vault.find(v => v.shortId === manifest.pop_id);
        const judgeResult = await visualAnalysisJudge(result.imageUrl, manifest.fusionIntent, popItem?.imageUrl);
        
        setAlchemistLogs(prev => [...prev, { 
          type: 'Visual Quality Judge', 
          status: 'completed', 
          message: `Consensus Score: ${Math.round(judgeResult.score * 100)}%. ${judgeResult.critique}`, 
          timestamp: Date.now(), 
          department: 'Advanced' 
        }]);

        if (judgeResult.score < 0.7) {
          setAlchemistLogs(prev => [...prev, { type: 'Latent Optimizer', status: 'processing', message: `Refining character consistency: ${judgeResult.suggestion}`, timestamp: Date.now(), department: 'Advanced' }]);
          const refinedManifest = { ...manifest, fusionIntent: `${manifest.fusionIntent}. Ensure full character migration: ${judgeResult.suggestion}` };
          const refinedResult = await executeFusion(refinedManifest, vault);
          if (refinedResult.imageUrl) {
            setFusionResultUrl(refinedResult.imageUrl);
            setAlchemistLogs(prev => [...prev, { type: 'Director', status: 'completed', message: 'Identity Migration stabilized.', timestamp: Date.now(), department: 'Direction' }]);
            onResult(refinedResult.imageUrl, refinedResult.params, alchemistLogs);
            return;
          }
        }
      }

      if (result.imageUrl) {
        onResult(result.imageUrl, result.params, alchemistLogs);
      }

    } catch (e) {
      console.error(e);
      setAlchemistLogs(prev => [...prev, { type: 'Neural Alchemist', status: 'error', message: 'Critical Reactor Melt.', timestamp: Date.now(), department: 'Advanced' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefineIntent = async () => {
    if (!manifest.fusionIntent.trim() || isOptimizing) return;
    setIsOptimizing(true);
    setAlchemistLogs(prev => [...prev, { type: 'Meta-Prompt Translator', status: 'processing', message: 'Expanding Intent...', timestamp: Date.now(), department: 'Advanced' }]);
    try {
      const result = await refinePromptDNA(manifest.fusionIntent);
      setManifest(prev => ({ ...prev, fusionIntent: result.refined }));
      setAlchemistLogs(prev => [...prev, ...result.logs]);
    } catch (e) { console.error(e); } finally { setIsOptimizing(false); }
  };

  const handleAutoPilotTrigger = async () => {
    if (!manifest.fusionIntent.trim()) {
      alert("Neural intent required.");
      setIsAutoPilotActive(false);
      return;
    }
    setIsOptimizing(true);
    try {
      const { manifest: optimizedManifest } = await autoOptimizeFusion(manifest.fusionIntent, manifest, vault);
      setManifest(optimizedManifest);
      setAlchemistLogs(prev => [...prev, { type: 'Visual Archivist', status: 'completed', message: 'Optimal Character mapping identified.', timestamp: Date.now(), department: 'Direction' }]);
    } catch (e) { console.error(e); setIsAutoPilotActive(false); } finally { setIsOptimizing(false); }
  };

  useEffect(() => {
    if (isAutoPilotActive && manifest.fusionIntent.trim() && !isOptimizing) {
      handleAutoPilotTrigger();
    }
  }, [isAutoPilotActive]);

  const ComponentSlot = ({ type, label, currentId, onSelect, color }: any) => {
    const selectedItem = vault.find(v => v.shortId === currentId);
    
    return (
      <div className={`bg-zinc-950/40 border-2 rounded-[2.5rem] p-6 transition-all duration-700 relative overflow-hidden group ${selectedItem ? 'border-indigo-500/30 ring-1 ring-indigo-500/20' : 'border-white/5 hover:border-white/10'}`}>
        <div className="flex justify-between items-center mb-5">
          <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${color}`}>{label}</span>
          </div>
          {selectedItem && (
             <button onClick={() => onSelect('')} className="text-zinc-600 hover:text-white p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
             </button>
          )}
        </div>
        
        <div className="relative aspect-square rounded-[2rem] bg-black/60 overflow-hidden border border-white/5 mb-6 group-hover:scale-[1.02] transition-transform">
          {selectedItem ? (
            <>
              <img src={selectedItem.imageUrl} className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700" alt="Preview" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              
              {/* Score Indicator Overlay */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                 <span className="text-[8px] mono text-indigo-400 font-bold">R:{selectedItem.neuralPreferenceScore || 0}</span>
                 {selectedItem.usageCount >= 10 && <span className="text-[10px]">⭐</span>}
              </div>

              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                 <div className="flex gap-1">
                    <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500" style={{ width: `${(selectedItem.neuralPreferenceScore || 0)}%` }} />
                    </div>
                 </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-10">
               <svg className={`w-10 h-10 mb-2 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={2}/></svg>
               <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Component</span>
            </div>
          )}
        </div>

        <select 
          value={currentId} 
          onChange={(e) => onSelect(e.target.value)}
          disabled={isOptimizing}
          className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl p-4 text-[11px] text-zinc-400 font-bold outline-none hover:border-indigo-500/20 transition-all appearance-none text-center"
        >
          <option value="">Neural Select...</option>
          {vault
            .sort((a, b) => (b.neuralPreferenceScore || 0) - (a.neuralPreferenceScore || 0))
            .map(v => (
            <option key={v.id} value={v.shortId}>
              {v.neuralPreferenceScore >= 80 ? '⭐ ' : ''}{v.shortId} (Score: {v.neuralPreferenceScore || 0})
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-[#08080a] p-6 lg:p-12 flex flex-col lg:flex-row gap-12 pb-32 overflow-y-auto">
      <div className="flex-1 space-y-12 max-w-5xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)] animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2a5 5 0 00-5 5v3a5 5 0 0010 0V7a5 5 0 00-5-5z" strokeWidth={2.5}/></svg>
               </div>
               <div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Fusion Reactor</h2>
                  <p className="text-[11px] mono text-zinc-500 uppercase tracking-[0.5em]">Adaptive Synaptic Logic v10.2</p>
               </div>
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-8 bg-zinc-950/50 p-8 rounded-[3rem] border border-white/5 shadow-inner">
              <div className="w-full md:min-w-[400px] space-y-3 relative group">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Neural Intent Directive</label>
                  <textarea 
                      value={manifest.fusionIntent}
                      onChange={(e) => setManifest({...manifest, fusionIntent: e.target.value})}
                      placeholder="Specify synthesis..."
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none h-24 resize-none transition-all focus:border-indigo-500/30"
                  />
                  <button onClick={handleRefineIntent} disabled={isOptimizing || !manifest.fusionIntent} className="absolute bottom-3 right-3 p-2 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20 hover:bg-indigo-600/20 transition-all active:scale-95">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.5 3L11 8.5L5.5 11L11 13.5L13.5 19L16 13.5L21.5 11L16 8.5L13.5 3Z" strokeWidth={2}/></svg>
                  </button>
              </div>
              <div className="flex flex-col items-center gap-3">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">AutoPilot</span>
                  <button onClick={() => setIsAutoPilotActive(!isAutoPilotActive)} className={`relative w-14 h-7 rounded-full transition-all duration-500 ${isAutoPilotActive ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-500 ${isAutoPilotActive ? 'left-8' : 'left-1'}`} />
                  </button>
              </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ComponentSlot type="PEP" label="PEP Node (Identity)" color="text-emerald-400" currentId={manifest.pep_id} onSelect={(id: string) => setManifest({...manifest, pep_id: id})} />
          <ComponentSlot type="POP" label="POP Node (Pose)" color="text-pink-400" currentId={manifest.pop_id} onSelect={(id: string) => setManifest({...manifest, pop_id: id})} />
          <ComponentSlot type="POV" label="POV Node (Lens)" color="text-cyan-400" currentId={manifest.pov_id} onSelect={(id: string) => setManifest({...manifest, pov_id: id})} />
          <ComponentSlot type="AMB" label="AMB Node (Env)" color="text-amber-400" currentId={manifest.amb_id} onSelect={(id: string) => setManifest({...manifest, amb_id: id})} />
        </div>

        <button 
          onClick={handleFusion} 
          disabled={isProcessing || isOptimizing} 
          className="w-full py-12 bg-white text-black rounded-[4rem] font-black uppercase tracking-[1em] text-sm shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:bg-zinc-100 transition-all active:scale-[0.98] disabled:opacity-30 relative overflow-hidden group"
        >
          {isProcessing && <div className="absolute inset-0 bg-indigo-600/20 animate-pulse" />}
          <span className="relative z-10">{isProcessing ? 'TRANSPLANTING IDENTITY...' : 'EXECUTE NEURAL SYNTH'}</span>
        </button>
      </div>

      <div className="w-full lg:w-[400px] space-y-8 h-fit lg:sticky lg:top-32">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 px-2">Reactor Log Telemetry</h3>
        <AgentFeed logs={alchemistLogs} isProcessing={isProcessing} />
      </div>
    </div>
  );
};

export default FusionLab;
