import React, { useState } from 'react';
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

export const BranchesView: React.FC = () => {
  const { branches, orders, updateBranchStatus } = useKitchen();
  const [toast, setToast] = useState<string | null>(null);

  const getBranchMetrics = (branchId: string) => {
    const branchOrders = orders.filter((o) => o.branch_id === branchId);
    const revenue = branchOrders.reduce(
      (sum, o) => sum + (o.item_revenue ? parseFloat(o.item_revenue) : 0),
      0
    );
    const avgTicket = branchOrders.length ? Math.round(revenue / branchOrders.length) : 0;

    return {
      orderCount: branchOrders.length,
      revenue: Math.round(revenue),
      avgTicket,
    };
  };

  const handleStatusChange = (branchId: string, status: string) => {
    updateBranchStatus(branchId, status);
    setToast(`Updated ${branchId} status to: ${status}`);
    setTimeout(() => setToast(null), 3000);
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

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-8 border border-[#ece8df] shadow-2xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#f4f1ea] px-3 py-1 rounded-full text-xs font-bold text-[#6d6a62] mb-3 uppercase tracking-wider">
            <Store className="w-3.5 h-3.5 text-[#527d58]" />
            <span>Multi-Outlet Operating Review</span>
          </div>
          <h2 className="font-athelas text-3xl font-bold text-[#201f1c]">
            Branch Operations & Health Review
          </h2>
          <p className="mt-2 text-xs text-[#79766e] leading-relaxed">
            Comparing daily throughput, ticket sizes, and configured capacities between our central Indore flagship and regional Jabalpur outpost.
          </p>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {branches.map((branch) => {
          const metrics = getBranchMetrics(branch.id);
          const isJabalpur = branch.id === 'jabalpur';

          return (
            <div
              key={branch.id}
              className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-2xs flex flex-col justify-between space-y-6 ${
                isJabalpur ? 'border-amber-300 ring-2 ring-amber-400/10' : 'border-[#ece8df]'
              }`}
            >
              <div>
                {/* Branch Head */}
                <div className="flex items-start justify-between pb-4 border-b border-[#f1efe9]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#f4f1ea] border border-[#e2ddd1] flex items-center justify-center text-[#201f1c]">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-athelas text-2xl font-bold text-[#201f1c]">
                        {branch.name}
                      </h3>
                      <p className="text-xs text-[#79766e]">
                        {branch.city} · Configured Capacity: <b>{branch.capacity_per_day} orders/day</b>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      branch.review_status === 'Open'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {branch.review_status === 'Open' ? 'Open · High Volume' : 'Under Review'}
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-3 my-6">
                  <div className="p-4 bg-[#fbf9f5] rounded-2xl border border-[#ece8df] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#79766e] block">
                      Orders Placed
                    </span>
                    <span className="font-athelas text-2xl font-bold text-[#201f1c] block mt-1">
                      {metrics.orderCount}
                    </span>
                  </div>

                  <div className="p-4 bg-[#fbf9f5] rounded-2xl border border-[#ece8df] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#79766e] block">
                      Gross Revenue
                    </span>
                    <span className="font-athelas text-2xl font-bold text-[#201f1c] block mt-1">
                      ₹{metrics.revenue}
                    </span>
                  </div>

                  <div className="p-4 bg-[#fbf9f5] rounded-2xl border border-[#ece8df] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#79766e] block">
                      Average Ticket
                    </span>
                    <span className="font-athelas text-2xl font-bold text-[#201f1c] block mt-1">
                      ₹{metrics.avgTicket}
                    </span>
                  </div>
                </div>

                {/* Status Notice / Decision Guard */}
                {isJabalpur ? (
                  <div className="p-4 bg-[#fffaf0] border border-[#edd7aa] rounded-2xl space-y-2 text-xs text-[#7c5b1e]">
                    <div className="flex items-center gap-2 font-bold text-[#966314]">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Operator Decision Guard</span>
                    </div>
                    <p className="leading-relaxed">
                      Jabalpur remains open to fulfill existing patron orders. Management requires human executive review before any consolidation or shift adjustments are finalized.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-[#f6faf5] border border-[#d5e4d4] rounded-2xl text-xs text-[#375b3c] leading-relaxed">
                    Flagship dual-brand kitchen operating at strong unit contribution margins with active steamer and wok station pipelines.
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div className="pt-4 border-t border-[#f1efe9] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#79766e]">Operational Review Status:</span>
                <select
                  aria-label="Branch Operational Review Status"
                  value={branch.review_status}
                  onChange={(e) => handleStatusChange(branch.id, e.target.value)}
                  className="bg-[#f4f1ea] border border-[#ded8cc] text-[#201f1c] font-semibold rounded-xl px-3 py-1.5 outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="Review / Consolidation Decision Required">
                    Review / Consolidation Decision Required
                  </option>
                  <option value="Operational Maintenance">Operational Maintenance</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
