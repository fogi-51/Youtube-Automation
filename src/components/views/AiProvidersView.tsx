import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Shield,
  Layers,
  Clock,
} from 'lucide-react';

export const AiProvidersView: React.FC = () => {
  const { recordAiUsage, logActivity } = useApp();

  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { latencyMs: number; ok: boolean; msg: string }>>({});

  const providers = [
    {
      id: 'google-gemini',
      name: 'Google Gemini (Native Engine)',
      badge: 'Primary Provider',
      baseUrl: 'https://generativelanguage.googleapis.com',
      models: [
        { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash', desc: 'Balanced flagship model for scripts, vision & SEO' },
        { id: 'gemini-3.1-flash-lite', label: 'gemini-3.1-flash-lite', desc: 'Ultra-low latency model for instant hooks & tags' },
        { id: 'gemini-3.8-flash-lite-tts', label: 'gemini-3.8-flash-lite-tts', desc: 'High-throughput 24kHz audio synthesis' },
      ],
      status: 'active',
    },
    {
      id: 'openai-gateway',
      name: 'OmniRoute / OpenAI Gateway (Self-Hosted)',
      badge: 'Secondary Adapter',
      baseUrl: 'https://api.omniroute.internal/v1',
      models: [
        { id: 'gpt-4o-mini', label: 'gpt-4o-mini', desc: 'Compatible OpenAI chat endpoint' },
        { id: 'claude-3-5-sonnet', label: 'claude-3-5-sonnet', desc: 'Narrative expansion adapter' },
      ],
      status: 'standby',
    },
  ];

  const handleTestConnection = async (modelId: string) => {
    setTestingModel(modelId);
    try {
      const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId }),
      });

      const data = await response.json();
      if (data.success) {
        setTestResults((prev) => ({
          ...prev,
          [modelId]: {
            latencyMs: data.latencyMs,
            ok: true,
            msg: `PONG (${data.latencyMs}ms) - Model responsive`,
          },
        }));
        logActivity('AI Provider Ping', `Pinged ${modelId} successfully (${data.latencyMs}ms)`, 'ai');
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [modelId]: {
          latencyMs: 0,
          ok: false,
          msg: err?.message || 'Connection test failed',
        },
      }));
    } finally {
      setTestingModel(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>AI Provider Architecture</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Modular multi-model routing engine with real connection testing, capability checks, and failover fallbacks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
            Gemini SDK @google/genai v2.4.0
          </span>
        </div>
      </div>

      {/* Providers List */}
      <div className="space-y-6">
        {providers.map((prov) => (
          <div key={prov.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 font-bold text-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{prov.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {prov.badge}
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{prov.baseUrl}</div>
                </div>
              </div>

              <span
                className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold ${
                  prov.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {prov.status}
              </span>
            </div>

            {/* Models Table */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Configured Model Endpoints
              </span>

              <div className="space-y-2">
                {prov.models.map((mod) => {
                  const result = testResults[mod.id];
                  const isTesting = testingModel === mod.id;

                  return (
                    <div
                      key={mod.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold font-mono text-white text-xs">{mod.label}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{mod.desc}</div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {result && (
                          <div
                            className={`flex items-center gap-1.5 font-mono text-xs ${
                              result.ok ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {result.ok ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5" />
                            )}
                            <span>{result.msg}</span>
                          </div>
                        )}

                        <button
                          onClick={() => handleTestConnection(mod.id)}
                          disabled={isTesting}
                          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors font-medium"
                        >
                          <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-amber-400' : ''}`} />
                          <span>{isTesting ? 'Pinging...' : 'Test Ping'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
