import {
  MenuItem,
  Task,
  Order,
  AppConfig,
  DEFAULT_MENU,
  DEFAULT_CONFIG,
  scheduleOrder,
  calculateProfitability,
  parseOrderText,
  optimizeEligibleBatches,
} from '../utils/kitchenRules';

export interface Branch {
  id: string;
  name: string;
  city: string;
  capacity_per_day: number;
  is_open: boolean;
  review_status: string;
}

export interface BatchRecord {
  id: string;
  menu_item_id: string;
  dish_name: string;
  station: 'steamer' | 'wok';
  created_at: string;
  planned_start: string;
  planned_finish: string;
  status: 'queued' | 'active' | 'completed';
  orders: Array<{ order_id: string; quantity: number }>;
  total_quantity: number;
}

const STORAGE_KEY = 'kitchensync_state_v1';

export function getInitialDemoOrders(): Order[] {
  const now = new Date();
  const baseTime = new Date(now.getTime() - 45 * 60 * 1000); // 45 mins ago

  return [
    {
      id: 'DEMO-101',
      branch_id: 'bhanwarkuan',
      created_at: new Date(baseTime.getTime() + 5 * 60 * 1000).toISOString(),
      status: 'completed',
      estimated_minutes: 13,
      sync_deviation: 0,
      sync_success: true,
      completed_at: new Date(baseTime.getTime() + 18 * 60 * 1000).toISOString(),
      items: [
        {
          id: 'DEMO-101-I1',
          order_id: 'DEMO-101',
          menu_item_id: 'veg-momo',
          name: 'Steamed Veg Momos',
          brand: 'Momobuzz',
          station: 'steamer',
          quantity: 2,
          unit_price: 129,
          duration_minutes: 10,
          ingredient_cost_per_unit: 42,
        },
        {
          id: 'DEMO-101-I2',
          order_id: 'DEMO-101',
          menu_item_id: 'hakka-noodles',
          name: 'Chicken Hakka Noodles',
          brand: 'Woksum',
          station: 'wok',
          quantity: 1,
          unit_price: 219,
          duration_minutes: 3,
          ingredient_cost_per_unit: 86,
        },
      ],
      tasks: [
        {
          id: 'DEMO-101-T1',
          order_id: 'DEMO-101',
          station: 'steamer',
          status: 'completed',
          planned_start: new Date(baseTime.getTime() + 5 * 60 * 1000).toISOString(),
          planned_finish: new Date(baseTime.getTime() + 15 * 60 * 1000).toISOString(),
          actual_start: new Date(baseTime.getTime() + 5 * 60 * 1000).toISOString(),
          actual_finish: new Date(baseTime.getTime() + 15 * 60 * 1000).toISOString(),
          item_summary: '2 × Steamed Veg Momos',
        },
        {
          id: 'DEMO-101-T2',
          order_id: 'DEMO-101',
          station: 'wok',
          status: 'completed',
          planned_start: new Date(baseTime.getTime() + 12 * 60 * 1000).toISOString(),
          planned_finish: new Date(baseTime.getTime() + 15 * 60 * 1000).toISOString(),
          actual_start: new Date(baseTime.getTime() + 12 * 60 * 1000).toISOString(),
          actual_finish: new Date(baseTime.getTime() + 15 * 60 * 1000).toISOString(),
          item_summary: '1 × Chicken Hakka Noodles',
        },
      ],
      item_revenue: '477.00',
      contribution_profit: '232.60',
    },
    {
      id: 'DEMO-102',
      branch_id: 'bhanwarkuan',
      created_at: new Date(baseTime.getTime() + 12 * 60 * 1000).toISOString(),
      status: 'completed',
      estimated_minutes: 11,
      sync_deviation: 1,
      sync_success: true,
      completed_at: new Date(baseTime.getTime() + 24 * 60 * 1000).toISOString(),
      items: [
        {
          id: 'DEMO-102-I1',
          order_id: 'DEMO-102',
          menu_item_id: 'veg-momo',
          name: 'Steamed Veg Momos',
          brand: 'Momobuzz',
          station: 'steamer',
          quantity: 1,
          unit_price: 129,
          duration_minutes: 10,
          ingredient_cost_per_unit: 42,
        },
        {
          id: 'DEMO-102-I2',
          order_id: 'DEMO-102',
          menu_item_id: 'veg-fried-rice',
          name: 'Veg Fried Rice',
          brand: 'Woksum',
          station: 'wok',
          quantity: 1,
          unit_price: 189,
          duration_minutes: 3,
          ingredient_cost_per_unit: 67,
        },
      ],
      tasks: [
        {
          id: 'DEMO-102-T1',
          order_id: 'DEMO-102',
          station: 'steamer',
          status: 'completed',
          planned_start: new Date(baseTime.getTime() + 13 * 60 * 1000).toISOString(),
          planned_finish: new Date(baseTime.getTime() + 23 * 60 * 1000).toISOString(),
          actual_start: new Date(baseTime.getTime() + 13 * 60 * 1000).toISOString(),
          actual_finish: new Date(baseTime.getTime() + 23 * 60 * 1000).toISOString(),
          item_summary: '1 × Steamed Veg Momos',
        },
        {
          id: 'DEMO-102-T2',
          order_id: 'DEMO-102',
          station: 'wok',
          status: 'completed',
          planned_start: new Date(baseTime.getTime() + 20 * 60 * 1000).toISOString(),
          planned_finish: new Date(baseTime.getTime() + 23 * 60 * 1000).toISOString(),
          actual_start: new Date(baseTime.getTime() + 20 * 60 * 1000).toISOString(),
          actual_finish: new Date(baseTime.getTime() + 23 * 60 * 1000).toISOString(),
          item_summary: '1 × Veg Fried Rice',
        },
      ],
      item_revenue: '318.00',
      contribution_profit: '122.40',
    },
    {
      id: 'DEMO-103',
      branch_id: 'jabalpur',
      created_at: new Date(baseTime.getTime() + 20 * 60 * 1000).toISOString(),
      status: 'completed',
      estimated_minutes: 10,
      sync_deviation: 0,
      sync_success: true,
      completed_at: new Date(baseTime.getTime() + 31 * 60 * 1000).toISOString(),
      items: [
        {
          id: 'DEMO-103-I1',
          order_id: 'DEMO-103',
          menu_item_id: 'chicken-momo',
          name: 'Chicken Momos',
          brand: 'Momobuzz',
          station: 'steamer',
          quantity: 2,
          unit_price: 159,
          duration_minutes: 10,
          ingredient_cost_per_unit: 57,
        },
      ],
      tasks: [
        {
          id: 'DEMO-103-T1',
          order_id: 'DEMO-103',
          station: 'steamer',
          status: 'completed',
          planned_start: new Date(baseTime.getTime() + 21 * 60 * 1000).toISOString(),
          planned_finish: new Date(baseTime.getTime() + 31 * 60 * 1000).toISOString(),
          actual_start: new Date(baseTime.getTime() + 21 * 60 * 1000).toISOString(),
          actual_finish: new Date(baseTime.getTime() + 31 * 60 * 1000).toISOString(),
          item_summary: '2 × Chicken Momos',
        },
      ],
      item_revenue: '318.00',
      contribution_profit: '129.40',
    },
    {
      id: 'ORD-701',
      branch_id: 'bhanwarkuan',
      created_at: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
      status: 'cooking',
      estimated_minutes: 10,
      sync_deviation: 0,
      sync_success: true,
      items: [
        {
          id: 'ORD-701-I1',
          order_id: 'ORD-701',
          menu_item_id: 'veg-momo',
          name: 'Steamed Veg Momos',
          brand: 'Momobuzz',
          station: 'steamer',
          quantity: 2,
          unit_price: 129,
          duration_minutes: 10,
          ingredient_cost_per_unit: 42,
        },
        {
          id: 'ORD-701-I2',
          order_id: 'ORD-701',
          menu_item_id: 'hakka-noodles',
          name: 'Chicken Hakka Noodles',
          brand: 'Woksum',
          station: 'wok',
          quantity: 1,
          unit_price: 219,
          duration_minutes: 3,
          ingredient_cost_per_unit: 86,
        },
      ],
      tasks: [
        {
          id: 'ORD-701-T1',
          order_id: 'ORD-701',
          station: 'steamer',
          status: 'active',
          planned_start: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
          planned_finish: new Date(now.getTime() + 6 * 60 * 1000).toISOString(),
          actual_start: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
          item_summary: '2 × Steamed Veg Momos',
        },
        {
          id: 'ORD-701-T2',
          order_id: 'ORD-701',
          station: 'wok',
          status: 'queued',
          planned_start: new Date(now.getTime() + 3 * 60 * 1000).toISOString(),
          planned_finish: new Date(now.getTime() + 6 * 60 * 1000).toISOString(),
          item_summary: '1 × Chicken Hakka Noodles',
        },
      ],
      item_revenue: '477.00',
      contribution_profit: '232.60',
    },
    {
      id: 'ORD-702',
      branch_id: 'bhanwarkuan',
      created_at: new Date(now.getTime() - 1 * 60 * 1000).toISOString(),
      status: 'queued',
      estimated_minutes: 10,
      sync_deviation: 0,
      sync_success: true,
      items: [
        {
          id: 'ORD-702-I1',
          order_id: 'ORD-702',
          menu_item_id: 'veg-momo',
          name: 'Steamed Veg Momos',
          brand: 'Momobuzz',
          station: 'steamer',
          quantity: 1,
          unit_price: 129,
          duration_minutes: 10,
          ingredient_cost_per_unit: 42,
        },
      ],
      tasks: [
        {
          id: 'ORD-702-T1',
          order_id: 'ORD-702',
          station: 'steamer',
          status: 'queued',
          planned_start: new Date(now.getTime() + 6 * 60 * 1000).toISOString(),
          planned_finish: new Date(now.getTime() + 16 * 60 * 1000).toISOString(),
          item_summary: '1 × Steamed Veg Momos',
        },
      ],
      item_revenue: '129.00',
      contribution_profit: '44.20',
    },
  ];
}

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'bhanwarkuan',
    name: 'Bhanwarkuan Flagship',
    city: 'Indore',
    capacity_per_day: 80,
    is_open: true,
    review_status: 'Open',
  },
  {
    id: 'jabalpur',
    name: 'Jabalpur Station Road',
    city: 'Jabalpur',
    capacity_per_day: 60,
    is_open: true,
    review_status: 'Review / Consolidation Decision Required',
  },
];
