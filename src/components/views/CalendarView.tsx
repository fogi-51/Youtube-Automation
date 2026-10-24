import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Film,
  CheckCircle2,
  Send,
  Lightbulb,
  Youtube,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { projects, publishingJobs, ideas, activeChannel, setSelectedProjectId, setActiveNav } = useApp();

  const [currentMonth, setCurrentMonth] = useState('October 2026');

  // Days of month simulation
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            <span>Content Publishing Calendar</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Schedule deadlines, coordinate video uploads, and maintain consistent channel publishing cadence for{' '}
            <strong className="text-white">{activeChannel?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white">
            <button className="text-slate-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold">{currentMonth}</span>
            <button className="text-slate-400 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setActiveNav('publishing')}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Release</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day) => {
            // Assign some demo schedule events
            const isToday = day === 24;
            const hasUpload = day === 26 || day === 12;
            const hasDeadline = day === 25;
            const hasIdea = day === 28;

            return (
              <div
                key={day}
                className={`min-h-[110px] p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                  isToday
                    ? 'bg-slate-800/80 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-mono font-bold ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs'
                        : 'text-slate-400'
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && <span className="text-[9px] text-indigo-400 font-bold uppercase">Today</span>}
                </div>

                {/* Calendar Events Pills */}
                <div className="space-y-1 my-1">
                  {hasUpload && (
                    <div
                      onClick={() => setActiveNav('publishing')}
                      className="p-1.5 rounded-lg bg-red-600/20 border border-red-500/40 text-[10px] font-semibold text-red-300 truncate cursor-pointer hover:bg-red-600/30 flex items-center gap-1"
                    >
                      <Youtube className="w-2.5 h-2.5 text-red-400" />
                      <span>Release: Quantum AI</span>
                    </div>
                  )}
                  {hasDeadline && (
                    <div
                      onClick={() => setActiveNav('script')}
                      className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] font-medium text-amber-300 truncate cursor-pointer hover:bg-amber-500/25 flex items-center gap-1"
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>QC Approval Gate</span>
                    </div>
                  )}
                  {hasIdea && (
                    <div
                      onClick={() => setActiveNav('ideas')}
                      className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-medium text-indigo-300 truncate cursor-pointer hover:bg-indigo-500/25 flex items-center gap-1"
                    >
                      <Lightbulb className="w-2.5 h-2.5" />
                      <span>Dark Factories</span>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 text-right">
                  {hasUpload ? '1 Release' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
