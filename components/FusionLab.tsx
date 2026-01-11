
import React, { useState, useEffect } from 'react';
import { VaultItem, FusionManifest, LatentParams, AgentStatus, AppSettings } from '../types';
import { executeFusion, autoOptimizeFusion, visualAnalysisJudge, refinePromptDNA } from '../geminiService';
import AgentFeed from './AgentFeed';

// Subcomponents
import FusionHeader from './fusionLab/FusionHeader';
import FusionReactorControls from './fusionLab/FusionReactorControls';
import FusionSlots from './fusionLab/FusionSlots';
import FusionAction from './fusionLab/FusionAction';

interface FusionLabProps {
  vault: VaultItem[];
  onResult: (imageUrl: string, params: LatentParams, logs: any[]) => void;
  settings?: AppSettings;
}

const FusionLab: React.FC<FusionLabProps> = ({ vault, onResult, settings }) => {
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
      const result = await executeFusion(manifest, vault, settings);
      setFusionResultUrl(result.imageUrl);
      setAlchemistLogs(prev => [...prev, ...result.logs]);

      if (autoRefine && result.imageUrl) {
        setAlchemistLogs(prev => [...prev, { type: 'Visual Quality Judge', status: 'processing', message: 'Analyzing Character Migration Integrity...', timestamp: Date.now(), department: 'Advanced' }]);
        const popItem = vault.find(v => v.shortId === manifest.pop_id);
        const judgeResult = await visualAnalysisJudge(result.imageUrl, manifest.fusionIntent, popItem?.imageUrl, settings);
        
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
          const refinedResult = await executeFusion(refinedManifest, vault, settings);
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
      const result = await refinePromptDNA(manifest.fusionIntent, settings);
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
      const { manifest: optimizedManifest } = await autoOptimizeFusion(manifest.fusionIntent, manifest, vault, settings);
      setManifest(optimizedManifest);
      setAlchemistLogs(prev => [...prev, { type: 'Visual Archivist', status: 'completed', message: 'Optimal Character mapping identified.', timestamp: Date.now(), department: 'Direction' }]);
    } catch (e) { console.error(e); setIsAutoPilotActive(false); } finally { setIsOptimizing(false); }
  };

  useEffect(() => {
    if (isAutoPilotActive && manifest.fusionIntent.trim() && !isOptimizing) {
      handleAutoPilotTrigger();
    }
  }, [isAutoPilotActive]);

  const handleSelectSlot = (key: keyof FusionManifest, id: string) => {
    setManifest(prev => ({ ...prev, [key]: id }));
  };

  return (
    <div className="min-h-full bg-[#08080a] p-6 lg:p-12 flex flex-col lg:flex-row gap-12 pb-32 overflow-y-auto">
      <div className="flex-1 space-y-12 max-w-5xl">
        <FusionHeader />

        <FusionReactorControls 
          intent={manifest.fusionIntent}
          onIntentChange={(val) => setManifest(prev => ({ ...prev, fusionIntent: val }))}
          onRefine={handleRefineIntent}
          isOptimizing={isOptimizing}
          isAutoPilot={isAutoPilotActive}
          onAutoPilotToggle={() => setIsAutoPilotActive(!isAutoPilotActive)}
        />

        <FusionSlots 
          manifest={manifest} 
          vault={vault} 
          onSelectSlot={handleSelectSlot} 
          isOptimizing={isOptimizing} 
        />

        <FusionAction 
          onFusion={handleFusion} 
          isProcessing={isProcessing} 
          isOptimizing={isOptimizing} 
        />
      </div>

      <div className="w-full lg:w-[400px] space-y-8 h-fit lg:sticky lg:top-32">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 px-2">Reactor Log Telemetry</h3>
        <AgentFeed logs={alchemistLogs} isProcessing={isProcessing} />
      </div>
    </div>
  );
};

export default FusionLab;
