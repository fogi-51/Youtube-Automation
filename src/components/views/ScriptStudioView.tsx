import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScriptScene, ScriptData } from '../../types';
import {
  FileText,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Download,
  Clock,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Eye,
  Film,
  MessageSquare,
} from 'lucide-react';

export const ScriptStudioView: React.FC = () => {
  const {
    activeProject,
    activeChannel,
    activeScript,
    saveScript,
    updateProjectStage,
    recordAiUsage,
    logActivity,
  } = useApp();

  const [generating, setGenerating] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Initialize or fallback script data
  const currentScript: ScriptData = activeScript || {
    id: `script_${activeProject?.id || 'default'}`,
    userId: 'creator-demo-1',
    projectId: activeProject?.id || 'default',
    title: activeProject?.title || 'Untitled Project',
    hook: 'Have you ever wondered what happens behind closed doors?',
    format: activeProject?.format || '16:9',
    version: 1,
    approved: false,
    callToAction: 'Drop a like if you learned something new, and subscribe for weekly deep dives!',
    sourcesNotes: 'Verified against industry benchmarks and academic papers.',
    updatedAt: new Date().toISOString(),
    scenes: [
      {
        id: 'sc_init_1',
        sceneNumber: 1,
        heading: '00:00 - The Hook',
        narration: 'Every day, millions of people walk past this without noticing. But what they don’t realize is that inside, a revolution has already begun.',
        visualDirection: 'Fast-paced macro dolly shot into a sleek hardware server cluster with glowing amber diagnostics.',
        onScreenText: 'THE SILENT SHIFT',
        estimatedSeconds: 15,
      },
    ],
  };

  const totalEstimatedSeconds = currentScript.scenes.reduce(
    (acc, sc) => acc + (sc.estimatedSeconds || 20),
    0
  );

  const handleGenerateScript = async () => {
    if (generating) return;
    setGenerating(true);

    const projectTitle = activeProject?.title || 'Advanced AI Breakthroughs';
    const channelNiche = activeChannel?.niche || 'Tech';
    const brandVoice = activeChannel?.brandVoice || 'Engaging, fast-paced, insightful';
    const targetAudience = activeChannel?.targetAudience || 'Curious minds';

    const systemInstruction = `You are a master YouTube scriptwriter who crafts high-retention, faceless YouTube video scripts.
Follow retention psychology:
- Hook in first 3 seconds (create curiosity gap)
- Scene-by-scene progression with visual directions, b-roll cues, on-screen text, and narration
- Natural cadence for AI voiceover
- Strong Call to Action (CTA)

Format output strictly as JSON matching:
{
  "hook": "Compelling 3-second opening hook",
  "callToAction": "Strategic subscribe CTA",
  "sourcesNotes": "Key research sources or fact-checks",
  "scenes": [
    {
      "sceneNumber": 1,
      "heading": "00:00 - Hook / Cold Open",
      "narration": "Full narration spoken text...",
      "visualDirection": "Visual instruction for b-roll and graphics...",
      "onScreenText": "Short bold on-screen text",
      "estimatedSeconds": 20
    }
  ]
}`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Write a high-retention 4-scene video script for: "${projectTitle}".
Channel Niche: ${channelNiche}.
Brand Voice: ${brandVoice}.
Target Audience: ${targetAudience}.`,
          systemInstruction,
          model: 'gemini-3.8-flash',
          jsonOutput: true,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (data.success && data.json) {
        const generated = data.json;
        const newScenes: ScriptScene[] = Array.isArray(generated.scenes)
          ? generated.scenes.map((s: any, idx: number) => ({
              id: `sc_${Date.now()}_${idx}`,
              sceneNumber: idx + 1,
              heading: s.heading || `Scene ${idx + 1}`,
              narration: s.narration || '',
              visualDirection: s.visualDirection || '',
              onScreenText: s.onScreenText || '',
              estimatedSeconds: s.estimatedSeconds || 20,
            }))
          : currentScript.scenes;

        const updated: ScriptData = {
          ...currentScript,
          hook: generated.hook || currentScript.hook,
          callToAction: generated.callToAction || currentScript.callToAction,
          sourcesNotes: generated.sourcesNotes || currentScript.sourcesNotes,
          scenes: newScenes,
          version: currentScript.version + 1,
          approved: false, // Reset approval upon regeneration
          updatedAt: new Date().toISOString(),
        };

        await saveScript(updated);
        recordAiUsage('gemini-3.8-flash', 'Full Script Generation', data.usage?.estimatedTokens || 1400);
      }
    } catch (err: any) {
      console.error('Failed to generate script:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateScene = (index: number, fields: Partial<ScriptScene>) => {
    const nextScenes = [...currentScript.scenes];
    nextScenes[index] = { ...nextScenes[index], ...fields };
    saveScript({ ...currentScript, scenes: nextScenes });
  };

  const handleAddScene = () => {
    const newSceneNumber = currentScript.scenes.length + 1;
    const newScene: ScriptScene = {
      id: `sc_${Date.now()}`,
      sceneNumber: newSceneNumber,
      heading: `Scene ${newSceneNumber} - New Beat`,
      narration: 'Enter narration for this scene here...',
      visualDirection: 'Cinematic b-roll footage and motion graphics.',
      onScreenText: 'KEY TAKEAWAY',
      estimatedSeconds: 20,
    };
    saveScript({
      ...currentScript,
      scenes: [...currentScript.scenes, newScene],
    });
    setActiveSceneIndex(currentScript.scenes.length);
  };

  const handleDeleteScene = (index: number) => {
    if (currentScript.scenes.length <= 1) return;
    const nextScenes = currentScript.scenes.filter((_, i) => i !== index);
    saveScript({ ...currentScript, scenes: nextScenes });
    setActiveSceneIndex(Math.max(0, index - 1));
  };

  const handleToggleApproval = () => {
    const nextApproved = !currentScript.approved;
    saveScript({ ...currentScript, approved: nextApproved });
    if (nextApproved && activeProject) {
      updateProjectStage(activeProject.id, 'VOICEOVER');
      logActivity('Script Approved', `Human editorial approval granted for "${activeProject.title}"`, 'pipeline');
    }
  };

  const handleExportMarkdown = () => {
    let md = `# ${currentScript.title}\n\n`;
    md += `**Format**: ${currentScript.format} | **Version**: ${currentScript.version}\n\n`;
    md += `### Hook\n> ${currentScript.hook}\n\n`;
    md += `## Scene Breakdown\n\n`;

    currentScript.scenes.forEach((sc) => {
      md += `### Scene ${sc.sceneNumber}: ${sc.heading} (~${sc.estimatedSeconds}s)\n`;
      md += `**Visual Direction**: *${sc.visualDirection}*\n\n`;
      md += `**On-Screen Text**: \`${sc.onScreenText || 'N/A'}\`\n\n`;
      md += `**Narration**:\n${sc.narration}\n\n---\n\n`;
    });

    md += `### Call to Action\n${currentScript.callToAction}\n\n`;
    if (currentScript.sourcesNotes) {
      md += `### Sources & Fact Check Notes\n${currentScript.sourcesNotes}\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentScript.title.replace(/\s+/g, '_')}_script_v${currentScript.version}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeScene = currentScript.scenes[activeSceneIndex] || currentScript.scenes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Script Studio</span>
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              v{currentScript.version}
            </span>
            {currentScript.approved ? (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Editorial Approved</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Awaiting Human Approval
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Scene-by-scene video script editor with visual b-roll directions and synchronized voiceover text.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MD</span>
          </button>

          <button
            onClick={handleGenerateScript}
            disabled={generating}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-red-600 hover:from-indigo-500 hover:to-red-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'Drafting Script...' : 'Generate with Gemini 3.8'}</span>
          </button>

          <button
            onClick={handleToggleApproval}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
              currentScript.approved
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{currentScript.approved ? 'Approved (Advance)' : 'Approve Script'}</span>
          </button>
        </div>
      </div>

      {/* Script Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400">Total Scenes:</span>
          <div className="text-base font-bold text-white mt-0.5">{currentScript.scenes.length} Scenes</div>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400">Est. Duration:</span>
          <div className="text-base font-bold text-indigo-400 mt-0.5">
            {Math.floor(totalEstimatedSeconds / 60)}m {totalEstimatedSeconds % 60}s
          </div>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400">Word Count:</span>
          <div className="text-base font-bold text-white mt-0.5">
            {currentScript.scenes.reduce((acc, s) => acc + s.narration.split(/\s+/).length, 0)} words
          </div>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400">Tone & Pacing:</span>
          <div className="text-base font-bold text-emerald-400 mt-0.5 truncate">
            {activeChannel?.brandVoice || 'High Energy'}
          </div>
        </div>
      </div>

      {/* Opening Hook Banner */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs space-y-1.5">
        <div className="font-semibold text-amber-400 uppercase text-[10px] tracking-wider">
          Critical 3-Second Cold Open Hook
        </div>
        <textarea
          rows={2}
          value={currentScript.hook}
          onChange={(e) => saveScript({ ...currentScript, hook: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 italic"
          placeholder="Enter hook that stops the scroll..."
        />
      </div>

      {/* Main Studio Editor: Left Scene List, Right Detail Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scenes Timeline Navigator */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Scene Timeline ({currentScript.scenes.length})</span>
            <button
              onClick={handleAddScene}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Beat</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {currentScript.scenes.map((scene, idx) => {
              const isActive = activeSceneIndex === idx;
              return (
                <div
                  key={scene.id}
                  onClick={() => setActiveSceneIndex(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-900 border-indigo-500 shadow-lg text-white'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-indigo-400 font-mono">SCENE {scene.sceneNumber}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{scene.estimatedSeconds}s</span>
                    </span>
                  </div>
                  <div className="font-medium text-xs truncate">{scene.heading}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {scene.narration}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Focused Scene Editor */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 font-mono">
                EDITING SCENE {activeScene.sceneNumber}
              </span>
              <span className="text-slate-500">•</span>
              <input
                type="text"
                value={activeScene.heading}
                onChange={(e) => handleUpdateScene(activeSceneIndex, { heading: e.target.value })}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span>Duration:</span>
                <input
                  type="number"
                  value={activeScene.estimatedSeconds}
                  onChange={(e) =>
                    handleUpdateScene(activeSceneIndex, { estimatedSeconds: Number(e.target.value) || 20 })
                  }
                  className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center text-xs text-white"
                />
                <span>sec</span>
              </div>

              {currentScript.scenes.length > 1 && (
                <button
                  onClick={() => handleDeleteScene(activeSceneIndex)}
                  title="Delete Scene"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Voiceover Narration */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
              <span>Voiceover Spoken Narration (What the voice says)</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeScene.narration.split(/\s+/).filter(Boolean).length} words
              </span>
            </label>
            <textarea
              rows={4}
              value={activeScene.narration}
              onChange={(e) => handleUpdateScene(activeSceneIndex, { narration: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              placeholder="Write the narration transcript spoken by AI TTS or voice artist..."
            />
          </div>

          {/* Visual Directions & B-Roll Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Visual Directions & B-Roll Cues (What the viewer sees)
            </label>
            <textarea
              rows={3}
              value={activeScene.visualDirection}
              onChange={(e) => handleUpdateScene(activeSceneIndex, { visualDirection: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 italic"
              placeholder="Camera movement, graphic animations, b-roll stock query, glitch effects..."
            />
          </div>

          {/* On Screen Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              On-Screen Motion Graphic Typography (3-5 words max)
            </label>
            <input
              type="text"
              value={activeScene.onScreenText || ''}
              onChange={(e) => handleUpdateScene(activeSceneIndex, { onScreenText: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono uppercase"
              placeholder="e.g. 10X FASTER THAN HUMANS"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
