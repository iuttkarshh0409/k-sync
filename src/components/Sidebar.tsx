import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  ChefHat,
  Layers,
  FileText,
  BarChart3,
  Store,
  Settings2,
  RotateCcw,
  Flame,
  Wind,
} from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

export type PageId =
  | 'overview'
  | 'order'
  | 'student-combo'
  | 'kitchen'
  | 'batches'
  | 'parser'
  | 'analytics'
  | 'branches'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { cart, stationQueues, branches, activeBranchId, setActiveBranchId, resetDemoData } = useKitchen();

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const activeTasksCount = stationQueues.steamer.active.length + stationQueues.wok.active.length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    {
      id: 'order',
      label: 'Order Food',
      icon: ShoppingBag,
      badge: cartCount > 0 ? `${cartCount}` : null,
      badgeTone: 'momo',
    },
    { id: 'student-combo', label: 'Student Combo', icon: Sparkles, badge: 'Combo', badgeTone: 'wok' },
    {
      id: 'kitchen',
      label: 'Kitchen KDS',
      icon: ChefHat,
      badge: activeTasksCount > 0 ? `${activeTasksCount} active` : null,
      badgeTone: 'active',
    },
    { id: 'batches', label: 'Orders & Batches', icon: Layers, badge: null },
    { id: 'parser', label: 'Text Parser', icon: FileText, badge: 'Natural Lang', badgeTone: 'neutral' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'branches', label: 'Branches', icon: Store, badge: null },
    { id: 'settings', label: 'Cost Settings', icon: Settings2, badge: null },
  ] as const;

  return (
    <aside className="w-64 shrink-0 bg-[#f4f1ea] border-r border-[#e8e4db] flex flex-col justify-between min-h-screen select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 pb-4 border-b border-[#e8e4db]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#201f1c] text-[#fbf9f5] flex items-center justify-center font-athelas text-xl font-bold shadow-sm">
              KS
            </div>
            <div>
              <h1 className="font-athelas text-xl font-bold tracking-tight text-[#201f1c] leading-none">
                KitchenSync
              </h1>
              <p className="text-[11px] font-medium text-[#79766e] tracking-wide uppercase mt-1">
                Dual Kitchen Ops
              </p>
            </div>
          </div>

          {/* Dual Brand Pills */}
          <div className="mt-4 flex items-center gap-1.5 p-1.5 bg-[#eae6dc] rounded-lg">
            <div className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-[#b85032] py-1 bg-white rounded shadow-2xs">
              <Wind className="w-3 h-3 text-[#d96d4c]" />
              <span>Momobuzz</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-[#375b3c] py-1 bg-white rounded shadow-2xs">
              <Flame className="w-3 h-3 text-[#527d58]" />
              <span>Woksum</span>
            </div>
          </div>

          {/* Branch Switcher */}
          <div className="mt-3">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8b877f] block mb-1">
              Active Branch
            </label>
            <select
              aria-label="Select Active Branch"
              value={activeBranchId}
              onChange={(e) => setActiveBranchId(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-[#ded8cb] text-[#2a2926] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#d96d4c] transition"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as PageId)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#201f1c] text-[#fbf9f5] shadow-xs'
                    : 'text-[#44423c] hover:bg-[#eae6dc] hover:text-[#181715]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-[#fbf9f5]'
                        : item.id === 'order'
                        ? 'text-[#d96d4c]'
                        : item.id === 'kitchen'
                        ? 'text-[#527d58]'
                        : 'text-[#6d6a62]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.badgeTone === 'momo'
                        ? 'bg-[#d96d4c] text-white'
                        : item.badgeTone === 'wok'
                        ? 'bg-[#527d58] text-white'
                        : item.badgeTone === 'active'
                        ? 'bg-[#e56f4d] text-white animate-pulse'
                        : 'bg-[#ded9cb] text-[#4d4b45]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#e8e4db] space-y-3">
        <div className="bg-[#edeae1] rounded-xl p-3 border border-[#ded9cb]">
          <div className="flex items-center justify-between text-[11px] text-[#6d6961]">
            <span className="font-medium">Stations Sync:</span>
            <span className="font-bold text-[#375b3c] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#527d58] animate-ping" />
              Active
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#7a766e] leading-snug">
            Steamer (10m) & Wok (3m) aligned to ≤2m target finish deviation.
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset demo data to initial state?')) {
              resetDemoData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#8b877f] hover:text-[#201f1c] hover:bg-[#eae6dc] rounded-lg transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </aside>
  );
};
