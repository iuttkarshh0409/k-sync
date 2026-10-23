/**
 * KitchenSync Core Business Logic & Rule Engine
 * Handles dual-brand station synchronization, cross-order batching,
 * natural language dish parsing, and combo profitability calculations.
 */

export interface MenuItem {
  id: string;
  name: string;
  brand: 'Momobuzz' | 'Woksum';
  station: 'steamer' | 'wok';
  category: string;
  description: string;
  price: number;
  ingredient_cost_per_unit: number | null;
  duration_minutes: number;
  aliases: string[];
}

export interface Task {
  id: string;
  order_id: string;
  station: 'steamer' | 'wok';
  status: 'queued' | 'active' | 'completed';
  planned_start: string;
  planned_finish: string;
  actual_start?: string | null;
  actual_finish?: string | null;
  batch_id?: string | null;
  item_summary: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  brand: 'Momobuzz' | 'Woksum';
  station: 'steamer' | 'wok';
  quantity: number;
  unit_price: number;
  duration_minutes: number;
  ingredient_cost_per_unit?: number | null;
  batch_id?: string | null;
}

export interface Order {
  id: string;
  branch_id: string;
  created_at: string;
  status: 'queued' | 'scheduled' | 'cooking' | 'completed';
  priority_note?: string | null;
  source_text?: string | null;
  estimated_minutes: number;
  sync_deviation: number;
  sync_success: boolean;
  completed_at?: string | null;
  items: OrderItem[];
  tasks: Task[];
  item_revenue?: string;
  estimated_cost?: string;
  contribution_profit?: string;
}

export interface AppConfig {
  platform_commission_percent: number;
  delivery_cost: number;
  minimum_contribution_profit: number | null;
  minimum_contribution_margin_percent: number | null;
  other_order_cost: number;
}

export const DEFAULT_MENU: MenuItem[] = [
  {
    id: 'veg-momo',
    name: 'Steamed Veg Momos',
    brand: 'Momobuzz',
    station: 'steamer',
    category: 'Steamed momos',
    description: 'Hand-folded cabbage, carrot, and aromatic ginger dumplings with chili dip',
    price: 129,
    ingredient_cost_per_unit: 42,
    duration_minutes: 10,
    aliases: ['veg momo', 'veg momos', 'steamed veg momo', 'steamed momo', 'momos', 'veg dumpling'],
  },
  {
    id: 'chicken-momo',
    name: 'Chicken Momos',
    brand: 'Momobuzz',
    station: 'steamer',
    category: 'Steamed momos',
    description: 'Juicy minced chicken dumplings with house smoked Sichuan chili crisp',
    price: 159,
    ingredient_cost_per_unit: 57,
    duration_minutes: 10,
    aliases: ['chicken momo', 'chicken momos', 'steamed chicken momo'],
  },
  {
    id: 'fried-momo',
    name: 'Crispy Fried Momos',
    brand: 'Momobuzz',
    station: 'steamer',
    category: 'Fried momos',
    description: 'Golden crisp pan-fried momos tossed in sesame scallion chili oil',
    price: 149,
    ingredient_cost_per_unit: 48,
    duration_minutes: 8,
    aliases: ['fried momo', 'fried momos', 'crispy momos', 'crispy fried momo'],
  },
  {
    id: 'hakka-noodles',
    name: 'Chicken Hakka Noodles',
    brand: 'Woksum',
    station: 'wok',
    category: 'Wok favourites',
    description: 'Smoky high-flame wok-tossed noodles with chicken, shredded bell peppers, and scallions',
    price: 219,
    ingredient_cost_per_unit: 86,
    duration_minutes: 3,
    aliases: ['chicken hakka noodles', 'hakka noodles', 'chicken noodles', 'noodles', 'chow mein'],
  },
  {
    id: 'veg-fried-rice',
    name: 'Veg Fried Rice',
    brand: 'Woksum',
    station: 'wok',
    category: 'Wok favourites',
    description: 'Aromatic jasmine wok-fired rice with farm vegetables and light soy glaze',
    price: 189,
    ingredient_cost_per_unit: 67,
    duration_minutes: 3,
    aliases: ['veg fried rice', 'vegetable fried rice', 'fried rice', 'rice'],
  },
  {
    id: 'chilli-paneer',
    name: 'Chilli Paneer',
    brand: 'Woksum',
    station: 'wok',
    category: 'Wok favourites',
    description: 'Crisp cottage cheese cubes, charred peppers, and scallions in savory chili-garlic glaze',
    price: 229,
    ingredient_cost_per_unit: 91,
    duration_minutes: 4,
    aliases: ['chilli paneer', 'chili paneer', 'paneer chilli', 'paneer'],
  },
];

