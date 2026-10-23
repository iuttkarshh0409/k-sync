import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Wind,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';
import { scheduleOrder, calculateProfitability } from '../utils/kitchenRules';

export const StudentComboView: React.FC<{ onComboAdded: () => void }> = ({ onComboAdded }) => {
  const { menu, addToCart, placeOrder, config } = useKitchen();

  const momoOptions = menu.filter((i) => i.brand === 'Momobuzz');
  const wokOptions = menu.filter((i) => i.brand === 'Woksum');

  const [selectedMomoId, setSelectedMomoId] = useState<string>(momoOptions[0]?.id || 'veg-momo');
  const [selectedWokId, setSelectedWokId] = useState<string>(wokOptions[0]?.id || 'hakka-noodles');
  const [toast, setToast] = useState<string | null>(null);

  const selectedMomo = menu.find((i) => i.id === selectedMomoId) || momoOptions[0];
  const selectedWok = menu.find((i) => i.id === selectedWokId) || wokOptions[0];

  const comboItems = useMemo(() => {
    return [
      { ...selectedMomo, quantity: 1 },
      { ...selectedWok, quantity: 1 },
    ];
  }, [selectedMomo, selectedWok]);

  const schedule = useMemo(() => {
    return scheduleOrder(
      comboItems.map((i) => ({
        menu_item_id: i.id,
        name: i.name,
        station: i.station,
        quantity: i.quantity,
        duration_minutes: i.duration_minutes,
      }))
    );
  }, [comboItems]);

  const profitability = useMemo(() => {
    return calculateProfitability(
      comboItems.map((i) => ({
        id: i.id,
        name: i.name,
        brand: i.brand,
        price: i.price,
        quantity: i.quantity,
        ingredient_cost_per_unit: i.ingredient_cost_per_unit,
      })),
      config
    );
  }, [comboItems, config]);

  const handleAddBothToCart = () => {
    addToCart(selectedMomo.id, 1);
    addToCart(selectedWok.id, 1);
    setToast('Student Combo added to cart!');
    setTimeout(() => setToast(null), 3000);
    onComboAdded();
  };

  const handleDispatchDirectly = () => {
    const order = placeOrder({
      items: [
        { menu_item_id: selectedMomo.id, quantity: 1 },
        { menu_item_id: selectedWok.id, quantity: 1 },
      ],
      priority_note: 'Student Combo · Fast',
    });
    setToast(`Student Combo ticket ${order.id} sent directly to stations!`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#201f1c] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-8 border border-[#ece8df] shadow-2xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#fdf5ed] text-[#b85032] border border-[#f5dfd3] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dual-Brand Value Pairing</span>
          </div>
          <h2 className="font-athelas text-3xl font-bold text-[#201f1c]">
            Student Combo Builder
          </h2>
          <p className="mt-2 text-xs text-[#79766e] leading-relaxed">
            Students and busy patrons frequently order momos alongside hot noodles or wok rice. This builder synchronizes steamer cooking and wok firing with standard pricing rules and zero unconfigured margin erosion.
          </p>
        </div>
      </div>

      {/* Step Grid: Momobuzz Choice + Woksum Choice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Pick Momobuzz Dish */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece8df] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1efe9]">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-[#fff8f5] text-[#d96d4c] font-bold flex items-center justify-center text-xs border border-[#f4d8ce]">
                1
              </span>
              <h3 className="font-athelas text-lg font-bold text-[#201f1c]">
                Select Momobuzz Steamer Dish
              </h3>
            </div>
            <span className="text-[11px] font-bold text-[#b85032] bg-[#fff8f5] px-2 py-0.5 rounded-md">
              10 Min Duration
            </span>
          </div>

          <div className="space-y-3">
            {momoOptions.map((item) => {
              const isSelected = selectedMomoId === item.id;
              return (
                <label
                  key={item.id}
                  onClick={() => setSelectedMomoId(item.id)}
                  className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-[#fff9f6] border-[#d96d4c] ring-2 ring-[#d96d4c]/15 shadow-2xs'
                      : 'bg-[#fbf9f5] border-[#f0ece3] hover:border-[#ded9cb]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="momo-selection"
                      checked={isSelected}
                      onChange={() => setSelectedMomoId(item.id)}
                      className="mt-1 text-[#d96d4c] focus:ring-[#d96d4c]"
                    />
                    <div>
                      <span className="font-athelas font-bold text-sm text-[#201f1c] block">
                        {item.name}
                      </span>
                      <p className="text-xs text-[#79766e] mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <span className="font-sans font-bold text-sm text-[#201f1c] ml-3">
                    ₹{item.price}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Step 2: Pick Woksum Dish */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece8df] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1efe9]">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-[#f6faf5] text-[#527d58] font-bold flex items-center justify-center text-xs border border-[#d5e4d4]">
                2
              </span>
              <h3 className="font-athelas text-lg font-bold text-[#201f1c]">
                Select Woksum Wok Dish
              </h3>
            </div>
            <span className="text-[11px] font-bold text-[#375b3c] bg-[#f6faf5] px-2 py-0.5 rounded-md">
              3 Min Duration
            </span>
          </div>

          <div className="space-y-3">
            {wokOptions.map((item) => {
              const isSelected = selectedWokId === item.id;
              return (
                <label
                  key={item.id}
                  onClick={() => setSelectedWokId(item.id)}
                  className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-[#f8fbf7] border-[#527d58] ring-2 ring-[#527d58]/15 shadow-2xs'
                      : 'bg-[#fbf9f5] border-[#f0ece3] hover:border-[#ded9cb]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="wok-selection"
                      checked={isSelected}
                      onChange={() => setSelectedWokId(item.id)}
                      className="mt-1 text-[#527d58] focus:ring-[#527d58]"
                    />
                    <div>
                      <span className="font-athelas font-bold text-sm text-[#201f1c] block">
                        {item.name}
                      </span>
                      <p className="text-xs text-[#79766e] mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <span className="font-sans font-bold text-sm text-[#201f1c] ml-3">
                    ₹{item.price}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time Combination Preview: Synchronized Stagger & Economics */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ece8df] shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Schedule Visualization */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-athelas text-xl font-bold text-[#201f1c]">
                Station Synchronization Timeline
              </h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#527d58] bg-[#edf5ee] px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simultaneous Finish (≤2m Target)</span>
              </span>
            </div>

            <div className="p-5 bg-[#fbf9f5] rounded-2xl border border-[#ece8df] space-y-3">
              {/* Steamer task row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-[#d96d4c]" />
                  <span className="font-bold text-[#201f1c]">{selectedMomo.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#79766e]">Starts at T+0m</span>
                  <span className="px-2 py-0.5 bg-[#fff8f5] text-[#b85032] border border-[#f4d8ce] rounded text-[10px] font-bold">
                    10 min steam
                  </span>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full h-3 bg-[#e8e4da] rounded-full overflow-hidden flex">
                <div className="h-full bg-[#d96d4c] w-full rounded-full" />
              </div>

              {/* Wok task row */}
              <div className="flex items-center justify-between text-xs pt-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#527d58]" />
                  <span className="font-bold text-[#201f1c]">{selectedWok.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#527d58] font-bold">Starts at T+7m (Staggered)</span>
                  <span className="px-2 py-0.5 bg-[#f6faf5] text-[#375b3c] border border-[#d5e4d4] rounded text-[10px] font-bold">
                    3 min wok
                  </span>
                </div>
              </div>

              {/* Wok bar visual (delayed start) */}
              <div className="w-full h-3 bg-[#e8e4da] rounded-full overflow-hidden flex">
                <div className="h-full bg-transparent w-[70%]" />
                <div className="h-full bg-[#527d58] w-[30%] rounded-full" />
              </div>

              <div className="pt-2 text-[11px] text-[#79766e] flex items-center justify-between border-t border-[#f0ece3]">
                <span>T+0 (Steamer starts)</span>
                <span className="font-bold text-[#527d58]">T+10 (Both Finish Simultaneously) ✓</span>
              </div>
            </div>
          </div>

          {/* Right: Pricing & Economics */}
          <div className="lg:col-span-5 p-6 bg-[#f8f6f0] rounded-2xl border border-[#ded8cb] space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#79766e]">
                Combo Total
              </span>
              <span className="font-sans text-3xl font-bold text-[#201f1c]">
                ₹{selectedMomo.price + selectedWok.price}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-[#6d6961] pb-3 border-b border-[#e2ddd1]">
              <div className="flex justify-between">
                <span>{selectedMomo.name}:</span>
                <b className="text-[#201f1c]">₹{selectedMomo.price}</b>
              </div>
              <div className="flex justify-between">
                <span>{selectedWok.name}:</span>
                <b className="text-[#201f1c]">₹{selectedWok.price}</b>
              </div>
              <div className="flex justify-between text-[#527d58]">
                <span>Contribution Margin:</span>
                <b>{profitability?.contribution_margin_percent || '--'}%</b>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleAddBothToCart}
                className="w-full py-3 bg-[#201f1c] hover:bg-[#383631] text-white rounded-xl text-xs font-bold tracking-wide uppercase transition active:scale-95 shadow-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Combo to Order Cart</span>
              </button>

              <button
                onClick={handleDispatchDirectly}
                className="w-full py-2.5 bg-white hover:bg-[#f2efe8] text-[#201f1c] border border-[#ded8cb] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Dispatch Direct Ticket to Kitchen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
