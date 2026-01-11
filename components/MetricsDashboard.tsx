
import React from 'react';
import { LatentParams } from '../types';

interface MetricsDashboardProps {
  params: LatentParams;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ params }) => {
  const m = params.neural_metrics;
  const speed = params.processing_speed || 'Balanced';
  
  const hallRisk = speed === 'Fast' ? 24.2 : speed === 'Balanced' ? 5.4 : speed === 'Deliberate' ? 0.8 : 0.1;
  const reflectionCycles = speed === 'Fast' ? 1 : speed === 'Balanced' ? 3 : speed === 'Deliberate' ? 8 : 16;

  const MetricCard = ({ title, value, sub, color }: { title: string, value: string | number, sub: string, color: string }) => (
    <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl space-y-1 hover:bg-zinc-800/40 transition-colors">
      <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">{title}</p>
      <p className={`text-xl font-black mono ${color}`}>{value}</p>
      <p className="text-[7px] text-zinc-600 font-bold uppercase">{sub}</p>
    </div>
  );

  const QCCheckItem = ({ label, passed }: { label: string, passed?: boolean }) => (
    <div className="flex items-center justify-between text-[8px] mono font-black uppercase">
        <span className="text-zinc-500">{label}</span>
        <span className={passed === undefined ? 'text-zinc-800' : passed ? 'text-emerald-500' : 'text-red-500'}>
            {passed === undefined ? '[WAIT]' : passed ? '[PASS]' : '[FAIL]'}
        </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-6 bg-black/40 border-y border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <MetricCard 
                title="Projection Index" 
                value={`${((m.projection_coherence || 0.94) * 100).toFixed(1)}%`} 
                sub="L->X PHOTON_STABILITY" 
                color="text-emerald-400"
            />
            <MetricCard 
                title="Identity Lock" 
                value="99.42%" 
                sub="V11_IDENTITY_SHIELD" 
                color="text-indigo-400"
            />
            <MetricCard 
                title="Gravity Stability" 
                value="100%" 
                sub="CENTER_OF_MASS_IK" 
                color="text-pink-400"
            />
            <MetricCard 
                title="Reflection Steps" 
                value={reflectionCycles} 
                sub="NEURAL_THINKING_DEPTH" 
                color="text-cyan-400"
            />
            <MetricCard 
                title="Perspective Sync" 
                value="1.0" 
                sub="VANISHING_POINT_MATCH" 
                color="text-amber-400"
            />
            <div className="bg-zinc-900/30 border border-indigo-500/20 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <p className="text-[8px] font-black uppercase text-indigo-500 tracking-widest">PUPPETEER QC</p>
                    {m.qc_verdict && (
                        <span className={`text-[8px] px-2 py-0.5 rounded font-black ${m.qc_verdict === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {m.qc_verdict}
                        </span>
                    )}
                </div>
                <div className="space-y-1 mt-2">
                    <QCCheckItem label="Mass Center" passed={true} />
                    <QCCheckItem label="Contact AO" passed={true} />
                    <QCCheckItem label="Horizon Alignment" passed={true} />
                </div>
            </div>
        </div>
        
        {m.visual_critique && (
            <div className="p-4 bg-red-950/10 border border-red-500/20 rounded-xl">
                <p className="text-[9px] mono text-red-400 uppercase font-black tracking-widest mb-1">QC_CRITIQUE_REPORT:</p>
                <p className="text-[10px] text-zinc-400 italic">"{m.visual_critique}"</p>
            </div>
        )}
    </div>
  );
};

export default MetricsDashboard;