export const DEFAULT_CONFIG: AppConfig = {
  platform_commission_percent: 20,
  delivery_cost: 25,
  minimum_contribution_profit: 0,
  minimum_contribution_margin_percent: 0,
  other_order_cost: 0,
};

export const MOMO_PRICE_FLOOR = 69.0;
export const TARGET_WINDOW_MINUTES = 2;

export const STATION_DEFAULT_DURATIONS: Record<'steamer' | 'wok', number> = {
  steamer: 10,
  wok: 3,
};

/**
 * 1. Synchronized Order Scheduling Logic
 * Schedules tasks across steamer and wok stations targeting simultaneous finish.
 */
export function scheduleOrder(
  items: Array<{
    menu_item_id: string;
    name: string;
    station: 'steamer' | 'wok';
    quantity: number;
    duration_minutes?: number;
  }>,
  createdAt: Date = new Date(),
  stationAvailability?: Partial<Record<'steamer' | 'wok', Date>>
): {
  tasks: Array<{
    task_group: string;
    menu_item_id: string;
    name: string;
    station: 'steamer' | 'wok';
    quantity: number;
    planned_start: string;
    planned_finish: string;
  }>;
  estimated_minutes: number;
  sync_deviation_minutes: number;
  sync_success: boolean;
  target_window_minutes: number;
} {
  const availability = stationAvailability || {};
  const normalized = items.map((i) => ({
    ...i,
    duration_minutes:
      i.duration_minutes ??
      STATION_DEFAULT_DURATIONS[i.station] ??
      (i.station === 'steamer' ? 10 : 3),
  }));

  const stationReady: Record<'steamer' | 'wok', Date> = {
    steamer: availability.steamer && availability.steamer > createdAt ? availability.steamer : new Date(createdAt),
    wok: availability.wok && availability.wok > createdAt ? availability.wok : new Date(createdAt),
  };

  // Find first item per station
  const firstPerStation: Partial<Record<'steamer' | 'wok', typeof normalized[0]>> = {};
  for (const item of normalized) {
    if (!firstPerStation[item.station]) {
      firstPerStation[item.station] = item;
    }
  }

  // Calculate common target finish time
  let targetFinishTime = new Date(createdAt);
  for (const station of ['steamer', 'wok'] as const) {
    const firstItem = firstPerStation[station];
    if (firstItem) {
      const cookDurationMs = firstItem.duration_minutes * firstItem.quantity * 60 * 1000;
      const readyAt = stationReady[station].getTime();
      const earliestFinish = new Date(readyAt + cookDurationMs);
      if (earliestFinish > targetFinishTime) {
        targetFinishTime = earliestFinish;
      }
    }
  }

  const tasks: Array<{
    task_group: string;
    menu_item_id: string;
    name: string;
    station: 'steamer' | 'wok';
    quantity: number;
    planned_start: string;
    planned_finish: string;
  }> = [];

  const cursor: Record<'steamer' | 'wok', Date> = {
    steamer: new Date(stationReady.steamer),
    wok: new Date(stationReady.wok),
  };
  const seenStations = new Set<'steamer' | 'wok'>();

  for (let ix = 0; ix < normalized.length; ix++) {
    const item = normalized[ix];
    const s = item.station;
    const durationMs = item.duration_minutes * item.quantity * 60 * 1000;

    let start: Date;
    let finish: Date;

    if (!seenStations.has(s)) {
      // First item for this station: align finish with target finish time
      const naturalEarliestFinish = new Date(stationReady[s].getTime() + durationMs);
      finish = targetFinishTime > naturalEarliestFinish ? targetFinishTime : naturalEarliestFinish;
      start = new Date(finish.getTime() - durationMs);
    } else {
      // Subsequent item for the same station: queue after previous finish
      start = cursor[s] > new Date(targetFinishTime.getTime() - durationMs)
        ? cursor[s]
        : new Date(targetFinishTime.getTime() - durationMs);
      finish = new Date(start.getTime() + durationMs);
    }

    cursor[s] = finish;
    seenStations.add(s);

    tasks.push({
      task_group: `task-${ix}`,
      menu_item_id: item.menu_item_id,
      name: item.name,
      station: s,
      quantity: item.quantity,
      planned_start: start.toISOString(),
      planned_finish: finish.toISOString(),
    });
  }

  const finishTimestamps = tasks.map((t) => new Date(t.planned_finish).getTime());
  const maxFinish = finishTimestamps.length ? Math.max(...finishTimestamps) : createdAt.getTime();
  const minFinish = finishTimestamps.length ? Math.min(...finishTimestamps) : createdAt.getTime();
  const deviation = (maxFinish - minFinish) / (60 * 1000);
  const estimatedMins = Math.max(0, (maxFinish - createdAt.getTime()) / (60 * 1000));

  return {
    tasks,
    estimated_minutes: Math.round(estimatedMins * 10) / 10,
    sync_deviation_minutes: Math.round(deviation * 10) / 10,
    sync_success: deviation <= TARGET_WINDOW_MINUTES,
    target_window_minutes: TARGET_WINDOW_MINUTES,
  };
}

