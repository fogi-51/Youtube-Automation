import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Tv,
  Lightbulb,
  Calendar,
  Workflow,
  FileText,
  Mic,
  Film,
  Palette,
  Search,
  Send,
  BarChart3,
  Cpu,
  Layers,
  DollarSign,
  ScrollText,
  Settings,
  Sparkles,
  Bot,
  Video,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeNav, setActiveNav, isCopilotOpen, setIsCopilotOpen, activeProject } = useApp();

  const navItems: { section: string; items: NavItem[] }[] = [
    {
      section: 'Production Hub',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'channels', label: 'Channels', icon: Tv },
        { id: 'pipeline', label: 'Production Pipeline', icon: Workflow, badge: 'Live' },
        { id: 'calendar', label: 'Content Calendar', icon: Calendar },
      ],
    },
    {
      section: 'Creative Studios',
      items: [
        { id: 'ideas', label: 'Ideas & Research', icon: Lightbulb },
        { id: 'script', label: 'Script Studio', icon: FileText },
        { id: 'voiceover', label: 'Voiceover Studio', icon: Mic },
        { id: 'editor', label: 'Video Editor & Assembly', icon: Film },
        { id: 'thumbnail', label: 'Thumbnail Studio', icon: Palette },
        { id: 'seo', label: 'SEO Studio', icon: Search },
      ],
    },
    {
      section: 'Publishing & Analytics',
      items: [
        { id: 'publishing', label: 'Publishing Queue', icon: Send },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      section: 'Operations & AI',
      items: [
        { id: 'providers', label: 'AI Providers', icon: Cpu },
        { id: 'integrations', label: 'Integrations', icon: Layers },
        { id: 'costs', label: 'Costs & Usage', icon: DollarSign },
        { id: 'logs', label: 'Logs & Jobs', icon: ScrollText },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>YT Automation</span>
              <span className="text-[10px] font-mono uppercase bg-red-950 text-red-400 border border-red-800/60 px-1.5 py-0.2 rounded">
                Factory
              </span>
            </div>
            <div className="text-[11px] text-slate-400">AI Video Production Engine</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((group) => (
          <div key={group.section} className="space-y-1">
            <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {group.section}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-red-600/15 text-red-400 border border-red-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Copilot Assistant Quick Trigger */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
            isCopilotOpen
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border-indigo-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>YouTube Copilot</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </button>
      </div>

      {/* Active Project Footer Widget */}
      {activeProject && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950 text-xs">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Project</div>
          <div className="font-medium text-slate-200 truncate mt-0.5">{activeProject.title}</div>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px]">
              {activeProject.stage}
            </span>
            <span>•</span>
            <span>{Math.floor(activeProject.targetDuration / 60)}m target</span>
          </div>
        </div>
      )}
    </aside>
  );
};
