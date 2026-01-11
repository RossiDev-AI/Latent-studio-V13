
import React from 'react';

interface Category {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface GradingNavigationProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

const GradingNavigation: React.FC<GradingNavigationProps> = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="flex justify-around border-b border-white/5 py-1 bg-black/40">
       {categories.map((cat) => (
         <button 
          key={cat.id} 
          onClick={() => setActiveCategory(cat.id)} 
          className={`flex flex-col items-center p-2 transition-all flex-1 ${activeCategory === cat.id ? 'text-indigo-400' : 'text-zinc-600'}`}
         >
            {cat.icon}
            <span className="text-[7px] font-black uppercase mt-1 tracking-tighter">{cat.label}</span>
            {activeCategory === cat.id && <div className="w-4 h-0.5 bg-indigo-400 mt-1 rounded-full" />}
         </button>
       ))}
    </div>
  );
};

export default GradingNavigation;
