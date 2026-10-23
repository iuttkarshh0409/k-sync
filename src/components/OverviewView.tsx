import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Wind,
  Flame,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ChefHat,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';
import { PageId } from './Sidebar';

export const OverviewView: React.FC<{ onNavigate: (page: PageId) => void }> = ({ onNavigate }) => {
  const { orders, stationQueues, analytics, activeBranchId, branches } = useKitchen();

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];
  const activeOrders = orders.filter((o) => o.status !== 'completed');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const totalRevenue = orders.reduce((sum, o) => sum + (o.item_revenue ? parseFloat(o.item_revenue) : 0), 0);
  const totalProfit = orders.reduce(
    (sum, o) => sum + (o.contribution_profit ? parseFloat(o.contribution_profit) : 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Hero Welcome & Operational Banner */}
      <div className="bg-gradient-to-r from-[#201f1c] via-[#2c2b27] to-[#3a3832] text-white rounded-3xl p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase text-amber-200 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Kitchen Operating System · {activeBranch.name}
          </div>
          <h1 className="font-athelas text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Momobuzz & Woksum Dual Orchestration
          </h1>
          <p className="text-[#d8d4cb] text-sm leading-relaxed">
            Coordinating bamboo steamer batches and high-flame wok cooking so multi-brand items arrive hot and finish together within our 2-minute synchronization target.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('order')}
              className="inline-flex items-center gap-2 bg-[#d96d4c] hover:bg-[#b85032] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Start Dual-Brand Order</span>
            </button>
            <button
              onClick={() => onNavigate('kitchen')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-sm transition"
            >
              <ChefHat className="w-4 h-4 text-emerald-400" />
              <span>Open Kitchen KDS</span>
            </button>
            <button
              onClick={() => onNavigate('student-combo')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-sm transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Student Combo Builder</span>
            </button>
          </div>
        </div>

        {/* Decorative background branding */}
        <div className="absolute right-6 -bottom-10 opacity-10 font-athelas text-9xl font-bold select-none pointer-events-none text-white">
          SYNC
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Orders */}
        <div className="bg-white rounded-2xl p-6 border border-[#ece8df] shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-xs text-[#79766e] font-medium">
            <span>Active Tickets</span>
            <span className="w-7 h-7 rounded-lg bg-[#fff8f5] text-[#d96d4c] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-athelas text-3xl font-bold text-[#201f1c]">
              {activeOrders.length}
            </span>
            <span className="text-xs text-[#79766e]">in preparation</span>
          </div>
          <div className="mt-2 text-xs text-[#527d58] flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{completedOrders.length} completed today</span>
          </div>
        </div>

        {/* Sync Success Rate */}
        <div className="bg-white rounded-2xl p-6 border border-[#ece8df] shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-xs text-[#79766e] font-medium">
            <span>Sync Target Rate (≤2m)</span>
            <span className="w-7 h-7 rounded-lg bg-[#f6faf5] text-[#527d58] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-athelas text-3xl font-bold text-[#527d58]">
              {analytics.sync_success_rate}%
            </span>
            <span className="text-xs text-[#79766e]">on-time target</span>
          </div>
          <div className="mt-2 text-xs text-[#79766e]">
            Avg finish offset: <b className="text-[#201f1c]">{analytics.average_finish_variance_minutes.steamer}m</b>
          </div>
        </div>

        {/* Average Prep Time */}
        <div className="bg-white rounded-2xl p-6 border border-[#ece8df] shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-xs text-[#79766e] font-medium">
            <span>Average Prep Time</span>
            <span className="w-7 h-7 rounded-lg bg-[#faf8f3] text-[#b85032] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-athelas text-3xl font-bold text-[#201f1c]">
              {analytics.average_completion_minutes || 11.2}
            </span>
            <span className="text-xs text-[#79766e]">minutes/order</span>
          </div>
          <div className="mt-2 text-xs text-[#79766e]">
            Steamer 10m · Wok 3m base
          </div>
        </div>

        {/* Daily Profit & Contribution */}
        <div className="bg-white rounded-2xl p-6 border border-[#ece8df] shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-xs text-[#79766e] font-medium">
            <span>Contribution Economics</span>
            <span className="w-7 h-7 rounded-lg bg-[#f5f8ff] text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-athelas text-3xl font-bold text-[#201f1c]">
              ₹{Math.round(totalProfit)}
            </span>
            <span className="text-xs text-[#79766e]">profit earned</span>
          </div>
          <div className="mt-2 text-xs text-[#79766e]">
            Total gross: <b className="text-[#201f1c]">₹{Math.round(totalRevenue)}</b>
          </div>
        </div>
      </div>

      {/* Live Station Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Momobuzz Steamer Station */}
        <div className="bg-white rounded-2xl p-6 border border-[#ece8df] shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#f1efe9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fff8f5] border border-[#f4d8ce] text-[#d96d4c] flex items-center justify-center">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-athelas text-lg font-bold text-[#201f1c]">
                  Momobuzz Steamer Station
                </h3>
                <p className="text-xs text-[#79766e]">
                  Steamed dumplings, crispy fried & momo baskets (10 min duration)
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

          <div className="mt-4 space-y-3">
            <div className="text-xs font-bold text-[#79766e] uppercase tracking-wider">
              Active In Steamer ({stationQueues.steamer.active.length})
            </div>
            {stationQueues.steamer.active.length === 0 ? (
              <div className="p-4 bg-[#fbf9f5] rounded-xl text-center text-xs text-[#8d8a81] border border-dashed border-[#e6e2d8]">
                Steamer baskets currently idle. Next dish starts on order.
              </div>
            ) : (
              stationQueues.steamer.active.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 bg-[#fff8f5] border border-[#f4d8ce] rounded-xl flex items-center justify-between"
                >
                  <div>
                    <span className="font-athelas font-bold text-sm text-[#201f1c] block">
                      {task.item_summary}
                    </span>
                    <span className="text-[11px] text-[#79766e]">
                      Ticket {task.order_id} · Steaming now
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#b85032] block">
                      Finish: {new Date(task.planned_finish).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-[#527d58] font-semibold">Active</span>
                  </div>
                </div>
              ))
            )}

            <div className="flex items-center justify-between pt-2 text-xs text-[#79766e]">
              <span>Queued tasks waiting: <b>{stationQueues.steamer.queued.length}</b></span>
              <button
                onClick={() => onNavigate('kitchen')}
                className="text-[#d96d4c] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>View Steamer KDS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Woksum Wok Station */}
        <div className="bg-white rounded-2xl p-6 border border-[#ece8df] shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#f1efe9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f6faf5] border border-[#d5e4d4] text-[#527d58] flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-athelas text-lg font-bold text-[#201f1c]">
                  Woksum Wok Station
                </h3>
                <p className="text-xs text-[#79766e]">
                  High-flame hakka noodles, fried rice & chilli paneer (3 min duration)
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

          <div className="mt-4 space-y-3">
            <div className="text-xs font-bold text-[#79766e] uppercase tracking-wider">
              Active In Wok ({stationQueues.wok.active.length})
            </div>
            {stationQueues.wok.active.length === 0 ? (
              <div className="p-4 bg-[#fbf9f5] rounded-xl text-center text-xs text-[#8d8a81] border border-dashed border-[#e6e2d8]">
                Wok is clean and preheated. Ready for quick stir-fry.
              </div>
            ) : (
              stationQueues.wok.active.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 bg-[#f6faf5] border border-[#d5e4d4] rounded-xl flex items-center justify-between"
                >
                  <div>
                    <span className="font-athelas font-bold text-sm text-[#201f1c] block">
                      {task.item_summary}
                    </span>
                    <span className="text-[11px] text-[#79766e]">
                      Ticket {task.order_id} · High flame stir-fry
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#375b3c] block">
                      Finish: {new Date(task.planned_finish).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-[#527d58] font-semibold">Active</span>
                  </div>
                </div>
              ))
            )}

            <div className="flex items-center justify-between pt-2 text-xs text-[#79766e]">
              <span>Queued tasks waiting: <b>{stationQueues.wok.queued.length}</b></span>
              <button
                onClick={() => onNavigate('kitchen')}
                className="text-[#527d58] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>View Wok KDS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-2xl border border-[#ece8df] p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#f1efe9]">
          <div>
            <h3 className="font-athelas text-lg font-bold text-[#201f1c]">
              Recent Multi-Brand Tickets
            </h3>
            <p className="text-xs text-[#79766e]">
              Synchronized timing across Momobuzz and Woksum items
            </p>
          </div>
          <button
            onClick={() => onNavigate('batches')}
            className="text-xs font-semibold text-[#201f1c] hover:underline flex items-center gap-1"
          >
            <span>All orders & batches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
          <table className="min-w-[650px] w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f1efe9] text-[#79766e] font-semibold">
                <th className="pb-3 font-semibold">TICKET ID</th>
                <th className="pb-3 font-semibold">ITEMS ORDERED</th>
                <th className="pb-3 font-semibold">EST. READY</th>
                <th className="pb-3 font-semibold">SYNC VARIANCE</th>
                <th className="pb-3 font-semibold">ECONOMICS</th>
                <th className="pb-3 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f7f5f0]">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-[#fbf9f5] transition">
                  <td className="py-3.5 font-mono font-bold text-[#201f1c]">
                    {order.id}
                  </td>
                  <td className="py-3.5">
                    <div className="font-medium text-[#201f1c]">
                      {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </div>
                    <div className="text-[11px] text-[#79766e]">
                      {new Date(order.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="py-3.5 font-medium text-[#201f1c]">
                    ~{Math.round(order.estimated_minutes)} min
                  </td>
                  <td className="py-3.5">
                    {order.sync_success ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Target met (≤2m)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                        <AlertCircle className="w-3 h-3" />
                        {order.sync_deviation}m offset
                      </span>
                    )}
                  </td>
                  <td className="py-3.5">
                    <span className="font-bold text-[#201f1c]">
                      ₹{order.item_revenue}
                    </span>
                    {order.contribution_profit && (
                      <span className="text-[11px] text-[#527d58] block">
                        +₹{order.contribution_profit} profit
                      </span>
                    )}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'cooking'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-[#ded9cb] text-[#4d4b45]'
                      }`}
                    >
                      {order.status}
                    </span>
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
