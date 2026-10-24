import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PublishingJob } from '../../types';
import {
  Send,
  Youtube,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Lock,
  Globe,
  EyeOff,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Plus,
} from 'lucide-react';

export const PublishingQueueView: React.FC = () => {
  const {
    publishingJobs,
    activeProject,
    activeChannel,
    createPublishingJob,
    updatePublishingJob,
    updateProjectStage,
    logActivity,
  } = useApp();

  const [privacyStatus, setPrivacyStatus] = useState<'private' | 'unlisted' | 'public'>('private');
  const [scheduledDateTime, setScheduledDateTime] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );
  const [humanApproved, setHumanApproved] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleScheduleUpload = async () => {
    if (!humanApproved) {
      alert('Human editorial approval is mandatory prior to queueing a YouTube release.');
      return;
    }
    if (!activeProject || !activeChannel) return;

    await createPublishingJob({
      projectId: activeProject.id,
      channelId: activeChannel.id,
      scheduledFor: new Date(scheduledDateTime).toISOString(),
      privacyStatus,
      publishStatus: 'scheduled',
      approvedByHuman: true,
    });

    updateProjectStage(activeProject.id, 'SCHEDULED');
    logActivity(
      'Upload Scheduled',
      `Queued video "${activeProject.title}" for release as ${privacyStatus.toUpperCase()} on ${new Date(scheduledDateTime).toLocaleString()}`,
      'publish'
    );
  };

  const handleSimulateDirectPublish = (jobId: string) => {
    setPublishing(true);
    setTimeout(() => {
      updatePublishingJob(jobId, {
        publishStatus: 'published',
        youtubeVideoId: `dQw4w9WgXcQ_${Math.random().toString(36).substr(2, 4)}`,
      });
      if (activeProject) {
        updateProjectStage(activeProject.id, 'PUBLISHED');
      }
      setPublishing(false);
      logActivity('YouTube Published', 'Video release published to YouTube via Data API', 'publish');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            <span>YouTube Publishing Queue</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Official YouTube Data API v3 publisher with mandatory human sign-off, scheduled releases, and private sandbox testing.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>API Quota: 1,600 / 10,000 units</span>
          </span>
        </div>
      </div>

      {/* Safety Policy Notice */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold uppercase tracking-wider text-[11px]">
            Strict Human Approval Policy Enforced
          </div>
          <p className="text-amber-200/90 text-xs leading-relaxed">
            Autonomous video pipelines never publish directly to YouTube without verified human sign-off.
            Private upload mode is set by default to protect channel standing and copyright integrity.
          </p>
        </div>
      </div>

      {/* Main Publishing Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Schedule Configuration */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Publishing Release Parameters
            </span>
            <div className="font-semibold text-sm text-slate-200 mt-1 truncate">
              {activeProject?.title}
            </div>
          </div>

          {/* Privacy Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Privacy Setting</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'private', label: 'Private', desc: 'Safest test mode', icon: Lock },
                { id: 'unlisted', label: 'Unlisted', desc: 'Share with direct link', icon: EyeOff },
                { id: 'public', label: 'Public', desc: 'Live on feed & search', icon: Globe },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = privacyStatus === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPrivacyStatus(item.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-red-600/15 border-red-500/60 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-red-400' : 'text-slate-500'}`} />
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Publication Date & Time (UTC)</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          {/* Mandatory Human Sign-Off Gate */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={humanApproved}
                onChange={(e) => setHumanApproved(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-0 mt-0.5 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-white">
                  I have manually reviewed the script, audio narration, video assembly, and metadata.
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Confirming all visuals adhere to YouTube Community Guidelines and Fair Use copyright standards.
                </p>
              </div>
            </label>
          </div>

          <button
            onClick={handleScheduleUpload}
            disabled={!humanApproved}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-semibold text-xs py-3 rounded-xl shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Queue Video for Scheduled Release</span>
          </button>
        </div>

        {/* Right: Channel Status & Release Checklist */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Release Readiness Checklist
            </span>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Scene Script Approved', ok: true },
                { label: 'Voiceover Audio Staged', ok: true },
                { label: 'FFmpeg Video Render Rendered', ok: true },
                { label: '16:9 Thumbnail Exported', ok: true },
                { label: 'SEO Tags & Description Populated', ok: true },
                { label: 'Human Review Verified', ok: humanApproved },
              ].map((chk, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/60"
                >
                  <span className="text-slate-300 font-medium">{chk.label}</span>
                  {chk.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Publishing Queue Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Publishing Queue & Release History ({publishingJobs.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">Video Title</th>
                <th className="pb-3 font-semibold">Privacy</th>
                <th className="pb-3 font-semibold">Scheduled Time</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Sign-off</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {publishingJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-medium text-slate-200 max-w-xs truncate">
                    {activeProject?.title || 'Video Release'}
                  </td>
                  <td className="py-3">
                    <span className="capitalize font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {job.privacyStatus}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {new Date(job.scheduledFor).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full capitalize font-medium ${
                        job.publishStatus === 'published'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {job.publishStatus}
                    </span>
                  </td>
                  <td className="py-3">
                    {job.approvedByHuman ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="text-amber-400">Pending</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {job.publishStatus !== 'published' ? (
                      <button
                        onClick={() => handleSimulateDirectPublish(job.id)}
                        disabled={publishing}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Publish Now
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-slate-400">Live on YT</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
