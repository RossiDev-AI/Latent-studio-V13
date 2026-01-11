
import React, { useState, useRef, useEffect } from 'react';
import { extractDeepDNA } from '../geminiService';
import { VaultItem, CategorizedDNA, VaultDomain, AppSettings } from '../types';

// Subcomponents
import IndexerHeader from './manualLab/IndexerHeader';
import IndexerUpload from './manualLab/IndexerUpload';
import IndexerDomainSelector from './manualLab/IndexerDomainSelector';
import IndexerDnaBiopsy from './manualLab/IndexerDnaBiopsy';
import IndexerCommitAction from './manualLab/IndexerCommitAction';

interface ManualNodeProps {
  onSave: (item: VaultItem) => Promise<void>;
  settings?: AppSettings;
}

const ManualNode: React.FC<ManualNodeProps> = ({ onSave, settings }) => {
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
      const result = await extractDeepDNA(image, settings);
      setDna(result);
      
      if (result.character && result.character.length > 5) {
        setVaultDomain('X'); 
      } else if (result.environment && result.environment.length > 5) {
        setVaultDomain('Y'); 
      } else if (result.technical_tags && result.technical_tags.some(t => t.toLowerCase().includes('light'))) {
        setVaultDomain('L'); 
      } else {
        setVaultDomain('Z'); 
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

  return (
    <div className="h-full flex items-center justify-center p-4 md:p-12 bg-[#050505] overflow-y-auto">
      <div className="w-full max-w-6xl bg-zinc-900/10 border border-white/5 rounded-[3rem] md:rounded-[5rem] p-8 md:p-20 space-y-12 shadow-[0_0_150px_rgba(0,0,0,0.8)] backdrop-blur-3xl relative overflow-hidden">
        
        <IndexerHeader 
          onBiopsy={handleMagicBiopsy} 
          isScanning={isScanningDNA} 
          hasImage={!!image} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
          <div className="space-y-8 relative">
            <IndexerUpload 
              image={image} 
              isScanning={isScanningDNA} 
              scanProgress={scanProgress} 
              onUploadClick={() => !isScanningDNA && fileRef.current?.click()} 
            />
            
            {image && !dna && !isScanningDNA && (
              <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] flex items-center justify-between">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-relaxed">Awaiting neural DNA biopsy to categorize node.</p>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>

          <div className="space-y-10 flex flex-col">
            {dna ? (
              <div className="flex-1 flex flex-col space-y-8 animate-in slide-in-from-right-12 duration-1000">
                <IndexerDomainSelector 
                  selectedDomain={vaultDomain} 
                  onSelect={setVaultDomain} 
                />
                <IndexerDnaBiopsy dna={dna} />
                <IndexerCommitAction 
                  onCommit={handleIndex} 
                  isIndexing={isIndexing} 
                  isEnabled={!!dna} 
                />
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

      <input type="file" ref={fileRef} className="hidden" onChange={handleFile} accept="image/*" />

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
