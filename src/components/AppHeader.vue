<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useTheme } from '@/composables'
import { IconLogo, IconMoon, IconSun } from '@/components/icons'

const { theme, isDark, toggleTheme } = useTheme()
</script>

<template>
  <header class="app-header">
    <RouterLink
      to="/"
      class="app-header__brand"
    >
      <span
        class="app-header__logo"
        aria-hidden="true"
      >
        <IconLogo
          width="18"
          height="18"
        />
      </span>
      <span class="app-header__name">Tasker</span>
    </RouterLink>

    <button
      type="button"
      class="app-header__theme"
      :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
      :aria-pressed="isDark"
      :title="theme === 'dark' ? 'Dark theme' : 'Light theme'"
      @click="toggleTheme"
    >
      <IconMoon
        v-if="isDark"
        width="17"
        height="17"
      />
      <IconSun
        v-else
        width="17"
        height="17"
      />
    </button>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 14px 32px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);

  &__brand {
    display: flex;
    align-items: center;
    gap: 11px;
    text-decoration: none;

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
      border-radius: 6px;
    }
  }

  &__logo {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: var(--accent);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__name {
    font-weight: 700;
    font-size: 16px;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  &__theme {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-secondary);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: var(--surface-2);
      color: var(--text);
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
  }
}
</style>
