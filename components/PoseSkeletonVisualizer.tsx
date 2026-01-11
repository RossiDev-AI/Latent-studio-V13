
import React, { useEffect, useRef } from 'react';
import { PoseSkeleton } from '../types';

interface PoseSkeletonVisualizerProps {
  imageUrl: string;
  sourcePose?: PoseSkeleton;
  targetPose?: PoseSkeleton;
}

const PoseSkeletonVisualizer: React.FC<PoseSkeletonVisualizerProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      
      // Simulated IK Rig points for UI feedback
      const points = [
        { x: w * 0.5, y: h * 0.15, label: 'head' },
        { x: w * 0.5, y: h * 0.35, label: 'neck' },
        { x: w * 0.35, y: h * 0.38, label: 'l_sh' },
        { x: w * 0.65, y: h * 0.38, label: 'r_sh' },
        { x: w * 0.28, y: h * 0.6, label: 'l_el' },
        { x: w * 0.72, y: h * 0.6, label: 'r_el' },
        { x: w * 0.5, y: h * 0.65, label: 'hips' },
        { x: w * 0.4, y: h * 0.9, label: 'l_kn' },
        { x: w * 0.6, y: h * 0.9, label: 'r_kn' },
      ];

      // Draw Latent Movement Arrows (ControlNet style)
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)'; // soft pink
      points.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x - 20, p.y - 20);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });

      ctx.strokeStyle = '#f472b6'; // pink-400
      ctx.lineWidth = Math.max(3, w * 0.015);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([0, 0]);

      // Draw Skeleton Lines
      // Spine
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.lineTo(points[6].x, points[6].y);
      ctx.stroke();

      // Shoulders
      ctx.beginPath();
      ctx.moveTo(points[2].x, points[2].y);
      ctx.lineTo(points[3].x, points[3].y);
      ctx.stroke();

      // Arms
      ctx.beginPath();
      ctx.moveTo(points[2].x, points[2].y);
      ctx.lineTo(points[4].x, points[4].y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(points[3].x, points[3].y);
      ctx.lineTo(points[5].x, points[5].y);
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(points[6].x, points[6].y);
      ctx.lineTo(points[7].x, points[7].y);
      ctx.moveTo(points[6].x, points[6].y);
      ctx.lineTo(points[8].x, points[8].y);
      ctx.stroke();

      // Joints
      ctx.fillStyle = '#ffffff';
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(4, w * 0.01), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f472b6';
    };
  }, [imageUrl]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border border-pink-500/30 bg-black/80 shadow-2xl group">
      <img src={imageUrl} className="w-full h-full object-cover opacity-20 grayscale saturate-0 transition-opacity group-hover:opacity-30" alt="Pose Base" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
        <span className="text-[7px] font-black text-pink-400 uppercase tracking-widest bg-black/60 px-2 py-1 rounded border border-pink-500/20">IK_LATENT_RIG_V3.5</span>
      </div>
      <div className="absolute bottom-3 right-3 text-[6px] mono text-pink-500/50 uppercase tracking-tighter">
        Transform_Map: ACTIVE
      </div>
    </div>
  );
};

export default PoseSkeletonVisualizer;
