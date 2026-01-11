
import React from 'react';
import { VaultItem } from '../../types';

interface GradingQueueProps {
  favoriteNodes: VaultItem[];
  selectedNodeId: string | undefined;
  onSelectNode: (node: VaultItem) => void;
}

const GradingQueue: React.FC<GradingQueueProps> = ({ favoriteNodes, selectedNodeId, onSelectNode }) => {
  return (
    <div className="p-2 bg-black border-t border-white/5">
       <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar scroll-smooth">
          {favoriteNodes.map(item => (
            <button 
              key={item.id} 
              onClick={() => onSelectNode(item)} 
              className={`flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden border transition-all ${selectedNodeId === item.id ? 'border-indigo-500 scale-105 shadow-lg' : 'border-white/10 opacity-40 hover:opacity-100'}`}
            >
               <img src={item.imageUrl} className="w-full h-full object-cover" alt="T" />
            </button>
          ))}
          {favoriteNodes.length === 0 && (
            <div className="w-full py-2 flex items-center justify-center opacity-10">
              <p className="text-[7px] text-zinc-500 uppercase tracking-widest">Mark favorites in Vault to inject</p>
            </div>
          )}
       </div>
    </div>
  );
};

export default GradingQueue;
