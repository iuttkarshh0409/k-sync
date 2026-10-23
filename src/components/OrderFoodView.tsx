import React, { useState, useMemo } from 'react';
import {
  Wind,
  Flame,
  Plus,
  Minus,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Info,
} from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';
import { scheduleOrder, calculateProfitability, MOMO_PRICE_FLOOR } from '../utils/kitchenRules';

export const OrderFoodView: React.FC<{ onOrderPlaced: () => void }> = ({ onOrderPlaced }) => {
  const { menu, cart, addToCart, clearCart, placeOrder, config, activeBranchId, branches } = useKitchen();
  const [selectedBrand, setSelectedBrand] = useState<'All' | 'Momobuzz' | 'Woksum'>('All');
  const [priorityRush, setPriorityRush] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  const filteredMenu = useMemo(() => {
    if (selectedBrand === 'All') return menu;
    return menu.filter((item) => item.brand === selectedBrand);
  }, [menu, selectedBrand]);

  const cartEntries = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const item = menu.find((m) => m.id === id);
        return item ? { ...item, quantity: qty } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [cart, menu]);

  // Real-time station synchronization calculation
  const liveSchedule = useMemo(() => {
    if (cartEntries.length === 0) return null;
    return scheduleOrder(
      cartEntries.map((i) => ({
        menu_item_id: i.id,
        name: i.name,
        station: i.station,
        quantity: i.quantity,
        duration_minutes: i.duration_minutes,
      }))
    );
  }, [cartEntries]);

  // Real-time server-grade profitability report
  const liveProfitability = useMemo(() => {
    if (cartEntries.length === 0) return null;
    return calculateProfitability(
      cartEntries.map((i) => ({
        id: i.id,
        name: i.name,
        brand: i.brand,
        price: i.price,
        quantity: i.quantity,
        ingredient_cost_per_unit: i.ingredient_cost_per_unit,
      })),
      config
    );
  }, [cartEntries, config]);

  const hasMomobuzz = cartEntries.some((i) => i.brand === 'Momobuzz');
  const hasWoksum = cartEntries.some((i) => i.brand === 'Woksum');
  const isDualBrand = hasMomobuzz && hasWoksum;

  const handlePlaceOrder = () => {
    if (cartEntries.length === 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const order = placeOrder({
        items: cartEntries.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
        priority_note: priorityRush ? 'fast' : null,
      });

      setIsSubmitting(false);
      setSuccessToast(`Ticket ${order.id} sent to kitchen with synchronized station timing!`);
      setTimeout(() => setSuccessToast(null), 4000);
      onOrderPlaced();
    }, 350);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#201f1c] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Brand Tabs Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#ece8df] shadow-2xs">
        <div className="flex items-center gap-2">
          {(['All', 'Momobuzz', 'Woksum'] as const).map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                selectedBrand === brand
                  ? 'bg-[#201f1c] text-white shadow-xs'
                  : 'bg-[#f4f1ea] text-[#6d6961] hover:bg-[#eae6dc]'
              }`}
            >
              {brand === 'Momobuzz' && <Wind className="w-3.5 h-3.5 text-[#d96d4c]" />}
              {brand === 'Woksum' && <Flame className="w-3.5 h-3.5 text-[#527d58]" />}
              <span>{brand === 'All' ? 'All Dishes' : brand}</span>
            </button>
          ))}
        </div>

        <div className="text-xs text-[#79766e] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Ordering for branch: <b className="text-[#201f1c]">{activeBranch.name}</b></span>
        </div>
      </div>

      {/* Main Grid: Menu Items (Left) & Cart / Sync Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Menu Cards (8 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredMenu.map((item) => {
              const qty = cart[item.id] || 0;
              const isMomo = item.brand === 'Momobuzz';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    qty > 0
                      ? isMomo
                        ? 'border-[#d96d4c] ring-2 ring-[#d96d4c]/10 shadow-sm'
                        : 'border-[#527d58] ring-2 ring-[#527d58]/10 shadow-sm'
                      : 'border-[#ece8df] hover:border-[#ded9ce] shadow-2xs'
                  }`}
                >
                  <div>
                    {/* Brand Pill & Station */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isMomo
                            ? 'bg-[#fff8f5] text-[#b85032] border border-[#f4d8ce]'
                            : 'bg-[#f6faf5] text-[#375b3c] border border-[#d5e4d4]'
                        }`}
                      >
                        {isMomo ? <Wind className="w-3 h-3 text-[#d96d4c]" /> : <Flame className="w-3 h-3 text-[#527d58]" />}
                        <span>{item.brand}</span>
                      </span>

                      <span className="text-[11px] font-medium text-[#79766e] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.duration_minutes}m cook</span>
                      </span>
                    </div>

                    {/* Dish Title & Description */}
                    <h3 className="font-athelas text-lg font-bold text-[#201f1c] leading-snug">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#79766e] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-5 pt-4 border-t border-[#f7f5f0] flex items-center justify-between">
                    <div>
                      <span className="font-sans text-xl font-bold text-[#201f1c]">
                        ₹{item.price}
                      </span>
                      <span className="text-[10px] text-[#8d8a81] block font-sans">
                        Cost est: ₹{item.ingredient_cost_per_unit || '--'}
                      </span>
                    </div>

                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(item.id, 1)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                          isMomo
                            ? 'bg-[#fff8f5] text-[#b85032] hover:bg-[#d96d4c] hover:text-white border border-[#f4d8ce]'
                            : 'bg-[#f6faf5] text-[#375b3c] hover:bg-[#527d58] hover:text-white border border-[#d5e4d4]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#f4f1ea] rounded-xl p-1 border border-[#ded8cc]">
                        <button
                          onClick={() => addToCart(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white text-[#201f1c] flex items-center justify-center font-bold hover:bg-[#e2ded5] transition shadow-2xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold font-mono px-1 text-[#201f1c]">
                          {qty}
                        </span>
                        <button
                          onClick={() => addToCart(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-[#201f1c] text-white flex items-center justify-center font-bold hover:bg-[#383631] transition shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unified Cart, Station Sync & Economics (5 columns) */}
        <div className="lg:col-span-5 space-y-5 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-[#ece8df] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#f1efe9]">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#201f1c]" />
                <h3 className="font-athelas text-lg font-bold text-[#201f1c]">
                  Cart & Kitchen Sync
                </h3>
              </div>

              {cartEntries.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-[#8d8a81] hover:text-rose-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cartEntries.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8d8a81] space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#f8f6f0] mx-auto flex items-center justify-center text-[#b8b3a7]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="font-medium">Your order cart is empty</p>
                <p className="text-[11px] text-[#aaa69d]">
                  Select dishes from Momobuzz and Woksum to see live station synchronization.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {cartEntries.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs p-2.5 bg-[#fbf9f5] rounded-xl border border-[#f0ece3]"
                    >
                      <div className="flex-1 pr-2">
                        <span className="font-bold text-[#201f1c] block font-athelas">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-[#79766e]">
                          {item.brand} ({item.station}) · ₹{item.price} each
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold font-sans text-[#201f1c]">
                          ₹{item.price * item.quantity}
                        </span>
                        <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-[#ded8cc]">
                          <button
                            onClick={() => addToCart(item.id, -1)}
                            className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#eae6dc]"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-[11px] font-mono font-bold px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item.id, 1)}
                            className="w-5 h-5 rounded bg-[#201f1c] text-white flex items-center justify-center"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real-time Synchronized Station Schedule */}
                {liveSchedule && (
                  <div className="p-4 bg-[#f8f6f0] rounded-2xl border border-[#e8e4da] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#79766e] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Synchronized Kitchen Schedule</span>
                      </span>

                      {liveSchedule.sync_success ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Target met (≤2m)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          {liveSchedule.sync_deviation_minutes}m offset
                        </span>
                      )}
                    </div>

                    {/* Timeline visualization */}
                    <div className="space-y-2 pt-1">
                      {liveSchedule.tasks.map((task, idx) => {
                        const isSteamer = task.station === 'steamer';
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-[11px] p-2 bg-white rounded-xl border border-[#ece8df]"
                          >
                            <div className="flex items-center gap-2">
                              {isSteamer ? (
                                <Wind className="w-3.5 h-3.5 text-[#d96d4c]" />
                              ) : (
                                <Flame className="w-3.5 h-3.5 text-[#527d58]" />
                              )}
                              <span className="font-semibold text-[#201f1c]">
                                {task.quantity}× {task.name}
                              </span>
                            </div>
                            <div className="text-right font-mono text-[10px] text-[#79766e]">
                              <span>
                                {new Date(task.planned_start).toLocaleTimeString('en-IN', {
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}{' '}
                                →{' '}
                                {new Date(task.planned_finish).toLocaleTimeString('en-IN', {
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[11px] text-[#6d6961] bg-white/70 p-2.5 rounded-xl border border-[#ded8cb] leading-relaxed">
                      {isDualBrand ? (
                        <span>
                          <b>Why staggered?</b> Steamer items take 10m while wok stir-fry takes 3m. The wok starts 7m later so both dishes finish hot at the exact same minute!
                        </span>
                      ) : (
                        <span>
                          Single-station order. Direct queue without cross-station stagger delay.
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Profitability & Contribution Economics Card */}
                {liveProfitability && (
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      liveProfitability.status === 'blocked'
                        ? 'bg-rose-50 border-rose-200'
                        : liveProfitability.status === 'incomplete_costs'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-[#f4f7f2] border-[#d8e4d4]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#201f1c] font-athelas">
                        {liveProfitability.status === 'approved'
                          ? 'Contribution Economics'
                          : liveProfitability.status === 'blocked'
                          ? 'Policy Violation'
                          : 'Incomplete Cost Estimates'}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          liveProfitability.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : liveProfitability.status === 'blocked'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {liveProfitability.contribution_margin_percent
                          ? `${liveProfitability.contribution_margin_percent}% margin`
                          : 'Margin unavailable'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex justify-between text-[#6d6a62]">
                        <span>Item Revenue:</span>
                        <b className="text-[#201f1c]">₹{liveProfitability.item_revenue}</b>
                      </div>
                      <div className="flex justify-between text-[#6d6a62]">
                        <span>Ingredients:</span>
                        <b className="text-[#201f1c]">₹{liveProfitability.ingredient_costs}</b>
                      </div>
                      <div className="flex justify-between text-[#6d6a62]">
                        <span>Delivery (₹):</span>
                        <b className="text-[#201f1c]">₹{liveProfitability.delivery_cost}</b>
                      </div>
                      <div className="flex justify-between text-[#6d6a62]">
                        <span>Platform (20%):</span>
                        <b className="text-[#201f1c]">₹{liveProfitability.platform_fee}</b>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#44423c]">Contribution Profit:</span>
                      <span className="font-athelas text-base font-bold text-[#527d58]">
                        ₹{liveProfitability.contribution_profit || '--'}
                      </span>
                    </div>

                    {liveProfitability.violations.map((v, i) => (
                      <p key={i} className="text-[10px] text-rose-700 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{v}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* Priority Fast Prep Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rush-order"
                    checked={priorityRush}
                    onChange={(e) => setPriorityRush(e.target.checked)}
                    className="rounded border-[#ded8cc] text-[#d96d4c] focus:ring-[#d96d4c]"
                  />
                  <label htmlFor="rush-order" className="text-xs text-[#524f48] font-medium cursor-pointer">
                    Flag as <b>High Priority / Fast Prep</b> for immediate station queueing
                  </label>
                </div>

                {/* Order Submit Button */}
                <button
                  disabled={isSubmitting || liveProfitability?.status === 'blocked'}
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 bg-[#201f1c] hover:bg-[#383631] disabled:bg-[#ded9ce] text-white rounded-2xl font-bold text-xs tracking-wide uppercase transition active:scale-95 shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Scheduling Stations…</span>
                  ) : (
                    <>
                      <span>Place Dual-Brand Order</span>
                      <span className="font-mono">
                        · ₹{liveProfitability?.item_revenue || 0}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
