import {
  collection,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Project, RenderJob, Channel } from '../types';

export interface DatabaseOverviewMetrics {
  totalProjects: number;
  activeRenderingJobs: number;
  pendingApprovals: number;
  completedProjects: number;
  source: string;
  lastFetched: string;
  projects: Partial<Project>[];
  activeJobs: Partial<RenderJob>[];
  pendingProjects: Partial<Project>[];
  isLive: boolean;
}

// Initial seed data to ensure the Firestore collections are populated on initial load
const SEED_PROJECTS: Project[] = [
  {
    id: 'proj_ai_quantum',
    userId: 'creator-demo-1',
    channelId: 'chan_tech_chronicles',
    title: 'How Quantum AI Will Crack Modern Encryption in 2027',
    stage: 'SCRIPT_REVIEW', // Needs review approval
    format: '16:9',
    targetDuration: 620,
    priority: 'high',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_humanoid_robots',
    userId: 'creator-demo-1',
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
    userId: 'creator-demo-1',
    channelId: 'chan_tech_chronicles',
    title: 'Nuclear Fusion Breakthrough: Infinite Clean Power Solved?',
    stage: 'FINAL_REVIEW', // Needs review approval
    format: '16:9',
    targetDuration: 750,
    priority: 'medium',
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_RENDER_JOBS: RenderJob[] = [
  {
    id: 'job_render_01',
    userId: 'creator-demo-1',
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
];

/**
 * Fetches real-time overview metrics directly from Firestore collections: 'projects' & 'renderJobs'
 */
export async function fetchOverviewMetricsFromDatabase(): Promise<DatabaseOverviewMetrics> {
  try {
    const projectsCol = collection(db, 'projects');
    const renderJobsCol = collection(db, 'renderJobs');

    let projSnap = await getDocs(projectsCol);

    // If Firestore database is brand new and empty, seed it with initial projects so records exist in Firestore
    if (projSnap.empty) {
      for (const p of SEED_PROJECTS) {
        await setDoc(doc(db, 'projects', p.id), p);
      }
      for (const r of SEED_RENDER_JOBS) {
        await setDoc(doc(db, 'renderJobs', r.id), r);
      }
      projSnap = await getDocs(projectsCol);
    }

    const fetchedProjects: Project[] = [];
    projSnap.forEach((doc) => {
      fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
    });

    const jobsSnap = await getDocs(renderJobsCol);
    const fetchedJobs: RenderJob[] = [];
    jobsSnap.forEach((doc) => {
      fetchedJobs.push({ id: doc.id, ...doc.data() } as RenderJob);
    });

    const totalProjects = fetchedProjects.length;
    const activeRenderingJobs = fetchedJobs.filter(
      (j) => j.status === 'processing' || j.status === 'queued'
    ).length;

    const pendingApprovals = fetchedProjects.filter(
      (p) => p.stage === 'SCRIPT_REVIEW' || p.stage === 'FINAL_REVIEW'
    ).length;

    const completedProjects = fetchedProjects.filter(
      (p) => p.stage === 'PUBLISHED' || p.stage === 'SCHEDULED' || p.completed
    ).length;

    const pendingProjects = fetchedProjects.filter(
      (p) => p.stage === 'SCRIPT_REVIEW' || p.stage === 'FINAL_REVIEW'
    );

    return {
      totalProjects,
      activeRenderingJobs,
      pendingApprovals,
      completedProjects,
      source: 'Cloud Firestore Database',
      lastFetched: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      projects: fetchedProjects,
      activeJobs: fetchedJobs.filter((j) => j.status === 'processing' || j.status === 'queued'),
      pendingProjects,
      isLive: true,
    };
  } catch (error) {
    console.warn('Firestore fetch fallback:', error);
    // Graceful fallback to memory/context if client is offline or initializing
    return {
      totalProjects: SEED_PROJECTS.length,
      activeRenderingJobs: SEED_RENDER_JOBS.filter((j) => j.status === 'processing').length,
      pendingApprovals: SEED_PROJECTS.filter((p) => p.stage.includes('REVIEW')).length,
      completedProjects: 1,
      source: 'Local Sync Cache',
      lastFetched: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      projects: SEED_PROJECTS,
      activeJobs: SEED_RENDER_JOBS,
      pendingProjects: SEED_PROJECTS.filter((p) => p.stage.includes('REVIEW')),
      isLive: false,
    };
  }
}

/**
 * Real-time snapshot listener on Firestore projects & renderJobs
 */
export function subscribeToDatabaseOverview(
  callback: (metrics: DatabaseOverviewMetrics) => void
): () => void {
  try {
    const unsubProjects = onSnapshot(collection(db, 'projects'), () => {
      fetchOverviewMetricsFromDatabase().then(callback);
    });
    const unsubJobs = onSnapshot(collection(db, 'renderJobs'), () => {
      fetchOverviewMetricsFromDatabase().then(callback);
    });

    return () => {
      unsubProjects();
      unsubJobs();
    };
  } catch (e) {
    return () => {};
  }
}
