import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Tv,
  Film,
  Plus,
  Search,
  Bot,
  LogOut,
  LogIn,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewProject: () => void;
  onOpenNewChannel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewProject, onOpenNewChannel }) => {
  const {
    user,
    signInWithGoogle,
    signOut,
    channels,
    selectedChannelId,
    setSelectedChannelId,
    activeChannel,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    activeProject,
    isCopilotOpen,
    setIsCopilotOpen,
    renderJobs,
  } = useApp();

  const [systemStatus, setSystemStatus] = useState<{ status: string; uptime: number } | null>(null);

  useEffect(() => {
    fetch('/api/system/health')
      .then((res) => res.json())
      .then((data) => setSystemStatus(data))
      .catch(() => setSystemStatus(null));
  }, []);

  const activeRendersCount = renderJobs.filter((j) => j.status === 'processing').length;

  return (
    <header className="h-16 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left: Channel & Project Selectors */}
      <div className="flex items-center gap-4">
        {/* Channel Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
          <Tv className="w-3.5 h-3.5 text-red-500" />
          <select
            value={selectedChannelId}
            onChange={(e) => setSelectedChannelId(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-2"
          >
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id} className="bg-slate-900 text-slate-200">
                {ch.name} ({ch.niche.slice(0, 18)}...)
              </option>
            ))}
          </select>
          <button
            onClick={onOpenNewChannel}
            title="Create New Channel"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs max-w-xs">
          <Film className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer truncate max-w-[200px]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                [{p.stage}] {p.title}
              </option>
            ))}
          </select>
          <button
            onClick={onOpenNewProject}
            title="Create New Project"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Render Engine Activity Indicator */}
        {activeRendersCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium animate-pulse">
            <Activity className="w-3.5 h-3.5" />
            <span>Rendering ({activeRendersCount})</span>
          </div>
        )}

        {/* Server Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Engine Online</span>
        </div>

        {/* Quick New Project Button */}
        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-red-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>

        {/* YouTube Copilot Trigger */}
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`p-2 rounded-lg border transition-all ${
            isCopilotOpen
              ? 'bg-indigo-600 text-white border-indigo-500'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
          }`}
          title="Toggle YouTube AI Copilot"
        >
          <Bot className="w-4 h-4" />
        </button>

        {/* User Profile & Auth */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden border border-indigo-400">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  (user.displayName || user.email || 'U')[0]
                )}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-medium text-slate-200 truncate max-w-[120px]">
                  {user.displayName || 'Creator'}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</div>
              </div>
            </div>
            <button
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
