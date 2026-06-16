import { ref, watch } from 'vue'
import type { Ref } from 'vue'

function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/**
 * A `ref<T>` that mirrors to localStorage under `key`. Reads the persisted
 * value on init (falling back to `defaultValue`) and writes on every change.
 * Handy for remembering the selected view mode or filter selections.
 */
export function usePersistedRef<T>(key: string, defaultValue: T): Ref<T> {
  const stored = localStorage.getItem(key)
  const initial = stored !== null ? safeParse<T>(stored, defaultValue) : defaultValue
  const state = ref<T>(initial) as Ref<T>

  watch(
    state,
    (value) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    { deep: true },
  )

  return state
}
