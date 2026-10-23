import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  MenuItem,
  Task,
  Order,
  AppConfig,
  DEFAULT_MENU,
  DEFAULT_CONFIG,
  scheduleOrder,
  calculateProfitability,
  optimizeEligibleBatches,
} from '../utils/kitchenRules';
import { Branch, BatchRecord, INITIAL_BRANCHES, getInitialDemoOrders } from '../services/kitchenStore';

interface KitchenContextType {
  menu: MenuItem[];
  orders: Order[];
  branches: Branch[];
  config: AppConfig;
  batches: BatchRecord[];
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  cart: Record<string, number>;
  addToCart: (menuItemId: string, delta: number) => void;
  clearCart: () => void;
  placeOrder: (opts: {
    items: Array<{ menu_item_id: string; quantity: number }>;
    priority_note?: string | null;
    source_text?: string | null;
    branch_id?: string;
  }) => Order;
  startTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  createBatches: (windowMinutes?: number) => BatchRecord[];
  updateConfig: (newConfig: AppConfig) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  updateBranchStatus: (branchId: string, reviewStatus: string) => void;
  resetDemoData: () => void;
  stationQueues: {
    steamer: { active: Task[]; queued: Task[]; status: 'idle' | 'normal' | 'overloaded' };
    wok: { active: Task[]; queued: Task[]; status: 'idle' | 'normal' | 'overloaded' };
  };
  analytics: {
    total_orders: number;
    completed_orders: number;
    average_completion_minutes: number;
    average_finish_variance_minutes: { steamer: number; wok: number };
    bottleneck_minutes: { steamer: number; wok: number };
    sync_success_rate: number;
    rush_hours: Array<{ hour: string; orders: number; average_completion_minutes: number }>;
    data_note: string;
  };
}

const KitchenContext = createContext<KitchenContextType | null>(null);

