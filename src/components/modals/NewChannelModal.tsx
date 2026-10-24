import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Tv, Sparkles } from 'lucide-react';

interface NewChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChannelModal: React.FC<NewChannelModalProps> = ({ isOpen, onClose }) => {
  const { createChannel, setActiveNav } = useApp();

  const [name, setName] = useState('');
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [defaultFormat, setDefaultFormat] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [brandVoice, setBrandVoice] = useState('');
  const [visualIdentity, setVisualIdentity] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !niche.trim()) return;

    await createChannel({
      name: name.trim(),
      channelId: `UC${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      niche: niche.trim(),
      targetAudience: targetAudience || 'Target audience for ' + niche,
      preferredLanguage: 'English',
      defaultFormat,
      brandVoice: brandVoice || 'Authoritative and dynamic storytelling',
      visualIdentity: visualIdentity || 'High-contrast cinematic grading',
      connected: false,
      subscribers: 0,
      totalViews: 0,
    });

    onClose();
    setActiveNav('channels');
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Create Channel Workspace</h2>
              <div className="text-[11px] text-slate-400">Multi-channel management configuration</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Channel Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dark Web Files, Wealth Blueprint"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Niche *</label>
              <input
                type="text"
                required
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. AI News, True Crime, Personal Finance"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Default Format</label>
              <select
                value={defaultFormat}
                onChange={(e) => setDefaultFormat(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              >
                <option value="16:9">16:9 Longform</option>
                <option value="9:16">9:16 Shorts</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Curious tech enthusiasts, investors, gamers 18-35"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Brand Voice</label>
            <input
              type="text"
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              placeholder="e.g. Mysterious documentary narrator, analytical and evidence-based"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Visual Identity</label>
            <input
              type="text"
              value={visualIdentity}
              onChange={(e) => setVisualIdentity(e.target.value)}
              placeholder="e.g. Cyberpunk neon, clean bold typography, moody b-roll"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
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
              <span>Create Channel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
