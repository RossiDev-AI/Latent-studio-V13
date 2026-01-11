
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Workspace from './components/Workspace';
import Vault from './components/Vault';
import ManualNode from './components/ManualNode';
import FusionLab from './components/FusionLab';
import CinemaLab from './components/CinemaLab';
import CreationLab from './components/CreationLab';
import GradingLab from './components/GradingLab';
import { VaultItem, AgentStatus, LatentParams, LatentGrading, VisualAnchor, CinemaProject, SubtitleSettings } from './types';
import { getAllNodes, saveNode, deleteNode } from './dbService';

const DEFAULT_PARAMS: LatentParams = {
  z_anatomy: 1.0,
  z_structure: 1.0, 
  z_lighting: 0.5, 
  z_texture: 0.5,
  hz_range: 'Standard', 
  structural_fidelity: 1.0, 
  scale_factor: 1.0,
  auto_tune_active: true,
  neural_metrics: { 
    loss_mse: 0, 
    ssim_index: 1, 
    tensor_vram: 6.2, 
    iteration_count: 0, 
    consensus_score: 1 
  }
};

const DEFAULT_SUBTITLES: SubtitleSettings = {
  fontSize: 16,
  fontColor: '#ffffff',
  backgroundColor: '#000000',
  fontFamily: 'Inter',
  bgOpacity: 0.7,
  textAlign: 'center',
  paddingHMult: 1.2,
  paddingVMult: 1.2,
  radiusMult: 0.8,
  marginMult: 2.5
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'creation' | 'workspace' | 'vault' | 'manual' | 'fusion' | 'cinema' | 'grading'>('creation');
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [studioPrompt, setStudioPrompt] = useState('');
  const [studioCurrentImage, setStudioCurrentImage] = useState<string | null>(null);
  const [studioOriginalSource, setStudioOriginalSource] = useState<string | null>(null);
  const [studioLogs, setStudioLogs] = useState<AgentStatus[]>([]);
  const [studioParams, setStudioParams] = useState<LatentParams>({ ...DEFAULT_PARAMS });
  const [studioGroundingLinks, setStudioGroundingLinks] = useState<{title: string, uri: string}[]>([]);
  const [studioGrading, setStudioGrading] = useState<LatentGrading | undefined>(undefined);
  const [studioVisualAnchor, setStudioVisualAnchor] = useState<VisualAnchor | undefined>(undefined);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [hasInitError, setHasInitError] = useState(false);

  // CinemaLab Lifted State
  const [cinemaProject, setCinemaProject] = useState<CinemaProject>({
    id: crypto.randomUUID(),
    title: 'Neural Documentary',
    beats: [],
    audioUrl: null,
    fps: 30,
    aspectRatio: '16:9',
    subtitleSettings: DEFAULT_SUBTITLES
  });
  const [cinemaScript, setCinemaScript] = useState('');
  const [cinemaTitle, setCinemaTitle] = useState('');
  const [cinemaCredits, setCinemaCredits] = useState('');
  const [cinemaLogs, setCinemaLogs] = useState<AgentStatus[]>([]);
  const [cinemaActiveBeatIndex, setCinemaActiveBeatIndex] = useState(0);

  const fetchVault = useCallback(async () => {
    try {
      const items = await getAllNodes();
      setVaultItems(Array.isArray(items) ? items.sort((a, b) => b.timestamp - a.timestamp) : []);
    } catch (err) {
      console.error("Critical Database Error:", err);
      setVaultItems([]);
    } finally {
      setIsDbLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchVault().catch(e => {
      console.error("Init Error", e);
      setHasInitError(true);
    });
  }, [fetchVault]);

  const handleCreationResult = (imageUrl: string, params: LatentParams, prompt: string, links: any[], grading?: LatentGrading, visualAnchor?: VisualAnchor) => {
    setStudioCurrentImage(imageUrl);
    setStudioParams(params);
    setStudioPrompt(prompt);
    setStudioGroundingLinks(links);
    setStudioGrading(grading);
    setStudioVisualAnchor(visualAnchor);
    setStudioOriginalSource(null);
    setActiveTab('workspace');
  };

  const handleFusionResult = (imageUrl: string, params: LatentParams, logs: any[]) => {
    setStudioCurrentImage(imageUrl);
    setStudioParams(params);
    setStudioLogs(logs);
    setStudioOriginalSource(null);
    setStudioGrading(undefined);
    setStudioVisualAnchor(undefined);
    setActiveTab('workspace');
  };

  const handleSaveToVault = useCallback(async (item: VaultItem) => {
    try {
      await saveNode(item);
      setVaultItems(prev => {
        const index = prev.findIndex(i => i.id === item.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        }
        return [item, ...prev];
      });
    } catch (e) {
      console.error("Failed to index node:", e);
    }
  }, []);

  const handleDeleteFromVault = useCallback(async (id: string) => {
    try {
      await deleteNode(id);
      setVaultItems(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }, []);

  const handleReloadFromVault = (item: VaultItem) => {
    setStudioCurrentImage(item.imageUrl);
    setStudioOriginalSource(item.originalImageUrl);
    setStudioParams(item.params);
    setStudioPrompt(item.prompt);
    setStudioLogs(item.agentHistory || []);
    setStudioGrading(item.grading);
    setStudioVisualAnchor(undefined);
    setActiveTab('workspace');
  };

  const executeHardReset = useCallback(() => {
    setStudioPrompt('');
    setStudioCurrentImage(null);
    setStudioOriginalSource(null);
    setStudioLogs([]);
    setStudioParams({ ...DEFAULT_PARAMS });
    setStudioGroundingLinks([]);
    setStudioGrading(undefined);
    setStudioVisualAnchor(undefined);
  }, []);

  const handleCinemaReset = useCallback(() => {
    if (!window.confirm("Deseja limpar todo o CinemaLab? Esta ação é irreversível.")) return;
    setCinemaProject({
      id: crypto.randomUUID(),
      title: 'Neural Documentary',
      beats: [],
      audioUrl: null,
      fps: 30,
      aspectRatio: '16:9',
      subtitleSettings: DEFAULT_SUBTITLES
    });
    setCinemaScript('');
    setCinemaTitle('');
    setCinemaCredits('');
    setCinemaLogs([]);
    setCinemaActiveBeatIndex(0);
  }, []);

  if (hasInitError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-black text-white uppercase">Kernel Initialization Failure</h1>
          <p className="text-zinc-500 text-sm mono">Check your environment for process.env.API_KEY.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold text-xs">Retry Protocol</button>
        </div>
      </div>
    );
  }

  const NavItem = ({ id, label, icon }: { id: any, label: string, icon?: React.ReactNode }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`flex flex-col md:flex-row items-center justify-center md:px-5 py-2 md:py-1.5 rounded-2xl md:rounded-full text-[7px] md:text-xs font-black transition-all flex-1 md:flex-none ${
        activeTab === id 
        ? 'bg-indigo-600 text-white shadow-lg' 
        : 'text-zinc-600 hover:text-zinc-300'
      }`}
    >
      {icon && <span className="md:hidden mb-0.5 scale-75">{icon}</span>}
      <span className="leading-none">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-zinc-100 overflow-hidden relative">
      <header className="sticky top-0 z-[300] bg-black/80 backdrop-blur-md border-b border-white/5 h-14 md:h-16 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
             <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xs md:text-lg font-black tracking-tighter uppercase leading-none">Latent Cinema</h1>
            <span className="text-[7px] md:text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Nexus v3.0 Industrial Core</span>
          </div>
        </div>

        <nav className="hidden md:flex bg-zinc-900/50 p-1 rounded-full border border-white/5 gap-1 shadow-2xl">
          <NavItem id="creation" label="Creation" />
          <NavItem id="workspace" label="Studio" />
          <NavItem id="grading" label="Grading" />
          <NavItem id="cinema" label="Cinema" />
          <NavItem id="fusion" label="Fusion" />
          <NavItem id="manual" label="Indexer" />
          <NavItem id="vault" label={`Vault (${vaultItems.length})`} />
        </nav>

        <div className="md:hidden flex items-center gap-2">
            <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[7px] mono text-zinc-500 uppercase">Kernel: V12 Active</div>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[#020202] pb-20 md:pb-0">
        {!isDbLoaded ? (
          <div className="flex h-full items-center justify-center">
             <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Suspense fallback={<div className="p-4 text-zinc-500 text-[10px]">Loading...</div>}>
            {activeTab === 'creation' && (
              <CreationLab 
                onResult={handleCreationResult}
                params={studioParams}
                setParams={setStudioParams}
                onReset={executeHardReset}
                vault={vaultItems}
              />
            )}
            {activeTab === 'workspace' && (
              <Workspace 
                onSave={handleSaveToVault} vault={vaultItems} prompt={studioPrompt} setPrompt={setStudioPrompt}
                currentImage={studioCurrentImage} setCurrentImage={setStudioCurrentImage} 
                originalSource={studioOriginalSource} setOriginalSource={setStudioOriginalSource}
                logs={studioLogs} setLogs={setStudioLogs} params={studioParams} setParams={setStudioParams}
                onReloadApp={executeHardReset} grading={studioGrading} visualAnchor={studioVisualAnchor}
              />
            )}
            {activeTab === 'grading' && (
              <GradingLab 
                vault={vaultItems}
                onSave={handleSaveToVault}
              />
            )}
            {activeTab === 'cinema' && (
              <CinemaLab 
                vault={vaultItems} 
                onSave={handleSaveToVault} 
                currentSourceImage={studioCurrentImage}
                project={cinemaProject}
                setProject={setCinemaProject}
                script={cinemaScript}
                setScript={setCinemaScript}
                title={cinemaTitle}
                setTitle={setCinemaTitle}
                credits={cinemaCredits}
                setCredits={setCinemaCredits}
                logs={cinemaLogs}
                setLogs={setCinemaLogs}
                activeBeatIndex={cinemaActiveBeatIndex}
                setActiveBeatIndex={setCinemaActiveBeatIndex}
                onReset={handleCinemaReset}
              />
            )}
            {activeTab === 'fusion' && <FusionLab vault={vaultItems} onResult={handleFusionResult} />}
            {activeTab === 'manual' && <ManualNode onSave={handleSaveToVault} />}
            {activeTab === 'vault' && <Vault items={vaultItems} onDelete={handleDeleteFromVault} onClearAll={() => {}} onRefresh={fetchVault} onReload={handleReloadFromVault} />}
          </Suspense>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[400] bg-black/90 backdrop-blur-xl border-t border-white/10 h-16 flex items-center justify-around px-0.5 shadow-2xl">
        <NavItem id="creation" label="Creation" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2}/></svg>} />
        <NavItem id="workspace" label="Studio" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeWidth={2}/></svg>} />
        <NavItem id="grading" label="Grading" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" strokeWidth={2}/></svg>} />
        <NavItem id="cinema" label="Cinema" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth={2}/></svg>} />
        <NavItem id="manual" label="Indexer" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={2}/></svg>} />
        <NavItem id="fusion" label="Fusion" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86 1.412l-1.874 1.318" strokeWidth={2}/></svg>} />
        <NavItem id="vault" label="Vault" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" strokeWidth={2}/></svg>} />
      </nav>
    </div>
  );
};

export default App;
