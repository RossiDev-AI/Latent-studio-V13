
import React from 'react';
import { VaultItem } from '../../types';

interface CinemaVaultModalProps {
  items: VaultItem[];
  onSelect: (item: VaultItem) => void;
  onClose: () => void;
}

const CinemaVaultModal: React.FC<CinemaVaultModalProps> = ({ items, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[600] bg-black/98 backdrop-blur-3xl flex flex-col p-12 animate-in slide-in-from-bottom-10 duration-700">
      <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto w-full">
        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Vault Favorites</h3>
        <button onClick={onClose} className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Voltar</button>
      </div>
      <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full pb-20 custom-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {items.filter(v => v.isFavorite).map(item => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)} 
              className="aspect-square bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer hover:border-indigo-500 hover:scale-[1.03] transition-all group relative shadow-2xl"
            >
              <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] font-black text-white uppercase tracking-widest bg-indigo-600 px-4 py-2 rounded-xl">Selecionar Node</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CinemaVaultModal;
