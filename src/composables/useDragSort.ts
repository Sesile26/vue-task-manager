import { ref, watch, toValue } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'

export interface UseDragSortReturn<T> {
  /**
   * Writable mirror of `source` to bind to BOTH `<VueDraggable v-model>` and
   * the `v-for`, so the library reorders exactly what is rendered.
   */
  list: Ref<T[]>
  /** Pass to `<VueDraggable @end>`: reports the new id order to `onReorder`. */
  onEnd: () => void
}

/**
 * Drag-to-reorder glue for a single vertical list built on the `<VueDraggable>`
 * component. It owns the DnD wiring so components stay declarative:
 *  - keeps a local mirror (`list`) re-synced from `source` (sorted/filtered
 *    rows) whenever it changes — deep, because the store rewrites `order` in
 *    place without changing array identity;
 *  - on drop, hands the new flat id sequence to `onReorder` (which persists it,
 *    e.g. the tasks store's `reorderTasks`).
 *
 * It deliberately does NOT touch data/order itself — the store remains the
 * single source of truth and decides how ids map back to `order`.
 */
export function useDragSort<T extends { id: number }>(
  source: MaybeRefOrGetter<T[]>,
  onReorder: (orderedIds: number[]) => void,
): UseDragSortReturn<T> {
  const list = ref<T[]>([]) as Ref<T[]>

  watch(
    () => toValue(source),
    (value) => {
      list.value = [...value]
    },
    { immediate: true, deep: true },
  )

  function onEnd(): void {
    onReorder(list.value.map((item) => item.id))
  }

  return { list, onEnd }
}
