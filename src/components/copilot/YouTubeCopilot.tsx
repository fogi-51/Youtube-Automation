import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Lightbulb,
  Zap,
  TrendingUp,
  Flame,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export const YouTubeCopilot: React.FC = () => {
  const { isCopilotOpen, setIsCopilotOpen, activeProject, activeChannel, recordAiUsage } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'model',
      content: `👋 Hey creator! I'm your **YouTube Production Copilot**. I analyze retention curves, optimize hooks, script pacing, and thumbnail psychology.\n\nWorking on **"${activeProject?.title || 'your next viral video'}"** for **${activeChannel?.name || 'your channel'}**. How can we maximize viewer retention today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isCopilotOpen) {
      scrollToBottom();
    }
  }, [messages, isCopilotOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          channelContext: activeChannel
            ? {
                name: activeChannel.name,
                niche: activeChannel.niche,
                brandVoice: activeChannel.brandVoice,
                targetAudience: activeChannel.targetAudience,
                currentProject: activeProject?.title,
                stage: activeProject?.stage,
              }
            : null,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        recordAiUsage('gemini-3.8-flash', 'Copilot Chat Conversation', Math.ceil((text.length + data.reply.length) / 4));
      } else {
        throw new Error(data.error || 'Failed to get answer');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        content: `⚠️ Error communicating with Gemini Copilot: ${err?.message || 'Check your internet connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Generate 5 viral 3-second opening hooks',
    'How do we boost retention during scene 2?',
    'What thumbnail curiosity gap works best here?',
    'Suggest 3 high-search YouTube tags',
  ];

  if (!isCopilotOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col z-30 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shadow-inner">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-white flex items-center gap-1.5">
              <span>YouTube Copilot</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                Gemini 3.8
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Retention & Content Strategist</div>
          </div>
        </div>
        <button
          onClick={() => setIsCopilotOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                  isUser
                    ? 'bg-red-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {m.content}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs px-2 py-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Formulating strategic response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/30 space-y-1.5">
        <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1 px-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Quick Strategic Actions</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp)}
              disabled={loading}
              className="text-[10px] bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-300 px-2 py-1 rounded-md transition-colors text-left"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Copilot for hooks, pacing, ideas..."
          disabled={loading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
