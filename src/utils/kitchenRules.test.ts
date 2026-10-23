import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scheduleOrder,
  calculateProfitability,
  parseOrderText,
  DEFAULT_CONFIG,
  MOMO_PRICE_FLOOR,
} from './kitchenRules';

test('Order scheduling aligns steamer and wok to simultaneous finish target', () => {
  const baseTime = new Date('2026-10-23T12:00:00Z');
  const items = [
    { menu_item_id: 'veg-momo', name: 'Steamed Veg Momos', station: 'steamer' as const, quantity: 1, duration_minutes: 10 },
    { menu_item_id: 'hakka-noodles', name: 'Chicken Hakka Noodles', station: 'wok' as const, quantity: 1, duration_minutes: 3 },
  ];

  const schedule = scheduleOrder(items, baseTime);

  assert.equal(schedule.tasks.length, 2);
  assert.equal(schedule.sync_success, true, 'Dual brand items must synchronize within 2 min target');
  assert.ok(schedule.sync_deviation_minutes <= 2, 'Finish times should deviate by <= 2 min');

  const steamerTask = schedule.tasks.find((t) => t.station === 'steamer')!;
  const wokTask = schedule.tasks.find((t) => t.station === 'wok')!;

  // Steamer starts at T+0, finishes at T+10
  // Wok starts at T+7, finishes at T+10
  const steamerStart = new Date(steamerTask.planned_start).getTime();
  const wokStart = new Date(wokTask.planned_start).getTime();
  const steamerFinish = new Date(steamerTask.planned_finish).getTime();
  const wokFinish = new Date(wokTask.planned_finish).getTime();

  assert.ok(wokStart > steamerStart, 'Wok task should start later than slower steamer task');
  assert.equal(steamerFinish, wokFinish, 'Both dishes should finish at identical time when idle');
});

test('Momobuzz price floor of ₹69.00 is strictly enforced', () => {
  const violatingItems = [
    {
      id: 'veg-momo',
      name: 'Steamed Veg Momos',
      brand: 'Momobuzz' as const,
      price: 65,
      quantity: 1,
      ingredient_cost_per_unit: 42,
    },
  ];

  const report = calculateProfitability(violatingItems, DEFAULT_CONFIG);
  assert.equal(report.status, 'blocked');
  assert.ok(
    report.violations.some((v) => v.includes('below ₹69.00 per unit policy floor')),
    'Must report violation when Momobuzz price is below ₹69'
  );

  const compliantItems = [
    {
      id: 'veg-momo',
      name: 'Steamed Veg Momos',
      brand: 'Momobuzz' as const,
      price: 129,
      quantity: 1,
      ingredient_cost_per_unit: 42,
    },
  ];

  const compliantReport = calculateProfitability(compliantItems, DEFAULT_CONFIG);
  assert.equal(compliantReport.status, 'approved');
  assert.equal(compliantReport.violations.length, 0);
  assert.ok(Number(compliantReport.contribution_profit) > 0);
});

test('Text parser extracts quantities, dishes and priority notes', () => {
  const result = parseOrderText('2 veg momo 1 chicken hakka noodles fast');

  assert.equal(result.valid, true);
  assert.equal(result.priority_note, 'fast');
  assert.equal(result.items.length, 2);

  const momoItem = result.items.find((i) => i.name === 'Steamed Veg Momos');
  const noodlesItem = result.items.find((i) => i.name === 'Chicken Hakka Noodles');

  assert.ok(momoItem, 'Parsed veg momo');
  assert.equal(momoItem?.quantity, 2);
  assert.equal(momoItem?.brand, 'Momobuzz');
  assert.equal(momoItem?.station, 'steamer');

  assert.ok(noodlesItem, 'Parsed hakka noodles');
  assert.equal(noodlesItem?.quantity, 1);
  assert.equal(noodlesItem?.brand, 'Woksum');
  assert.equal(noodlesItem?.station, 'wok');
});

test('Text parser gracefully handles invalid dishes', () => {
  const result = parseOrderText('5 mystery tacos');
  assert.equal(result.valid, false);
  assert.ok(result.items[0].error?.includes('Could not identify'));
});
