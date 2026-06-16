import { computed, type Ref, type WritableComputedRef } from 'vue'

/**
 * Bridge a nullable enum-like ref to a non-null dropdown model:
 * `null` ⇄ `allValue` (default `'all'`). Reading returns the all-sentinel when
 * the source is `null`; writing the sentinel resets the source to `null`.
 *
 * Works for any string enum (ProjectStatus, TaskStatus, …) — the dropdown
 * binds to the returned WritableComputedRef, the underlying filter stays nullable.
 */
export function useNullableSelect<T extends string, A extends string = 'all'>(
  source: Ref<T | null>,
  allValue: A = 'all' as A,
): WritableComputedRef<T | A> {
  return computed<T | A>({
    get: () => source.value ?? allValue,
    set: (value) => {
      source.value = value === allValue ? null : (value as T)
    },
  })
}
