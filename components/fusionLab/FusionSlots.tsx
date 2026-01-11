
import React from 'react';
import { VaultItem, FusionManifest } from '../../types';
import FusionSlotItem from './FusionSlotItem';

interface FusionSlotsProps {
  manifest: FusionManifest;
  vault: VaultItem[];
  onSelectSlot: (key: keyof FusionManifest, id: string) => void;
  isOptimizing: boolean;
}

const FusionSlots: React.FC<FusionSlotsProps> = ({ manifest, vault, onSelectSlot, isOptimizing }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <FusionSlotItem 
        label="PEP Node (Identity)" 
        color="text-emerald-400" 
        currentId={manifest.pep_id} 
        vault={vault} 
        onSelect={(id) => onSelectSlot('pep_id', id)} 
        isOptimizing={isOptimizing} 
      />
      <FusionSlotItem 
        label="POP Node (Pose)" 
        color="text-pink-400" 
        currentId={manifest.pop_id} 
        vault={vault} 
        onSelect={(id) => onSelectSlot('pop_id', id)} 
        isOptimizing={isOptimizing} 
      />
      <FusionSlotItem 
        label="POV Node (Lens)" 
        color="text-cyan-400" 
        currentId={manifest.pov_id} 
        vault={vault} 
        onSelect={(id) => onSelectSlot('pov_id', id)} 
        isOptimizing={isOptimizing} 
      />
      <FusionSlotItem 
        label="AMB Node (Env)" 
        color="text-amber-400" 
        currentId={manifest.amb_id} 
        vault={vault} 
        onSelect={(id) => onSelectSlot('amb_id', id)} 
        isOptimizing={isOptimizing} 
      />
    </div>
  );
};

export default FusionSlots;
