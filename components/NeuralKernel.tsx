
import React from 'react';
import { AgentStatus } from '../types';

interface NeuralKernelProps {
  logs?: AgentStatus[];
}

const NeuralKernel: React.FC<NeuralKernelProps> = ({ logs = [] }) => {
  const activeAgents = Array.from(new Set(logs.map(l => l.type))).slice(0, 5);

  const pythonCode = `import torch
import torch.nn as nn
import torch.nn.functional as F

class LatentOrchestratorPro(nn.Module):
    """
    UPGRADED CORE v10.0: Global Identity Migration System
    Protects the entire character DNA (Clothing, Build, Identity).
    """
    def __init__(self, device='cuda'):
        super().__init__()
        self.device = device
        self.identity_shield = GlobalIdentityShield()
        
    def migrate_character(self, z_subject, z_pose_ref, alpha=1.0):
        """
        Migração global protegida.
        Image 1: Subject DNA (Subject, Clothing, Hair)
        Image 2: Pose DNA (Skeletal position ONLY)
        """
        # 1. Extração de Metadados de Personagem
        char_metadata = self.identity_shield.biopsy(z_subject)
        
        # 2. Deformação Anatômica da Pose
        skeleton = self.extract_skeleton(z_pose_ref)
        
        # 3. Projeção de Mesh Latente
        # O modelo reconstrói o personage de z_subject na pose de skeleton
        z_migrated = self.vae_reconstruct(
            identity=char_metadata,
            pose=skeleton,
            consistency_weight=alpha
        )
        
        return z_migrated
    
    def character_dna_lock(self, z_latent, strength=2.5):
        """
        Força a dominância do Personagem Inteiro.
        Evita que o modelo use as roupas da pose de referência.
        """
        lock = torch.sigmoid(torch.tensor(strength - 1.0))
        return z_latent * lock + self.noise_floor() * (1 - lock)

def CHARACTER_MAP(z_outfit, z_anatomy, global_pacing=0.9):
    """
    Conserva 100% da indumentária e traços físicos.
    """
    return apply_global_mask(z_outfit, z_anatomy, mode='character_migration')
`;

  return (
    <div className="h-full bg-[#050505] overflow-auto p-8 mono relative">
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
          <h3 className="text-xs font-black text-indigo-400 tracking-[0.3em] uppercase">Kernel Source: LCP_v10_migration.py</h3>
        </div>
        
        <div className="space-y-2 text-right">
          <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest">LCP-Telemetria Active:</p>
          <div className="flex flex-wrap gap-2 justify-end">
            {activeAgents.length > 0 ? activeAgents.map((type, i) => (
              <span key={i} className="px-2 py-1 bg-pink-500/10 border border-pink-500/30 text-[8px] text-pink-300 rounded uppercase font-black">
                {type}
              </span>
            )) : (
              <span className="text-[8px] text-zinc-700 italic">No agents active in current session.</span>
            )}
          </div>
        </div>
      </div>

      <pre className="text-[11px] leading-relaxed text-zinc-500">
        <code className="language-python">
          {pythonCode}
        </code>
      </pre>
      
      <div className="mt-12 p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
            <p className="text-[10px] text-zinc-400 uppercase font-black">LCP v10 Migration Protocol</p>
            <div className="space-y-2">
              <p className="text-indigo-400 text-[10px] font-bold">Character Identity Lock (Full):</p>
              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '99.9%' }} />
              </div>
              <p className="text-[8px] text-zinc-600">DNA_CONSISTENCY: 0.9994 (IDENTITY_SHIELD_V10)</p>
            </div>
        </div>
        <div className="space-y-4">
            <p className="text-[10px] text-zinc-400 uppercase font-black">Pose Latent Projection</p>
            <div className="grid grid-cols-4 gap-2 h-16 items-end">
              <div className="bg-emerald-500/40 h-full rounded-sm" title="Character Mesh" />
              <div className="bg-indigo-500/60 h-full rounded-sm" title="Pose Skeleton" />
              <div className="bg-amber-500/60 h-full rounded-sm" title="Outfit Buffer" />
              <div className="bg-pink-500/60 h-full rounded-sm" title="Environment Sync" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralKernel;
