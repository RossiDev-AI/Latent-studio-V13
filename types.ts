
export type AgentType = 
  | 'Director' | 'Meta-Prompt Translator' | 'Consensus Judge' | 'Scriptwriter' | 'Visual Scout'
  | 'Anatomy Specialist' | 'Texture Master' | 'Lighting Architect'
  | 'Anatomy Critic' | 'Luminance Critic' | 'Epidermal Specialist'
  | 'Lens Specialist' | 'Composition Analyst'
  | 'Neural Alchemist' | 'Latent Optimizer'
  | 'Puppeteer Agent' | 'Pose Extractor' | 'IK Solver'
  | 'Temporal Architect' | 'Motion Sculptor' | 'Fluidity Critic'
  | 'Identity Guard' | 'Visual Quality Judge' | 'Visual Archivist'
  | 'Digital DNA Curator' | 'Noise & Geometry Critic'
  | 'VAE Agent' | 'Texture Artist' | 'Lighting Lead' | 'Rigging Supervisor'
  | 'Surgical Repair Specialist' | 'Garment Architect' | 'Material Physicist'
  | 'Perspective Architect' | 'Gravity Analyst'
  | 'Style Transfer Specialist' | 'Chromatic Aberration Manager' | 'Lighting Harmonizer'
  | 'Semantic Router' | 'Vault Prioritizer'
  | 'Identity Anchor Manager' | 'Fabric Tension Analyst'
  | 'Spatial Synchronizer' | 'Vanishing Point Analyst'
  | 'Master Colorist' | 'Ray-Trace Agent' | 'Aesthetic Critic'
  | 'Vault Kernel' | 'Heuristic Optimizer'
  | 'Attribute Mapper' | 'Schema Validator'
  | 'Physics Analyst' | 'Shadow Projectionist' | 'Collision Engine'
  | 'Grading Specialist' | 'Chroma Manager' | 'Frequency Analyst'
  | 'Timeline Editor' | 'Audio Synchronizer' | 'Script Analyzer';

export type VaultDomain = 'X' | 'Y' | 'Z' | 'L';

export interface SubtitleSettings {
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  fontFamily: 'sans-serif' | 'serif' | 'monospace' | 'Inter' | string;
  bgOpacity: number;
  textAlign: 'left' | 'center' | 'right';
  paddingHMult: number;
  paddingVMult: number;
  radiusMult: number;
  marginMult: number;
}

export interface TimelineBeat {
  id: string;
  timestamp: number;
  duration: number;
  assetUrl: string | null;
  caption: string;
  assetType: 'IMAGE' | 'VIDEO' | 'UPLOAD';
  scoutQuery?: string;
  sourceUrl?: string;
  manualSourceUrl?: string;
  yOffset?: number; 
  sourceLink?: string; // For attribution
}

export interface CinemaProject {
  id: string;
  title: string;
  beats: TimelineBeat[];
  audioUrl: string | null;
  audioName?: string;
  fps: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  subtitleSettings?: SubtitleSettings;
}

export type ProcessingSpeed = 'Fast' | 'Balanced' | 'Deliberate' | 'Debug';

export interface AgentAuthority {
  lighting: number;
  texture: number;
  structure: number;
  anatomy: number;
}

export interface LatentParams {
  z_anatomy: number;
  z_structure: number; 
  z_lighting: number;  
  z_texture: number;
  hz_range: string;
  structural_fidelity: number;
  scale_factor: number;
  auto_tune_active?: boolean;
  neural_metrics: {
    loss_mse: number;
    ssim_index: number;
    tensor_vram: number;
    iteration_count: number;
    consensus_score: number;
    projection_coherence?: number;
    qc_verdict?: string;
    visual_critique?: string;
  };
  dna?: any;
  agent_authority?: AgentAuthority;
  vault_domain?: VaultDomain;
  active_slots?: Partial<Record<VaultDomain, string | null>>;
  processing_speed?: ProcessingSpeed;
  pose_control?: PoseData;
  dna_type?: string;
}

export interface LatentGrading {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  blur: number;
  hueRotate: number;
  sepia: number;
  grayscale: number;
  invert: number;
  opacity: number;
  vignette: number;
  tint_r: number;
  tint_g: number;
  tint_b: number;
  shadows: number;
  midtones: number;
  highlights: number;
  bloom: number;
  halation: number;
  preset_name: string;
  css_filter_string: string;
}

export interface VaultItem {
  id: string;
  shortId: string;
  name: string; 
  imageUrl: string;
  originalImageUrl: string;
  prompt: string;
  agentHistory: AgentStatus[];
  params: LatentParams;
  rating: number;
  timestamp: number;
  dna?: any;
  usageCount: number;
  neuralPreferenceScore: number;
  isFavorite: boolean;
  vaultDomain: VaultDomain;
  grading?: LatentGrading;
}

export interface AgentStatus {
  type: AgentType;
  status: 'idle' | 'processing' | 'completed' | 'error';
  message: string;
  timestamp: number;
  department?: string;
  flow_to?: AgentType;
}

export interface ScoutData {
  candidates: ScoutCandidate[];
  consensus_report: string;
  winner_id: string;
  search_stats: {
    premium_hits: number;
    internal_hits: number;
  };
}

export interface DeliberationStep {
  from: string;
  to: string;
  action: string;
  impact: string;
  timestamp: number;
}

export interface PoseData {
  imageUrl: string;
  strength: number;
  symmetry_strength?: number;
  rigid_integrity?: number;
  preserveIdentity?: boolean;
  enabled?: boolean;
  warpMethod?: WarpMethod;
  dna?: any;
  technicalDescription?: string;
}

export interface PoseSkeleton {
  keypoints: any[];
}

export interface DNAToken {
  id: string;
  domain: VaultDomain;
  data: any;
}

export interface FusionManifest {
  pep_id: string;
  pop_id: string;
  pov_id: string;
  amb_id: string;
  weights: { pep: number; pop: number; pov: number; amb: number };
  style_modifiers: string[];
  surgicalSwap: boolean;
  fusionIntent: string;
  protectionStrength: number;
}

export interface VisualAnchor {
  id: string;
  type: string;
}

export interface CategorizedDNA {
  character?: string;
  environment?: string;
  pose?: string;
  technical_tags?: string[];
  spatial_metadata?: {
    camera_angle?: string;
  };
  aesthetic_dna?: {
    lighting_setup?: string;
  };
}

export type ComponentType = 'PEP' | 'POP' | 'POV' | 'AMB';

export interface ScoutCandidate {
  id: string;
  title: string;
  source_layer: string;
  composite_score: number;
  quality_metrics: {
    technical: number;
    aesthetic: number;
  };
  votes: Array<{
    agent: string;
    score: number;
    critique: string;
  }>;
  dna_preview: {
    z_anatomy?: number;
    z_structure?: number;
    z_lighting?: number;
    z_texture?: number;
  };
}

export type WarpMethod = 'affine' | 'thin_plate' | 'deformation';
