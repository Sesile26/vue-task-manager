<script setup lang="ts" generic="T extends string | number">
import { ref, computed } from 'vue'
import { IconChevronDown, IconCheck } from '@/components/icons'

export interface DropdownOption<V> {
  value: V
  label: string
}

const props = defineProps<{
  options: readonly DropdownOption<T>[]
  placeholder?: string
  align?: 'left' | 'right'
  ariaLabel?: string
}>()

// Custom dropdown (not a native <select>) — typed via the component generic `T`.
const model = defineModel<T>({ required: true })

const open = ref(false)

const selectedLabel = computed(
  () => props.options.find((o) => o.value === model.value)?.label ?? props.placeholder ?? '',
)

function toggle(): void {
  open.value = !open.value
}

function close(): void {
  open.value = false
}

function select(value: T): void {
  model.value = value
  close()
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
}
</script>

<template>
  <div
    class="dropdown"
    @keydown="onKeydown"
  >
    <button
      type="button"
      class="dropdown__trigger"
      :aria-label="ariaLabel"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <span
        v-if="$slots.icon"
        class="dropdown__lead"
      >
        <slot name="icon" />
      </span>
      <span class="dropdown__value">{{ selectedLabel }}</span>
      <IconChevronDown
        class="dropdown__chevron"
        width="15"
        height="15"
      />
    </button>

    <template v-if="open">
      <div
        class="dropdown__scrim"
        @click="close"
      />
      <ul
        class="dropdown__menu"
        :class="`dropdown__menu--${align ?? 'left'}`"
        role="listbox"
      >
        <li
          v-for="option in options"
          :key="String(option.value)"
          role="none"
        >
          <button
            type="button"
            class="dropdown__item"
            role="option"
            :aria-selected="option.value === model"
            @click="select(option.value)"
          >
            <slot
              name="option"
              :option="option"
            >
              <span>{{ option.label }}</span>
            </slot>
            <IconCheck
              v-if="option.value === model"
              class="dropdown__check"
              width="15"
              height="15"
            />
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped lang="scss">
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dropdown {
  position: relative;
  display: inline-block;

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    height: 40px;
    padding: 0 13px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-family: inherit;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;

    &:hover {
      background: var(--surface-2);
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
  }

  &__lead {
    display: inline-flex;
    color: var(--text-secondary);
  }

  &__value {
    white-space: nowrap;
  }

  &__chevron {
    color: var(--text-tertiary);
  }

  &__scrim {
    position: fixed;
    inset: 0;
    z-index: 40;
  }

  &__menu {
    position: absolute;
    top: 46px;
    z-index: 41;
    min-width: 190px;
    margin: 0;
    padding: 6px;
    list-style: none;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    animation: fade-in 0.12s ease;

    &--left {
      left: 0;
    }

    &--right {
      right: 0;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    padding: 9px 10px;
    border: none;
    border-radius: 7px;
    background: none;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    transition: background 0.12s;

    &:hover {
      background: var(--surface-2);
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: -2px;
    }
  }

  &__check {
    flex-shrink: 0;
    color: var(--accent-fg);
  }
}
</style>
