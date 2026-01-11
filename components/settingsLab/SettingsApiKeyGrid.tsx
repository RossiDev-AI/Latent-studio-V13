
import React from 'react';
import { AppSettings } from '../../types';
import SettingsApiKeyItem from './SettingsApiKeyItem';

interface SettingsApiKeyGridProps {
  settings: AppSettings;
  onUpdate: (key: keyof AppSettings, val: string) => void;
  saveIndicator: string | null;
}

const SettingsApiKeyGrid: React.FC<SettingsApiKeyGridProps> = ({ settings, onUpdate, saveIndicator }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SettingsApiKeyItem 
        label="Google / Gemini API" 
        apiKey="googleApiKey" 
        value={settings.googleApiKey}
        placeholder="AI Studio API Key..."
        onUpdate={onUpdate}
        isRecentUpdate={saveIndicator === 'googleApiKey'}
        icon={<div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
      />
      <SettingsApiKeyItem 
        label="Pexels API" 
        apiKey="pexelsApiKey" 
        value={settings.pexelsApiKey}
        placeholder="Pexels Key for Scout..."
        onUpdate={onUpdate}
        isRecentUpdate={saveIndicator === 'pexelsApiKey'}
        icon={<div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
      />
      <SettingsApiKeyItem 
        label="Unsplash Access Key" 
        apiKey="unsplashAccessKey" 
        value={settings.unsplashAccessKey}
        placeholder="Unsplash Source..."
        onUpdate={onUpdate}
        isRecentUpdate={saveIndicator === 'unsplashAccessKey'}
        icon={<div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />}
      />
      <SettingsApiKeyItem 
        label="Pixabay API" 
        apiKey="pixabayApiKey" 
        value={settings.pixabayApiKey}
        placeholder="Pixabay Logic..."
        onUpdate={onUpdate}
        isRecentUpdate={saveIndicator === 'pixabayApiKey'}
        icon={<div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
      />
    </div>
  );
};

export default SettingsApiKeyGrid;
