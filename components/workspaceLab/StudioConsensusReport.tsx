
import React from 'react';

interface StudioConsensusReportProps {
  report: { logic: string, prompt: string } | null;
}

const StudioConsensusReport: React.FC<StudioConsensusReportProps> = ({ report }) => {
  if (!report) return null;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
        <div className="bg-zinc-950 border border-white/5 p-5 rounded-2xl">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Multi-Agent Deliberation Result</span>
          <div className="text-[8px] mono text-zinc-600 h-24 overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed">
              {report.prompt}
          </div>
        </div>
    </div>
  );
};

export default StudioConsensusReport;
