
import React, { useState, useCallback } from 'react';
import { VaultItem, VaultDomain } from '../types';
import { toggleFavoriteNode, bulkSaveNodes } from '../dbService';

// Subcomponents
import VaultHeader from './vaultLab/VaultHeader';
import VaultFilters from './vaultLab/VaultFilters';
import VaultNodeItem from './vaultLab/VaultNodeItem';
import VaultNodeInspector from './vaultLab/VaultNodeInspector';

interface VaultProps {
  items: VaultItem[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onReload: (item: VaultItem) => void;
  onRefresh: () => Promise<void>;
}

const Vault: React.FC<VaultProps> = ({ items, onDelete, onClearAll, onReload, onRefresh }) => {
  const [filterDomain, setFilterDomain] = useState<VaultDomain | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleFavorite = async (id: string) => {
    await toggleFavoriteNode(id);
    await onRefresh();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `latent-vault-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const importedItems = JSON.parse(ev.target?.result as string) as VaultItem[];
          if (Array.isArray(importedItems)) {
            await bulkSaveNodes(importedItems);
            await onRefresh();
            alert(`${importedItems.length} nodes successfully merged.`);
          }
        } catch (err) {
          alert('Failed to parse vault file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getDNAColor = (domain?: VaultDomain) => {
    switch(domain) {
      case 'X': return 'bg-emerald-600 border-emerald-400';
      case 'Y': return 'bg-pink-600 border-pink-400';
      case 'Z': return 'bg-cyan-600 border-cyan-400';
      case 'L': return 'bg-amber-600 border-amber-400';
      default: return 'bg-zinc-700 border-white/10';
    }
  };

  const filteredItems = items
    .filter(item => filterDomain === 'ALL' || item.vaultDomain === filterDomain)
    .sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return b.neuralPreferenceScore - a.neuralPreferenceScore;
    });

  return (
    <div className="p-8 md:p-12 bg-[#0c0c0e] min-h-full space-y-12 pb-32">
      <VaultHeader 
        nodeCount={items.length} 
        onExport={handleExport} 
        onImport={handleImport} 
      />

      <div className="flex flex-col">
        <VaultFilters 
          filterDomain={filterDomain} 
          setFilterDomain={setFilterDomain} 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <React.Fragment key={item.id}>
                <VaultNodeItem 
                  item={item}
                  isExpanded={isExpanded}
                  onToggleExpand={setExpandedId}
                  onToggleFavorite={handleToggleFavorite}
                  onReload={onReload}
                  onDelete={onDelete}
                  getDNAColor={getDNAColor}
                />
                
                {isExpanded && (
                  <div className="col-span-1 md:col-span-2 order-last md:order-none">
                    <VaultNodeInspector 
                      item={item}
                      onReload={onReload}
                      onClose={() => setExpandedId(null)}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Vault;
