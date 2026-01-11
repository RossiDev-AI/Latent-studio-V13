
import React from 'react';

interface IndexerCommitActionProps {
  onCommit: () => void;
  isIndexing: boolean;
  isEnabled: boolean;
}

const IndexerCommitAction: React.FC<IndexerCommitActionProps> = ({ onCommit, isIndexing, isEnabled }) => {
  return (
    <button 
      onClick={onCommit}
      disabled={!isEnabled || isIndexing}
      className="w-full py-8 md:py-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.8em] text-[12px] shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 transition-all relative overflow-hidden group"
    >
      <span className="relative z-10">{isIndexing ? 'Committing to Vault...' : 'Commit Categorized DNA'}</span>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export default IndexerCommitAction;
