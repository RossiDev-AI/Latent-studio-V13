
import React from 'react';
import { SubtitleSettings, AppSettings, AgentStatus } from '../../types';
import AgentFeed from '../AgentFeed';

interface CinemaControlsProps {
  onReset: () => void;
  title: string;
  setTitle: (val: string) => void;
  credits: string;
  setCredits: (val: string) => void;
  aspectRatio: string;
  setAspectRatio: (val: any) => void;
  exportRes: string;
  setExportRes: (val: any) => void;
  globalDuration: number;
  setGlobalDuration: (val: number) => void;
  subtitleSettings: SubtitleSettings;
  onUpdateSubtitle: (key: keyof SubtitleSettings, val: any) => void;
  script: string;
  setScript: (val: string) => void;
  fidelityMode: boolean;
  setFidelityMode: (val: boolean) => void;
  isGenerating: boolean;
  isRendering: boolean;
  onAnalyze: () => void;
  onRender: () => void;
  onBatch: (mode: 'SCOUT' | 'AI') => void;
  logs: AgentStatus[];
}

const CinemaControls: React.FC<CinemaControlsProps> = (props) => {
  const { subtitleSettings: subs } = props;
  
  return (
    <div className="w-full lg:w-[440px] bg-[#0e0e11] border-l border-white/5 flex flex-col p-8 space-y-8 overflow-y-auto pb-40 custom-scrollbar shadow-2xl">
      {/* Global Config */}
      <div className="space-y-6 bg-zinc-950 p-6 rounded-[2.5rem] border border-white/5">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Protocol</h3>
          <button onClick={props.onReset} className="px-3 py-1 bg-red-600/10 text-red-500 text-[8px] font-black uppercase rounded-lg border border-red-500/20 hover:bg-red-600/20 transition-all">Full Reset</button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Capa (Título HTML)</label>
            <div 
              contentEditable onBlur={(e) => props.setTitle(e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: props.title }}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none min-h-[60px] focus:border-indigo-500/30 overflow-y-auto custom-scrollbar" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Aspect Ratio</label>
              <select value={props.aspectRatio} onChange={(e) => props.setAspectRatio(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-black text-white outline-none">
                <option value="16:9">Widescreen 16:9</option>
                <option value="9:16">Portrait 9:16</option>
                <option value="1:1">Square 1:1</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Export Res</label>
              <select value={props.exportRes} onChange={(e) => props.setExportRes(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-black text-white outline-none">
                <option value="1080p">HD 1080p</option>
                <option value="2K">2K Cinema</option>
                <option value="4K">UHD 4K</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Créditos (HTML)</label>
            <div 
              contentEditable onBlur={(e) => props.setCredits(e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: props.credits }}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none min-h-[80px] focus:border-indigo-500/30 overflow-y-auto custom-scrollbar" 
            />
          </div>
        </div>
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1"><span>Duração Global</span><span className="text-white mono">{props.globalDuration}s</span></div>
          <input type="range" min="1" max="20" value={props.globalDuration} onChange={(e) => props.setGlobalDuration(parseInt(e.target.value))} className="w-full h-1 bg-zinc-900 rounded-full appearance-none accent-indigo-500" />
        </div>
      </div>

      {/* Subtitle Protocol */}
      <div className="space-y-6 bg-zinc-950 p-6 rounded-[2.5rem] border border-white/5">
        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Subtitle Protocol</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Font Size</label>
            <input type="number" value={subs.fontSize} onChange={(e) => props.onUpdateSubtitle('fontSize', parseInt(e.target.value))} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Text Color</label>
            <input type="color" value={subs.fontColor} onChange={(e) => props.onUpdateSubtitle('fontColor', e.target.value)} className="w-full h-8 bg-black/40 border border-white/5 rounded-xl px-1 py-1 cursor-pointer" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Box Color</label>
            <input type="color" value={subs.backgroundColor} onChange={(e) => props.onUpdateSubtitle('backgroundColor', e.target.value)} className="w-full h-8 bg-black/40 border border-white/5 rounded-xl px-1 py-1 cursor-pointer" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Opacity</label>
            <input type="number" step="0.1" min="0" max="1" value={subs.bgOpacity} onChange={(e) => props.onUpdateSubtitle('bgOpacity', parseFloat(e.target.value))} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white outline-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Font Family</label>
          <select value={subs.fontFamily} onChange={(e) => props.onUpdateSubtitle('fontFamily', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white outline-none">
            <option value="Inter">Inter UI</option>
            <option value="JetBrains Mono">JetBrains Mono</option>
            <option value="serif">Classic Serif</option>
            <option value="sans-serif">System Sans</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Radius Mult</label>
            <input type="number" step="0.1" value={subs.radiusMult} onChange={(e) => props.onUpdateSubtitle('radiusMult', parseFloat(e.target.value))} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Margin Mult</label>
            <input type="number" step="0.1" value={subs.marginMult} onChange={(e) => props.onUpdateSubtitle('marginMult', parseFloat(e.target.value))} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white outline-none" />
          </div>
        </div>
      </div>

      {/* Script & Execution */}
      <div className="space-y-4">
        <div className="bg-zinc-950 p-6 rounded-[3rem] border border-white/5 space-y-4 shadow-2xl">
          <div className="flex justify-between items-center px-1 mb-2">
            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Roteiro / Script (HTML)</label>
            <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-full border border-white/5">
              <span className={`text-[7px] font-black uppercase ${props.fidelityMode ? 'text-indigo-400' : 'text-zinc-600'}`}>Fidelidade</span>
              <button onClick={() => props.setFidelityMode(!props.fidelityMode)} className={`relative w-8 h-4 rounded-full transition-all duration-300 ${props.fidelityMode ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${props.fidelityMode ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
          <div 
            contentEditable onBlur={(e) => props.setScript(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: props.script }}
            className="w-full h-40 bg-black/50 border border-white/5 rounded-2xl p-5 text-sm text-zinc-300 focus:outline-none resize-none transition-all overflow-y-auto custom-scrollbar" 
          />
          <button onClick={props.onAnalyze} disabled={props.isGenerating || !props.script.trim()} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.5em] transition-all active:scale-95 shadow-xl">Analisar & Orquestrar</button>
        </div>
        <button onClick={props.onRender} disabled={props.isRendering} className="w-full py-8 bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-black uppercase tracking-[0.6em] rounded-[3rem] shadow-xl transition-all relative overflow-hidden group">
          <span className="relative z-10">{props.isRendering ? 'MASTERIZANDO...' : 'MASTERIZAR UHD'}</span>
        </button>
      </div>
      
      <div className="bg-zinc-950 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block text-center">Batch Processing</span>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => props.onBatch('SCOUT')} className="py-3 bg-zinc-900 text-[8px] font-black uppercase rounded-xl border border-white/5 hover:border-indigo-500 transition-all">All Scout (Web)</button>
          <button onClick={() => props.onBatch('AI')} className="py-3 bg-zinc-900 text-[8px] font-black uppercase rounded-xl border border-white/5 hover:border-pink-500 transition-all">All Synth (IA)</button>
        </div>
      </div>

      <AgentFeed logs={props.logs} isProcessing={props.isGenerating || props.isRendering} />
    </div>
  );
};

export default CinemaControls;
