
import React, { useState } from 'react';
import { executeGroundedSynth, optimizeVisualPrompt } from '../geminiService';
import { LatentParams, AgentStatus, VaultItem, ScoutData, LatentGrading, VisualAnchor, AgentAuthority, DeliberationStep, AppSettings } from '../types';
import AgentFeed from './AgentFeed';

// Subcomponents
import CreationHeader from './creationLab/CreationHeader';
import CreationInputs from './creationLab/CreationInputs';
import CreationAuthority from './creationLab/CreationAuthority';
import CreationZMatrix from './creationLab/CreationZMatrix';
import CreationAction from './creationLab/CreationAction';
import CreationScoutView from './creationLab/CreationScoutView';

interface CreationLabProps {
  onResult: (imageUrl: string, params: LatentParams, prompt: string, links: any[], grading?: LatentGrading, visualAnchor?: VisualAnchor) => void;
  params: LatentParams;
  setParams: (p: LatentParams) => void;
  onReset: () => void;
  vault?: VaultItem[];
  settings?: AppSettings;
}

const CreationLab: React.FC<CreationLabProps> = ({ onResult, params, setParams, onReset, vault = [], settings }) => {
  const [prompt, setPrompt] = useState('');
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [logs, setLogs] = useState<AgentStatus[]>([]);
  const [deliberationFlow, setDeliberationFlow] = useState<DeliberationStep[]>([]);
  const [scoutData, setScoutData] = useState<ScoutData | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);
  const [agentAuthority, setAgentAuthority] = useState<AgentAuthority>({ lighting: 50, texture: 50, structure: 50, anatomy: 50 });
  
  const [zAnatomy, setZAnatomy] = useState(1.0);
  const [zStructure, setZStructure] = useState(1.0);
  const [zLighting, setZLighting] = useState(0.5);
  const [zTexture, setZTexture] = useState(0.5);

  const handleMagicWand = async () => {
    if (!prompt.trim() || isOptimizing) return;
    setIsOptimizing(true);
    setLogs(prev => [...prev, { type: 'Meta-Prompt Translator', status: 'processing', message: 'Upleveling user intent to Industrial Meta-Prompt...', timestamp: Date.now(), department: 'Advanced' }]);
    try {
      const optimized = await optimizeVisualPrompt(prompt, settings);
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
      const result = await executeGroundedSynth(prompt, weights, vault, agentAuthority, settings);
      
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
          <CreationHeader onReset={handleHardReset} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-8">
                <CreationInputs 
                  prompt={prompt} 
                  setPrompt={setPrompt} 
                  refinedPrompt={refinedPrompt} 
                  isOptimizing={isOptimizing} 
                  onMagicWand={handleMagicWand} 
                />
                <CreationAuthority 
                  authority={agentAuthority} 
                  onChange={handleAuthorityChange} 
                />
             </div>

             <div className="space-y-8 flex flex-col">
                <CreationZMatrix 
                  zAnatomy={zAnatomy} setZAnatomy={setZAnatomy}
                  zStructure={zStructure} setZStructure={setZStructure}
                  zLighting={zLighting} setZLighting={setZLighting}
                  zTexture={zTexture} setZTexture={setZTexture}
                />
                <CreationAction 
                  isProcessing={isProcessing} 
                  onProcess={handleProcess} 
                  prompt={prompt} 
                />
             </div>
          </div>

          <CreationScoutView 
            scoutData={scoutData} 
            groundingLinks={groundingLinks} 
          />
        </div>
        
        <div className="w-full lg:w-[400px] flex flex-col gap-6 lg:sticky lg:top-12 h-[calc(100vh-160px)]">
           <AgentFeed logs={logs} isProcessing={isProcessing} deliberation_flow={deliberationFlow} />
        </div>
      </div>
    </div>
  );
};

export default CreationLab;
