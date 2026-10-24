import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Film,
  Play,
  Pause,
  Download,
  Settings,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Layers,
  Music,
  Type,
  Video,
  Monitor,
  Smartphone,
  Square,
  AlertCircle,
} from 'lucide-react';

export const VideoEditorView: React.FC = () => {
  const {
    activeProject,
    activeScript,
    renderJobs,
    startRenderJob,
    updateProjectStage,
    logActivity,
  } = useApp();

  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>(
    (activeProject?.format as any) || '16:9'
  );
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState(30);
  const [bgMusic, setBgMusic] = useState('Cyberpunk Ambient Synth (Low Bed)');
  const [enableSubtitles, setEnableSubtitles] = useState(true);
  const [subtitleStyle, setSubtitleStyle] = useState('Alex Hormozi Yellow Pop');

  const currentJob = renderJobs.find((j) => j.projectId === activeProject?.id);
  const isRendering = currentJob?.status === 'processing' || currentJob?.status === 'queued';

  const scenes = activeScript?.scenes || [];

  const handleStartRender = async () => {
    if (!activeProject || isRendering) return;
    await startRenderJob(activeProject.id, aspectRatio, resolution);
    logActivity('FFmpeg Render Dispatched', `Video assembly queued at ${resolution} ${fps}fps (${aspectRatio})`, 'render');
  };

  const handleAdvanceToThumbnail = () => {
    if (activeProject) {
      updateProjectStage(activeProject.id, 'THUMBNAIL');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-400" />
            <span>Video Editor & Media Assembly</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            FFmpeg timeline compositor: stitch scene assets, synchronize voiceovers, apply animated subtitle captions, and render MP4 masters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleStartRender}
            disabled={isRendering}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all"
          >
            {isRendering ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Rendering Assembly...</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>Start FFmpeg Render</span>
              </>
            )}
          </button>

          {currentJob?.status === 'completed' && (
            <button
              onClick={handleAdvanceToThumbnail}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Advance to Thumbnail</span>
            </button>
          )}
        </div>
      </div>

      {/* Assembly Settings Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl text-xs">
        {/* Aspect Ratio */}
        <div>
          <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5" />
            <span>Aspect Ratio</span>
          </label>
          <div className="flex gap-2">
            {[
              { id: '16:9', label: '16:9 Landscape', icon: Monitor },
              { id: '9:16', label: '9:16 Shorts', icon: Smartphone },
              { id: '1:1', label: '1:1 Square', icon: Square },
            ].map((ar) => (
              <button
                key={ar.id}
                onClick={() => setAspectRatio(ar.id as any)}
                className={`flex-1 py-1.5 px-2 rounded-lg border font-medium text-center transition-colors ${
                  aspectRatio === ar.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {ar.id}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution & FPS */}
        <div>
          <label className="block text-slate-400 font-medium mb-1.5">Resolution & Frame Rate</label>
          <div className="flex gap-2">
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="1080p">1080p FHD (1920x1080)</option>
              <option value="4K">4K UHD (3840x2160)</option>
              <option value="720p">720p HD</option>
            </select>
            <select
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value={30}>30 fps</option>
              <option value={60}>60 fps</option>
            </select>
          </div>
        </div>

        {/* Background Music */}
        <div>
          <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5" />
            <span>Background Music</span>
          </label>
          <select
            value={bgMusic}
            onChange={(e) => setBgMusic(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none truncate"
          >
            <option value="Cyberpunk Ambient Synth">Cyberpunk Ambient Synth (Low Bed)</option>
            <option value="Cinematic Deep Mystery">Cinematic Deep Mystery</option>
            <option value="Upbeat Tech Explainer">Upbeat Tech Explainer</option>
            <option value="None">None (Voiceover only)</option>
          </select>
        </div>

        {/* Motion Subtitles */}
        <div>
          <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            <span>Animated Subtitles</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEnableSubtitles(!enableSubtitles)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                enableSubtitles
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              {enableSubtitles ? 'Enabled' : 'Disabled'}
            </button>
            <select
              value={subtitleStyle}
              onChange={(e) => setSubtitleStyle(e.target.value)}
              disabled={!enableSubtitles}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none truncate disabled:opacity-50"
            >
              <option value="Alex Hormozi Yellow Pop">Hormozi Yellow Pop</option>
              <option value="Minimalist Clean White">Minimalist White</option>
              <option value="Cyber Neon Green">Cyber Neon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Preview & Render Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Player Master Canvas Preview */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-red-500" />
                <span>Master Video Preview ({aspectRatio})</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {currentJob?.status === 'completed' ? '4K Render Complete' : 'Timeline Composite'}
              </span>
            </div>

            {/* Simulated Player Viewport */}
            <div
              className={`relative mx-auto bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center ${
                aspectRatio === '9:16'
                  ? 'w-[240px] h-[426px]'
                  : aspectRatio === '1:1'
                  ? 'w-[360px] h-[360px]'
                  : 'w-full aspect-video'
              }`}
            >
              {currentJob?.status === 'completed' ? (
                <video
                  controls
                  className="w-full h-full object-cover"
                  src={currentJob.outputUrl}
                  poster="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1280&q=80"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-indigo-400">
                    <Film className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-semibold text-white">Timeline Assembled ({scenes.length} Scenes)</div>
                  <div className="text-[11px] text-slate-400 max-w-xs">
                    Ready to render H.264 MP4 with synchronized TTS audio & subtitle typography.
                  </div>
                </div>
              )}

              {/* Subtitle simulation overlay */}
              {enableSubtitles && (
                <div className="absolute bottom-6 inset-x-4 text-center pointer-events-none">
                  <span className="bg-black/80 text-amber-300 font-extrabold uppercase px-3 py-1 rounded text-xs tracking-wider border border-amber-400/40 shadow-lg">
                    {scenes[0]?.onScreenText || 'HARVEST NOW. DECRYPT LATER.'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {currentJob?.status === 'completed' && (
            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-medium">Render complete: master_1080p.mp4</span>
              <a
                href={currentJob.outputUrl}
                download="master_render.mp4"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </a>
            </div>
          )}
        </div>

        {/* Right: Render Job Terminal & Progress */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                FFmpeg Worker Output
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full capitalize ${
                  currentJob?.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isRendering
                    ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {currentJob?.status || 'Idle'}
              </span>
            </div>

            {/* Progress Bar */}
            {isRendering && (
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Encoding Progress</span>
                  <span className="font-mono text-indigo-400 font-bold">{currentJob?.progress || 0}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-indigo-600 transition-all duration-300"
                    style={{ width: `${currentJob?.progress || 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Terminal Console Logs */}
            <div className="mt-4 p-3 bg-black/90 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1.5 max-h-[280px] overflow-y-auto">
              {currentJob?.logs && currentJob.logs.length > 0 ? (
                currentJob.logs.map((log, i) => (
                  <div key={i} className="leading-snug">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-500">Waiting for render job trigger...</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Engine: FFmpeg libx264 / AAC</span>
            <span className="font-mono text-slate-300">Preset: fast</span>
          </div>
        </div>
      </div>
    </div>
  );
};
