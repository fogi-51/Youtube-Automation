import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Studio3DViewer } from '../studio3d/Studio3DViewer';
import { PIPELINE_STAGES } from '../../types';
import {
  fetchOverviewMetricsFromDatabase,
  subscribeToDatabaseOverview,
  DatabaseOverviewMetrics,
} from '../../lib/dbService';
import {
  Tv,
  Film,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Play,
  Calendar,
  Database,
  RefreshCw,
  Video,
  ShieldCheck,
  Activity,
  FolderGit2,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    channels,
    projects,
    activeProject,
    renderJobs,
    publishingJobs,
    aiUsageLogs,
    activityLogs,
    setActiveNav,
    setSelectedProjectId,
  } = useApp();

  // State populated from Cloud Firestore database queries
  const [dbMetrics, setDbMetrics] = useState<DatabaseOverviewMetrics>({
    totalProjects: projects.length,
    activeRenderingJobs: renderJobs.filter((j) => j.status === 'processing' || j.status === 'queued').length,
    pendingApprovals: projects.filter((p) => p.stage === 'SCRIPT_REVIEW' || p.stage === 'FINAL_REVIEW').length,
    completedProjects: projects.filter((p) => p.stage === 'PUBLISHED' || p.stage === 'SCHEDULED').length,
    source: 'Cloud Firestore Database',
    lastFetched: 'Just now',
    projects: projects,
    activeJobs: renderJobs.filter((j) => j.status === 'processing' || j.status === 'queued'),
    pendingProjects: projects.filter((p) => p.stage === 'SCRIPT_REVIEW' || p.stage === 'FINAL_REVIEW'),
    isLive: true,
  });

  const [loadingDb, setLoadingDb] = useState(false);

  // Load from database on mount and subscribe to live Firestore document changes
  useEffect(() => {
    let isMounted = true;
    setLoadingDb(true);

    fetchOverviewMetricsFromDatabase().then((data) => {
      if (isMounted) {
        setDbMetrics(data);
        setLoadingDb(false);
      }
    });

    const unsubscribe = subscribeToDatabaseOverview((data) => {
      if (isMounted) {
        setDbMetrics(data);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    setLoadingDb(true);
    const data = await fetchOverviewMetricsFromDatabase();
    setDbMetrics(data);
    setLoadingDb(false);
  };

  const totalChannels = channels.length;
  const inProduction = dbMetrics.projects.filter(
    (p) => p.stage !== 'PUBLISHED' && p.stage !== 'IDEA'
  ).length;
  const completedVideos = dbMetrics.completedProjects;
  const scheduledUploads = publishingJobs.filter((j) => j.publishStatus === 'scheduled').length;
  const failedJobs = renderJobs.filter((j) => j.status === 'failed').length;
  const totalCost = aiUsageLogs.reduce((acc, curr) => acc + curr.costEstimated, 0);

  const activeRender = renderJobs.find((j) => j.status === 'processing');

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Production Suite</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Production Factory Overview</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time pipeline metrics, automated media assembly workers, and AI multi-channel orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveNav('ideas')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            <span>Brainstorm Ideas</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => setActiveNav('pipeline')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md shadow-red-500/20 transition-all"
          >
            <span>Open Pipeline Kanban</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* DATABASE SYNC HEADER & REFRESH BAR */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Source: {dbMetrics.source}</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 text-[11px]">Last Synchronized: {dbMetrics.lastFetched}</span>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={loadingDb}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
        >
          <RefreshCw className={`w-3 h-3 text-indigo-400 ${loadingDb ? 'animate-spin' : ''}`} />
          <span>{loadingDb ? 'Querying Firestore...' : 'Sync Database'}</span>
        </button>
      </div>

      {/* PRIMARY SUMMARY CARDS (FETCHED FROM DATABASE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Projects */}
        <div
          onClick={() => setActiveNav('pipeline')}
          className="relative bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-6 shadow-xl cursor-pointer transition-all group overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Film className="w-24 h-24 text-indigo-500" />
          </div>

          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Database Synced
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Projects
            </div>
            <div className="text-3xl font-extrabold text-white mt-1 tracking-tight font-mono">
              {dbMetrics.totalProjects}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active video pipelines in persistent storage
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium group-hover:text-indigo-300">
            <span>View all in Pipeline Kanban</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Active Rendering Jobs */}
        <div
          onClick={() => setActiveNav('editor')}
          className="relative bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-6 shadow-xl cursor-pointer transition-all group overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-24 h-24 text-amber-500" />
          </div>

          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Activity className={`w-5 h-5 ${dbMetrics.activeRenderingJobs > 0 ? 'animate-pulse' : ''}`} />
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                dbMetrics.activeRenderingJobs > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {dbMetrics.activeRenderingJobs > 0 ? 'Worker Encoding' : 'Queue Idle'}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Rendering Jobs
            </div>
            <div className="text-3xl font-extrabold text-white mt-1 tracking-tight font-mono">
              {dbMetrics.activeRenderingJobs}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {dbMetrics.activeRenderingJobs > 0
                ? `${dbMetrics.activeRenderingJobs} FFmpeg timeline thread(s) in progress`
                : 'All assembly jobs finished or in standby'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-medium group-hover:text-amber-300">
            <span>Open Video Assembly Studio</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div
          onClick={() => setActiveNav('script')}
          className="relative bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-rose-500/60 rounded-2xl p-6 shadow-xl cursor-pointer transition-all group overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="w-24 h-24 text-rose-500" />
          </div>

          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
              Human Gates
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Approvals
            </div>
            <div className="text-3xl font-extrabold text-white mt-1 tracking-tight font-mono">
              {dbMetrics.pendingApprovals}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Scripts and master renders awaiting editorial sign-off
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-rose-400 font-medium group-hover:text-rose-300">
            <span>Review & sign off releases</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* SECONDARY STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Channels', value: totalChannels, icon: Tv, color: 'text-indigo-400', nav: 'channels' },
          { label: 'In Production', value: inProduction, icon: Film, color: 'text-amber-400', nav: 'pipeline' },
          { label: 'Completed', value: completedVideos, icon: CheckCircle2, color: 'text-emerald-400', nav: 'publishing' },
          { label: 'Scheduled', value: scheduledUploads, icon: Calendar, color: 'text-sky-400', nav: 'publishing' },
          { label: 'Failed Jobs', value: failedJobs, icon: AlertCircle, color: failedJobs > 0 ? 'text-red-400' : 'text-slate-400', nav: 'logs' },
          { label: 'AI Cost', value: `$${totalCost.toFixed(4)}`, icon: DollarSign, color: 'text-emerald-400', nav: 'costs' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={() => setActiveNav(stat.nav)}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 rounded-xl p-3 cursor-pointer transition-all hover:border-slate-700"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-medium truncate">{stat.label}</span>
                <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <div className="text-base font-bold text-white mt-1 tracking-tight">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* 3D Virtual Studio & Live Stage Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Stage Viewer */}
        <div className="lg:col-span-8 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Virtual 3D Production Studio
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Three.js PBR Engine • Stage: {activeProject?.stage || 'IDLE'}
            </span>
          </div>

          <div className="h-[380px] w-full">
            <Studio3DViewer
              currentProjectTitle={activeProject?.title}
              currentStage={activeProject?.stage}
              isRendering={Boolean(activeRender)}
            />
          </div>
        </div>

        {/* Right: Active Project Quick Controls */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase text-slate-400">Current Focused Video</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {activeProject?.stage}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-white mt-3 line-clamp-2 leading-snug">
              {activeProject?.title}
            </h3>

            <div className="mt-4 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Aspect Ratio:</span>
                <span className="font-mono text-white">{activeProject?.format || '16:9'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Target Duration:</span>
                <span className="font-mono text-white">
                  {Math.floor((activeProject?.targetDuration || 480) / 60)} min
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Priority:</span>
                <span className="capitalize font-medium text-amber-400">{activeProject?.priority}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Assembly Status:</span>
                <span className="font-medium text-emerald-400">
                  {activeRender ? `Rendering (${activeRender.progress}%)` : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => setActiveNav('script')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-xl transition-colors text-center"
            >
              Open in Script Studio
            </button>
            <button
              onClick={() => setActiveNav('editor')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 rounded-xl transition-colors text-center"
            >
              Configure Media Assembly
            </button>
          </div>
        </div>
      </div>

      {/* Production Pipeline Roadmap Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">14-Stage Production Roadmap</h2>
            <span className="text-xs text-slate-400">• Strict verified progression</span>
          </div>
          <button
            onClick={() => setActiveNav('pipeline')}
            className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
          >
            <span>View Full Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-14 gap-2">
          {PIPELINE_STAGES.map((st, idx) => {
            const count = projects.filter((p) => p.stage === st.key).length;
            const isCurrent = activeProject?.stage === st.key;
            return (
              <div
                key={st.key}
                onClick={() => setActiveNav('pipeline')}
                className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-red-600/20 border-red-500/60 text-red-300 shadow-md shadow-red-500/10'
                    : count > 0
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400">{idx + 1}</div>
                <div className="text-[11px] font-bold truncate mt-0.5">{st.label}</div>
                <div className="text-xs font-bold text-indigo-400 mt-1">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Factory Projects</h2>
            <button
              onClick={() => setActiveNav('pipeline')}
              className="text-xs text-slate-400 hover:text-white"
            >
              See all ({projects.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => {
                  setSelectedProjectId(proj.id);
                  setActiveNav('script');
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shrink-0">
                    <Film className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">{proj.title}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{proj.format}</span>
                      <span>•</span>
                      <span>{Math.floor(proj.targetDuration / 60)}m</span>
                      <span>•</span>
                      <span className="capitalize">{proj.priority} priority</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                    {proj.stage}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Activity Feed */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Audit & Pipeline Logs</h2>
            <button
              onClick={() => setActiveNav('logs')}
              className="text-xs text-slate-400 hover:text-white"
            >
              System logs
            </button>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-200">{log.action}</div>
                  <div className="text-slate-400 text-[11px] truncate">{log.details}</div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
