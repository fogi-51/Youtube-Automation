import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ScrollText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Activity,
  Filter,
} from 'lucide-react';

export const LogsJobsView: React.FC = () => {
  const { renderJobs, activityLogs, startRenderJob, logActivity } = useApp();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    renderJobs[0]?.id || null
  );

  const selectedJob = renderJobs.find((j) => j.id === selectedJobId) || renderJobs[0];

  const handleRetryJob = async (projectId: string) => {
    await startRenderJob(projectId);
    logActivity('Render Job Retried', `Dispatched fresh worker thread for project`, 'render');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-indigo-400" />
            <span>Background Jobs & Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Monitor FFmpeg rendering workers, job queues, execution logs, and full security audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            Worker Concurrency: 4 threads
          </span>
        </div>
      </div>

      {/* Grid: Left Jobs Queue, Right Terminal Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Background Render Jobs */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Render Job Queue ({renderJobs.length})
            </span>
            <span className="text-xs text-slate-400">Persistent state</span>
          </div>

          <div className="space-y-2.5">
            {renderJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isProcessing = job.status === 'processing';
              const isCompleted = job.status === 'completed';

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-[11px] text-slate-300">{job.id}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full capitalize font-semibold ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isProcessing
                          ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {job.status} ({job.progress}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="font-mono">
                      {job.resolution} • {job.aspectRatio} • {job.fps}fps
                    </span>
                    <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
                  </div>

                  {job.status === 'failed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetryJob(job.projectId);
                      }}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-1 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Failed Stage</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Worker Terminal Output */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Job Execution Output: {selectedJob?.id || 'N/A'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">stdout/stderr</span>
            </div>

            <div className="mt-4 p-4 bg-black rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-2 h-[340px] overflow-y-auto">
              {selectedJob?.logs && selectedJob.logs.length > 0 ? (
                selectedJob.logs.map((line, i) => (
                  <div key={i} className="leading-relaxed">
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-slate-500">No output logs captured for this job.</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Process: ffmpeg -y -i inputs -c:v libx264</span>
            <span className="text-emerald-400 font-mono">Exit Code: 0</span>
          </div>
        </div>
      </div>

      {/* Security Audit Trail */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Immutable System Audit Trail ({activityLogs.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Details</th>
                <th className="pb-3 font-semibold text-right">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {activityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 font-bold text-slate-200 font-sans">{log.action}</td>
                  <td className="py-2.5 font-sans text-slate-400 truncate max-w-md">
                    {log.details}
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded uppercase text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {log.category}
                    </span>
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
