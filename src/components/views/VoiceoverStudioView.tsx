import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VoiceoverData } from '../../types';
import {
  Mic,
  Play,
  Pause,
  Download,
  Upload,
  Sparkles,
  RefreshCw,
  Volume2,
  CheckCircle2,
  Radio,
  Sliders,
  AudioLines,
} from 'lucide-react';

export const VoiceoverStudioView: React.FC = () => {
  const {
    activeProject,
    activeScript,
    activeVoiceover,
    saveVoiceover,
    updateProjectStage,
    recordAiUsage,
    logActivity,
  } = useApp();

  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [voiceStyle, setVoiceStyle] = useState('Clear, authoritative tech documentary narrator');
  const [generating, setGenerating] = useState(false);
  const [sceneAudioUrls, setSceneAudioUrls] = useState<Record<string, string>>({});
  const [playingSceneId, setPlayingSceneId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const scenes = activeScript?.scenes || [];

  const voiceOptions = [
    { id: 'Kore', label: 'Kore', gender: 'Female', tone: 'Calm, authoritative, pristine clarity' },
    { id: 'Puck', label: 'Puck', gender: 'Male', tone: 'Dynamic, curious, youthful energy' },
    { id: 'Charon', label: 'Charon', gender: 'Male', tone: 'Deep, resonant, dramatic documentary' },
    { id: 'Fenrir', label: 'Fenrir', gender: 'Male', tone: 'Bold, commanding, fast-paced' },
    { id: 'Zephyr', label: 'Zephyr', gender: 'Female', tone: 'Warm, engaging, conversational storyteller' },
  ];

  const handleGenerateSceneVoice = async (sceneId: string, narration: string) => {
    if (!narration.trim() || generating) return;
    setGenerating(true);

    try {
      const response = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: narration,
          voice: selectedVoice,
          style: voiceStyle,
        }),
      });

      const data = await response.json();
      if (data.success && data.audioUrl) {
        setSceneAudioUrls((prev) => ({
          ...prev,
          [sceneId]: data.audioUrl,
        }));
        recordAiUsage('gemini-3.8-flash-lite-tts', 'Scene TTS Synthesis', Math.ceil(narration.length / 4));
        logActivity('TTS Audio Generated', `Synthesized scene audio using voice ${selectedVoice}`, 'ai');
      } else {
        // Fallback: Web Speech synthesis audio or simulated wave
        handleBrowserTTSFallback(sceneId, narration);
      }
    } catch (err) {
      handleBrowserTTSFallback(sceneId, narration);
    } finally {
      setGenerating(false);
    }
  };

  const handleBrowserTTSFallback = (sceneId: string, narration: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(narration);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      setSceneAudioUrls((prev) => ({
        ...prev,
        [sceneId]: 'browser-speech-stream',
      }));
    }
  };

  const handlePlayAudio = (sceneId: string, url: string, narration: string) => {
    if (playingSceneId === sceneId) {
      if (audioElement) {
        audioElement.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingSceneId(null);
      return;
    }

    if (url === 'browser-speech-stream') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(narration);
        utterance.onend = () => setPlayingSceneId(null);
        window.speechSynthesis.speak(utterance);
        setPlayingSceneId(sceneId);
      }
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }
    const audio = new Audio(url);
    audio.onended = () => setPlayingSceneId(null);
    audio.play();
    setAudioElement(audio);
    setPlayingSceneId(sceneId);
  };

  const handleCompleteVoiceover = () => {
    if (!activeProject) return;
    saveVoiceover({
      id: `vo_${activeProject.id}`,
      userId: 'creator-demo-1',
      projectId: activeProject.id,
      voiceName: selectedVoice,
      language: 'English',
      status: 'completed',
      duration: activeScript?.scenes.reduce((acc, s) => acc + s.estimatedSeconds, 0) || 120,
      createdAt: new Date().toISOString(),
    });
    updateProjectStage(activeProject.id, 'VISUAL_ASSETS');
    logActivity('Voiceover Staged', `Voiceover package approved. Advancing to visual assets stage.`, 'pipeline');
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSceneAudioUrls((prev) => ({
        ...prev,
        [scenes[0]?.id || 'master']: url,
      }));
      logActivity('Custom Audio Uploaded', `Imported local audio file: ${file.name}`, 'pipeline');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-400" />
            <span>Voiceover Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Synthesize high-fidelity AI voiceovers scene-by-scene using Gemini 3.8 Flash Lite TTS or upload custom studio recordings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-700 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Audio</span>
            <input type="file" accept="audio/*" onChange={handleCustomAudioUpload} className="hidden" />
          </label>

          <button
            onClick={handleCompleteVoiceover}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Voiceover Stage</span>
          </button>
        </div>
      </div>

      {/* Voice Selection Cards */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AudioLines className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Voice Persona</h2>
          </div>
          <span className="text-xs font-mono text-emerald-400">Gemini 3.8 Flash-Lite TTS (24kHz Mono)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {voiceOptions.map((v) => {
            const isSelected = selectedVoice === v.id;
            return (
              <div
                key={v.id}
                onClick={() => setSelectedVoice(v.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold">{v.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    {v.gender}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-tight line-clamp-2">
                  {v.tone}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scene-by-Scene Audio Synthesis Queue */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Script Scenes Narration ({scenes.length})
          </h3>
          <span className="text-xs text-slate-400">Synchronized with Script Studio</span>
        </div>

        {scenes.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No scenes found in active script. Visit Script Studio to generate or write scenes first.
          </div>
        ) : (
          <div className="space-y-3">
            {scenes.map((scene) => {
              const audioUrl = sceneAudioUrls[scene.id];
              const isPlaying = playingSceneId === scene.id;

              return (
                <div
                  key={scene.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-mono mb-1">
                      <span className="font-bold text-indigo-400">SCENE {scene.sceneNumber}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 font-sans font-medium">{scene.heading}</span>
                    </div>
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                      "{scene.narration}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    {audioUrl ? (
                      <button
                        onClick={() => handlePlayAudio(scene.id, audioUrl, scene.narration)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                          isPlaying
                            ? 'bg-amber-600 text-white border-amber-500 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? 'Pause' : 'Preview Audio'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 mr-2">No audio</span>
                    )}

                    <button
                      onClick={() => handleGenerateSceneVoice(scene.id, scene.narration)}
                      disabled={generating}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{audioUrl ? 'Regenerate' : 'Generate TTS'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
