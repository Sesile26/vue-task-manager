<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: number | string
    height?: number | string
    strokeWidth?: number | string
  }>(),
  { width: 16, height: 16, strokeWidth: 2.2 },
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
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
</template>
