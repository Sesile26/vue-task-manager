<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: number | string
    height?: number | string
    /** Radius of each grip dot (in viewBox units). */
    dotRadius?: number | string
  }>(),
  { width: 16, height: 16, dotRadius: 1.6 },
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
      cx="9"
      cy="6"
      :r="dotRadius"
    />
    <circle
      cx="15"
      cy="6"
      :r="dotRadius"
    />
    <circle
      cx="9"
      cy="12"
      :r="dotRadius"
    />
    <circle
      cx="15"
      cy="12"
      :r="dotRadius"
    />
    <circle
      cx="9"
      cy="18"
      :r="dotRadius"
    />
    <circle
      cx="15"
      cy="18"
      :r="dotRadius"
    />
  </svg>
</template>
