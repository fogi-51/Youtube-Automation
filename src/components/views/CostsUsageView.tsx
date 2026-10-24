import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  CreditCard,
  Zap,
  Info,
  Calendar,
} from 'lucide-react';

export const CostsUsageView: React.FC = () => {
  const { aiUsageLogs } = useApp();
  const [budgetLimit, setBudgetLimit] = useState(25.0);

  const totalCost = aiUsageLogs.reduce((acc, curr) => acc + curr.costEstimated, 0);
  const totalTokens = aiUsageLogs.reduce((acc, curr) => acc + curr.tokensEstimated, 0);

  const percentageUsed = Math.min(100, Math.round((totalCost / budgetLimit) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>AI Costs & Token Usage Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time accounting of token consumption, TTS synthesis overhead, and configurable monthly spend ceilings.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Monthly Budget Ceiling:</span>
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-white font-mono">
            <span>$</span>
            <input
              type="number"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(Number(e.target.value) || 10)}
              className="w-12 bg-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Spend Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-slate-400">Total Month Spend</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
            ${totalCost.toFixed(5)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Calculated per model token rate</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-slate-400">Estimated Tokens Processed</span>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            {totalTokens.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Scripts, Ideation & Multimodal Vision</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-slate-400">Budget Consumed</span>
          <div className="text-3xl font-extrabold text-indigo-400 mt-2 font-mono">
            {percentageUsed}%
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 mt-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500"
              style={{ width: `${Math.max(5, percentageUsed)}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Usage Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Token Execution Ledger ({aiUsageLogs.length})
          </h3>
          <span className="text-xs text-slate-400">Logged via server API telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Model</th>
                <th className="pb-3 font-semibold">Task Purpose</th>
                <th className="pb-3 font-semibold text-right">Tokens</th>
                <th className="pb-3 font-semibold text-right">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {aiUsageLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 font-bold text-indigo-400 font-mono text-[11px]">
                    {log.model}
                  </td>
                  <td className="py-2.5 font-sans text-slate-200">{log.task}</td>
                  <td className="py-2.5 text-right text-slate-300">
                    {log.tokensEstimated.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-bold text-emerald-400">
                    ${log.costEstimated.toFixed(5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
