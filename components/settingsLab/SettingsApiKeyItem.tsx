
import React from 'react';
import { AppSettings } from '../../types';

interface SettingsApiKeyItemProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  apiKey: keyof AppSettings;
  placeholder: string;
  onUpdate: (key: keyof AppSettings, val: string) => void;
  isRecentUpdate: boolean;
}

const SettingsApiKeyItem: React.FC<SettingsApiKeyItemProps> = ({ 
  label, icon, value, apiKey, placeholder, onUpdate, isRecentUpdate 
}) => {
  return (
    <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] space-y-3 transition-all hover:border-indigo-500/20 group">
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          {icon}
          {label}
        </label>
        {isRecentUpdate ? (
          <span className="text-[7px] font-black text-emerald-500 uppercase animate-pulse">Live Sync Active</span>
        ) : value ? (
          <div className="flex items-center gap-1">
             <span className="text-[7px] font-bold text-zinc-700 uppercase">Vault Secured</span>
             <svg className="w-3 h-3 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} /></svg>
          </div>
        ) : null}
      </div>
      <div className="relative">
        <input 
          type="password"
          value={value}
          onChange={(e) => onUpdate(apiKey, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs text-indigo-400 focus:outline-none focus:border-indigo-500/30 transition-all font-mono placeholder:text-zinc-800"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
           <svg className="w-4 h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth={2}/></svg>
        </div>
      </div>
    </div>
  );
};

export default SettingsApiKeyItem;
