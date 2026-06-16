<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: number | string
    height?: number | string
    strokeWidth?: number | string
  }>(),
  { width: 16, height: 16, strokeWidth: 2 },
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
    <path d="m15 18-6-6 6-6" />
  </svg>
</template>
