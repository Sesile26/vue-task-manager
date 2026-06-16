import { reactive, readonly } from 'vue'
import type { DeepReadonly } from 'vue'

export type ToastType = 'success' | 'error'

export interface Toast {
  id: number
  type: ToastType
  title: string
  description?: string
}

export interface UseToastReturn {
  toasts: DeepReadonly<Toast[]>
  success: (title: string, description?: string) => number
  error: (title: string, description?: string) => number
  dismiss: (id: number) => void
}

// Module-level singleton queue so toasts are global and survive unmounts —
// stores and components share this one list.
const toasts = reactive<Toast[]>([])
let nextId = 0
const DURATION = 3400

function dismiss(id: number): void {
  const index = toasts.findIndex((t) => t.id === id)
  if (index !== -1) toasts.splice(index, 1)
}

function push(type: ToastType, title: string, description?: string): number {
  const id = nextId++
  toasts.push({ id, type, title, description })
  window.setTimeout(() => dismiss(id), DURATION)
  return id
}

/** Toast notifications. Use anywhere — the state is a shared singleton. */
export function useToast(): UseToastReturn {
  return {
    toasts: readonly(toasts),
    success: (title, description) => push('success', title, description),
    error: (title, description) => push('error', title, description),
    dismiss,
  }
}
