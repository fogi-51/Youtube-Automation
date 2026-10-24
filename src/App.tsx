/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { YouTubeCopilot } from './components/copilot/YouTubeCopilot';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { NewChannelModal } from './components/modals/NewChannelModal';

import { OverviewView } from './components/views/OverviewView';
import { ChannelsView } from './components/views/ChannelsView';
import { IdeasView } from './components/views/IdeasView';
import { CalendarView } from './components/views/CalendarView';
import { PipelineView } from './components/views/PipelineView';
import { ScriptStudioView } from './components/views/ScriptStudioView';
import { VoiceoverStudioView } from './components/views/VoiceoverStudioView';
import { VideoEditorView } from './components/views/VideoEditorView';
import { ThumbnailStudioView } from './components/views/ThumbnailStudioView';
import { SeoStudioView } from './components/views/SeoStudioView';
import { PublishingQueueView } from './components/views/PublishingQueueView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AiProvidersView } from './components/views/AiProvidersView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { CostsUsageView } from './components/views/CostsUsageView';
import { LogsJobsView } from './components/views/LogsJobsView';
import { SettingsView } from './components/views/SettingsView';

function AppContent() {
  const { activeNav } = useApp();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeNav) {
      case 'overview':
        return <OverviewView />;
      case 'channels':
        return <ChannelsView />;
      case 'ideas':
        return <IdeasView />;
      case 'calendar':
        return <CalendarView />;
      case 'pipeline':
        return <PipelineView />;
      case 'script':
        return <ScriptStudioView />;
      case 'voiceover':
        return <VoiceoverStudioView />;
      case 'editor':
        return <VideoEditorView />;
      case 'thumbnail':
        return <ThumbnailStudioView />;
      case 'seo':
        return <SeoStudioView />;
      case 'publishing':
        return <PublishingQueueView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'providers':
        return <AiProvidersView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'costs':
        return <CostsUsageView />;
      case 'logs':
        return <LogsJobsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-red-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navigation */}
        <Navbar
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onOpenNewChannel={() => setIsNewChannelOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-12">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Slide-out Gemini AI YouTube Copilot */}
      <YouTubeCopilot />

      {/* Creation Modals */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />
      <NewChannelModal
        isOpen={isNewChannelOpen}
        onClose={() => setIsNewChannelOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
