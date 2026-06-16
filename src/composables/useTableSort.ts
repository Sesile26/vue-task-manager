import { ref, computed, toValue } from 'vue'
import type { MaybeRefOrGetter, Ref, ComputedRef } from 'vue'

export type SortOrder = 'asc' | 'desc'

/** Type-agnostic comparator: numbers, booleans, nullish, fallback to string. */
function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0
  if (a === null || a === undefined) return -1
  if (b === null || b === undefined) return 1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return String(a).localeCompare(String(b))
}

export interface UseTableSortReturn<T> {
  sorted: ComputedRef<T[]>
  sortKey: Ref<keyof T | null>
  sortOrder: Ref<SortOrder>
  /** Three-state cycle on the same column: inactive → asc → desc → manual. */
  sortBy: (key: keyof T) => void
}

export interface UseTableSortOptions<T> {
  /** Initial sort key when no external `sortKey` ref is supplied. */
  defaultKey?: keyof T
  /**
   * The "manual" state a three-state cycle returns to after desc (e.g. an
   * `order` key for a drag-sortable list). Defaults to `null` (no sort).
   */
  manualKey?: keyof T
  /** External (e.g. persisted) refs to drive/observe the sort state. */
  sortKey?: Ref<keyof T | null>
  sortOrder?: Ref<SortOrder>
}

/**
 * Generic table sorting by any key of `T`. `items` may be a ref/getter or a
 * plain array. Clicking a header (`sortBy`) cycles three states:
 * inactive → asc → desc → manual (`manualKey`, or unsorted).
 *
 * Pass `sortKey`/`sortOrder` refs (e.g. from usePersistedRef) to persist state.
 */
export function useTableSort<T>(
  items: MaybeRefOrGetter<T[]>,
  options: UseTableSortOptions<T> = {},
): UseTableSortReturn<T> {
  const manualKey = options.manualKey ?? null
  const sortKey =
    options.sortKey ??
    (ref<keyof T | null>(options.defaultKey ?? manualKey) as Ref<keyof T | null>)
  const sortOrder = options.sortOrder ?? ref<SortOrder>('asc')

  function sortBy(key: keyof T): void {
    if (sortKey.value !== key) {
      sortKey.value = key
      sortOrder.value = 'asc'
    } else if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc'
    } else {
      // desc → back to the manual / unsorted state.
      sortKey.value = manualKey
      sortOrder.value = 'asc'
    }
  }

  const sorted = computed<T[]>(() => {
    const list = [...toValue(items)]
    const key = sortKey.value
    if (key === null) return list
    const direction = sortOrder.value === 'asc' ? 1 : -1
    return list.sort((a, b) => compareValues(a[key], b[key]) * direction)
  })

  return { sorted, sortKey, sortOrder, sortBy }
}
