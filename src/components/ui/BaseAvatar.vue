<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' },
)

// Fixed pastel palette (avatar colours stay constant across light/dark).
const PALETTE: { bg: string; fg: string }[] = [
  { bg: '#C4B5FD', fg: '#3730A3' },
  { bg: '#93C5FD', fg: '#1E3A8A' },
  { bg: '#FCA5A5', fg: '#7F1D1D' },
  { bg: '#A7F3D0', fg: '#065F46' },
  { bg: '#FCD34D', fg: '#78350F' },
  { bg: '#F9A8D4', fg: '#831843' },
]
const FALLBACK = { bg: '#CBD5E1', fg: '#334155' }

function hash(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  }
  return (parts[0] ?? '').slice(0, 2).toUpperCase()
})

const colors = computed(() => PALETTE[hash(props.name) % PALETTE.length] ?? FALLBACK)
</script>

<template>
  <span
    class="avatar"
    :class="`avatar--${size}`"
    :style="{ backgroundColor: colors.bg, color: colors.fg }"
    aria-hidden="true"
  >
    {{ initials }}
  </span>
</template>

<style scoped lang="scss">
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 999px;
  font-weight: 700;
  line-height: 1;

  &--md {
    width: 24px;
    height: 24px;
    font-size: 10.5px;
  }

  &--sm {
    width: 22px;
    height: 22px;
    font-size: 10px;
  }
}
</style>
