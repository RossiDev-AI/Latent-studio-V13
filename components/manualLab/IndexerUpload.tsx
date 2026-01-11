
import React from 'react';

interface IndexerUploadProps {
  image: string | null;
  isScanning: boolean;
  scanProgress: number;
  onUploadClick: () => void;
}

const IndexerUpload: React.FC<IndexerUploadProps> = ({ image, isScanning, scanProgress, onUploadClick }) => {
  return (
    <div 
      onClick={onUploadClick}
      className={`group relative aspect-square rounded-[3rem] md:rounded-[4rem] border-2 border-dashed transition-all duration-700 overflow-hidden cursor-pointer ${image ? 'border-transparent' : 'border-white/5 hover:border-indigo-500/30 bg-black/40'}`}
    >
      {image ? (
        <>
          <img src={image} className={`w-full h-full object-cover transition-all duration-1000 ${isScanning ? 'scale-110 blur-sm grayscale' : 'scale-100 grayscale-0'}`} alt="Reference" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          
          {isScanning && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-full h-[2px] bg-indigo-500 shadow-[0_0_20px_#6366f1] animate-scan-y absolute top-0" />
              <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-indigo-500/30">
                <span className="text-[10px] font-black text-indigo-400 mono uppercase tracking-widest">Sequencing: {Math.floor(scanProgress)}%</span>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-full text-[9px] font-black text-white uppercase border border-white/10">Replace Frame</span>
          </div>
        </>
      ) : (
        <div className="h-full flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth={1.5}/></svg>
          </div>
          <div className="text-center space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600">Inject Reference Frame</p>
            <p className="text-[8px] mono text-zinc-800 uppercase">TIFF / PNG / WEBP SUPPORTED</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexerUpload;
