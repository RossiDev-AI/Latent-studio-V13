
import React, { useState } from 'react';
import { AppSettings } from '../types';

// Subcomponents
import SettingsHeader from './settingsLab/SettingsHeader';
import SettingsApiKeyGrid from './settingsLab/SettingsApiKeyGrid';
import SettingsPersistencePanel from './settingsLab/SettingsPersistencePanel';

interface SettingsLabProps {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}

const SettingsLab: React.FC<SettingsLabProps> = ({ settings, setSettings }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);

  const handleUpdate = (key: keyof AppSettings, value: string) => {
    const next = { ...localSettings, [key]: value };
    setLocalSettings(next);
    setSettings(next);
    
    setSaveIndicator(key);
    setTimeout(() => setSaveIndicator(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] overflow-y-auto custom-scrollbar p-6 lg:p-12 pb-32">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <SettingsHeader />

        <SettingsApiKeyGrid 
          settings={localSettings} 
          onUpdate={handleUpdate} 
          saveIndicator={saveIndicator} 
        />

        <SettingsPersistencePanel />

        <div className="pt-8 text-center border-t border-white/5">
           <p className="text-[8px] mono text-zinc-700 uppercase tracking-widest font-black">
              Kernel Status: V13 Industrial - No Restart Required
           </p>
           <div className="flex justify-center gap-4 mt-4">
              <div className="h-1 w-12 bg-indigo-500/20 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 animate-pulse" style={{ width: '100%' }} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLab;
