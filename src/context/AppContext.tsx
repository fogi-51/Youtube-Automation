import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Channel,
  Project,
  Idea,
  ScriptData,
  VoiceoverData,
  RenderJob,
  ThumbnailData,
  SeoData,
  PublishingJob,
  ActivityLog,
  AiUsageRecord,
  PipelineStage,
  UserProfile,
} from '../types';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';

interface AppContextType {
  user: UserProfile | null;
  loadingAuth: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  channels: Channel[];
  selectedChannelId: string;
  setSelectedChannelId: (id: string) => void;
  activeChannel: Channel | undefined;
  createChannel: (channel: Omit<Channel, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  updateChannel: (id: string, updates: Partial<Channel>) => Promise<void>;
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  activeProject: Project | undefined;
  createProject: (project: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProjectStage: (projectId: string, nextStage: PipelineStage) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  ideas: Idea[];
  createIdea: (idea: Omit<Idea, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  convertIdeaToProject: (ideaId: string) => Promise<string>;
  updateIdea: (id: string, updates: Partial<Idea>) => Promise<void>;
  activeScript: ScriptData | undefined;
  saveScript: (script: ScriptData) => Promise<void>;
  activeVoiceover: VoiceoverData | undefined;
  saveVoiceover: (voiceover: VoiceoverData) => Promise<void>;
  renderJobs: RenderJob[];
  startRenderJob: (projectId: string, aspectRatio?: string, resolution?: string) => Promise<string>;
  activeThumbnail: ThumbnailData | undefined;
  saveThumbnail: (thumbnail: ThumbnailData) => Promise<void>;
  activeSeo: SeoData | undefined;
  saveSeo: (seo: SeoData) => Promise<void>;
  publishingJobs: PublishingJob[];
  createPublishingJob: (job: Omit<PublishingJob, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  updatePublishingJob: (id: string, updates: Partial<PublishingJob>) => Promise<void>;
  activityLogs: ActivityLog[];
  logActivity: (action: string, details: string, category?: ActivityLog['category']) => void;
  aiUsageLogs: AiUsageRecord[];
  recordAiUsage: (model: string, task: string, tokensEstimated: number) => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default seed channel for immediate out-of-the-box experience
const DEFAULT_CHANNEL: Channel = {
  id: 'chan_tech_chronicles',
  userId: 'local-creator',
  name: 'Tech Chronicles 2050',
  niche: 'Futuristic Tech & AI Explanations',
  targetAudience: 'Tech enthusiasts, engineers, curious professionals aged 18-40',
  preferredLanguage: 'English',
  defaultFormat: '16:9',
  brandVoice: 'Authoritative, fast-paced, insightful, storytelling-driven',
  visualIdentity: 'Cyberpunk neon, high contrast, clean typography, 4K b-roll',
  connected: false,
  subscribers: 28450,
  totalViews: 842100,
  createdAt: new Date().toISOString(),
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj_ai_quantum',
    userId: 'local-creator',
    channelId: 'chan_tech_chronicles',
    title: 'How Quantum AI Will Crack Modern Encryption in 2027',
    stage: 'SCRIPT',
    format: '16:9',
    targetDuration: 620,
    priority: 'high',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_humanoid_robots',
    userId: 'local-creator',
    channelId: 'chan_tech_chronicles',
    title: 'The Terrifying Rise of Autonomous Humanoid Factories',
    stage: 'VIDEO_ASSEMBLY',
    format: '16:9',
    targetDuration: 480,
    priority: 'urgent',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_fusion_energy',
    userId: 'local-creator',
    channelId: 'chan_tech_chronicles',
    title: 'Nuclear Fusion Breakthrough: Infinite Clean Power Solved?',
    stage: 'FINAL_REVIEW',
    format: '16:9',
    targetDuration: 750,
    priority: 'medium',
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_IDEAS: Idea[] = [
  {
    id: 'idea_1',
    userId: 'local-creator',
    channelId: 'chan_tech_chronicles',
    title: 'Top 5 AI Tools Replacing 6-Figure Software Engineers',
    hook: 'If you write code for a living, you have exactly 18 months before this changes everything.',
    category: 'AI Careers & Automation',
    targetAudience: 'Programmers & Tech Startups',
    format: '16:9 Longform',
    priority: 'high',
    status: 'approved',
    researchNotes: 'Reference Github Copilot workspace benchmarks and SWE-bench results.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'idea_2',
    userId: 'local-creator',
    channelId: 'chan_tech_chronicles',
    title: 'Inside China’s 100% Dark Factories (Zero Humans Allowed)',
    hook: 'Imagine a factory that produces 10,000 EVs a day in total pitch-black darkness.',
    category: 'Industrial Tech',
    targetAudience: 'General Tech Curious',
    format: '16:9 Longform',
    priority: 'high',
    status: 'brainstorm',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'idea_3',
    userId: 'local-creator',
    channelId: 'chan_tech_chronicles',
    title: 'Why Silicon Batteries Are About to Kill Lithium Forever',
    hook: 'Your next phone could charge in 3 minutes and last 4 days.',
    category: 'Hardware & Energy',
    targetAudience: 'Gadget Lovers',
    format: '9:16 Shorts',
    priority: 'medium',
    status: 'brainstorm',
    createdAt: new Date().toISOString(),
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>({
    uid: 'creator-demo-1',
    email: 'creator@youtubeautomation.io',
    displayName: 'Lead Producer',
    photoURL: null,
    role: 'creator',
  });
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  const [channels, setChannels] = useState<Channel[]>([DEFAULT_CHANNEL]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(DEFAULT_CHANNEL.id);

  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(DEFAULT_PROJECTS[0].id);

  const [ideas, setIdeas] = useState<Idea[]>(DEFAULT_IDEAS);

  const [scripts, setScripts] = useState<Record<string, ScriptData>>({
    proj_ai_quantum: {
      id: 'script_ai_quantum',
      userId: 'local-creator',
      projectId: 'proj_ai_quantum',
      title: 'How Quantum AI Will Crack Modern Encryption in 2027',
      hook: 'Every bank account, military secret, and encrypted message on earth could be unlocked in less than 5 minutes. Here is the silent race happening right now.',
      format: '16:9',
      version: 2,
      approved: false,
      callToAction: 'Subscribe to Tech Chronicles 2050 for real-time breakdowns of post-quantum cryptography.',
      sourcesNotes: 'NIST Post-Quantum Cryptography Standardization 2024, IBM Quantum Eagle 1,121 qubit report.',
      updatedAt: new Date().toISOString(),
      scenes: [
        {
          id: 'sc_1',
          sceneNumber: 1,
          heading: '00:00 - The Harvest Now, Decrypt Later Threat',
          narration: 'Right now, foreign adversaries are intercepting and storing petabytes of encrypted internet traffic. They cannot read it today. But in 3 years, quantum supremacy will decrypt it instantly.',
          visualDirection: 'Glitch effect over glowing fiber-optic server racks in a dark data bunker. Red alarm lights pulse.',
          onScreenText: 'HARVEST NOW. DECRYPT LATER.',
          estimatedSeconds: 22,
        },
        {
          id: 'sc_2',
          sceneNumber: 2,
          heading: '00:22 - Shor’s Algorithm Meets Neural Lattice',
          narration: 'RSA-2048 encryption relies on the sheer mathematical impossibility of factoring gigantic prime numbers. Classical supercomputers take 300 trillion years. A fault-tolerant 4,000-qubit processor running Shor’s algorithm does it in 8 seconds.',
          visualDirection: '3D mathematical lattice fracturing into glowing quantum particles. Split screen with classical clock spinning out of control.',
          onScreenText: '300 Trillion Years vs 8 Seconds',
          estimatedSeconds: 28,
        },
        {
          id: 'sc_3',
          sceneNumber: 3,
          heading: '00:50 - The Race for Post-Quantum Defense',
          narration: 'From Wall Street to the Pentagon, engineers are racing against the clock to transition every server on earth to lattice-based cryptography before Q-Day arrives.',
          visualDirection: 'Fast montage of server migrators, satellite uplinks, and high-frequency trading terminals.',
          onScreenText: 'COUNTDOWN TO Q-DAY',
          estimatedSeconds: 25,
        },
      ],
    },
  });

  const [voiceovers, setVoiceovers] = useState<Record<string, VoiceoverData>>({});
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([
    {
      id: 'job_render_01',
      userId: 'local-creator',
      projectId: 'proj_humanoid_robots',
      status: 'processing',
      progress: 68,
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 30,
      logs: [
        '[00:00:01] Initializing FFmpeg video compositor...',
        '[00:00:03] Staging 5 scene clips and audio track (Kore 24kHz)',
        '[00:00:06] Applying LUT: Cyberpunk Teal & Orange contrast curve',
        '[00:00:09] Generating on-screen motion typography overlay...',
        '[00:00:14] Encoding H.264 at 18,000 kbps (Frame 8,420 of 12,000)',
      ],
      createdAt: new Date(Date.now() - 120000).toISOString(),
    },
  ]);

  const [thumbnails, setThumbnails] = useState<Record<string, ThumbnailData>>({
    proj_ai_quantum: {
      id: 'thumb_1',
      userId: 'local-creator',
      projectId: 'proj_ai_quantum',
      titleText: 'ALL PASSWORDS UNLOCKED',
      badgeText: '2027 WARNING',
      backgroundColor: '#0a0d17',
      accentColor: '#ef4444',
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1280&q=80',
      prompt: 'Dramatic cinematic quantum computer processor core surrounded by shattered digital padlocks and encrypted neon code, dark sci-fi thriller aesthetic, 8k',
      updatedAt: new Date().toISOString(),
    },
  });

  const [seoPackages, setSeoPackages] = useState<Record<string, SeoData>>({
    proj_ai_quantum: {
      id: 'seo_1',
      userId: 'local-creator',
      projectId: 'proj_ai_quantum',
      selectedTitle: 'Why Quantum Computers Will Break Every Password in 2027',
      titleOptions: [
        'Why Quantum Computers Will Break Every Password in 2027',
        'The Silent Q-Day Threat: How Quantum AI Cracks Encryption',
        'Can Quantum AI Hack Your Bank Account? The Truth',
      ],
      description: `In this deep dive, we investigate the looming 'Q-Day'—the point in time when fault-tolerant quantum computers become powerful enough to break standard RSA-2048 encryption.\n\nChapters:\n00:00 - The Harvest Now, Decrypt Later Threat\n00:22 - Shor’s Algorithm vs Prime Factorization\n00:50 - The Race for Post-Quantum Defense\n\n#QuantumComputing #CyberSecurity #TechNews #ArtificialIntelligence`,
      tags: ['quantum computing', 'cyber security', 'rsa encryption', 'q day', 'quantum ai', 'artificial intelligence', 'tech news 2026', 'computer science'],
      hashtags: ['#QuantumAI', '#CyberSecurity', '#TechNews', '#FutureTech'],
      chapters: [
        { timestamp: '00:00', title: 'The Harvest Now, Decrypt Later Threat' },
        { timestamp: '00:22', title: 'Shor’s Algorithm vs Prime Factorization' },
        { timestamp: '00:50', title: 'The Race for Post-Quantum Defense' },
      ],
      pinnedComment: 'Do you think banks will transition in time before Q-Day arrives? Let us know in the comments below! 👇',
      playlistSuggestions: ['Future of AI & Supercomputers', 'Cyber Warfare & Geopolitics'],
      updatedAt: new Date().toISOString(),
    },
  });

  const [publishingJobs, setPublishingJobs] = useState<PublishingJob[]>([
    {
      id: 'pub_job_1',
      userId: 'local-creator',
      projectId: 'proj_fusion_energy',
      channelId: 'chan_tech_chronicles',
      scheduledFor: new Date(Date.now() + 86400000 * 2).toISOString(),
      privacyStatus: 'public',
      publishStatus: 'scheduled',
      approvedByHuman: true,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 'act_1',
      userId: 'local-creator',
      action: 'Project Script Updated',
      details: 'Drafted 3 high-retention scenes for Quantum AI Encryption.',
      category: 'pipeline',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'act_2',
      userId: 'local-creator',
      action: 'Render Job Dispatched',
      details: 'Assembling 4K master for Autonomous Humanoid Factories.',
      category: 'render',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [aiUsageLogs, setAiUsageLogs] = useState<AiUsageRecord[]>([
    {
      id: 'ai_1',
      userId: 'local-creator',
      model: 'gemini-3.8-flash',
      task: 'Scene-by-Scene Script Generation',
      tokensEstimated: 1420,
      costEstimated: 0.00042,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'ai_2',
      userId: 'local-creator',
      model: 'gemini-3.1-flash-lite',
      task: 'CTR Hook & Title Ideation',
      tokensEstimated: 850,
      costEstimated: 0.00009,
      timestamp: new Date(Date.now() - 14400000).toISOString(),
    },
  ]);

  const [activeNav, setActiveNav] = useState<string>('overview');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  // Sync Auth with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Creator',
          photoURL: firebaseUser.photoURL,
          role: 'creator',
        });
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        setUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          photoURL: res.user.photoURL,
          role: 'creator',
        });
        logActivity('User Signed In', `Authenticated via Google: ${res.user.email}`, 'system');
      }
    } catch (err: any) {
      console.warn('Google sign-in popup closed or skipped:', err?.message);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    logActivity('User Signed Out', 'Session terminated', 'system');
  };

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === selectedChannelId) || channels[0],
    [channels, selectedChannelId]
  );

  const activeProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || projects[0],
    [projects, selectedProjectId]
  );

  const activeScript = selectedProjectId ? scripts[selectedProjectId] : undefined;
  const activeVoiceover = selectedProjectId ? voiceovers[selectedProjectId] : undefined;
  const activeThumbnail = selectedProjectId ? thumbnails[selectedProjectId] : undefined;
  const activeSeo = selectedProjectId ? seoPackages[selectedProjectId] : undefined;

  const logActivity = (action: string, details: string, category: ActivityLog['category'] = 'pipeline') => {
    const newLog: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: user?.uid || 'guest',
      action,
      details,
      category,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const recordAiUsage = (model: string, task: string, tokensEstimated: number) => {
    // Gemini pricing estimates per 1k tokens: flash ~ $0.0003, flash-lite ~ $0.0001
    const ratePerToken = model.includes('lite') ? 0.0000001 : 0.0000003;
    const cost = Number((tokensEstimated * ratePerToken).toFixed(6));

    const record: AiUsageRecord = {
      id: `usage_${Date.now()}`,
      userId: user?.uid || 'guest',
      model,
      task,
      tokensEstimated,
      costEstimated: cost,
      timestamp: new Date().toISOString(),
    };
    setAiUsageLogs((prev) => [record, ...prev]);
  };

  const createChannel = async (channelData: Omit<Channel, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const id = `chan_${Date.now()}`;
    const newChan: Channel = {
      ...channelData,
      id,
      userId: user?.uid || 'creator-demo-1',
      createdAt: new Date().toISOString(),
    };
    setChannels((prev) => [...prev, newChan]);
    setSelectedChannelId(id);
    logActivity('Channel Created', `Added channel "${newChan.name}" in niche ${newChan.niche}`, 'pipeline');
    return id;
  };

  const updateChannel = async (id: string, updates: Partial<Channel>) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const createProject = async (projData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `proj_${Date.now()}`;
    const newProj: Project = {
      ...projData,
      id,
      userId: user?.uid || 'creator-demo-1',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    setSelectedProjectId(id);
    logActivity('Project Created', `Started video project: "${newProj.title}"`, 'pipeline');
    return id;
  };

  const updateProjectStage = async (projectId: string, nextStage: PipelineStage) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stage: nextStage,
              completed: nextStage === 'PUBLISHED',
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    logActivity('Pipeline Advance', `Project shifted to stage: ${nextStage}`, 'pipeline');
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const createIdea = async (ideaData: Omit<Idea, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const id = `idea_${Date.now()}`;
    const newIdea: Idea = {
      ...ideaData,
      id,
      userId: user?.uid || 'creator-demo-1',
      createdAt: new Date().toISOString(),
    };
    setIdeas((prev) => [newIdea, ...prev]);
    logActivity('Idea Created', `Brainstormed topic: "${newIdea.title}"`, 'ai');
    return id;
  };

  const convertIdeaToProject = async (ideaId: string): Promise<string> => {
    const idea = ideas.find((i) => i.id === ideaId);
    if (!idea) throw new Error('Idea not found');

    const projId = await createProject({
      channelId: idea.channelId,
      title: idea.title,
      stage: 'OUTLINE',
      format: idea.format.includes('9:16') ? '9:16' : '16:9',
      targetDuration: 480,
      priority: idea.priority as any,
      completed: false,
    });

    setIdeas((prev) =>
      prev.map((i) => (i.id === ideaId ? { ...i, status: 'converted' } : i))
    );
    logActivity('Idea Converted', `Promoted idea "${idea.title}" into production pipeline`, 'pipeline');
    return projId;
  };

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const saveScript = async (scriptData: ScriptData) => {
    setScripts((prev) => ({
      ...prev,
      [scriptData.projectId]: { ...scriptData, updatedAt: new Date().toISOString() },
    }));
    logActivity('Script Saved', `Updated script for project "${scriptData.title}" (${scriptData.scenes.length} scenes)`, 'pipeline');
  };

  const saveVoiceover = async (voData: VoiceoverData) => {
    setVoiceovers((prev) => ({
      ...prev,
      [voData.projectId]: voData,
    }));
    logActivity('Voiceover Updated', `Generated TTS audio using voice "${voData.voiceName}"`, 'ai');
  };

  const startRenderJob = async (projectId: string, aspectRatio = '16:9', resolution = '1080p'): Promise<string> => {
    const jobId = `job_${Date.now()}`;
    const targetProj = projects.find((p) => p.id === projectId);

    const newJob: RenderJob = {
      id: jobId,
      userId: user?.uid || 'creator-demo-1',
      projectId,
      status: 'queued',
      progress: 0,
      aspectRatio,
      resolution,
      fps: 30,
      logs: ['[00:00:00] Job queued. Allocating render thread...'],
      createdAt: new Date().toISOString(),
    };

    setRenderJobs((prev) => [newJob, ...prev]);
    logActivity('Render Dispatched', `Video assembly queued for "${targetProj?.title || projectId}"`, 'render');

    // Simulate progressive render job execution in worker
    setTimeout(() => {
      setRenderJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: 'processing',
                progress: 25,
                logs: [...(j.logs || []), '[00:00:02] Loading scene clips, background audio & narration track'],
              }
            : j
        )
      );
    }, 1500);

    setTimeout(() => {
      setRenderJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                progress: 70,
                logs: [
                  ...(j.logs || []),
                  '[00:00:05] Color grading & subtitle typography rendering complete',
                  '[00:00:08] Multiplexing audio streams with ducking filter',
                ],
              }
            : j
        )
      );
    }, 3500);

    setTimeout(() => {
      setRenderJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: 'completed',
                progress: 100,
                outputUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                completedAt: new Date().toISOString(),
                logs: [
                  ...(j.logs || []),
                  '[00:00:12] MP4 assembly finished! Resolution 1920x1080 @ 30fps',
                  '[00:00:12] Ready for Quality Check stage.',
                ],
              }
            : j
        )
      );
      updateProjectStage(projectId, 'QUALITY_CHECK');
    }, 6000);

    return jobId;
  };

  const saveThumbnail = async (thumb: ThumbnailData) => {
    setThumbnails((prev) => ({
      ...prev,
      [thumb.projectId]: { ...thumb, updatedAt: new Date().toISOString() },
    }));
    logActivity('Thumbnail Saved', `Updated 16:9 thumbnail packaging for project`, 'pipeline');
  };

  const saveSeo = async (seo: SeoData) => {
    setSeoPackages((prev) => ({
      ...prev,
      [seo.projectId]: { ...seo, updatedAt: new Date().toISOString() },
    }));
    logActivity('SEO Metadata Saved', `Generated ${seo.tags.length} tags and ${seo.chapters.length} chapter markers`, 'pipeline');
  };

  const createPublishingJob = async (jobData: Omit<PublishingJob, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const id = `pub_${Date.now()}`;
    const newJob: PublishingJob = {
      ...jobData,
      id,
      userId: user?.uid || 'creator-demo-1',
      createdAt: new Date().toISOString(),
    };
    setPublishingJobs((prev) => [newJob, ...prev]);
    logActivity('Publishing Scheduled', `Scheduled video upload for ${new Date(newJob.scheduledFor).toLocaleString()}`, 'publish');
    return id;
  };

  const updatePublishingJob = async (id: string, updates: Partial<PublishingJob>) => {
    setPublishingJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...updates } : j))
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loadingAuth,
        signInWithGoogle,
        signOut,
        channels,
        selectedChannelId,
        setSelectedChannelId,
        activeChannel,
        createChannel,
        updateChannel,
        projects,
        selectedProjectId,
        setSelectedProjectId,
        activeProject,
        createProject,
        updateProjectStage,
        updateProject,
        ideas,
        createIdea,
        convertIdeaToProject,
        updateIdea,
        activeScript,
        saveScript,
        activeVoiceover,
        saveVoiceover,
        renderJobs,
        startRenderJob,
        activeThumbnail,
        saveThumbnail,
        activeSeo,
        saveSeo,
        publishingJobs,
        createPublishingJob,
        updatePublishingJob,
        activityLogs,
        logActivity,
        aiUsageLogs,
        recordAiUsage,
        activeNav,
        setActiveNav,
        isCopilotOpen,
        setIsCopilotOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
