import { ref, watch, toValue } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'

export interface UseKanbanDragReturn<S extends string, T> {
  /** Writable mirror for one column — bind to its `<VueDraggable>` + `v-for`. */
  listFor: (status: S) => Ref<T[]>
  /** The `<VueDraggable @update:model-value>` setter (the lib's optimistic half). */
  setList: (status: S, list: T[]) => void
  /** Pass to each column's `<VueDraggable @end>`: reports the full layout. */
  onEnd: () => void
}

/**
 * Drag-and-drop glue for a multi-column kanban board built on `<VueDraggable>`.
 * The single source of truth stays in the store; this composable only:
 *  - mirrors `source` into one writable list per `statuses` column (filtered by
 *    status, ordered by `order`) and keeps it in sync (deep — the store mutates
 *    `order`/`status` in place);
 *  - on any column drop, reports the actual layout (column → id sequence) to
 *    `onChange`, which persists it (e.g. the tasks store's `syncBoard`).
 *
 * It never derives status/order itself — that's the store's job, so table and
 * board stay reconciled in both directions.
 */
export function useKanbanDrag<S extends string, T extends { id: number; status: S; order: number }>(
  source: MaybeRefOrGetter<T[]>,
  statuses: readonly S[],
  onChange: (layout: Record<S, number[]>) => void,
): UseKanbanDragReturn<S, T> {
  const byOrder = (a: T, b: T): number => a.order - b.order

  const lists = {} as Record<S, Ref<T[]>>
  for (const status of statuses) {
    lists[status] = ref<T[]>([]) as Ref<T[]>
  }

  watch(
    () => toValue(source),
    (items) => {
      for (const status of statuses) {
        lists[status].value = items.filter((item) => item.status === status).slice().sort(byOrder)
      }
    },
    { immediate: true, deep: true },
  )

  function listFor(status: S): Ref<T[]> {
    return lists[status]
  }

  function setList(status: S, list: T[]): void {
    lists[status].value = list
  }

  function onEnd(): void {
    const layout = {} as Record<S, number[]>
    for (const status of statuses) {
      layout[status] = lists[status].value.map((item) => item.id)
    }
    onChange(layout)
  }

  return { listFor, setList, onEnd }
}
