
import React, { useState, useRef, useEffect } from 'react';
import { extractDeepDNA } from '../geminiService';
import { VaultItem, CategorizedDNA, ComponentType, VaultDomain } from '../types';

interface ManualNodeProps {
  onSave: (item: VaultItem) => Promise<void>;
}

const ManualNode: React.FC<ManualNodeProps> = ({ onSave }) => {
  const [image, setImage] = useState<string | null>(null);
  const [dna, setDna] = useState<CategorizedDNA | null>(null);
  const [vaultDomain, setVaultDomain] = useState<VaultDomain>('X');
  const [isScanningDNA, setIsScanningDNA] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (isScanningDNA) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress(prev => (prev < 95 ? prev + Math.random() * 15 : prev));
      }, 400);
    } else {
      setScanProgress(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isScanningDNA]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
        setDna(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMagicBiopsy = async () => {
    if (!image || isScanningDNA) return;
    setIsScanningDNA(true);
    try {
      const result = await extractDeepDNA(image);
      setDna(result);
      
      // Intelligent Domain Suggestion
      if (result.character && result.character.length > 5) {
        setVaultDomain('X'); // Identity
      } else if (result.environment && result.environment.length > 5) {
        setVaultDomain('Y'); // Environment
      } else if (result.technical_tags && result.technical_tags.some(t => t.toLowerCase().includes('light'))) {
        setVaultDomain('L'); // Lighting
      } else {
        setVaultDomain('Z'); // Style/Texture
      }
    } catch (err) {
      alert('Neural Biopsy Protocol Interrupted.');
    } finally {
      setIsScanningDNA(false);
    }
  };

  const handleIndex = async () => {
    if (!image || !dna || isIndexing) return;
    setIsIndexing(true);
    try {
      const shortIdNum = Math.floor(10000 + Math.random() * 90000);
      const nameTag = dna.character || dna.environment || 'Latent_Node';
      
      const item: VaultItem = {
        id: crypto.randomUUID(),
        shortId: `LCP-${shortIdNum}`,
        name: nameTag.split(' ').slice(0, 2).join('_').replace(/[^a-zA-Z0-9_]/g, ''),
        imageUrl: image,
        originalImageUrl: image,
        prompt: dna.technical_tags?.join(', ') || `Visual DNA: ${nameTag}`,
        agentHistory: [{ 
            type: 'Visual Archivist', 
            status: 'completed', 
            message: `Neural Biopsy completed. Node committed to Vault ${vaultDomain}.`, 
            timestamp: Date.now(),
            department: 'Advanced'
        }],
        params: {
          z_anatomy: 1, z_structure: 1, z_lighting: 1, z_texture: 1,
          hz_range: "Index-v11", 
          dna,
          structural_fidelity: 1.0, 
          scale_factor: 1.0, 
          neural_metrics: { loss_mse: 0, ssim_index: 1, tensor_vram: 2.5, iteration_count: 0, consensus_score: 1.0 }
        },
        dna,
        rating: 5,
        timestamp: Date.now(),
        usageCount: 0,
        neuralPreferenceScore: 65,
        isFavorite: false,
        vaultDomain: vaultDomain
      };
      await onSave(item);
      setImage(null);
      setDna(null);
    } catch (err) {
      alert('Vault Commitment Failure.');
    } finally {
      setIsIndexing(false);
    }
  };

  const domainData = {
    X: { label: 'Identity', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    Y: { label: 'Environment', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
    Z: { label: 'Style', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    L: { label: 'Lighting', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  };

  return (
    <div className="h-full flex items-center justify-center p-4 md:p-12 bg-[#050505] overflow-y-auto">
      <div className="w-full max-w-6xl bg-zinc-900/10 border border-white/5 rounded-[3rem] md:rounded-[5rem] p-8 md:p-20 space-y-12 shadow-[0_0_150px_rgba(0,0,0,0.8)] backdrop-blur-3xl relative overflow-hidden">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group">
                <svg className="w-6 h-6 text-indigo-500 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={2.5}/></svg>
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Neural Biopsy Station</h2>
                <p className="text-[10px] mono text-zinc-500 uppercase tracking-[0.5em]">LCP_v11.11 AUTOMATED INDEXING</p>
              </div>
            </div>
          </div>
          
          {image && (
            <button 
              onClick={handleMagicBiopsy}
              disabled={isScanningDNA}
              className={`group flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600/20 transition-all ${isScanningDNA ? 'animate-pulse' : ''}`}
            >
              <svg className="w-4 h-4 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.5 3L11 8.5L5.5 11L11 13.5L13.5 19L16 13.5L21.5 11L16 8.5L13.5 3Z" strokeWidth={2}/></svg>
              {isScanningDNA ? 'Scanning DNA...' : 'Neural Biopsy (Magic Wand)'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
          {/* Left: Upload & Preview */}
          <div className="space-y-8 relative">
            <div 
              onClick={() => !isScanningDNA && fileRef.current?.click()}
              className={`group relative aspect-square rounded-[3rem] md:rounded-[4rem] border-2 border-dashed transition-all duration-700 overflow-hidden cursor-pointer ${image ? 'border-transparent' : 'border-white/5 hover:border-indigo-500/30 bg-black/40'}`}
            >
              {image ? (
                <>
                  <img src={image} className={`w-full h-full object-cover transition-all duration-1000 ${isScanningDNA ? 'scale-110 blur-sm grayscale' : 'scale-100 grayscale-0'}`} alt="Reference" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  
                  {isScanningDNA && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-4">
                      <div className="w-full h-[2px] bg-indigo-500 shadow-[0_0_20px_#6366f1] animate-scan-y absolute top-0" />
                      <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-indigo-500/30">
                        <span className="text-[10px] font-black text-indigo-400 mono uppercase tracking-widest">Sequencing: {Math.floor(scanProgress)}%</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-full text-[9px] font-black text-white uppercase border border-white/10">Replace Frame</span>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth={1.5}/></svg>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600">Inject Reference Frame</p>
                    <p className="text-[8px] mono text-zinc-800 uppercase">TIFF / PNG / WEBP SUPPORTED</p>
                  </div>
                </div>
              )}
              <input type="file" ref={fileRef} className="hidden" onChange={handleFile} accept="image/*" />
            </div>
            
            {image && !dna && !isScanningDNA && (
              <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] flex items-center justify-between">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-relaxed">Awaiting neural DNA biopsy to categorize node.</p>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* Right: Data & Domain */}
          <div className="space-y-10 flex flex-col">
            {dna ? (
              <div className="flex-1 flex flex-col space-y-8 animate-in slide-in-from-right-12 duration-1000">
                
                {/* Domain Selector */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Select Target Domain</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(Object.keys(domainData) as VaultDomain[]).map(d => (
                      <button 
                        key={d}
                        onClick={() => setVaultDomain(d)}
                        className={`flex flex-col items-center justify-center gap-2 py-5 rounded-3xl border transition-all relative overflow-hidden ${vaultDomain === d ? `bg-white text-black border-white shadow-2xl scale-105` : `bg-black/40 border-white/5 text-zinc-600 hover:text-zinc-400`}`}
                      >
                        <span className="text-[13px] font-black">{d}</span>
                        <span className="text-[7px] font-black uppercase tracking-widest">{domainData[d].label}</span>
                        {vaultDomain === d && <div className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-bl-lg" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DNA Preview Dashboard */}
                <div className="flex-1 bg-zinc-950/40 border border-white/5 rounded-[3rem] p-8 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Neural Biopsy Results</h4>
                    <p className="text-[12px] text-white font-black uppercase leading-tight">{dna.character || dna.environment || 'Analyzed Node'}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                      <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Core Attribute</span>
                      <p className="text-[10px] text-zinc-300 italic">"{dna.pose || dna.environment || 'N/A'}"</p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block px-1">Technical Spec Tags</span>
                      <div className="flex flex-wrap gap-2">
                        {dna.technical_tags?.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-full text-[8px] mono text-zinc-400 font-bold uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-1">
                        <span className="text-[7px] font-black text-zinc-600 uppercase">Camera</span>
                        <p className="text-[9px] text-white mono font-bold uppercase">{dna.spatial_metadata?.camera_angle || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[7px] font-black text-zinc-600 uppercase">Lighting</span>
                        <p className="text-[9px] text-white mono font-bold uppercase">{dna.aesthetic_dna?.lighting_setup?.split(' ').slice(0, 2).join(' ') || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleIndex}
                  disabled={isIndexing}
                  className="w-full py-8 md:py-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.8em] text-[12px] shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10">{isIndexing ? 'Committing to Vault...' : 'Commit Categorized DNA'}</span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-20 opacity-30">
                <div className="w-16 h-16 border-2 border-indigo-500/20 rounded-full border-t-indigo-500 animate-spin" />
                <div className="space-y-2">
                   <p className="text-[11px] font-black uppercase tracking-widest">Station Locked</p>
                   <p className="text-[9px] mono uppercase">Awaiting neural input buffer...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        .animate-scan-y {
          animation: scan 4s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
};

export default ManualNode;
