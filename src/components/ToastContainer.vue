<script setup lang="ts">
import { useToast } from '@/composables'
import { IconCheck, IconAlertCircle, IconClose } from '@/components/icons'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div
    class="toasts"
    aria-live="polite"
    aria-atomic="false"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        role="status"
      >
        <span class="toast__icon">
          <IconCheck
            v-if="toast.type === 'success'"
            width="17"
            height="17"
          />
          <IconAlertCircle
            v-else
            width="17"
            height="17"
            stroke-width="2.2"
          />
        </span>

        <div class="toast__body">
          <span class="toast__title">{{ toast.title }}</span>
          <span
            v-if="toast.description"
            class="toast__desc"
          >{{ toast.description }}</span>
        </div>

        <button
          type="button"
          class="toast__close"
          aria-label="Закрити сповіщення"
          @click="dismiss(toast.id)"
        >
          <IconClose
            width="16"
            height="16"
          />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss">
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.toasts {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 332px;
  max-width: calc(100vw - 48px);
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px 14px 15px;
  border-radius: 11px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: 8px;
  }

  &--success &__icon {
    background: color-mix(in srgb, var(--success) 16%, var(--surface));
    color: var(--success);
  }

  &--error &__icon {
    background: color-mix(in srgb, var(--error) 16%, var(--surface));
    color: var(--error);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    padding-top: 1px;
    min-width: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }

  &__desc {
    font-size: 12.5px;
    color: var(--text-secondary);
  }

  &__close {
    display: flex;
    flex-shrink: 0;
    padding: 2px;
    border: none;
    background: none;
    color: var(--text-tertiary);
    cursor: pointer;
    border-radius: 5px;
    transition: color 0.15s;

    &:hover {
      color: var(--text);
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
  }
}

.toast-enter-active {
  animation: toast-in 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  position: absolute;
  right: 0;
  width: 100%;
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.toast-move {
  transition: transform 0.2s ease;
}
</style>
