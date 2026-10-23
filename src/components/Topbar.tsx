import React, { useState, useEffect } from 'react';
import { Wind, Flame, Plus, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';
import { PageId } from './Sidebar';

interface TopbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ currentPage, onNavigate }) => {
  const { stationQueues, branches, activeBranchId } = useKitchen();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  const pageTitles: Record<PageId, { title: string; subtitle: string }> = {
    overview: {
      title: 'Operations Dashboard',
      subtitle: 'Real-time kitchen overview, station workloads & branch performance',
    },
    order: {
      title: 'Dual-Brand Order Food',
      subtitle: 'Unified ordering across Momobuzz and Woksum with real-time station sync',
    },
    'student-combo': {
      title: 'Student Cross-Brand Combo Builder',
      subtitle: 'Synchronized momo + wok bundle pairing with contribution margin checks',
    },
    kitchen: {
      title: 'Kitchen Display System (KDS)',
      subtitle: 'Dedicated steamer and wok station queues with synchronized ticket timing',
    },
    batches: {
      title: 'Orders & Cross-Order Batches',
      subtitle: 'Smart batching of identical dishes within 3-minute arrival windows',
    },
    parser: {
      title: 'Natural Language Order Parser',
      subtitle: 'Quick order intake parsing dishes, quantities, aliases, and rush flags',
    },
    analytics: {
      title: 'Kitchen Analytics & Unit Economics',
      subtitle: 'Station bottleneck minutes, finish variance, and peak rush hour trends',
    },
    branches: {
      title: 'Branch Management & Consolidation Review',
      subtitle: 'Unit operational metrics, daily capacity, and review decisions',
    },
    settings: {
      title: 'Cost Policies & Menu Pricing',
      subtitle: 'Configure platform commissions, delivery costs, and Momobuzz ₹69 floor rule',
    },
  };

  const currentMeta = pageTitles[currentPage] || pageTitles.overview;

  return (
    <header className="h-20 bg-[#fbf9f5] border-b border-[#ece8df] px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#79766e]">
          <span>KitchenSync</span>
          <span>/</span>
          <span className="font-semibold text-[#201f1c] capitalize">
            {currentPage.replace('-', ' ')}
          </span>
        </div>
        <h2 className="font-athelas text-xl font-bold text-[#201f1c] tracking-tight">
          {currentMeta.title}
        </h2>
      </div>

      {/* Right status modules */}
      <div className="flex items-center gap-4">
        {/* Steamer station badge */}
        <div className="flex items-center gap-2 bg-[#fff8f5] border border-[#f4d8ce] rounded-xl px-3 py-1.5 shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-[#d96d4c] text-white flex items-center justify-center">
            <Wind className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold text-[#b85032] flex items-center gap-1">
              <span>Steamer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d96d4c]" />
            </div>
            <div className="text-xs font-semibold text-[#201f1c]">
              {stationQueues.steamer.active.length} active · {stationQueues.steamer.queued.length} queued
            </div>
          </div>
        </div>

        {/* Wok station badge */}
        <div className="flex items-center gap-2 bg-[#f6faf5] border border-[#d5e4d4] rounded-xl px-3 py-1.5 shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-[#527d58] text-white flex items-center justify-center">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold text-[#375b3c] flex items-center gap-1">
              <span>Wok Station</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#527d58]" />
            </div>
            <div className="text-xs font-semibold text-[#201f1c]">
              {stationQueues.wok.active.length} active · {stationQueues.wok.queued.length} queued
            </div>
          </div>
        </div>

        {/* Live sync target tag */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#f4f1ea] border border-[#e2ddd1] px-3 py-2 rounded-xl text-xs font-medium text-[#4d4b45]">
          <ShieldCheck className="w-4 h-4 text-[#527d58]" />
          <span>2m Sync Target</span>
        </div>

        {/* Time and branch */}
        <div className="text-right pl-2 border-l border-[#ece8df]">
          <div className="text-xs font-bold font-mono text-[#201f1c]">{currentTime}</div>
          <div className="text-[11px] text-[#79766e] font-medium">{activeBranch.name}</div>
        </div>

        {/* Quick new order button */}
        {currentPage !== 'order' && (
          <button
            onClick={() => onNavigate('order')}
            className="flex items-center gap-2 bg-[#201f1c] hover:bg-[#33312c] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Order</span>
          </button>
        )}
      </div>
    </header>
  );
};
