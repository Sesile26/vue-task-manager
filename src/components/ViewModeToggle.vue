<script lang="ts">
export type ViewMode = 'table' | 'kanban'
</script>

<script setup lang="ts">
import { IconRows, IconColumns } from '@/components/icons'

const mode = defineModel<ViewMode>({ required: true })

const options: { value: ViewMode; label: string }[] = [
  { value: 'table', label: 'Таблиця' },
  { value: 'kanban', label: 'Канбан' },
]
</script>

<template>
  <div
    class="toggle"
    role="group"
    aria-label="Режим перегляду"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="toggle__btn"
      :class="{ 'toggle__btn--active': mode === option.value }"
      :aria-pressed="mode === option.value"
      @click="mode = option.value"
    >
      <IconRows
        v-if="option.value === 'table'"
        width="15"
        height="15"
      />
      <IconColumns
        v-else
        width="15"
        height="15"
      />
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 32px;
    padding: 0 14px;
    border: none;
    border-radius: 7px;
    background: transparent;
    color: var(--text-secondary);
    font-family: inherit;
    font-weight: 600;
    font-size: 13.5px;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;

    &:hover {
      color: var(--text);
    }

    &--active {
      background: var(--surface);
      color: var(--text);
      box-shadow: var(--shadow);
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
  }
}
</style>