/**
 * 2. Profitability & Contribution Economics Engine
 * Validates Momobuzz ₹69 floor, platform fees, delivery, margins, and policies.
 */
export function calculateProfitability(
  items: Array<{
    id?: string;
    name: string;
    brand: 'Momobuzz' | 'Woksum';
    price: number;
    quantity: number;
    ingredient_cost_per_unit?: number | null;
    discount?: number;
  }>,
  config: AppConfig,
  deliveryCostOverride = 0,
  otherCost = 0
): {
  items: Array<{
    menu_item_id?: string;
    name: string;
    quantity: number;
    unit_price: string;
    subtotal: string;
    ingredient_cost: string | null;
  }>;
  item_revenue: string;
  ingredient_costs: string;
  delivery_cost: string;
  platform_fee: string;
  other_costs: string;
  known_costs_total: string;
  total_estimated_cost: string | null;
  contribution_profit: string | null;
  contribution_margin_percent: string | null;
  costs_complete: boolean;
  warnings: string[];
  violations: string[];
  status: 'approved' | 'blocked' | 'incomplete_costs';
  policy: {
    minimum_contribution_profit: string | null;
    minimum_contribution_margin_percent: string | null;
  };
} {
  let revenue = 0;
  let ingredients = 0;
  const warnings: string[] = [];
  const violations: string[] = [];
  const lines: any[] = [];

  for (const item of items) {
    const price = Number(item.price);
    const qty = Number(item.quantity);
    const discount = Number(item.discount || 0);
    const effectivePrice = (price * qty - discount) / qty;

    if (item.brand === 'Momobuzz' && effectivePrice < MOMO_PRICE_FLOOR) {
      violations.push(
        `${item.name} effective price ₹${effectivePrice.toFixed(2)} is below ₹${MOMO_PRICE_FLOOR.toFixed(2)} per unit policy floor.`
      );
    }

    revenue += price * qty - discount;
    const cost = item.ingredient_cost_per_unit;
    if (cost === undefined || cost === null) {
      warnings.push(`Ingredient cost missing for ${item.name}.`);
    } else {
      ingredients += Number(cost) * qty;
    }

    lines.push({
      menu_item_id: item.id,
      name: item.name,
      quantity: qty,
      unit_price: price.toFixed(2),
      subtotal: (price * qty - discount).toFixed(2),
      ingredient_cost: cost !== undefined && cost !== null ? (Number(cost) * qty).toFixed(2) : null,
    });
  }

  const platformFee = (revenue * (Number(config.platform_commission_percent) || 0)) / 100;
  const delivery = deliveryCostOverride > 0 ? deliveryCostOverride : Number(config.delivery_cost) || 0;
  const other = Number(otherCost) || Number(config.other_order_cost) || 0;

  if (config.delivery_cost === null || config.delivery_cost === undefined) {
    warnings.push('Delivery cost is not configured.');
  }

  const complete = warnings.length === 0;
  const totalCost = ingredients + delivery + platformFee + other;
  const profit = revenue - totalCost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  if (config.minimum_contribution_profit !== null && profit < config.minimum_contribution_profit) {
    violations.push(
      `Contribution profit ₹${profit.toFixed(2)} is below configured minimum ₹${Number(config.minimum_contribution_profit).toFixed(2)}.`
    );
  }

  if (
    config.minimum_contribution_margin_percent !== null &&
    margin < config.minimum_contribution_margin_percent
  ) {
    violations.push(
      `Contribution margin ${margin.toFixed(1)}% is below configured minimum ${Number(config.minimum_contribution_margin_percent).toFixed(1)}%.`
    );
  }

  let status: 'approved' | 'blocked' | 'incomplete_costs' = 'approved';
  if (!complete) {
    status = 'incomplete_costs';
  } else if (violations.length > 0) {
    status = 'blocked';
  }

  return {
    items: lines,
    item_revenue: revenue.toFixed(2),
    ingredient_costs: ingredients.toFixed(2),
    delivery_cost: delivery.toFixed(2),
    platform_fee: platformFee.toFixed(2),
    other_costs: other.toFixed(2),
    known_costs_total: totalCost.toFixed(2),
    total_estimated_cost: complete ? totalCost.toFixed(2) : null,
    contribution_profit: complete ? profit.toFixed(2) : null,
    contribution_margin_percent: complete ? margin.toFixed(2) : null,
    costs_complete: complete,
    warnings,
    violations,
    status,
    policy: {
      minimum_contribution_profit:
        config.minimum_contribution_profit !== null ? config.minimum_contribution_profit.toFixed(2) : null,
      minimum_contribution_margin_percent:
        config.minimum_contribution_margin_percent !== null
          ? config.minimum_contribution_margin_percent.toFixed(2)
          : null,
    },
  };
}

