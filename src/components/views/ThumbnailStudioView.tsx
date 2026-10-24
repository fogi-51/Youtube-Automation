import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ThumbnailData } from '../../types';
import {
  Palette,
  Upload,
  Sparkles,
  Download,
  CheckCircle2,
  Scan,
  AlertCircle,
  Eye,
  Type,
  Maximize2,
  RefreshCw,
  Zap,
} from 'lucide-react';

export const ThumbnailStudioView: React.FC = () => {
  const {
    activeProject,
    activeChannel,
    activeThumbnail,
    saveThumbnail,
    updateProjectStage,
    recordAiUsage,
    logActivity,
  } = useApp();

  const [titleText, setTitleText] = useState(activeThumbnail?.titleText || 'ALL PASSWORDS UNLOCKED');
  const [badgeText, setBadgeText] = useState(activeThumbnail?.badgeText || '2027 WARNING');
  const [accentColor, setAccentColor] = useState(activeThumbnail?.accentColor || '#ef4444');
  const [bgColor, setBgColor] = useState(activeThumbnail?.backgroundColor || '#0a0d17');
  const [bgImage, setBgImage] = useState(
    activeThumbnail?.imageUrl ||
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1280&q=80'
  );
  const [prompt, setPrompt] = useState(activeThumbnail?.prompt || '');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);

  // Multimodal AI Image Understanding state
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGeneratePrompt = async () => {
    if (generatingPrompt) return;
    setGeneratingPrompt(true);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a viral 16:9 YouTube thumbnail concept for video: "${activeProject?.title}".
Channel Niche: ${activeChannel?.niche}.
Brand Voice: ${activeChannel?.brandVoice}.`,
          systemInstruction: `You are an elite YouTube packaging designer with 10M+ views experience.
Generate:
1. High-CTR Bold 3-Word Thumbnail Headline
2. Urgent Badge text
3. Ultra-detailed Midjourney / Imagen visual prompt describing visual subject, extreme contrast lighting, and cinematic focal point.
Output format: JSON with fields "titleText", "badgeText", "visualPrompt".`,
          model: 'gemini-3.8-flash',
          jsonOutput: true,
        }),
      });

      const data = await response.json();
      if (data.success && data.json) {
        if (data.json.titleText) setTitleText(data.json.titleText);
        if (data.json.badgeText) setBadgeText(data.json.badgeText);
        if (data.json.visualPrompt) setPrompt(data.json.visualPrompt);
        recordAiUsage('gemini-3.8-flash', 'Thumbnail Concept Generation', data.usage?.estimatedTokens || 650);
      }
    } catch (err: any) {
      console.error('Failed to generate thumbnail concept:', err);
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Multimodal Image Analysis via server Gemini endpoint
  const handleAnalyzeThumbnail = async () => {
    if (analyzingImage || !bgImage) return;
    setAnalyzingImage(true);
    setImageAnalysisResult(null);

    try {
      const response = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: bgImage,
          mimeType: 'image/jpeg',
          prompt: `Analyze this YouTube thumbnail draft for: "${activeProject?.title}".
Overlaid Text: "${titleText}" | Badge: "${badgeText}".
Rate:
1. Mobile readability and contrast
2. Curiosity gap
3. Predicted CTR Grade
4. Top 3 recommendations for 2x more clicks`,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setImageAnalysisResult(data.analysis);
        recordAiUsage('gemini-3.8-flash', 'Multimodal Thumbnail Critique', 1100);
        logActivity('Multimodal Analysis', 'Analyzed thumbnail image with Gemini 3.8', 'ai');
      } else {
        throw new Error(data.error || 'Failed to analyze thumbnail');
      }
    } catch (err: any) {
      setImageAnalysisResult(`⚠️ Error analyzing thumbnail: ${err?.message}`);
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleSave = async () => {
    if (!activeProject) return;
    const thumbData: ThumbnailData = {
      id: `thumb_${activeProject.id}`,
      userId: 'creator-demo-1',
      projectId: activeProject.id,
      titleText,
      badgeText,
      backgroundColor: bgColor,
      accentColor,
      imageUrl: bgImage,
      prompt,
      updatedAt: new Date().toISOString(),
    };
    await saveThumbnail(thumbData);
    updateProjectStage(activeProject.id, 'SEO_METADATA');
  };

  const handleDownloadCanvas = () => {
    // Generate real 1280x720 PNG canvas export
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d')!;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1280, 720);
      // Dark gradient overlay for text readability
      const grad = ctx.createLinearGradient(0, 0, 1280, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0.85)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.4)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Draw Badge
      if (badgeText) {
        ctx.fillStyle = accentColor;
        ctx.fillRect(80, 140, 240, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(badgeText.toUpperCase(), 100, 175);
      }

      // Draw Headline Text
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 68px sans-serif';
      ctx.fillText(titleText.toUpperCase(), 80, 280);

      // Trigger download
      const link = document.createElement('a');
      link.download = `thumbnail_${activeProject?.id || 'export'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = bgImage;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <span>Thumbnail Studio & Multimodal Vision</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            16:9 CTR packaging canvas, AI visual concept ideation, and automated multimodal vision critique for YouTube packaging.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadCanvas}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 1280x720 PNG</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Advance to SEO</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: 16:9 Canvas on Left, Controls & Multimodal Review on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 16:9 Canvas Viewport */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-indigo-400" />
                <span>16:9 Canvas Live Preview</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">1280 x 720 (Standard YouTube)</span>
            </div>

            {/* Canvas Box */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-black select-none">
              {/* Background Art */}
              <img
                src={bgImage}
                alt="Thumbnail Background"
                className="w-full h-full object-cover"
              />

              {/* Gradient Scrim for Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none" />

              {/* Text Overlays */}
              <div className="absolute inset-0 p-8 flex flex-col justify-center items-start space-y-3 pointer-events-none">
                {badgeText && (
                  <span
                    className="px-3.5 py-1 rounded font-black text-xs uppercase tracking-widest text-white shadow-lg"
                    style={{ backgroundColor: accentColor }}
                  >
                    {badgeText}
                  </span>
                )}

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight max-w-sm drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-none">
                  {titleText}
                </h2>
              </div>
            </div>

            {/* Mobile scale miniature test */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-20 aspect-video rounded bg-black overflow-hidden border border-slate-700 shrink-0 relative">
                  <img src={bgImage} alt="mini" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 p-1 flex items-center">
                    <span className="text-[5px] font-black text-white uppercase leading-none truncate">
                      {titleText}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-300">Mobile Miniature Test</div>
                  <div className="text-[11px] text-slate-400">Preview text legibility on 100px mobile cards.</div>
                </div>
              </div>

              <label className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Art</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* AI Concept & Midjourney Prompt Generator */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Thumbnail Packaging Concept</span>
              </span>
              <button
                onClick={handleGeneratePrompt}
                disabled={generatingPrompt}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <span>{generatingPrompt ? 'Generating...' : 'Regenerate Concept'}</span>
              </button>
            </div>

            {prompt ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
                "{prompt}"
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Click "Regenerate Concept" to generate viral headline text and visual subject prompts with Gemini.
              </div>
            )}
          </div>
        </div>

        {/* Right: Typography Controls & Multimodal Image Understanding */}
        <div className="lg:col-span-5 space-y-4">
          {/* Typography Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Canvas Typography Controls</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Headline Text (Under 4 words)</label>
              <input
                type="text"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Callout</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Accent Badge Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Multimodal AI Vision Critique Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Scan className="w-4 h-4 text-emerald-400" />
                <span>Multimodal Image Understanding</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Gemini 3.8 Vision
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Runs deep computer vision analysis to evaluate mobile contrast, emotional curiosity gap, and click potential.
            </p>

            <button
              onClick={handleAnalyzeThumbnail}
              disabled={analyzingImage}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-md"
            >
              {analyzingImage ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Image Elements...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Run Multimodal Vision Critique</span>
                </>
              )}
            </button>

            {imageAnalysisResult && (
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed max-h-[220px] overflow-y-auto whitespace-pre-wrap font-sans">
                {imageAnalysisResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
