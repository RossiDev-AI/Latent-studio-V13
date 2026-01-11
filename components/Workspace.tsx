
import React, { useState, useRef, useEffect } from 'react';
import { AgentStatus, LatentParams, VaultItem, VaultDomain, LatentGrading, VisualAnchor, DeliberationStep, AgentAuthority, PoseData, AppSettings } from '../types';
import { extractDeepDNA, executeGroundedSynth } from '../geminiService';
import AgentFeed from './AgentFeed';
import ZModeModal from './ZModeModal';
import LGNEditor from './LGNEditor';
import MetricsDashboard from './MetricsDashboard';
import ProcessingControl from './ProcessingControl';
import PoseControlPanel from './PoseControlPanel';

// Subcomponents
import StudioPreview from './workspaceLab/StudioPreview';
import StudioSidebarHeader from './workspaceLab/StudioSidebarHeader';
import StudioAuthorityPanel from './workspaceLab/StudioAuthorityPanel';
import StudioConsensusReport from './workspaceLab/StudioConsensusReport';
import StudioActionPanel from './workspaceLab/StudioActionPanel';

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
  settings?: AppSettings;
}

const Workspace: React.FC<WorkspaceProps> = ({ 
  onSave, vault, prompt, setPrompt, currentImage, setCurrentImage,
  originalSource, setOriginalSource, logs, setLogs, params, setParams,
  onReloadApp, grading: initialGrading, settings
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
          const dna = await extractDeepDNA(result, settings);
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
      
      const poseContext = params.pose_control?.enabled ? `\n[POSE_RIG_ACTIVE]: ${params.pose_control.technicalDescription || 'Follow skeleton structure.'}` : '';
      const contextPrompt = prompt + poseContext;

      let result = await executeGroundedSynth(contextPrompt, weights, vault, auth, settings);
      
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

  const handleSlotClick = (domain: VaultDomain) => {
    setParams(prev => ({ ...prev, active_slots: { ...(prev.active_slots || {}), [domain]: null } }));
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0c0e] relative overflow-hidden min-h-full">
      <div className="hidden md:block">
        <MetricsDashboard params={params} />
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row relative">
        <StudioPreview 
          currentImage={currentImage} 
          isProcessing={isProcessing} 
          isBiopsyActive={isBiopsyActive} 
          loadingMessage={loadingMessages[loadingStep]} 
          localGrading={localGrading} 
          params={params} 
          vault={vault} 
          onUploadClick={() => fileInputRef.current?.click()} 
          onSlotClick={handleSlotClick} 
        />
        
        <div className="w-full md:w-[380px] lg:w-[440px] flex flex-col bg-[#0e0e11] border-l border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5 md:space-y-8 pb-40 md:pb-96 custom-scrollbar">
            <StudioSidebarHeader 
              onPurge={handlePurgeBuffer} 
              onZMode={() => setIsZModeOpen(true)} 
              onPose={() => setIsPoseOpen(!isPoseOpen)} 
              onLGN={() => setIsLGNOpen(true)} 
              isPoseOpen={isPoseOpen} 
              hasGrading={!!localGrading} 
            />

            {isPoseOpen ? (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <PoseControlPanel 
                  poseControl={params.pose_control} 
                  setPoseControl={setPoseControl} 
                  vault={vault} 
                  sourceImage={currentImage} 
                  onExecuteSurgical={handleProcess}
                  settings={settings}
                />
              </div>
            ) : (
              <>
                <StudioAuthorityPanel 
                  authority={params.agent_authority || { lighting: 50, texture: 50, structure: 50, anatomy: 50 }} 
                  onChange={handleAuthorityChange} 
                />
                <StudioConsensusReport report={collisionReport} />
                <ProcessingControl speed={params.processing_speed || 'Balanced'} setSpeed={(val) => setParams(prev => ({ ...prev, processing_speed: val }))} />
                <AgentFeed logs={logs} isProcessing={isProcessing} deliberation_flow={deliberationFlow} />
              </>
            )}
          </div>
          
          <StudioActionPanel 
            prompt={prompt} 
            setPrompt={setPrompt} 
            onProcess={handleProcess} 
            onCommit={handleCommit} 
            isProcessing={isProcessing} 
            isSaving={isSaving} 
            hasImage={!!currentImage} 
          />
        </div>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
      
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
