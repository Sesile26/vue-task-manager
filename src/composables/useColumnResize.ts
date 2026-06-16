import { ref, onScopeDispose } from 'vue'
import type { Ref } from 'vue'

export interface UseColumnResizeOptions {
  /** Minimum column width in px. Default 40. */
  minWidth?: number
}

export interface UseColumnResizeReturn<K extends string> {
  widths: Ref<Record<K, number>>
  /**
   * Call from a resizer handle's mousedown to begin dragging its border.
   * Accepts `undefined` and no-ops, so non-resizable columns can bind it
   * uniformly without a wrapper guard.
   */
  startResize: (colKey: K | undefined, event: MouseEvent) => void
}

/**
 * Column-resize logic: mousedown on a resizer → track mousemove → store the
 * new width. `K` is the union of column keys; widths are keyed by it.
 */
export function useColumnResize<K extends string>(
  initialWidths: Record<K, number>,
  options: UseColumnResizeOptions = {},
): UseColumnResizeReturn<K> {
  const minWidth = options.minWidth ?? 40
  const widths = ref<Record<K, number>>({ ...initialWidths }) as Ref<Record<K, number>>

  let activeMove: ((e: MouseEvent) => void) | null = null
  let activeUp: (() => void) | null = null

  function cleanup(): void {
    if (activeMove) window.removeEventListener('mousemove', activeMove)
    if (activeUp) window.removeEventListener('mouseup', activeUp)
    activeMove = null
    activeUp = null
  }

  function startResize(colKey: K | undefined, event: MouseEvent): void {
    if (colKey === undefined) return
    event.preventDefault()
    const startX = event.clientX
    const startWidth = widths.value[colKey] ?? minWidth

    const onMove = (e: MouseEvent): void => {
      const next = startWidth + (e.clientX - startX)
      // Mutate the reactive object directly — instant, no spread typing churn.
      widths.value[colKey] = Math.max(minWidth, next)
    }
    const onUp = (): void => cleanup()

    activeMove = onMove
    activeUp = onUp
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  onScopeDispose(cleanup)

  return { widths, startResize }
}
