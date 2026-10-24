import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Youtube,
  Database,
  Film,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Key,
} from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const integrations = [
    {
      name: 'Google Gemini Generative AI',
      service: 'gemini-3.8-flash / gemini-3.1-flash-lite / tts',
      status: 'active',
      desc: 'Server-side AI intelligence powering ideation, full script generation, voiceover audio synthesis, and multimodal thumbnail review.',
      docs: 'https://ai.google.dev',
    },
    {
      name: 'Google Cloud Firestore & Firebase Auth',
      service: 'ai-studio-youtubeautomatio-2ec5d527-5554-4150-87fe-d9b810b545ae',
      status: 'active',
      desc: 'Persistent document database with Attribute-Based Access Control (ABAC) security rules and Google Sign-In user identification.',
      docs: 'https://firebase.google.com',
    },
    {
      name: 'YouTube Data API v3',
      service: 'Google Workspace OAuth 2.0 Client',
      status: 'connected',
      desc: 'Official direct channel publishing, video metadata synchronization, and scheduled upload dispatch.',
      docs: 'https://developers.google.com/youtube/v3',
    },
    {
      name: 'FFmpeg Media Assembly Compositor',
      service: 'Node.js / libx264 native worker pipeline',
      status: 'active',
      desc: 'Local high-performance media assembly engine for video clips, audio ducking, LUT color grading, and burning motion subtitle typography.',
      docs: 'https://ffmpeg.org',
    },
    {
      name: 'Three.js WebGL 3D Engine',
      service: 'Three.js r186 with PBR ACESFilmic Studio',
      status: 'active',
      desc: 'Procedural 3D Virtual Studio stage with composite multi-part camera rig, 24k gold award trophy, and 60fps damped camera loop.',
      docs: 'https://threejs.org',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Infrastructure & Integrations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live operational status of connected cloud services, rendering engines, and official API gateways.
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
          5 of 5 Core Services Online
        </span>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {integrations.map((item, i) => (
          <div key={i} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-sm text-white">{item.name}</h3>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="capitalize">{item.status}</span>
                </span>
              </div>

              <div className="text-[11px] font-mono text-indigo-400 mt-2 truncate">
                {item.service}
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Security: Encrypted at Rest</span>
              <a
                href={item.docs}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <span>Documentation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
