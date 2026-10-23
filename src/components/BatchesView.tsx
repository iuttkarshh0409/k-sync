import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Wind,
  Flame,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';
import { BatchRecord } from '../services/kitchenStore';

export const BatchesView: React.FC = () => {
  const { orders, batches, createBatches } = useKitchen();
  const [toast, setToast] = useState<string | null>(null);

  const handleCombine = () => {
    const created = createBatches(3); // 3-minute window
    if (created.length > 0) {
      setToast(`Created ${created.length} new synchronized batch(es)! Preserved customer order identities.`);
    } else {
      setToast('No eligible identical dishes found in the 3-minute window to batch.');
    }
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#201f1c] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Header & Batch Optimization Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ece8df] shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#f4f1ea] px-3 py-1 rounded-full text-xs font-bold text-[#6d6a62] mb-3 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#527d58]" />
              <span>Cross-Order Batching Engine</span>
            </div>
            <h2 className="font-athelas text-2xl sm:text-3xl font-bold text-[#201f1c]">
              Combine Eligible Queued Orders
            </h2>
            <p className="mt-2 text-xs text-[#79766e] leading-relaxed">
              When multiple incoming orders share identical menu items within a 3-minute window, KitchenSync can combine prep into one batch (e.g. 4× Veg Momos in one steamer basket) while maintaining exact customer order relationships.
            </p>
          </div>

          <button
            onClick={handleCombine}
            className="px-6 py-3.5 bg-[#201f1c] hover:bg-[#383631] text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition shadow-sm active:scale-95 flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Optimize & Combine Batches</span>
          </button>
        </div>
      </div>

      {/* Batches in Progress */}
      {batches.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-athelas text-xl font-bold text-[#201f1c] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#d96d4c]" />
            <span>Created Multi-Order Batches ({batches.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.map((batch) => {
              const isSteamer = batch.station === 'steamer';
              return (
                <div
                  key={batch.id}
                  className="bg-white rounded-2xl p-5 border border-[#ece8df] shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold bg-[#ded9cb] text-[#2a2926] px-2.5 py-1 rounded-lg">
                      {batch.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSteamer ? 'bg-[#fff8f5] text-[#b85032]' : 'bg-[#f6faf5] text-[#375b3c]'
                      }`}
                    >
                      {batch.station}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-athelas text-lg font-bold text-[#201f1c]">
                      {batch.dish_name}
                    </h4>
                    <span className="text-xs font-semibold text-[#527d58]">
                      Total batch quantity: {batch.total_quantity} portions
                    </span>
                  </div>

                  <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#f0ece3] text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#79766e] block">
                      Source Orders Preserved:
                    </span>
                    {batch.orders.map((o, idx) => (
                      <div key={idx} className="flex justify-between font-mono text-[11px] text-[#201f1c]">
                        <span>Ticket: {o.order_id}</span>
                        <span>{o.quantity} portions</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-[#79766e]">
                    <span>Status: <b className="text-emerald-700 capitalize">{batch.status}</b></span>
                    <span>
                      {new Date(batch.planned_start).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Orders Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ece8df] shadow-2xs space-y-4">
        <div>
          <h3 className="font-athelas text-xl font-bold text-[#201f1c]">
            Complete Order Tickets Registry
          </h3>
          <p className="text-xs text-[#79766e] mt-1">
            Persisted order tickets with synchronization variance, revenue, and prep times.
          </p>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
          <table className="min-w-[650px] w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f1efe9] text-[#79766e] font-semibold">
                <th className="pb-3 font-semibold">ORDER ID</th>
                <th className="pb-3 font-semibold">DISHES & PORTIONS</th>
                <th className="pb-3 font-semibold">TIME PLACED</th>
                <th className="pb-3 font-semibold">EST. TIME</th>
                <th className="pb-3 font-semibold">SYNC VARIANCE</th>
                <th className="pb-3 font-semibold">REVENUE & PROFIT</th>
                <th className="pb-3 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f7f5f0]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#fbf9f5] transition">
                  <td className="py-4 font-mono font-bold text-[#201f1c]">
                    {order.id}
                  </td>
                  <td className="py-4">
                    <div className="font-semibold text-[#201f1c]">
                      {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </div>
                    {order.priority_note && (
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                        ⚡ {order.priority_note}
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-[#79766e] font-mono">
                    {new Date(order.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-4 text-[#201f1c] font-medium">
                    ~{Math.round(order.estimated_minutes)} min
                  </td>
                  <td className="py-4">
                    {order.sync_success ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Within 2m
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                        <AlertCircle className="w-3 h-3" />
                        {order.sync_deviation}m dev
                      </span>
                    )}
                  </td>
                  <td className="py-4">
                    <span className="font-bold text-[#201f1c] font-sans">
                      ₹{order.item_revenue}
                    </span>
                    {order.contribution_profit && (
                      <span className="text-[11px] text-[#527d58] block">
                        ₹{order.contribution_profit} profit
                      </span>
                    )}
                  </td>
                  <td className="py-4">
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
