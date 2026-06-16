import { ref, computed, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function readInitial(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' || stored === 'light' ? stored : 'light'
}

// Singleton state so every component shares one theme.
const theme = ref<Theme>(readInitial())

function apply(value: Theme): void {
  document.documentElement.dataset.theme = value
  localStorage.setItem(STORAGE_KEY, value)
}

apply(theme.value)
watch(theme, apply)

export interface UseThemeReturn {
  theme: Ref<Theme>
  isDark: ComputedRef<boolean>
  toggleTheme: () => void
  setTheme: (value: Theme) => void
}

export function useTheme(): UseThemeReturn {
  return {
    theme,
    isDark: computed(() => theme.value === 'dark'),
    toggleTheme: () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark'
    },
    setTheme: (value: Theme) => {
      theme.value = value
    },
  }
}
