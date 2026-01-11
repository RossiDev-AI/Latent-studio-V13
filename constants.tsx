
import React from 'react';

export const ICONS: Record<string, React.ReactNode> = {
  // Core & Management
  Director: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  'Meta-Prompt Translator': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16m-7 5h7"/></svg>,
  'Consensus Judge': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  'Scriptwriter': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  'Visual Scout': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>,
  'Visual Quality Judge': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/><path d="M9 10h.01M15 10h.01M9 15h6"/></svg>,
  'Visual Archivist': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 7.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="9" r="3"/></svg>,

  // 1. Gaffer Team (Lighting)
  'Luminance Critic': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  'Shadow Specialist': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  'Ray-Trace Agent': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  'Atmospheric Critic': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.7 7.7A7.1 7.1 0 115 14.5m12 0a7 7 0 11-14 0c0-1.2.3-2.3.8-3.3"/></svg>,

  // 2. SFX Team (Texture)
  'Epidermal Specialist': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a5 5 0 00-5 5v3a5 5 0 0010 0V7a5 5 0 00-5-5zM5 20a2 2 0 012-2h10a2 2 0 012 2v2H5v-2z"/></svg>,
  'Material Alchemist': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l-9 5v10l9 5 9-5V7l-9-5zM12 22V12m0 0l9-5m-9 5l-9-5"/></svg>,
  'Textile Critic': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4zM4 9h16M4 14h16M9 4v16M14 4v16"/></svg>,
  'Hair & Fur Groomer': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>,

  // 3. Casting Team
  'Identity Guard': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  'Anatomy Critic': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>,
  'Emotion Sculptor': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>,

  // 4. Lens Team
  'Bokeh & DOF Agent': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
  'Chromatic Aberration Critic': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0118 0M3 12a9 9 0 0018 0M12 3v18M3 12h18"/></svg>,
  'Composition Judge': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>,

  // 5. Finalization
  'Master Colorist': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21a9 9 0 110-18c4.97 0 9 3.582 9 8s-4.03 8-9 8z"/><circle cx="12" cy="12" r="3"/></svg>,
  'Grain & Noise Manager': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3V3z"/><circle cx="7" cy="7" r="1"/><circle cx="17" cy="17" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="17" cy="7" r="1"/><circle cx="7" cy="17" r="1"/></svg>,
  'Consistency Judge': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4zM12 4v16"/></svg>,

  // 6. Puppeteer Team
  'IK Rig Agent': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="3"/><path d="M12 8v7m0 0l-4 4m4-4l4 4m-4-11l-5 3m5-3l5 3"/></svg>,
  'Weight Distribution Critic': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6l9 12 9-12M12 3v15"/></svg>,
  'Contact Point Specialist': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12h.01M19 12h.01M5 12h.01M12 19h.01M12 5h.01"/></svg>,
  'Gesture Nuance Agent': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a3 3 0 00-3-3H5a3 3 0 00-3 3v8a3 3 0 003 3h10a3 3 0 003-3V8z"/><path d="M22 12l-4-4v8l4-4z"/></svg>,

  // 7. Camera Op Team
  'Angle Architect': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21L3 3m18 0L3 21"/></svg>,
  'Lens Distortion Specialist': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10S2 17.5 2 12z"/><path d="M12 2v20M2 12h20"/></svg>,
  'Eye-Level Coordinator': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  'Z-Depth Manager': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M12 2v20M5 5l14 14M19 5L5 14"/></svg>,

  // Cinema Lab Agents
  'Temporal Architect': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8V4H8m4 4v4h4m-4-4L4 4m16 16l-4-4"/></svg>,
  'Motion Sculptor': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  'Fluidity Critic': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20m-5-5l-10 10"/></svg>,
  'Latent Optimizer': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
};
