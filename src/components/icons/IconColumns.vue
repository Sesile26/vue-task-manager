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
    <rect
      x="3"
      y="3"
      width="6"
      height="18"
      rx="1.5"
    />
    <rect
      x="10"
      y="3"
      width="6"
      height="12"
      rx="1.5"
    />
    <rect
      x="17"
      y="3"
      width="4"
      height="8"
      rx="1.5"
    />
  </svg>
</template>
