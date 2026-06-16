import type { SortOrder } from '@/composables'

/**
 * aria-sort value for a single column header. Pass `active` already resolved
 * (e.g. `sortKey === column.sortKey && column.sortKey !== null`) so the helper
 * stays free of column-shape assumptions.
 */
export function ariaSort(active: boolean, order: SortOrder): 'ascending' | 'descending' | 'none' {
  if (!active) return 'none'
  return order === 'asc' ? 'ascending' : 'descending'
}
