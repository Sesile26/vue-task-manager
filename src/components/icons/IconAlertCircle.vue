<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: number | string
    height?: number | string
    strokeWidth?: number | string
  }>(),
  { width: 14, height: 14, strokeWidth: 2 },
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
    <circle
      cx="12"
      cy="12"
      r="10"
    />
    <path d="M12 8v4M12 16h.01" />
  </svg>
</template>
