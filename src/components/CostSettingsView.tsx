import React, { useState } from 'react';
import {
  Settings2,
  CheckCircle2,
  AlertCircle,
  Save,
  Wind,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';
import { MOMO_PRICE_FLOOR } from '../utils/kitchenRules';

export const CostSettingsView: React.FC = () => {
  const { config, updateConfig, menu, updateMenuItem } = useKitchen();

  const [formConfig, setFormConfig] = useState(config);
  const [menuValues, setMenuValues] = useState<
    Record<string, { price: number; cost: number | '' }>
  >(() => {
    const init: Record<string, { price: number; cost: number | '' }> = {};
    menu.forEach((m) => {
      init[m.id] = {
        price: m.price,
        cost: m.ingredient_cost_per_unit ?? '',
      };
    });
    return init;
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formConfig);
    setToast({ type: 'success', message: 'Kitchen profitability policy saved successfully!' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveMenuItem = (item: (typeof menu)[0]) => {
    const current = menuValues[item.id];
    const newPrice = Number(current.price);

    // Momobuzz ₹69.00 floor enforcement rule
    if (item.brand === 'Momobuzz' && newPrice < MOMO_PRICE_FLOOR) {
      setToast({
        type: 'error',
        message: `Policy Rejection: Momobuzz price ₹${newPrice.toFixed(2)} is below the minimum mandatory ₹69.00 floor!`,
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    if (newPrice <= 0) {
      setToast({ type: 'error', message: 'Price must be greater than ₹0.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    updateMenuItem(item.id, {
      price: newPrice,
      ingredient_cost_per_unit: current.cost === '' ? null : Number(current.cost),
    });

    setToast({
      type: 'success',
      message: `Updated ${item.name}: Selling Price ₹${newPrice}, Ingredient Cost ₹${current.cost || '--'}.`,
    });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border animate-bounce ${
            toast.type === 'success'
              ? 'bg-[#201f1c] border-emerald-500/30'
              : 'bg-rose-950 border-rose-500/50'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-[#ece8df] shadow-2xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#f4f1ea] px-3 py-1 rounded-full text-xs font-bold text-[#6d6a62] mb-3 uppercase tracking-wider">
            <Settings2 className="w-3.5 h-3.5 text-[#d96d4c]" />
            <span>Economic Configuration & Policy Guard</span>
          </div>
          <h2 className="font-athelas text-3xl font-bold text-[#201f1c]">
            Profitability Policy & Menu Costs
          </h2>
          <p className="mt-2 text-xs text-[#79766e] leading-relaxed">
            Configure order-level cost allocations, aggregator platform fees, and minimum price floors. Momobuzz dishes enforce a strict ₹69.00 baseline floor to prevent margin collapse.
          </p>
        </div>
      </div>

      {/* Global Policy Parameters Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ece8df] shadow-2xs space-y-6">
        <div>
          <h3 className="font-athelas text-xl font-bold text-[#201f1c]">
            Order-Level Cost Assumptions
          </h3>
          <p className="text-xs text-[#79766e] mt-1">
            These variables govern live contribution profit calculations for all incoming tickets.
          </p>
        </div>

        <form onSubmit={handleSavePolicy} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#44423c] mb-1">
              Platform Commission %
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="50"
              value={formConfig.platform_commission_percent}
              onChange={(e) =>
                setFormConfig({ ...formConfig, platform_commission_percent: parseFloat(e.target.value) || 0 })
              }
              className="w-full text-sm font-semibold p-3 bg-[#fbf9f5] border border-[#ded8cc] rounded-xl outline-none focus:border-[#201f1c] text-[#201f1c]"
            />
            <span className="text-[10px] text-[#79766e] mt-1 block">Zomato/Swiggy commission share</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#44423c] mb-1">
              Delivery Cost (₹ / Order)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={formConfig.delivery_cost}
              onChange={(e) =>
                setFormConfig({ ...formConfig, delivery_cost: parseFloat(e.target.value) || 0 })
              }
              className="w-full text-sm font-semibold p-3 bg-[#fbf9f5] border border-[#ded8cc] rounded-xl outline-none focus:border-[#201f1c] text-[#201f1c]"
            />
            <span className="text-[10px] text-[#79766e] mt-1 block">Rider logistics subsidy per drop</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#44423c] mb-1">
              Minimum Contribution Margin (%)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={formConfig.minimum_contribution_margin_percent ?? ''}
              onChange={(e) =>
                setFormConfig({
                  ...formConfig,
                  minimum_contribution_margin_percent: e.target.value === '' ? null : parseFloat(e.target.value),
                })
              }
              placeholder="0 (None)"
              className="w-full text-sm font-semibold p-3 bg-[#fbf9f5] border border-[#ded8cc] rounded-xl outline-none focus:border-[#201f1c] text-[#201f1c]"
            />
            <span className="text-[10px] text-[#79766e] mt-1 block">Combos below this margin get flagged</span>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 pt-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#201f1c] hover:bg-[#383631] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Policy Rules</span>
            </button>
          </div>
        </form>
      </div>

      {/* Menu Item Prices & Costs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ece8df] shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-athelas text-xl font-bold text-[#201f1c]">
              Menu Selling Prices & Ingredient Costs
            </h3>
            <p className="text-xs text-[#79766e] mt-1">
              Momobuzz items enforce a strict ₹69.00 minimum unit price floor.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#fff8f5] border border-[#f4d8ce] px-3 py-1.5 rounded-xl text-xs text-[#b85032] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>₹69.00 Price Floor Active</span>
          </div>
        </div>

        <div className="space-y-3">
          {menu.map((item) => {
            const isMomo = item.brand === 'Momobuzz';
            const cur = menuValues[item.id] || { price: item.price, cost: item.ingredient_cost_per_unit ?? '' };

            return (
              <div
                key={item.id}
                className="p-4 bg-[#fbf9f5] rounded-2xl border border-[#ece8df] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isMomo ? 'bg-[#fff8f5] text-[#d96d4c] border border-[#f4d8ce]' : 'bg-[#f6faf5] text-[#527d58] border border-[#d5e4d4]'
                    }`}
                  >
                    {isMomo ? <Wind className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                  </div>

                  <div>
                    <span className="font-athelas text-base font-bold text-[#201f1c] block">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-[#79766e]">
                      {item.brand} · {item.station} station
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#79766e] font-medium">Selling Price:</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[#79766e] font-bold">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        value={cur.price}
                        onChange={(e) =>
                          setMenuValues({
                            ...menuValues,
                            [item.id]: { ...cur, price: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-24 pl-6 pr-2 py-1.5 bg-white border border-[#ded8cc] rounded-lg text-xs font-bold text-[#201f1c] outline-none focus:border-[#201f1c]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#79766e] font-medium">Ingredient Cost:</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[#79766e] font-bold">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Unknown"
                        value={cur.cost}
                        onChange={(e) =>
                          setMenuValues({
                            ...menuValues,
                            [item.id]: {
                              ...cur,
                              cost: e.target.value === '' ? '' : parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-24 pl-6 pr-2 py-1.5 bg-white border border-[#ded8cc] rounded-lg text-xs font-bold text-[#201f1c] outline-none focus:border-[#201f1c]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveMenuItem(item)}
                    className="px-4 py-1.5 bg-[#201f1c] hover:bg-[#383631] text-white rounded-lg text-xs font-semibold transition active:scale-95 shadow-2xs"
                  >
                    Save
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
