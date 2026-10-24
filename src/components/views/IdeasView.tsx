import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Idea } from '../../types';
import {
  Lightbulb,
  Sparkles,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Copy,
  Zap,
  Info,
  Layers,
} from 'lucide-react';

export const IdeasView: React.FC = () => {
  const {
    ideas,
    channels,
    selectedChannelId,
    activeChannel,
    createIdea,
    convertIdeaToProject,
    updateIdea,
    recordAiUsage,
    setActiveNav,
  } = useApp();

  const [generating, setGenerating] = useState(false);
  const [topicPrompt, setTopicPrompt] = useState('');
  const [modelType, setModelType] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [statusFilter, setStatusFilter] = useState<'all' | 'brainstorm' | 'approved' | 'converted'>('all');

  const filteredIdeas = ideas.filter((idea) => {
    const channelMatch = !selectedChannelId || idea.channelId === selectedChannelId;
    const statusMatch = statusFilter === 'all' || idea.status === statusFilter;
    return channelMatch && statusMatch;
  });

  const handleGenerateIdeas = async () => {
    if (generating) return;
    setGenerating(true);

    const niche = activeChannel?.niche || 'Technology & Future Trends';
    const brandVoice = activeChannel?.brandVoice || 'Direct, high-energy storytelling';
    const targetAudience = activeChannel?.targetAudience || 'Curious adults 18-35';

    const systemInstruction = `You are a viral YouTube automation ideation expert specializing in high click-through-rate concepts and strong opening hooks.
Generate 3 distinct high-potential YouTube video ideas for a channel in the niche: "${niche}".
Target Audience: "${targetAudience}".
Brand Voice: "${brandVoice}".
${topicPrompt ? `Focus specifically on subtopic: "${topicPrompt}".` : ''}

Output ONLY valid JSON matching this exact structure:
[
  {
    "title": "Compelling Title",
    "hook": "Strong 3-second opening line hook",
    "category": "Sub-category",
    "targetAudience": "Audience segment",
    "format": "16:9 Longform",
    "priority": "high",
    "researchNotes": "Key angle or psychological curiosity gap to exploit"
  }
]`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate 3 viral ideas for niche: ${niche}`,
          systemInstruction,
          model: modelType,
          jsonOutput: true,
          temperature: 0.8,
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.json)) {
        for (const item of data.json) {
          await createIdea({
            channelId: selectedChannelId,
            title: item.title || 'Untitled Viral Idea',
            hook: item.hook || 'Curiosity hook here...',
            category: item.category || niche,
            targetAudience: item.targetAudience || targetAudience,
            format: item.format || '16:9 Longform',
            priority: (item.priority as any) || 'medium',
            status: 'brainstorm',
            researchNotes: item.researchNotes || 'AI-generated brainstorming suggestion',
          });
        }
        recordAiUsage(modelType, 'Viral Topic & Hook Ideation', data.usage?.estimatedTokens || 850);
      } else {
        throw new Error(data.error || 'Failed to parse ideas response');
      }
    } catch (err: any) {
      console.error('Failed to generate ideas:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleConvert = async (ideaId: string) => {
    try {
      await convertIdeaToProject(ideaId);
      setActiveNav('script');
    } catch (err: any) {
      console.error('Failed to convert idea:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <span>Idea & Research Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Brainstorm high-retention video concepts, viral working hooks, and audience psychological triggers for{' '}
            <strong className="text-white">{activeChannel?.name || 'your channel'}</strong>.
          </p>
        </div>

        {/* Brainstorm Prompt Box */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            value={topicPrompt}
            onChange={(e) => setTopicPrompt(e.target.value)}
            placeholder="Focus subtopic (optional)..."
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-56"
          />

          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (Balanced)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Low Latency)</option>
          </select>

          <button
            onClick={handleGenerateIdeas}
            disabled={generating}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'Ideating...' : 'Generate 3 Ideas'}</span>
          </button>
        </div>
      </div>

      {/* Disclaimers & Methodology Note */}
      <div className="flex items-center gap-2 p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl text-xs text-slate-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          <strong>Methodology Disclosure:</strong> In accordance with factory policy, generated concepts are labeled as{' '}
          <span className="text-slate-300">AI-generated brainstorming</span>. Sourced facts must be validated during the Script Studio phase prior to publication.
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 mr-2">Filter Status:</span>
          {(['all', 'brainstorm', 'approved', 'converted'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredIdeas.length} idea cards
        </span>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIdeas.map((idea) => {
          const isConverted = idea.status === 'converted';
          const isApproved = idea.status === 'approved';

          return (
            <div
              key={idea.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                isConverted
                  ? 'bg-slate-900/30 border-slate-800/50 opacity-75'
                  : isApproved
                  ? 'bg-slate-900 border-indigo-500/40 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {idea.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full capitalize font-medium ${
                      isConverted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isApproved
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {idea.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-3 leading-snug line-clamp-2">
                  {idea.title}
                </h3>

                {/* Viral Hook */}
                <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                  <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Retention Opening Hook</span>
                  </div>
                  <p className="text-slate-300 italic">"{idea.hook}"</p>
                </div>

                {idea.researchNotes && (
                  <p className="text-[11px] text-slate-400 mt-3 line-clamp-2">
                    <strong>Angle:</strong> {idea.researchNotes}
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {!isApproved && !isConverted && (
                    <button
                      onClick={() => updateIdea(idea.id, { status: 'approved' })}
                      title="Approve Idea"
                      className="p-1.5 bg-slate-800 hover:bg-emerald-600/30 text-slate-400 hover:text-emerald-300 rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {idea.status !== 'rejected' && !isConverted && (
                    <button
                      onClick={() => updateIdea(idea.id, { status: 'rejected' })}
                      title="Reject"
                      className="p-1.5 bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isConverted ? (
                  <span className="text-xs text-emerald-400 font-medium">In Pipeline</span>
                ) : (
                  <button
                    onClick={() => handleConvert(idea.id)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>Start Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
