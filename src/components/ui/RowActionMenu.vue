<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { IconMoreVertical, IconEdit, IconTrash } from '@/components/icons'

export interface ActionItem {
  key: string
  label: string
  icon?: 'edit' | 'delete'
  danger?: boolean
}

defineProps<{
  items: ActionItem[]
  ariaLabel?: string
}>()

const emit = defineEmits<{
  (e: 'select', key: string): void
}>()

const isOpen = ref(false)
const menuStyle = ref<{ top: string; right: string }>({ top: '0px', right: '0px' })

// Position the menu (fixed → escapes the table's overflow clipping).
function toggle(event: MouseEvent): void {
  event.stopPropagation()
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  menuStyle.value = {
    top: `${rect.bottom + 6}px`,
    right: `${Math.max(8, window.innerWidth - rect.right)}px`,
  }
  isOpen.value = !isOpen.value
}

function close(): void {
  isOpen.value = false
}

function choose(event: MouseEvent, key: string): void {
  event.stopPropagation()
  emit('select', key)
  close()
}

function onWindowKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') close()
}

watch(isOpen, (open) => {
  if (open) {
    window.addEventListener('keydown', onWindowKey)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
  } else {
    window.removeEventListener('keydown', onWindowKey)
    window.removeEventListener('scroll', close, true)
    window.removeEventListener('resize', close)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onWindowKey)
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
})
</script>

<template>
  <button
    type="button"
    class="row-menu__trigger"
    :aria-label="ariaLabel ?? 'Дії'"
    :aria-expanded="isOpen"
    aria-haspopup="menu"
    @click="toggle"
    @keydown.enter.stop
  >
    <IconMoreVertical
      width="18"
      height="18"
    />
  </button>

  <Teleport to="body">
    <template v-if="isOpen">
      <div
        class="row-menu__scrim"
        @click.stop="close"
      />
      <ul
        class="row-menu__menu"
        :style="menuStyle"
        role="menu"
      >
        <li
          v-for="item in items"
          :key="item.key"
          role="none"
        >
          <button
            type="button"
            class="row-menu__item"
            :class="{ 'row-menu__item--danger': item.danger }"
            role="menuitem"
            @click="choose($event, item.key)"
          >
            <IconEdit
              v-if="item.icon === 'edit'"
              width="15"
              height="15"
            />
            <IconTrash
              v-else-if="item.icon === 'delete'"
              width="15"
              height="15"
            />
            {{ item.label }}
          </button>
        </li>
      </ul>
    </template>
  </Teleport>
</template>

<style scoped lang="scss">
.row-menu__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: var(--surface-2);
    color: var(--text);
    border-color: var(--border);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.row-menu__scrim {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.row-menu__menu {
  position: fixed;
  z-index: 1001;
  min-width: 180px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
}

.row-menu__item {
  display: flex;
  align-items: center;
  gap: 9px;
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
  transition: background 0.12s, color 0.12s;

  &:hover {
    background: var(--surface-2);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  &--danger {
    color: var(--error);

    &:hover {
      background: color-mix(in srgb, var(--error) 12%, var(--surface));
    }
  }
}
</style>
