import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SeoData } from '../../types';
import {
  Search,
  Sparkles,
  CheckCircle2,
  Copy,
  Info,
  Youtube,
  Tag,
  Hash,
  List,
  MessageSquare,
  Bookmark,
} from 'lucide-react';

export const SeoStudioView: React.FC = () => {
  const {
    activeProject,
    activeChannel,
    activeScript,
    activeSeo,
    saveSeo,
    updateProjectStage,
    recordAiUsage,
    logActivity,
  } = useApp();

  const [generating, setGenerating] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(
    activeSeo?.selectedTitle || activeProject?.title || 'Why Quantum Computers Will Break Every Password in 2027'
  );
  const [titleOptions, setTitleOptions] = useState<string[]>(
    activeSeo?.titleOptions || [
      'Why Quantum Computers Will Break Every Password in 2027',
      'The Silent Q-Day Threat: How Quantum AI Cracks Encryption',
      'Can Quantum AI Hack Your Bank Account? The Truth',
    ]
  );
  const [description, setDescription] = useState(
    activeSeo?.description ||
      `In this deep dive, we investigate the looming 'Q-Day'—the point in time when fault-tolerant quantum computers become powerful enough to break standard RSA-2048 encryption.\n\nChapters:\n00:00 - The Harvest Now, Decrypt Later Threat\n00:22 - Shor’s Algorithm vs Prime Factorization\n00:50 - The Race for Post-Quantum Defense\n\n#QuantumComputing #CyberSecurity #TechNews #ArtificialIntelligence`
  );
  const [tags, setTags] = useState<string[]>(
    activeSeo?.tags || [
      'quantum computing',
      'cyber security',
      'rsa encryption',
      'q day',
      'quantum ai',
      'artificial intelligence',
      'tech news 2026',
    ]
  );
  const [newTagInput, setNewTagInput] = useState('');
  const [pinnedComment, setPinnedComment] = useState(
    activeSeo?.pinnedComment ||
      'Do you think banks will transition in time before Q-Day arrives? Let us know in the comments below! 👇'
  );
  const [playlistSuggestions, setPlaylistSuggestions] = useState<string[]>(
    activeSeo?.playlistSuggestions || ['Future of AI & Supercomputers', 'Cyber Warfare & Geopolitics']
  );

  const handleGenerateSeo = async () => {
    if (generating) return;
    setGenerating(true);

    const title = activeProject?.title || 'Quantum AI Breakdown';
    const niche = activeChannel?.niche || 'Tech';
    const scenes = activeScript?.scenes || [];

    const systemInstruction = `You are an expert YouTube algorithm SEO consultant.
Generate an optimized YouTube SEO package for a video titled: "${title}".
Niche: ${niche}.
Include:
1. 3 Click-worthy title variations (Under 60 chars, curiosity-driven)
2. Compelling description with structured Chapter timestamps based on the scenes
3. 8-12 high-intent search tags
4. 4 hashtags
5. Engagement-driving pinned comment draft
6. 2 relevant playlist topic categories

Output strictly JSON:
{
  "titleOptions": ["Title 1", "Title 2", "Title 3"],
  "description": "Full description text with chapters...",
  "tags": ["tag1", "tag2"],
  "hashtags": ["#Tag1", "#Tag2"],
  "pinnedComment": "Engaging question...",
  "playlistSuggestions": ["Playlist 1", "Playlist 2"]
}`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate YouTube SEO metadata package for: "${title}".
Scenes list: ${scenes.map((s) => `${s.sceneNumber}. ${s.heading}`).join(', ')}`,
          systemInstruction,
          model: 'gemini-3.8-flash',
          jsonOutput: true,
        }),
      });

      const data = await response.json();
      if (data.success && data.json) {
        const pkg = data.json;
        if (Array.isArray(pkg.titleOptions)) {
          setTitleOptions(pkg.titleOptions);
          setSelectedTitle(pkg.titleOptions[0]);
        }
        if (pkg.description) setDescription(pkg.description);
        if (Array.isArray(pkg.tags)) setTags(pkg.tags);
        if (pkg.pinnedComment) setPinnedComment(pkg.pinnedComment);
        if (Array.isArray(pkg.playlistSuggestions)) setPlaylistSuggestions(pkg.playlistSuggestions);

        recordAiUsage('gemini-3.8-flash', 'SEO Metadata Package Generation', data.usage?.estimatedTokens || 950);
        logActivity('SEO Package Generated', `Generated optimized metadata for "${title}"`, 'ai');
      }
    } catch (err: any) {
      console.error('Failed to generate SEO:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSaveSeo = async () => {
    if (!activeProject) return;
    const seoPackage: SeoData = {
      id: `seo_${activeProject.id}`,
      userId: 'creator-demo-1',
      projectId: activeProject.id,
      selectedTitle,
      titleOptions,
      description,
      tags,
      hashtags: ['#YouTubeAutomation', '#TechNews'],
      chapters: [
        { timestamp: '00:00', title: 'The Hook' },
        { timestamp: '00:30', title: 'Deep Dive' },
      ],
      pinnedComment,
      playlistSuggestions,
      updatedAt: new Date().toISOString(),
    };
    await saveSeo(seoPackage);
    updateProjectStage(activeProject.id, 'FINAL_REVIEW');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-400" />
            <span>SEO Studio & YouTube Metadata</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Algorithm-optimized title variations, auto-chaptered description, discoverability tags, and community pinned comments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerateSeo}
            disabled={generating}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-red-600 hover:from-indigo-500 hover:to-red-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'Generating SEO...' : 'Generate with Gemini 3.8'}</span>
          </button>

          <button
            onClick={handleSaveSeo}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Advance to Review</span>
          </button>
        </div>
      </div>

      {/* Compliance & Algorithmic Disclaimer */}
      <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          <strong>Platform Policy Disclosure:</strong> In strict compliance with guidelines, we do not promise guaranteed views, rankings, or fabricated search volumes. All metadata is calibrated to maximize genuine search relevance and click-through curiosity.
        </span>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Titles, Descriptions, Tags */}
        <div className="lg:col-span-8 space-y-4">
          {/* Title Variations Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Optimized Title Variations ({titleOptions.length})
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {selectedTitle.length}/100 chars
              </span>
            </div>

            <div className="space-y-2">
              {titleOptions.map((opt, i) => {
                const isSelected = selectedTitle === opt;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedTitle(opt)}
                    className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-red-600/15 border-red-500/50 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Video Description with Chapters */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Video Description & Auto Chapters
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {description.length}/5000 chars
              </span>
            </div>
            <textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
            />
          </div>

          {/* Search Tags */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Search Tags ({tags.length})</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {tags.join(', ').length}/500 chars
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-red-400 ml-1 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add new tag..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview Card & Community Pinned Comment */}
        <div className="lg:col-span-4 space-y-4">
          {/* YouTube Search Card Preview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500" />
              <span>YouTube Search Preview</span>
            </span>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 space-y-2">
              <div className="w-full aspect-video rounded-lg bg-slate-900 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1280&q=80"
                  alt="Search Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1 rounded font-mono">
                  10:20
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-white line-clamp-2 leading-snug">
                  {selectedTitle}
                </h4>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <span>{activeChannel?.name || 'Tech Chronicles'}</span>
                  <span>•</span>
                  <span>14K views</span>
                  <span>•</span>
                  <span>2 hours ago</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {description.slice(0, 110)}...
                </p>
              </div>
            </div>
          </div>

          {/* Pinned Comment Draft */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Engagement Pinned Comment</span>
            </label>
            <textarea
              rows={4}
              value={pinnedComment}
              onChange={(e) => setPinnedComment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="Question to stimulate algorithmic comments..."
            />
          </div>

          {/* Playlist Recommendations */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Recommended Playlists</span>
            </label>
            <div className="space-y-1.5">
              {playlistSuggestions.map((pl, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium"
                >
                  {pl}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
