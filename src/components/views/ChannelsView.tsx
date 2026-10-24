import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Channel } from '../../types';
import {
  Tv,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Eye,
  Radio,
  Settings,
  Shield,
  Layers,
  Sparkles,
  Trash2,
} from 'lucide-react';

export const ChannelsView: React.FC = () => {
  const { channels, selectedChannelId, setSelectedChannelId, createChannel, updateChannel, logActivity } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    channelId: '',
    niche: '',
    targetAudience: '',
    preferredLanguage: 'English',
    defaultFormat: '16:9' as '16:9' | '9:16' | '1:1',
    brandVoice: '',
    visualIdentity: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.niche) return;

    await createChannel({
      name: formData.name,
      channelId: formData.channelId || `UC${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      niche: formData.niche,
      targetAudience: formData.targetAudience || 'General audience interested in ' + formData.niche,
      preferredLanguage: formData.preferredLanguage,
      defaultFormat: formData.defaultFormat,
      brandVoice: formData.brandVoice || 'Inspirational, direct, evidence-backed',
      visualIdentity: formData.visualIdentity || 'High-contrast 4k visuals, cinematic typography',
      connected: false,
      subscribers: 0,
      totalViews: 0,
    });

    setIsModalOpen(false);
    setFormData({
      name: '',
      channelId: '',
      niche: '',
      targetAudience: '',
      preferredLanguage: 'English',
      defaultFormat: '16:9',
      brandVoice: '',
      visualIdentity: '',
    });
  };

  const handleToggleConnection = (channel: Channel) => {
    const nextStatus = !channel.connected;
    updateChannel(channel.id, {
      connected: nextStatus,
      subscribers: nextStatus ? (channel.subscribers || 15400) : channel.subscribers,
    });
    logActivity(
      nextStatus ? 'YouTube OAuth Connected' : 'YouTube OAuth Disconnected',
      `Channel ${channel.name} account integration status updated.`,
      'publish'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-500" />
            <span>Multi-Channel Workspaces</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Configure independent brand voices, target demographics, and YouTube OAuth credentials for each automation channel.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-red-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Channel Workspace</span>
        </button>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((chan) => {
          const isSelected = chan.id === selectedChannelId;
          return (
            <div
              key={chan.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-slate-900 border-red-500/50 shadow-xl shadow-red-500/5 ring-1 ring-red-500/30'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Channel Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center font-bold text-sm text-red-400">
                      {chan.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-white">{chan.name}</h3>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {chan.channelId || 'ID: Pending Auth'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${
                      chan.connected
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Radio className="w-2.5 h-2.5" />
                    <span>{chan.connected ? 'OAuth Connected' : 'Manual / Draft'}</span>
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Subscribers</span>
                    </div>
                    <div className="font-bold text-white mt-0.5">
                      {chan.subscribers?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Total Views</span>
                    </div>
                    <div className="font-bold text-white mt-0.5">
                      {chan.totalViews?.toLocaleString() || '0'}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400">Niche:</span>
                    <div className="text-slate-200 font-medium truncate">{chan.niche}</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Target Audience:</span>
                    <div className="text-slate-300 text-[11px] line-clamp-2">{chan.targetAudience}</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Brand Voice:</span>
                    <div className="text-slate-300 text-[11px] line-clamp-2">{chan.brandVoice}</div>
                  </div>
                  <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                    <span>Format: <strong className="text-slate-200">{chan.defaultFormat}</strong></span>
                    <span>Lang: <strong className="text-slate-200">{chan.preferredLanguage}</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedChannelId(chan.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    isSelected
                      ? 'bg-red-600/20 text-red-300 border border-red-500/30 font-semibold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isSelected ? 'Active Workspace' : 'Select Workspace'}
                </button>

                <button
                  onClick={() => handleToggleConnection(chan)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    chan.connected
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  }`}
                >
                  {chan.connected ? 'Disconnect OAuth' : 'Connect YouTube'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Channel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Create Channel Workspace</h2>
            <p className="text-xs text-slate-400 mb-4">
              Configure parameters for your faceless YouTube automation niche.
            </p>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Channel Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Quantum Chronicles, Dark Mysteries AI"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Niche *</label>
                  <input
                    type="text"
                    required
                    value={formData.niche}
                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                    placeholder="e.g. AI news, finance, history"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Default Format</label>
                  <select
                    value={formData.defaultFormat}
                    onChange={(e) => setFormData({ ...formData, defaultFormat: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="16:9">16:9 Horizontal (Longform)</option>
                    <option value="9:16">9:16 Vertical (Shorts)</option>
                    <option value="1:1">1:1 Square</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Audience Demographic</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g. Male 18-34, software developers, sci-fi fans"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Brand Voice & Persona</label>
                <input
                  type="text"
                  value={formData.brandVoice}
                  onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
                  placeholder="e.g. Mysterious documentary narrator, fast-paced tech nerd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Visual Identity & Aesthetic</label>
                <input
                  type="text"
                  value={formData.visualIdentity}
                  onChange={(e) => setFormData({ ...formData, visualIdentity: e.target.value })}
                  placeholder="e.g. Cyberpunk neon, clean minimalist typography, dark footage"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
