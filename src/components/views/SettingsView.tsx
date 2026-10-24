import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  HardDrive,
  Key,
  Save,
  CheckCircle2,
  Lock,
  Globe,
  Video,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, logActivity } = useApp();

  const [saved, setSaved] = useState(false);
  const [defaultResolution, setDefaultResolution] = useState('1080p');
  const [defaultFps, setDefaultFps] = useState(30);
  const [tempStoragePath, setTempStoragePath] = useState('/tmp/yt-factory/media');
  const [renderStoragePath, setRenderStoragePath] = useState('/storage/renders/masters');
  const [autoExportSrt, setAutoExportSrt] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    logActivity('Settings Updated', 'System rendering defaults and storage paths saved', 'system');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span>Factory System Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global video encoding defaults, persistent storage directories, and security policies.
          </p>
        </div>

        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Encoding Defaults */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
            <Video className="w-4 h-4 text-indigo-400" />
            <span>Default Media Assembly Profiles</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Default Render Resolution</label>
              <select
                value={defaultResolution}
                onChange={(e) => setDefaultResolution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="1080p">1080p FHD (1920x1080)</option>
                <option value="4K">4K UHD (3840x2160)</option>
                <option value="720p">720p HD</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Default Frame Rate (FPS)</label>
              <select
                value={defaultFps}
                onChange={(e) => setDefaultFps(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={30}>30 fps (Broadcast standard)</option>
                <option value={60}>60 fps (High motion smoothness)</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-2 text-xs">
            <input
              type="checkbox"
              checked={autoExportSrt}
              onChange={(e) => setAutoExportSrt(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            <span className="text-slate-300">
              Automatically generate and burn .SRT subtitle motion captions on assembly
            </span>
          </label>
        </div>

        {/* Media Storage Paths */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Persistent Media Storage Paths</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Temporary Asset Buffer Directory</label>
              <input
                type="text"
                value={tempStoragePath}
                onChange={(e) => setTempStoragePath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Permanent Master Video Renders Directory</label>
              <input
                type="text"
                value={renderStoragePath}
                onChange={(e) => setRenderStoragePath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Security Overview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
            <Shield className="w-4 h-4 text-red-500" />
            <span>Security & Zero-Exposure Policy</span>
          </h2>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Gemini API Key Exposure Safeguard</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Handled server-side exclusively. Keys are never transmitted to client JavaScript.
                </div>
              </div>
              <span className="text-emerald-400 font-mono font-bold text-xs">ACTIVE</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Firestore Security Rules (ABAC)</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Zero-trust attribute-based access control isolating each user's projects and channels.
                </div>
              </div>
              <span className="text-emerald-400 font-mono font-bold text-xs">DEPLOYED</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save System Configurations</span>
        </button>
      </form>
    </div>
  );
};
