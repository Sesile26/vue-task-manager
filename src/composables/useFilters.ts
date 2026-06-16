import { ref, computed, toValue } from 'vue'
import type { MaybeRefOrGetter, Ref, ComputedRef } from 'vue'

/** Keys of `T` whose value is assignable to `V`. */
export type KeyOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

/**
 * A reusable exact-match filter over one field of `T`. `test(item)` reads the
 * reactive selection inside the consuming computed, so filtering re-runs when
 * the selection changes. Build instances with `choiceFilter` (below) so the
 * sentinel/null semantics live here, not in components.
 */
export interface FilterSpec<T> {
  test: (item: T) => boolean
}

export interface ChoiceFilterOptions<V> {
  /** Selection value meaning "no filter / show all". */
  all: V
  /** Optional selection value meaning "match items whose field is `null`". */
  none?: V
}

/**
 * An exact-match (optionally tri-state) filter over `item[key]`:
 *  - selection === `all`  → matches everything (no filtering);
 *  - selection === `none` → matches items where `item[key]` is `null`;
 *  - otherwise            → matches `item[key] === selection`.
 *
 * Covers both a nullable enum filter (`all: null`) and a sentinel-driven
 * "unassigned" choice (`all: 'all', none: 'none'`) without per-component code.
 */
export function choiceFilter<T, V>(
  key: keyof T,
  selected: Ref<V>,
  options: ChoiceFilterOptions<V>,
): FilterSpec<T> {
  return {
    test: (item: T): boolean => {
      const value = selected.value
      if (value === options.all) return true
      const field = item[key] as unknown
      if (options.none !== undefined && value === options.none) return field === null
      return field === (value as unknown)
    },
  }
}

export interface UseFiltersOptions<T> {
  /** Field to run the text search against (a string or string|null field). */
  searchKey?: KeyOfType<T, string | null>
  /** External (e.g. URL-bound) search model. */
  search?: Ref<string>
  /** Exact-match filters applied in order (all must pass). */
  filters?: FilterSpec<T>[]
}

export interface UseFiltersReturn<T> {
  filtered: ComputedRef<T[]>
}

/**
 * Generic list filtering: an optional case-insensitive text search over one
 * string field, plus any number of exact-match `FilterSpec`s (build them with
 * `choiceFilter`). Returns the filtered list; the selection models stay owned
 * by the caller (so they can be bound to inputs / the URL).
 */
export function useFilters<T>(
  items: MaybeRefOrGetter<T[]>,
  options: UseFiltersOptions<T> = {},
): UseFiltersReturn<T> {
  const search = options.search ?? ref('')
  const filters = options.filters ?? []

  const filtered = computed<T[]>(() => {
    const list = toValue(items)
    const query = search.value.trim().toLowerCase()
    const searchKey = options.searchKey

    return list.filter((item) => {
      if (query !== '' && searchKey !== undefined) {
        const raw = item[searchKey]
        const haystack = raw === null || raw === undefined ? '' : String(raw)
        if (!haystack.toLowerCase().includes(query)) return false
      }
      for (const filter of filters) {
        if (!filter.test(item)) return false
      }
      return true
    })
  })

  return { filtered }
}
