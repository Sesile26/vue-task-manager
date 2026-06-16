<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount, useSlots } from 'vue'
import { IconClose } from '@/components/icons'

const props = defineProps<{
  open: boolean
  /** Used as the dialog's accessible name when no header text is provided. */
  title?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const slots = useSlots()

const dialogRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusable(): HTMLElement[] {
  if (!dialogRef.value) return []
  return Array.from(dialogRef.value.querySelectorAll<HTMLElement>(FOCUSABLE))
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    e.stopPropagation()
    emit('close')
    return
  }
  if (e.key !== 'Tab') return

  const focusable = getFocusable()
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) {
    e.preventDefault()
    dialogRef.value?.focus()
    return
  }

  const active = document.activeElement
  if (e.shiftKey && active === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previouslyFocused =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      await nextTick()
      const focusable = getFocusable()
      ;(focusable[0] ?? dialogRef.value)?.focus()
    } else if (previouslyFocused) {
      previouslyFocused.focus()
      previouslyFocused = null
    }
  },
)

onBeforeUnmount(() => {
  previouslyFocused?.focus()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="overlay"
      @click="emit('close')"
      @keydown="onKeydown"
    >
      <div
        ref="dialogRef"
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        @click.stop
      >
        <div class="modal__head">
          <div class="modal__title">
            <slot name="header" />
          </div>
          <button
            type="button"
            class="modal__close"
            aria-label="Закрити"
            @click="emit('close')"
          >
            <IconClose
              width="19"
              height="19"
            />
          </button>
        </div>

        <div class="modal__body">
          <slot name="body">
            <slot />
          </slot>
        </div>

        <div
          v-if="slots.footer"
          class="modal__foot"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: color-mix(in srgb, #0f172a 45%, transparent);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  animation: fade-in 0.15s ease;
}

.modal {
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  padding: 24px;
  animation: modal-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    outline: none;
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 8px;
  }

  &__title {
    flex: 1;
    min-width: 0;
  }

  &__close {
    display: flex;
    flex-shrink: 0;
    padding: 3px;
    border: none;
    background: none;
    border-radius: 6px;
    color: var(--text-tertiary);
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

  &__body {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.55;
  }

  &__foot {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 24px;
  }
}
</style>
