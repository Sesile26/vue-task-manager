<script setup lang="ts">
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon'
export type ButtonSize = 'md' | 'sm'

withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
  },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
  >
    <!-- Leading icon for text buttons; for variant="icon" put the icon in the default slot. -->
    <span
      v-if="$slots.icon"
      class="btn__icon"
    >
      <slot name="icon" />
    </span>
    <slot />
  </button>
</template>

<style scoped lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease,
    transform 0.05s ease;

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    transform: translateY(1px);
  }

  &__icon {
    display: inline-flex;
  }
}

.btn--md {
  height: 40px;
  padding: 0 18px;
  font-size: 14px;
}

.btn--sm {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
}

.btn--primary {
  background: var(--accent);
  color: #fff;
  box-shadow: var(--shadow);

  &:not(:disabled):hover {
    background: var(--accent-hover);
  }
}

.btn--secondary {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border);
  box-shadow: var(--shadow);

  &:not(:disabled):hover {
    background: var(--surface-2);
  }
}

.btn--ghost {
  background: transparent;
  color: var(--accent-fg);

  &:not(:disabled):hover {
    background: var(--accent-soft);
  }
}

.btn--danger {
  background: var(--error);
  color: #fff;
  box-shadow: var(--shadow);

  &:not(:disabled):hover {
    background: var(--error-hover);
  }
}

.btn--icon {
  padding: 0;
  background: var(--surface);
  color: var(--text-secondary);
  border-color: var(--border);
  box-shadow: var(--shadow);

  &:not(:disabled):hover {
    background: var(--surface-2);
    color: var(--text);
  }

  &.btn--md {
    width: 40px;
  }

  &.btn--sm {
    width: 32px;
  }
}
</style>
