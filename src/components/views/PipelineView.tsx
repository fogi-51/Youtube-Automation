import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PIPELINE_STAGES, PipelineStage, Project } from '../../types';
import {
  Workflow,
  ChevronRight,
  RotateCcw,
  Clock,
  Film,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Play,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const PipelineView: React.FC = () => {
  const {
    projects,
    selectedChannelId,
    updateProjectStage,
    setSelectedProjectId,
    setActiveNav,
  } = useApp();

  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredProjects = projects.filter((p) => {
    const channelMatch = !selectedChannelId || p.channelId === selectedChannelId;
    const priorityMatch = filterPriority === 'all' || p.priority === filterPriority;
    return channelMatch && priorityMatch;
  });

  const getStageIndex = (stage: PipelineStage) =>
    PIPELINE_STAGES.findIndex((s) => s.key === stage);

  const handleAdvance = (project: Project) => {
    const currentIndex = getStageIndex(project.stage);
    if (currentIndex < PIPELINE_STAGES.length - 1) {
      const nextStage = PIPELINE_STAGES[currentIndex + 1].key;
      updateProjectStage(project.id, nextStage);
    }
  };

  const handleRollback = (project: Project) => {
    const currentIndex = getStageIndex(project.stage);
    if (currentIndex > 0) {
      const prevStage = PIPELINE_STAGES[currentIndex - 1].key;
      updateProjectStage(project.id, prevStage);
    }
  };

  const handleOpenStudio = (project: Project) => {
    setSelectedProjectId(project.id);
    switch (project.stage) {
      case 'IDEA':
      case 'RESEARCH':
        setActiveNav('ideas');
        break;
      case 'OUTLINE':
      case 'SCRIPT':
      case 'SCRIPT_REVIEW':
        setActiveNav('script');
        break;
      case 'VOICEOVER':
        setActiveNav('voiceover');
        break;
      case 'VISUAL_ASSETS':
      case 'VIDEO_ASSEMBLY':
      case 'QUALITY_CHECK':
        setActiveNav('editor');
        break;
      case 'THUMBNAIL':
        setActiveNav('thumbnail');
        break;
      case 'SEO_METADATA':
        setActiveNav('seo');
        break;
      case 'FINAL_REVIEW':
      case 'SCHEDULED':
      case 'PUBLISHED':
        setActiveNav('publishing');
        break;
      default:
        setActiveNav('overview');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Workflow className="w-5 h-5 text-indigo-400" />
            <span>14-Stage Production Pipeline</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            State machine with human-in-the-loop approval gates, automated stage rendering, and zero silent failures.
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Filter Priority:</span>
          {['all', 'urgent', 'high', 'medium', 'low'].map((pri) => (
            <button
              key={pri}
              onClick={() => setFilterPriority(pri)}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${
                filterPriority === pri
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {pri}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-800">
        {PIPELINE_STAGES.map((stage, idx) => {
          const stageProjects = filteredProjects.filter((p) => p.stage === stage.key);
          const isReviewGate = stage.key === 'SCRIPT_REVIEW' || stage.key === 'FINAL_REVIEW';

          return (
            <div
              key={stage.key}
              className="w-72 shrink-0 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col max-h-[750px]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/80 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                      <span>{stage.label}</span>
                      {isReviewGate && (
                        <span title="Human Approval Gate">
                          <ShieldCheck className="w-3 h-3 text-amber-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {stage.description}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {stageProjects.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {stageProjects.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                    No active videos
                  </div>
                ) : (
                  stageProjects.map((proj) => {
                    return (
                      <div
                        key={proj.id}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-md transition-all group"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                          <span className="font-mono">{proj.format}</span>
                          <span
                            className={`font-semibold capitalize px-1.5 py-0.2 rounded ${
                              proj.priority === 'urgent'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : proj.priority === 'high'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {proj.priority}
                          </span>
                        </div>

                        <h4
                          onClick={() => handleOpenStudio(proj)}
                          className="font-semibold text-xs text-slate-100 hover:text-red-400 cursor-pointer line-clamp-2 leading-snug transition-colors"
                        >
                          {proj.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{Math.floor(proj.targetDuration / 60)} min</span>
                        </div>

                        {/* Stage Controls */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1 text-xs">
                          <button
                            onClick={() => handleRollback(proj)}
                            disabled={idx === 0}
                            title="Move back / Retry stage"
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenStudio(proj)}
                            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                          >
                            Open Studio
                          </button>

                          <button
                            onClick={() => handleAdvance(proj)}
                            disabled={idx === PIPELINE_STAGES.length - 1}
                            title="Advance to next stage"
                            className="p-1 rounded bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 disabled:opacity-30 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
