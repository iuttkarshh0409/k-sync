import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Wind,
  Flame,
  Info,
  Calendar,
} from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

export const AnalyticsView: React.FC = () => {
  const { analytics, orders } = useKitchen();

  const maxRush = Math.max(...analytics.rush_hours.map((r) => r.orders), 1);

  return (
    <div className="space-y-8">
      {/* Analytics Header */}
      <div className="bg-white rounded-3xl p-8 border border-[#ece8df] shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#f4f1ea] px-3 py-1 rounded-full text-xs font-bold text-[#6d6a62] mb-3 uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5 text-[#527d58]" />
              <span>Performance & Synchronization Metrics</span>
            </div>
            <h2 className="font-athelas text-3xl font-bold text-[#201f1c]">
              Kitchen Analytics & Station Variance
            </h2>
            <p className="mt-2 text-xs text-[#79766e] leading-relaxed">
              Evaluating synchronization reliability between bamboo steamer baskets and wok ranges, bottleneck queues, and peak rush hour throughput.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#fbf9f5] border border-[#e8e4db] px-4 py-2 rounded-2xl text-xs text-[#79766e]">
            <Calendar className="w-4 h-4 text-[#201f1c]" />
            <span>Today's Live Window</span>
          </div>
        </div>

        {/* Synthetic Demo Orders Notice */}
        <div className="mt-6 p-4 bg-[#f8f6f0] rounded-2xl border border-[#ded8cb] flex items-center gap-3 text-xs text-[#6d6a62]">
          <Info className="w-5 h-5 text-amber-700 shrink-0" />
          <span>
            <b>Audit Note:</b> {analytics.data_note}
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-[#ece8df] shadow-2xs">
          <div className="text-xs text-[#79766e] font-semibold uppercase tracking-wider">
            Total Tickets
          </div>
          <div className="mt-3 font-athelas text-3xl font-bold text-[#201f1c]">
            {analytics.total_orders}
          </div>
          <div className="mt-2 text-xs text-[#527d58] font-medium">
            {analytics.completed_orders} orders completed
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#ece8df] shadow-2xs">
          <div className="text-xs text-[#79766e] font-semibold uppercase tracking-wider">
            Sync Target Rate
          </div>
          <div className="mt-3 font-athelas text-3xl font-bold text-[#527d58]">
            {analytics.sync_success_rate}%
          </div>
          <div className="mt-2 text-xs text-[#79766e]">
            ≤2 min deviation target
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#ece8df] shadow-2xs">
          <div className="text-xs text-[#79766e] font-semibold uppercase tracking-wider">
            Avg Prep Duration
          </div>
          <div className="mt-3 font-athelas text-3xl font-bold text-[#201f1c]">
            {analytics.average_completion_minutes}
          </div>
          <div className="mt-2 text-xs text-[#79766e]">
            Minutes from ticket to finish
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#ece8df] shadow-2xs">
          <div className="text-xs text-[#79766e] font-semibold uppercase tracking-wider">
            Station Finish Offset
          </div>
          <div className="mt-3 font-athelas text-3xl font-bold text-[#b85032]">
            {analytics.average_finish_variance_minutes.steamer}m
          </div>
          <div className="mt-2 text-xs text-[#79766e]">
            Deviation between items
          </div>
        </div>
      </div>

      {/* Station Bottleneck & Variance Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bottleneck Duration */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ece8df] shadow-2xs space-y-6">
          <div>
            <h3 className="font-athelas text-xl font-bold text-[#201f1c]">
              Station Bottleneck Workload (Minutes)
            </h3>
            <p className="text-xs text-[#79766e] mt-1">
              Accumulated backlog based on currently queued cooking tasks.
            </p>
          </div>

          <div className="space-y-5">
            {/* Steamer bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#201f1c] mb-2">
                <span className="flex items-center gap-1.5 text-[#b85032]">
                  <Wind className="w-4 h-4 text-[#d96d4c]" />
                  <span>Momobuzz Steamer Backlog</span>
                </span>
                <span className="font-mono">{analytics.bottleneck_minutes.steamer} min</span>
              </div>
              <div className="w-full h-3 bg-[#fdf5f0] rounded-full overflow-hidden border border-[#f4d8ce]">
                <div
                  className="h-full bg-[#d96d4c] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(10, analytics.bottleneck_minutes.steamer * 4))}%`,
                  }}
                />
              </div>
            </div>

            {/* Wok bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#201f1c] mb-2">
                <span className="flex items-center gap-1.5 text-[#375b3c]">
                  <Flame className="w-4 h-4 text-[#527d58]" />
                  <span>Woksum Wok Backlog</span>
                </span>
                <span className="font-mono">{analytics.bottleneck_minutes.wok} min</span>
              </div>
              <div className="w-full h-3 bg-[#f4faf3] rounded-full overflow-hidden border border-[#d5e4d4]">
                <div
                  className="h-full bg-[#527d58] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(10, analytics.bottleneck_minutes.wok * 6))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Peak Rush Hour Distribution */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ece8df] shadow-2xs space-y-6">
          <div>
            <h3 className="font-athelas text-xl font-bold text-[#201f1c]">
              Hourly Order Volume & Prep Speed
            </h3>
            <p className="text-xs text-[#79766e] mt-1">
              Hourly volume trends during lunch and evening rush windows.
            </p>
          </div>

          <div className="space-y-4">
            {analytics.rush_hours.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8d8a81]">
                No completed rush hour intervals recorded yet today.
              </div>
            ) : (
              analytics.rush_hours.map((rush, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-3 bg-[#fbf9f5] rounded-xl border border-[#ece8df]">
                  <div className="font-mono font-bold text-[#201f1c]">
                    {rush.hour}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full h-2 bg-[#eae6dc] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#201f1c] rounded-full"
                        style={{ width: `${(rush.orders / maxRush) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#201f1c]">{rush.orders} tickets</span>
                    <span className="text-[10px] text-[#79766e] block">
                      ~{rush.average_completion_minutes}m avg
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
