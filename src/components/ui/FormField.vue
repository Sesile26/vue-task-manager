<script setup lang="ts">
import { IconAlertCircle } from '@/components/icons'

defineProps<{
  label?: string
  error?: string
  required?: boolean
  /** id of the control in the default slot, linked to the label. */
  inputId?: string
}>()
</script>

<template>
  <div
    class="field"
    :class="{ 'field--error': Boolean(error) }"
  >
    <label
      v-if="label"
      class="field__label"
      :for="inputId"
    >
      {{ label }}
      <span
        v-if="required"
        class="field__required"
        aria-hidden="true"
      >*</span>
    </label>

    <slot />

    <p
      v-if="error"
      class="field__error"
      role="alert"
    >
      <IconAlertCircle
        width="14"
        height="14"
      />
      {{ error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.field {
  display: flex;
  flex-direction: column;
  gap: 7px;

  &__label {
    display: inline-flex;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
  }

  &__required {
    color: var(--error);
  }

  &__error {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--error);

    svg {
      flex-shrink: 0;
    }
  }

  &--error {
    :deep(input),
    :deep(select),
    :deep(textarea),
    :deep(.dropdown__trigger) {
      border-color: var(--error);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--error) 16%, transparent);
    }
  }
}
</style>
