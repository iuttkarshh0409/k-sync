import React, { useState } from 'react';
import {
  Wind,
  Flame,
  CheckCircle2,
  Clock,
  Play,
  Layers,
  Sparkles,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';
import { Task } from '../utils/kitchenRules';

export const KitchenKDSView: React.FC = () => {
  const { stationQueues, startTask, completeTask, orders } = useKitchen();
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleStart = (task: Task) => {
    startTask(task.id);
    setActionNotice(`Started ${task.item_summary} on ${task.station === 'steamer' ? 'Steamer' : 'Wok'}!`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleComplete = (task: Task) => {
    completeTask(task.id);
    setActionNotice(`Completed ${task.item_summary}!`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const renderTaskCard = (task: Task, isSteamer: boolean) => {
    const parentOrder = orders.find((o) => o.id === task.order_id);
    const hasPairedTask = (parentOrder?.tasks.length || 0) > 1;

    return (
      <div
        key={task.id}
        className={`p-4 rounded-2xl border transition-all ${
          task.status === 'active'
            ? isSteamer
              ? 'bg-[#fff9f6] border-[#d96d4c] ring-2 ring-[#d96d4c]/15 shadow-sm'
              : 'bg-[#f8fbf7] border-[#527d58] ring-2 ring-[#527d58]/15 shadow-sm'
            : 'bg-[#fbf9f5] border-[#ece8df] hover:border-[#ded9ce]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-[#201f1c]">
                {task.order_id}
              </span>
              {task.batch_id && (
                <span className="text-[10px] font-bold bg-[#ded9cb] text-[#4d4b45] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5" />
                  {task.batch_id}
                </span>
              )}
              {parentOrder?.priority_note && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  ⚡ Fast Prep
                </span>
              )}
            </div>

            <h4 className="font-athelas text-base font-bold text-[#201f1c]">
              {task.item_summary}
            </h4>
          </div>

          <div className="text-right">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                task.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                  : 'bg-[#ded9cb] text-[#4d4b45]'
              }`}
            >
              {task.status}
            </span>
          </div>
        </div>

        {/* Planned timing & Synchronized tag */}
        <div className="mt-3 pt-3 border-t border-[#f0ece3] flex items-center justify-between text-xs text-[#79766e]">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {new Date(task.planned_start).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              –{' '}
              {new Date(task.planned_finish).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {hasPairedTask && (
            <span className="text-[10px] font-medium text-[#527d58] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Dual-brand sync</span>
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-3">
          {task.status === 'active' ? (
            <button
              onClick={() => handleComplete(task)}
              className="w-full py-2 bg-[#201f1c] hover:bg-[#383631] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>✓ Mark Completed</span>
            </button>
          ) : (
            <button
              onClick={() => handleStart(task)}
              className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border active:scale-95 ${
                isSteamer
                  ? 'bg-white hover:bg-[#fff5f0] text-[#b85032] border-[#f4d8ce]'
                  : 'bg-white hover:bg-[#f4faf3] text-[#375b3c] border-[#d5e4d4]'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>♨ Start Cooking</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Action Notice */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#201f1c] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* KDS Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#ece8df] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#f4f1ea] px-3 py-1 rounded-full text-xs font-bold text-[#6d6a62] mb-2 uppercase tracking-wider">
            <Timer className="w-3.5 h-3.5 text-[#d96d4c]" />
            <span>Live Kitchen Display System (KDS)</span>
          </div>
          <h2 className="font-athelas text-2xl font-bold text-[#201f1c]">
            Station Queues & Preparation Board
          </h2>
          <p className="text-xs text-[#79766e] mt-1">
            Real-time steamer and wok pipelines. Items are scheduled so both stations finish together.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-[#79766e] block">Total In Progress</span>
            <span className="font-athelas text-xl font-bold text-[#201f1c]">
              {stationQueues.steamer.active.length +
                stationQueues.wok.active.length +
                stationQueues.steamer.queued.length +
                stationQueues.wok.queued.length}{' '}
              dishes
            </span>
          </div>
        </div>
      </div>

      {/* Dual Station Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Column 1: Momobuzz Steamer Station */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece8df] shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#f1efe9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fff8f5] border border-[#f4d8ce] text-[#d96d4c] flex items-center justify-center">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-athelas text-lg font-bold text-[#201f1c]">
                  ♨ Momobuzz Steamer Station
                </h3>
                <p className="text-xs text-[#79766e]">
                  Steamed & Fried Momos · 10 min cooking interval
                </p>
              </div>
            </div>

            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                stationQueues.steamer.status === 'overloaded'
                  ? 'bg-rose-100 text-rose-700'
                  : stationQueues.steamer.active.length > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {stationQueues.steamer.status}
            </span>
          </div>

          {/* Steamer Active Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#79766e] uppercase tracking-wider">
              <span>ACTIVE STEAMING ({stationQueues.steamer.active.length})</span>
              <span className="text-[10px] text-[#b85032] font-semibold">1 basket capacity</span>
            </div>

            {stationQueues.steamer.active.length === 0 ? (
              <div className="p-6 bg-[#fbf9f5] rounded-2xl text-center text-xs text-[#8d8a81] border border-dashed border-[#e6e2d8]">
                No active steaming task. Pick next order below when ready.
              </div>
            ) : (
              stationQueues.steamer.active.map((t) => renderTaskCard(t, true))
            )}
          </div>

          {/* Steamer Queued Tasks */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-[#79766e] uppercase tracking-wider">
              QUEUED UP NEXT ({stationQueues.steamer.queued.length})
            </div>

            {stationQueues.steamer.queued.length === 0 ? (
              <div className="p-5 bg-[#fbf9f5] rounded-2xl text-center text-xs text-[#8d8a81]">
                Queue clear. Awaiting next momo order.
              </div>
            ) : (
              stationQueues.steamer.queued.map((t) => renderTaskCard(t, true))
            )}
          </div>
        </div>

        {/* Column 2: Woksum Wok Station */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece8df] shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#f1efe9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f6faf5] border border-[#d5e4d4] text-[#527d58] flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-athelas text-lg font-bold text-[#201f1c]">
                  火 Woksum Wok Station
                </h3>
                <p className="text-xs text-[#79766e]">
                  High-Flame Stir Fry · 3 min cooking interval
                </p>
              </div>
            </div>

            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                stationQueues.wok.status === 'overloaded'
                  ? 'bg-rose-100 text-rose-700'
                  : stationQueues.wok.active.length > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {stationQueues.wok.status}
            </span>
          </div>

          {/* Wok Active Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#79766e] uppercase tracking-wider">
              <span>ACTIVE IN WOK ({stationQueues.wok.active.length})</span>
              <span className="text-[10px] text-[#375b3c] font-semibold">High-flame wok</span>
            </div>

            {stationQueues.wok.active.length === 0 ? (
              <div className="p-6 bg-[#fbf9f5] rounded-2xl text-center text-xs text-[#8d8a81] border border-dashed border-[#e6e2d8]">
                Wok is prepped and hot. Ready for next stir-fry task.
              </div>
            ) : (
              stationQueues.wok.active.map((t) => renderTaskCard(t, false))
            )}
          </div>

          {/* Wok Queued Tasks */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-[#79766e] uppercase tracking-wider">
              QUEUED UP NEXT ({stationQueues.wok.queued.length})
            </div>

            {stationQueues.wok.queued.length === 0 ? (
              <div className="p-5 bg-[#fbf9f5] rounded-2xl text-center text-xs text-[#8d8a81]">
                Queue clear. Awaiting next wok order.
              </div>
            ) : (
              stationQueues.wok.queued.map((t) => renderTaskCard(t, false))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