/**
 * 3. Natural Language Order Text Parser
 * Parses input phrases like "2 veg momo 1 chicken hakka noodles fast"
 */
export function parseOrderText(
  text: string,
  menu: MenuItem[] = DEFAULT_MENU
): {
  items: Array<{
    validation: 'valid' | 'error';
    menu_item_id?: string;
    name?: string;
    quantity?: number;
    brand?: 'Momobuzz' | 'Woksum';
    station?: 'steamer' | 'wok';
    duration_minutes?: number;
    priority_note?: string | null;
    error?: string;
  }>;
  priority_note: string | null;
  valid: boolean;
} {
  let normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const isFast = /\b(fast|urgent|rush|asap)\b/i.test(normalized);
  const priorityNote = isFast ? 'fast' : null;

  let clean = normalized
    .replace(/\b(fast|urgent|rush|asap|please|and)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Create list of aliases sorted by length descending
  const aliasList: Array<{ alias: string; item: MenuItem }> = [];
  for (const m of menu) {
    for (const a of m.aliases) {
      aliasList.push({ alias: a.toLowerCase(), item: m });
    }
  }
  aliasList.sort((a, b) => b.alias.length - a.alias.length);

  const results: any[] = [];

  while (clean.length > 0) {
    let bestMatch: { start: number; end: number; item: MenuItem } | null = null;

    for (const { alias, item } of aliasList) {
      const regex = new RegExp(`(?<![a-z])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z])`, 'i');
      const match = regex.exec(clean);
      if (match) {
        if (!bestMatch || match.index < bestMatch.start) {
          bestMatch = {
            start: match.index,
            end: match.index + match[0].length,
            item,
          };
        }
      }
    }

    if (!bestMatch) {
      results.push({
        validation: 'error',
        error: `Could not identify '${clean}'. Please choose a dish from the menu.`,
      });
      break;
    }

    const prefix = clean.substring(0, bestMatch.start).trim();
    const numbers = prefix.match(/\b(\d+)\b/g);
    const qty = numbers ? parseInt(numbers[numbers.length - 1], 10) : 1;
    const item = bestMatch.item;

    if (qty > 50) {
      results.push({
        validation: 'error',
        error: 'Quantity must be between 1 and 50.',
      });
    } else {
      results.push({
        validation: 'valid',
        menu_item_id: item.id,
        name: item.name,
        quantity: qty,
        brand: item.brand,
        station: item.station,
        duration_minutes: item.duration_minutes,
        priority_note: priorityNote,
      });
    }

    clean = (clean.substring(0, bestMatch.start) + ' ' + clean.substring(bestMatch.end)).trim();
    clean = clean.replace(/\b\d+\b/g, ' ').replace(/\s+/g, ' ').trim();
  }

  if (results.length === 0) {
    results.push({
      validation: 'error',
      error: 'Enter a recognized dish, for example: 2 veg momo.',
    });
  }

  return {
    items: results,
    priority_note: priorityNote,
    valid: results.every((x) => x.validation === 'valid'),
  };
}

/**
 * 4. Cross-Order Batching Logic
 * Merges identical queued dishes across orders within arrival window.
 */
export function optimizeEligibleBatches(
  orders: Order[],
  windowMinutes = 3
): Array<{
  batch_id: string;
  menu_item_id: string;
  dish_name: string;
  station: 'steamer' | 'wok';
  orders: Array<{ order_id: string; quantity: number }>;
  total_quantity: number;
  planned_start: string;
  planned_finish: string;
}> {
  const eligibleBatches: any[] = [];
  const now = new Date();
  const windowMs = windowMinutes * 60 * 1000;

  // Group queued tasks by menu_item_id
  const byMenuItem: Record<string, Array<{ order_id: string; item: OrderItem; orderCreatedAt: Date }>> = {};

  for (const order of orders) {
    if (order.status !== 'queued' && order.status !== 'scheduled') continue;
    const orderTime = new Date(order.created_at);
    if (now.getTime() - orderTime.getTime() > windowMs) continue;

    for (const item of order.items) {
      if (item.batch_id) continue;
      if (!byMenuItem[item.menu_item_id]) {
        byMenuItem[item.menu_item_id] = [];
      }
      byMenuItem[item.menu_item_id].push({
        order_id: order.id,
        item,
        orderCreatedAt: orderTime,
      });
    }
  }

  for (const [menuItemId, group] of Object.entries(byMenuItem)) {
    // Unique by order
    const orderMap = new Map<string, typeof group[0]>();
    for (const entry of group) {
      if (!orderMap.has(entry.order_id)) {
        orderMap.set(entry.order_id, entry);
      }
    }

    const selected = Array.from(orderMap.values());
    if (selected.length < 2) continue;

    const first = selected[0].item;
    const batchId = `B-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const start = new Date();
    const finish = new Date(start.getTime() + first.duration_minutes * 60 * 1000);

    eligibleBatches.push({
      batch_id: batchId,
      menu_item_id: menuItemId,
      dish_name: first.name,
      station: first.station,
      orders: selected.map((s) => ({
        order_id: s.order_id,
        quantity: s.item.quantity,
      })),
      total_quantity: selected.reduce((acc, s) => acc + s.item.quantity, 0),
      planned_start: start.toISOString(),
      planned_finish: finish.toISOString(),
    });
  }

  return eligibleBatches;
}