const STORAGE_KEYS = {
  MENU: 'kitchensync_menu_v2',
  ORDERS: 'kitchensync_orders_v2',
  BRANCHES: 'kitchensync_branches_v2',
  CONFIG: 'kitchensync_config_v2',
  BATCHES: 'kitchensync_batches_v2',
  BRANCH: 'kitchensync_active_branch_v2',
};

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      return saved ? JSON.parse(saved) : DEFAULT_MENU;
    } catch {
      return DEFAULT_MENU;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : getInitialDemoOrders();
    } catch {
      return getInitialDemoOrders();
    }
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRANCHES);
      return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
    } catch {
      return INITIAL_BRANCHES;
    }
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [batches, setBatches] = useState<BatchRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BATCHES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.BRANCH) || 'bhanwarkuan';
    } catch {
      return 'bhanwarkuan';
    }
  });

  const [cart, setCart] = useState<Record<string, number>>({});

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
    } catch {}
  }, [menu]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
    } catch {}
  }, [branches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
    } catch {}
  }, [batches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRANCH, activeBranchId);
    } catch {}
  }, [activeBranchId]);

  const addToCart = (menuItemId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[menuItemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[menuItemId];
        return copy;
      }
      return { ...prev, [menuItemId]: next };
    });
  };

  const clearCart = () => setCart({});

  const placeOrder = ({
    items,
    priority_note,
    source_text,
    branch_id,
  }: {
    items: Array<{ menu_item_id: string; quantity: number }>;
    priority_note?: string | null;
    source_text?: string | null;
    branch_id?: string;
  }): Order => {
    const branch = branch_id || activeBranchId;
    const now = new Date();

    // Map items to rich details
    const orderItems = items.map((cartItem, idx) => {
      const menuItem = menu.find((m) => m.id === cartItem.menu_item_id) || menu[0];
      return {
        id: `ORD-${Date.now().toString().slice(-4)}-I${idx + 1}`,
        order_id: '',
        menu_item_id: menuItem.id,
        name: menuItem.name,
        brand: menuItem.brand,
        station: menuItem.station,
        quantity: cartItem.quantity,
        unit_price: menuItem.price,
        duration_minutes: menuItem.duration_minutes,
        ingredient_cost_per_unit: menuItem.ingredient_cost_per_unit,
      };
    });

    // Determine current station availability from active tasks
    const activeTasks = orders.flatMap((o) => o.tasks).filter((t) => t.status === 'active' || t.status === 'queued');
    const steamerLatest = activeTasks
      .filter((t) => t.station === 'steamer')
      .map((t) => new Date(t.planned_finish).getTime());
    const wokLatest = activeTasks
      .filter((t) => t.station === 'wok')
      .map((t) => new Date(t.planned_finish).getTime());

    const availability: Partial<Record<'steamer' | 'wok', Date>> = {
      steamer: steamerLatest.length ? new Date(Math.max(...steamerLatest)) : now,
      wok: wokLatest.length ? new Date(Math.max(...wokLatest)) : now,
    };

    const schedule = scheduleOrder(
      orderItems.map((i) => ({
        menu_item_id: i.menu_item_id,
        name: i.name,
        station: i.station,
        quantity: i.quantity,
        duration_minutes: i.duration_minutes,
      })),
      now,
      availability
    );

    const orderId = `ORD-${Date.now().toString().slice(-4)}`;
    orderItems.forEach((i) => (i.order_id = orderId));

    const tasks: Task[] = schedule.tasks.map((st, idx) => ({
      id: `${orderId}-T${idx + 1}`,
      order_id: orderId,
      station: st.station,
      status: 'queued',
      planned_start: st.planned_start,
      planned_finish: st.planned_finish,
      item_summary: `${st.quantity} × ${st.name}`,
    }));

    const profitReport = calculateProfitability(
      orderItems.map((i) => ({
        id: i.menu_item_id,
        name: i.name,
        brand: i.brand,
        price: i.unit_price,
        quantity: i.quantity,
        ingredient_cost_per_unit: i.ingredient_cost_per_unit,
      })),
      config
    );

    const newOrder: Order = {
      id: orderId,
      branch_id: branch,
      created_at: now.toISOString(),
      status: 'queued',
      priority_note: priority_note || null,
      source_text: source_text || null,
      estimated_minutes: schedule.estimated_minutes,
      sync_deviation: schedule.sync_deviation_minutes,
      sync_success: schedule.sync_success,
      items: orderItems,
      tasks,
      item_revenue: profitReport.item_revenue,
      estimated_cost: profitReport.total_estimated_cost || undefined,
      contribution_profit: profitReport.contribution_profit || undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const startTask = (taskId: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((order) => {
        const hasTask = order.tasks.some((t) => t.id === taskId);
        if (!hasTask) return order;

        const updatedTasks = order.tasks.map((t) => {
          if (t.id === taskId) {
            return { ...t, status: 'active' as const, actual_start: now };
          }
          return t;
        });

        const anyActive = updatedTasks.some((t) => t.status === 'active');
        const nextStatus = anyActive ? ('cooking' as const) : order.status;

        return {
          ...order,
          tasks: updatedTasks,
          status: nextStatus,
        };
      })
    );
  };

  const completeTask = (taskId: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((order) => {
        const hasTask = order.tasks.some((t) => t.id === taskId);
        if (!hasTask) return order;

        const updatedTasks = order.tasks.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              status: 'completed' as const,
              actual_finish: now,
              actual_start: t.actual_start || now,
            };
          }
          return t;
        });

        const allCompleted = updatedTasks.every((t) => t.status === 'completed');
        const anyActive = updatedTasks.some((t) => t.status === 'active');

        let nextStatus: Order['status'] = order.status;
        if (allCompleted) {
          nextStatus = 'completed';
        } else if (anyActive) {
          nextStatus = 'cooking';
        }

        return {
          ...order,
          tasks: updatedTasks,
          status: nextStatus,
          completed_at: allCompleted ? now : order.completed_at,
        };
      })
    );
  };

  const createBatches = (windowMinutes = 3): BatchRecord[] => {
    const eligible = optimizeEligibleBatches(orders, windowMinutes);
    if (!eligible.length) return [];

    const newBatches: BatchRecord[] = eligible.map((b) => ({
      ...b,
      id: b.batch_id,
      status: 'queued',
      created_at: new Date().toISOString(),
    }));

    setBatches((prev) => [...newBatches, ...prev]);

    // Update orders and items with the batch ID
    setOrders((prev) =>
      prev.map((order) => {
        const matchingBatch = eligible.find((b) => b.orders.some((o) => o.order_id === order.id));
        if (!matchingBatch) return order;

        const updatedItems = order.items.map((item) => {
          if (item.menu_item_id === matchingBatch.menu_item_id) {
            return { ...item, batch_id: matchingBatch.batch_id };
          }
          return item;
        });

        const updatedTasks = order.tasks.map((task) => {
          if (task.station === matchingBatch.station && !task.batch_id) {
            return { ...task, batch_id: matchingBatch.batch_id };
          }
          return task;
        });

        return {
          ...order,
          items: updatedItems,
          tasks: updatedTasks,
        };
      })
    );

    return newBatches;
  };

  const updateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenu((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const updateBranchStatus = (branchId: string, reviewStatus: string) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === branchId ? { ...b, review_status: reviewStatus } : b))
    );
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.MENU);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.BRANCHES);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    setMenu(DEFAULT_MENU);
    setOrders(getInitialDemoOrders());
    setBranches(INITIAL_BRANCHES);
    setConfig(DEFAULT_CONFIG);
    setBatches([]);
    setCart({});
  };

  // Station queues calculation
  const stationQueues = useMemo(() => {
    const allTasks = orders.flatMap((o) => o.tasks);
    const steamerTasks = allTasks.filter((t) => t.station === 'steamer');
    const wokTasks = allTasks.filter((t) => t.station === 'wok');

    const steamerActive = steamerTasks.filter((t) => t.status === 'active');
    const steamerQueued = steamerTasks.filter((t) => t.status === 'queued');

    const wokActive = wokTasks.filter((t) => t.status === 'active');
    const wokQueued = wokTasks.filter((t) => t.status === 'queued');

    const steamerLoad = steamerActive.length + steamerQueued.length;
    const wokLoad = wokActive.length + wokQueued.length;

    return {
      steamer: {
        active: steamerActive,
        queued: steamerQueued,
        status: (steamerLoad > 4 ? 'overloaded' : steamerLoad > 0 ? 'normal' : 'idle') as
          | 'idle'
          | 'normal'
          | 'overloaded',
      },
      wok: {
        active: wokActive,
        queued: wokQueued,
        status: (wokLoad > 4 ? 'overloaded' : wokLoad > 0 ? 'normal' : 'idle') as
          | 'idle'
          | 'normal'
          | 'overloaded',
      },
    };
  }, [orders]);

  // Analytics calculation
  const analytics = useMemo(() => {
    const completed = orders.filter((o) => o.status === 'completed' && o.completed_at);
    const durations = completed.map((o) => {
      const diff = new Date(o.completed_at!).getTime() - new Date(o.created_at).getTime();
      return diff / (60 * 1000);
    });
    const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    const allTasks = orders.flatMap((o) => o.tasks);
    const steamerFinished = allTasks.filter((t) => t.station === 'steamer' && t.actual_finish);
    const wokFinished = allTasks.filter((t) => t.station === 'wok' && t.actual_finish);

    const getVariance = (tasks: Task[]) => {
      if (!tasks.length) return 0;
      const diffs = tasks.map((t) => {
        const delta = Math.abs(
          new Date(t.actual_finish!).getTime() - new Date(t.planned_finish).getTime()
        );
        return delta / (60 * 1000);
      });
      return diffs.reduce((a, b) => a + b, 0) / diffs.length;
    };

    const steamerBottleneck = stationQueues.steamer.queued.length * 10;
    const wokBottleneck = stationQueues.wok.queued.length * 3;

    const syncSuccessCount = completed.filter((o) => o.sync_success).length;
    const syncSuccessRate = completed.length ? (syncSuccessCount / completed.length) * 100 : 100;

    const rushHoursMap: Record<string, { count: number; totalMins: number }> = {};
    for (const order of completed) {
      const hour = new Date(order.created_at).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        hour12: true,
      });
      const diff = (new Date(order.completed_at!).getTime() - new Date(order.created_at).getTime()) / (60 * 1000);
      if (!rushHoursMap[hour]) {
        rushHoursMap[hour] = { count: 0, totalMins: 0 };
      }
      rushHoursMap[hour].count += 1;
      rushHoursMap[hour].totalMins += diff;
    }

    const rush_hours = Object.entries(rushHoursMap).map(([hour, val]) => ({
      hour,
      orders: val.count,
      average_completion_minutes: Math.round((val.totalMins / val.count) * 10) / 10,
    }));

    const syntheticCount = orders.filter((o) => o.id.startsWith('DEMO-')).length;

    return {
      total_orders: orders.length,
      completed_orders: completed.length,
      average_completion_minutes: Math.round(avgDuration * 10) / 10,
      average_finish_variance_minutes: {
        steamer: Math.round(getVariance(steamerFinished) * 10) / 10,
        wok: Math.round(getVariance(wokFinished) * 10) / 10,
      },
      bottleneck_minutes: {
        steamer: steamerBottleneck,
        wok: wokBottleneck,
      },
      sync_success_rate: Math.round(syncSuccessRate * 10) / 10,
      rush_hours,
      data_note: `${syntheticCount} synthetic demo baseline tickets; ${orders.length - syntheticCount} live active/placed tickets.`,
    };
  }, [orders, stationQueues]);

  return (
    <KitchenContext.Provider
      value={{
        menu,
        orders,
        branches,
        config,
        batches,
        activeBranchId,
        setActiveBranchId,
        cart,
        addToCart,
        clearCart,
        placeOrder,
        startTask,
        completeTask,
        createBatches,
        updateConfig,
        updateMenuItem,
        updateBranchStatus,
        resetDemoData,
        stationQueues,
        analytics,
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
};

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return context;
};
