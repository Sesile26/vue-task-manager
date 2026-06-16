<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
    confirming?: boolean
  }>(),
  {
    confirmLabel: 'Підтвердити',
    cancelLabel: 'Скасувати',
    danger: false,
    confirming: false,
  },
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <BaseModal
    :open="open"
    :title="title"
    @close="emit('cancel')"
  >
    <template #header>
      <h2 class="confirm__title">
        {{ title }}
      </h2>
    </template>

    <template #body>
      <div class="confirm__body">
        <slot />
      </div>
    </template>

    <template #footer>
      <BaseButton
        variant="secondary"
        @click="emit('cancel')"
      >
        {{ cancelLabel }}
      </BaseButton>
      <BaseButton
        :variant="danger ? 'danger' : 'primary'"
        :disabled="confirming"
        @click="emit('confirm')"
      >
        {{ confirming ? 'Зачекайте…' : confirmLabel }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped lang="scss">
.confirm__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text);
}

.confirm__body {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-secondary);
}
</style>
