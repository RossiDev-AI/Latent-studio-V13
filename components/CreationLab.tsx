
import React, { useState, useRef, useEffect } from 'react';
import { executeGroundedSynth, optimizeVisualPrompt, routeSemanticAssets, suggestScoutWeights } from '../geminiService';
import { LatentParams, AgentStatus, VaultItem, ScoutData, LatentGrading, VisualAnchor, AgentAuthority, DeliberationStep } from '../types';
import AgentFeed from './AgentFeed';
import ScoutDashboard from './ScoutDashboard';

interface CreationLabProps {
  onResult: (imageUrl: string, params: LatentParams, prompt: string, links: any[], grading?: LatentGrading, visualAnchor?: VisualAnchor) => void;
  params: LatentParams;
  setParams: (p: LatentParams) => void;
  onReset: () => void;
  vault?: VaultItem[];
}

const CreationLab: React.FC<CreationLabProps> = ({ onResult, params, setParams, onReset, vault = [] }) => {
  const [prompt, setPrompt] = useState('');
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [logs, setLogs] = useState<AgentStatus[]>([]);
  const [deliberationFlow, setDeliberationFlow] = useState<DeliberationStep[]>([]);
  const [scoutData, setScoutData] = useState<ScoutData | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);
  const [agentAuthority, setAgentAuthority] = useState<AgentAuthority>({ lighting: 50, texture: 50, structure: 50, anatomy: 50 });
  
  // Local Latent Matrix State
  const [zAnatomy, setZAnatomy] = useState(1.0);
  const [zStructure, setZStructure] = useState(1.0);
  const [zLighting, setZLighting] = useState(0.5);
  const [zTexture, setZTexture] = useState(0.5);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleMagicWand = async () => {
    if (!prompt.trim() || isOptimizing) return;
    setIsOptimizing(true);
    setLogs(prev => [...prev, { type: 'Meta-Prompt Translator', status: 'processing', message: 'Upleveling user intent to Industrial Meta-Prompt...', timestamp: Date.now(), department: 'Advanced' }]);
    try {
      const optimized = await optimizeVisualPrompt(prompt);
      setRefinedPrompt(optimized);
      setLogs(prev => [...prev, { type: 'Meta-Prompt Translator', status: 'completed', message: 'Visual refinement successfully mapped to technical directives.', timestamp: Date.now(), department: 'Advanced' }]);
    } catch (e) { console.error(e); } finally { setIsOptimizing(false); }
  };

  const handleHardReset = () => {
    setPrompt('');
    setRefinedPrompt('');
    setZAnatomy(1.0);
    setZStructure(1.0);
    setZLighting(0.5);
    setZTexture(0.5);
    setAgentAuthority({ lighting: 50, texture: 50, structure: 50, anatomy: 50 });
    setScoutData(null);
    setGroundingLinks([]);
    setLogs([]);
    setDeliberationFlow([]);
    onReset();
  };

  const handleProcess = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setScoutData(null);
    setDeliberationFlow([]);
    setLogs([{ type: 'Director', status: 'processing', message: `Kernel Job Initialized. Executing MAD Consensus V12.5...`, timestamp: Date.now() }]);
    
    try {
      const weights = { X: 50, Y: 50, Z: 50 };
      const result = await executeGroundedSynth(prompt, weights, vault, agentAuthority);
      
      if (result.imageUrl) {
        setScoutData(result.scoutData || null);
        setGroundingLinks(result.groundingLinks || []);
        setDeliberationFlow(result.deliberation_flow || []);
        setLogs(result.logs);
        setRefinedPrompt(result.enhancedPrompt);

        const finalParams: LatentParams = {
            ...params,
            z_anatomy: zAnatomy,
            z_structure: zStructure,
            z_lighting: zLighting,
            z_texture: zTexture,
            agent_authority: agentAuthority,
            neural_metrics: result.params.neural_metrics
        };

        onResult(result.imageUrl, finalParams, prompt, result.groundingLinks || [], result.grading, result.visual_anchor);
      }
    } catch (e) { 
        console.error(e); 
        setLogs(prev => [...prev, { type: 'Director', status: 'error', message: 'Critical Kernel Failure during synthesis.', timestamp: Date.now() }]);
    } finally { 
        setIsProcessing(false); 
    }
  };

  const handleAuthorityChange = (key: keyof AgentAuthority, val: number) => {
    setAgentAuthority(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] overflow-hidden min-h-full">
      <div className="flex-1 flex flex-col lg:flex-row gap-8 p-6 lg:p-12 overflow-y-auto pb-32 custom-scrollbar">
        <div className="flex-1 space-y-10 max-w-5xl">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
               <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Nexus Creation Hub</h2>
               <p className="text-[10px] mono text-zinc-500 uppercase tracking-[0.5em]">LCP-v12.5 MAD_INDUSTRIAL CORE</p>
            </div>
            <button 
              onClick={handleHardReset}
              className="p-3 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-600/20 transition-all flex items-center gap-2"
              title="Reset Protocol"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2}/></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-8">
                {/* Inputs Section */}
                <div className="bg-zinc-950 border border-white/5 p-8 rounded-[3rem] space-y-5 shadow-2xl transition-all relative group">
                   <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">User Intent</label>
                      <button 
                        onClick={handleMagicWand}
                        disabled={isOptimizing || !prompt.trim()}
                        className={`p-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 transition-all ${isOptimizing ? 'animate-pulse' : ''}`}
                        title="Meta-Prompt Optimize"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.5 3L11 8.5L5.5 11L11 13.5L13.5 19L16 13.5L21.5 11L16 8.5L13.5 3Z" strokeWidth={2}/></svg>
                      </button>
                   </div>
                   <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Specify your visual intent (Portuguese or English)..."
                      className="w-full h-32 bg-black/50 border border-white/5 rounded-3xl p-6 text-[13px] text-white focus:outline-none focus:border-indigo-500/30 resize-none transition-all placeholder:text-zinc-800"
                   />
                </div>

                {refinedPrompt && (
                  <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-[3rem] space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Meta-Prompt (Industrial English)</span>
                       <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </div>
                    <p className="text-[11px] text-zinc-400 mono italic leading-relaxed">"{refinedPrompt}"</p>
                  </div>
                )}

                {/* Authority Matrix */}
                <div className="bg-zinc-950 border border-white/5 p-8 rounded-[3rem] space-y-6 shadow-2xl relative">
                   <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Agent Authority Sliders</label>
                      <span className="text-[8px] font-black text-zinc-600 uppercase">Priority Control</span>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] mono font-bold text-amber-400"><span>Lighting Architect</span> <span>{agentAuthority.lighting}%</span></div>
                         <input type="range" min="0" max="100" value={agentAuthority.lighting} onChange={(e) => handleAuthorityChange('lighting', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-amber-500" />
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] mono font-bold text-emerald-400"><span>Texture Master</span> <span>{agentAuthority.texture}%</span></div>
                         <input type="range" min="0" max="100" value={agentAuthority.texture} onChange={(e) => handleAuthorityChange('texture', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-emerald-500" />
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] mono font-bold text-pink-400"><span>Anatomy Specialist</span> <span>{agentAuthority.anatomy}%</span></div>
                         <input type="range" min="0" max="100" value={agentAuthority.anatomy} onChange={(e) => handleAuthorityChange('anatomy', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-pink-500" />
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-8 flex flex-col">
                {/* Z-Matrix Regulation */}
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

                {/* Action Section */}
                <div className="bg-zinc-950 border border-white/5 p-8 rounded-[3rem] space-y-5 shadow-2xl flex-1 flex flex-col transition-all hover:border-indigo-500/20 overflow-hidden relative">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Synthesis Anchor</label>
                   <div onClick={() => fileRef.current?.click()} className="flex-1 min-h-[140px] bg-black/40 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all relative overflow-hidden group">
                     <div className="text-center space-y-3 opacity-30">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth={1}/></svg>
                        <p className="text-[9px] font-black uppercase tracking-widest">Inject Base DNA</p>
                     </div>
                     <input type="file" ref={fileRef} className="hidden" accept="image/*" />
                   </div>
                   <button 
                    onClick={handleProcess}
                    disabled={isProcessing || !prompt.trim()}
                    className="w-full py-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-[0.8em] text-[11px] shadow-2xl active:scale-95 transition-all"
                   >
                    {isProcessing ? 'SYNAPSING...' : 'EXECUTE MAD SYNTH V12.5'}
                   </button>
                </div>
             </div>
          </div>

          {/* Visual Scout Dashboard */}
          {scoutData && (
            <div className="col-span-1 md:col-span-2 space-y-4">
              <h3 className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-4">Visual Scout Intelligence</h3>
              <ScoutDashboard scoutData={scoutData} />
              
              {groundingLinks.length > 0 && (
                <div className="bg-zinc-950/50 border border-white/10 p-6 rounded-[2rem] flex flex-wrap gap-4 items-center">
                   <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Grounding Sources:</span>
                   {groundingLinks.map((link, idx) => (
                      <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-indigo-400 hover:bg-white/10 transition-all flex items-center gap-2">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth={2}/></svg>
                         {link.title}
                      </a>
                   ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Agent Feed Section */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 lg:sticky lg:top-12 h-[calc(100vh-160px)]">
           <AgentFeed logs={logs} isProcessing={isProcessing} deliberation_flow={deliberationFlow} />
        </div>
      </div>
    </div>
  );
};

export default CreationLab;
