import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Film, Sparkles, Monitor, Smartphone, Square } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { channels, selectedChannelId, createProject, setActiveNav } = useApp();

  const [channelId, setChannelId] = useState(selectedChannelId);
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [targetDuration, setTargetDuration] = useState(480);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createProject({
      channelId: channelId || channels[0]?.id || 'default',
      title: title.trim(),
      stage: 'OUTLINE',
      format,
      targetDuration,
      priority,
      completed: false,
    });

    onClose();
    setActiveNav('script');
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Create Video Production Project</h2>
              <div className="text-[11px] text-slate-400">Initiate automated 14-stage workflow</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Channel</label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
            >
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name} ({ch.niche})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Working Video Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Terrifying Truth About Autonomous Quantum Weapons"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Aspect Ratio & Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '16:9', label: '16:9 Longform', icon: Monitor },
                { id: '9:16', label: '9:16 Shorts', icon: Smartphone },
                { id: '1:1', label: '1:1 Square', icon: Square },
              ].map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = format === fmt.id;
                return (
                  <button
                    type="button"
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id as any)}
                    className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-red-600/15 border-red-500 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{fmt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Duration (min)</label>
              <select
                value={targetDuration}
                onChange={(e) => setTargetDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-mono"
              >
                <option value={60}>1 min (Shorts)</option>
                <option value={300}>5 min</option>
                <option value={480}>8 min (Mid-roll optimal)</option>
                <option value={600}>10 min</option>
                <option value={900}>15 min deep-dive</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Production Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 capitalize"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl shadow-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch in Pipeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
