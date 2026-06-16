<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: number | string
    height?: number | string
  }>(),
  { width: 18, height: 18 },
)
</script>

<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      cx="12"
      cy="5"
      r="1.6"
    />
    <circle
      cx="12"
      cy="12"
      r="1.6"
    />
    <circle
      cx="12"
      cy="19"
      r="1.6"
    />
  </svg>
</template>
