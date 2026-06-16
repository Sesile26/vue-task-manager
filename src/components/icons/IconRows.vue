<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: number | string
    height?: number | string
    strokeWidth?: number | string
  }>(),
  { width: 15, height: 15, strokeWidth: 2 },
)
</script>

<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <line
      x1="3"
      y1="6"
      x2="21"
      y2="6"
    />
    <line
      x1="3"
      y1="12"
      x2="21"
      y2="12"
    />
    <line
      x1="3"
      y1="18"
      x2="21"
      y2="18"
    />
  </svg>
</template>
