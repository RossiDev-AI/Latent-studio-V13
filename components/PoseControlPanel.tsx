
import React, { useRef, useState, useEffect } from 'react';
import { PoseData, VaultItem, WarpMethod, CategorizedDNA, AppSettings } from '../types';
import { extractDeepDNA } from '../geminiService';
import PoseSkeletonVisualizer from './PoseSkeletonVisualizer';

interface PoseControlPanelProps {
  poseControl?: PoseData;
  setPoseControl: (val?: PoseData) => void;
  vault: VaultItem[];
  sourceImage: string | null;
  onExecuteSurgical?: () => void;
  // Fix: Added settings prop
  settings?: AppSettings;
}

// MediaPipe Pose Global References
declare var Pose: any;

const PoseControlPanel: React.FC<PoseControlPanelProps> = ({ 
  poseControl, setPoseControl, vault, sourceImage, onExecuteSurgical, settings
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [poseInstance, setPoseInstance] = useState<any>(null);

  useEffect(() => {
    if (typeof Pose !== 'undefined' && !poseInstance) {
      const p = new Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
      });
      p.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      setPoseInstance(p);
    }
  }, [poseInstance]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const result = ev.target?.result as string;
        
        // Initial set
        const basePose: PoseData = {
          imageUrl: result,
          strength: 0.85,
          symmetry_strength: 0.5,
          rigid_integrity: 0.7,
          preserveIdentity: true,
          enabled: true,
          warpMethod: 'thin_plate'
        };
        setPoseControl(basePose);

        // AUTO BIOPSY FOR POSE
        setIsExtracting(true);
        try {
          // Fix: Added settings to extractDeepDNA call
          const dna = await extractDeepDNA(result, settings);
          setPoseControl({
            ...basePose,
            dna,
            technicalDescription: `POSE DNA: ${dna.pose}\n\nTAGS: ${dna.technical_tags.join(', ')}`
          });
        } catch (err) {
          console.error("Pose Biopsy failed", err);
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePoseDescription = (landmarks: any) => {
    if (!landmarks || landmarks.length < 33) return "Pose detection failed or insufficient keypoints.";
    
    const kp = {
      n: landmarks[0],
      ls: landmarks[11], rs: landmarks[12],
      le: landmarks[13], re: landmarks[14],
      lw: landmarks[15], rw: landmarks[16],
      lh: landmarks[23], rh: landmarks[24],
      lk: landmarks[25], rk: landmarks[26],
      la: landmarks[27], ra: landmarks[28]
    };

    const getAngle = (p1: any, p2: any, p3: any) => {
      const rad = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
      let deg = Math.abs(rad * 180.0 / Math.PI);
      if (deg > 180.0) deg = 360 - deg;
      return Math.round(deg);
    };

    const centerOfMassX = (kp.ls.x + kp.rs.x + kp.lh.x + kp.rh.x) / 4;
    const centerOfMassY = (kp.ls.y + kp.rs.y + kp.lh.y + kp.rh.y) / 4;

    return `[NEURAL RIGGING v9.5 - GEOMETRIC DNA]
KINEMATIC CONSTRAINTS:
- Left Elbow Flex: ${getAngle(kp.ls, kp.le, kp.lw)}° (Locked)
- Right Elbow Flex: ${getAngle(kp.rs, kp.re, kp.rw)}° (Locked)
- Left Knee Flex: ${getAngle(kp.lh, kp.lk, kp.la)}°
- Right Knee Flex: ${getAngle(kp.rh, kp.rk, kp.ra)}°

SKELETAL TELEMETRY:
- Center of Gravity: X:${centerOfMassX.toFixed(3)} Y:${centerOfMassY.toFixed(3)}
- Torso Pivot Bias: ${(kp.ls.y - kp.rs.y).toFixed(3)} (Z-Tilt)
- Posture Mapping: ${kp.n.y > kp.lh.y ? 'RECLINED / SEATED' : 'UPRIGHT_STANCE'}
- Rigging Mode: ${poseControl?.rigid_integrity && poseControl.rigid_integrity > 0.8 ? 'HARD_RIGID' : 'ORGANIC_FLOW'}

CALIBRATION:
- Symmetry Optimization: ${((poseControl?.symmetry_strength || 0) * 100).toFixed(0)}%
- Anatomical Override: MANDATORY`;
  };

  const extractPoseDNA = async () => {
    if (!poseControl?.imageUrl || !poseInstance) return;
    setIsExtracting(true);
    const img = new Image();
    img.src = poseControl.imageUrl;
    img.onload = async () => {
      poseInstance.onResults((results: any) => {
        if (results.poseLandmarks) {
          const description = generatePoseDescription(results.poseLandmarks);
          setPoseControl({ ...poseControl, technicalDescription: description });
        }
        setIsExtracting(false);
      });
      await poseInstance.send({ image: img });
    };
  };

  const popNodes = vault?.filter(v => v?.params?.dna_type === 'POP') || [];

  return (
    <div className="bg-[#0e0e11] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col p-6 space-y-6 relative group/rig">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent opacity-50" />
      
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <h3 className="text-[10px] font-black uppercase text-pink-400 tracking-[0.4em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            Neural Puppeteer v9.5
          </h3>
          <span className="text-[7px] mono text-zinc-600 font-bold uppercase tracking-widest">Advanced Rigging Station</span>
        </div>
        {poseControl && (
          <button onClick={() => setPoseControl(undefined)} className="text-zinc-600 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
          </button>
        )}
      </div>

      {!poseControl ? (
        <div className="space-y-6">
          <div 
            onClick={() => fileRef.current?.click()}
            className="aspect-video bg-black/40 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-500/40 hover:bg-pink-500/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform bg-zinc-900/50">
              <svg className="w-6 h-6 text-zinc-600 group-hover:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={2}/></svg>
            </div>
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Biopsy Pose Data</p>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {popNodes.slice(0, 4).map(node => (
              <button 
                key={node.id} 
                onClick={() => setPoseControl({ imageUrl: node.imageUrl, strength: 0.85, symmetry_strength: 0.5, rigid_integrity: 0.7, preserveIdentity: true, enabled: true, warpMethod: 'thin_plate', dna: node.dna })} 
                className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-pink-500/50 transition-all hover:scale-105"
              >
                <img src={node.imageUrl} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
             <PoseSkeletonVisualizer imageUrl={poseControl.imageUrl} />
             {isExtracting && (
               <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="w-full h-[2px] bg-pink-500 shadow-[0_0_15px_pink] animate-scan-y absolute top-0" />
                  <span className="text-[8px] font-black text-pink-400 uppercase tracking-[0.5em] animate-pulse">Sequencing DNA...</span>
               </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-3 p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center">
                   <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Influence</label>
                   <span className="text-[9px] mono text-pink-500 font-bold">{Math.round(poseControl.strength * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={poseControl.strength} onChange={(e) => setPoseControl({...poseControl, strength: parseFloat(e.target.value)})} className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-pink-500" />
             </div>
             <div className="space-y-3 p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center">
                   <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Symmetry</label>
                   <span className="text-[9px] mono text-indigo-400 font-bold">{Math.round((poseControl.symmetry_strength || 0) * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={poseControl.symmetry_strength || 0} onChange={(e) => setPoseControl({...poseControl, symmetry_strength: parseFloat(e.target.value)})} className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500" />
             </div>
          </div>

          {!poseControl.dna ? (
             <button 
              onClick={extractPoseDNA}
              disabled={isExtracting}
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] transition-all active:scale-95 border border-white/5"
            >
              Initialize Neural Scan
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="p-5 bg-[#08080a] border border-white/5 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-20">
                    <svg className="w-12 h-12 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  </div>
                  <p className="text-[7px] font-black text-pink-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 bg-pink-500 rounded-full" />
                    Rigging Telemetry
                  </p>
                  <div className="text-[8px] mono text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                      {poseControl.technicalDescription}
                  </div>
                  {poseControl.dna && (
                     <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                        <div className="p-2 bg-pink-500/5 rounded-lg border border-pink-500/10">
                           <span className="text-[6px] font-black text-pink-400 uppercase tracking-tighter block">Joint Mechanics</span>
                           <p className="text-[7px] text-zinc-500 line-clamp-2 leading-tight uppercase">{poseControl.dna.pose}</p>
                        </div>
                        <div className="p-2 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
                           <span className="text-[6px] font-black text-indigo-400 uppercase tracking-tighter block">Reference DNA</span>
                           <p className="text-[7px] text-zinc-500 line-clamp-2 leading-tight uppercase">{poseControl.dna.character}</p>
                        </div>
                     </div>
                  )}
              </div>
              
              <button 
                onClick={onExecuteSurgical}
                disabled={!sourceImage}
                className="group relative w-full py-6 bg-white text-black rounded-[1.8rem] font-black uppercase tracking-[0.6em] text-[11px] shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  EXECUTE SYNTH
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes scan {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        .animate-scan-y {
          animation: scan 2s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default PoseControlPanel;
