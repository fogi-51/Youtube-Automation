export type PipelineStage =
  | 'IDEA'
  | 'RESEARCH'
  | 'OUTLINE'
  | 'SCRIPT'
  | 'SCRIPT_REVIEW'
  | 'VOICEOVER'
  | 'VISUAL_ASSETS'
  | 'VIDEO_ASSEMBLY'
  | 'QUALITY_CHECK'
  | 'THUMBNAIL'
  | 'SEO_METADATA'
  | 'FINAL_REVIEW'
  | 'SCHEDULED'
  | 'PUBLISHED';

export const PIPELINE_STAGES: { key: PipelineStage; label: string; icon: string; description: string }[] = [
  { key: 'IDEA', label: 'Idea', icon: 'Lightbulb', description: 'Niche & topic concept' },
  { key: 'RESEARCH', label: 'Research', icon: 'Compass', description: 'Sources & key angles' },
  { key: 'OUTLINE', label: 'Outline', icon: 'ListTree', description: 'Pacing & key beats' },
  { key: 'SCRIPT', label: 'Script', icon: 'FileText', description: 'Scene-by-scene script' },
  { key: 'SCRIPT_REVIEW', label: 'Review Script', icon: 'CheckSquare', description: 'Human editorial approval' },
  { key: 'VOICEOVER', label: 'Voiceover', icon: 'Mic', description: 'TTS audio generation' },
  { key: 'VISUAL_ASSETS', label: 'Visuals', icon: 'Image', description: 'Clips, footage & graphics' },
  { key: 'VIDEO_ASSEMBLY', label: 'Assembly', icon: 'Film', description: 'FFmpeg timeline rendering' },
  { key: 'QUALITY_CHECK', label: 'Quality Check', icon: 'ShieldCheck', description: 'Audio/video QC verification' },
  { key: 'THUMBNAIL', label: 'Thumbnail', icon: 'Palette', description: 'CTR optimized cover art' },
  { key: 'SEO_METADATA', label: 'SEO Metadata', icon: 'Search', description: 'Tags, chapters, description' },
  { key: 'FINAL_REVIEW', label: 'Final Review', icon: 'Eye', description: 'Human publishing gate' },
  { key: 'SCHEDULED', label: 'Scheduled', icon: 'Calendar', description: 'Queued for YouTube release' },
  { key: 'PUBLISHED', label: 'Published', icon: 'Youtube', description: 'Live on YouTube' },
];

export interface Channel {
  id: string;
  userId: string;
  name: string;
  channelId?: string;
  niche: string;
  targetAudience: string;
  preferredLanguage: string;
  defaultFormat: '16:9' | '9:16' | '1:1';
  brandVoice: string;
  visualIdentity: string;
  connected: boolean;
  subscribers?: number;
  totalViews?: number;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  channelId: string;
  title: string;
  stage: PipelineStage;
  format: '16:9' | '9:16' | '1:1';
  targetDuration: number; // in seconds
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  userId: string;
  channelId: string;
  title: string;
  hook: string;
  category: string;
  targetAudience: string;
  format: string;
  priority: 'low' | 'medium' | 'high';
  status: 'brainstorm' | 'approved' | 'rejected' | 'converted';
  researchNotes?: string;
  createdAt: string;
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  heading: string;
  narration: string;
  visualDirection: string;
  onScreenText?: string;
  estimatedSeconds: number;
  audioUrl?: string;
}

export interface ScriptData {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  hook: string;
  format: string;
  scenes: ScriptScene[];
  callToAction: string;
  sourcesNotes?: string;
  version: number;
  approved: boolean;
  updatedAt: string;
}

export interface VoiceoverData {
  id: string;
  userId: string;
  projectId: string;
  voiceName: string;
  language: string;
  audioUrl?: string;
  duration?: number;
  status: 'idle' | 'generating' | 'completed' | 'failed';
  createdAt: string;
}

export interface RenderJob {
  id: string;
  userId: string;
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  aspectRatio: string;
  resolution: string;
  fps: number;
  outputUrl?: string;
  errorDetails?: string;
  logs?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface ThumbnailData {
  id: string;
  userId: string;
  projectId: string;
  titleText: string;
  badgeText: string;
  backgroundColor: string;
  accentColor: string;
  imageUrl?: string;
  prompt?: string;
  updatedAt: string;
}

export interface SeoData {
  id: string;
  userId: string;
  projectId: string;
  selectedTitle: string;
  titleOptions: string[];
  description: string;
  tags: string[];
  hashtags: string[];
  chapters: { timestamp: string; title: string }[];
  pinnedComment: string;
  playlistSuggestions: string[];
  updatedAt: string;
}

export interface PublishingJob {
  id: string;
  userId: string;
  projectId: string;
  channelId: string;
  scheduledFor: string;
  privacyStatus: 'private' | 'unlisted' | 'public';
  publishStatus: 'draft' | 'awaiting_approval' | 'scheduled' | 'publishing' | 'published' | 'failed';
  approvedByHuman: boolean;
  youtubeVideoId?: string;
  errorDetails?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  category: 'pipeline' | 'ai' | 'render' | 'publish' | 'system';
  timestamp: string;
}

export interface AiUsageRecord {
  id: string;
  userId: string;
  model: string;
  task: string;
  tokensEstimated: number;
  costEstimated: number;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'creator' | 'editor';
}
