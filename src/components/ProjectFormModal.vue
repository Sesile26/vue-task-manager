<script lang="ts">
export interface ProjectFormPayload {
  name: string
  description: string | null
}
</script>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { BaseModal, FormField, BaseButton } from '@/components/ui'
import type { Project } from '@/types'

const props = defineProps<{
  open: boolean
  /** When provided, the modal opens in edit mode pre-filled with this project. */
  project?: Project | null
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: ProjectFormPayload): void
}>()

const isEdit = computed(() => Boolean(props.project))
const title = computed(() => (isEdit.value ? 'Редагувати проект' : 'Новий проект'))
const subtitle = computed(() =>
  isEdit.value ? 'Оновіть деталі проекту.' : 'Створіть проект, щоб почати додавати завдання.',
)

const schema = toTypedSchema(
  z.object({
    name: z
      .string({ required_error: 'Введіть назву проекту' })
      .min(1, 'Введіть назву проекту')
      .min(2, 'Від 2 до 100 символів')
      .max(100, 'Від 2 до 100 символів'),
    description: z.string().max(500, 'Опис до 500 символів').optional(),
  }),
)

const fieldOpts = { validateOnModelUpdate: false, validateOnBlur: true } as const

const { handleSubmit, errors, defineField, resetForm } = useForm({ validationSchema: schema })
const [name, nameAttrs] = defineField('name', fieldOpts)
const [description, descriptionAttrs] = defineField('description', fieldOpts)

const onSubmit = handleSubmit((values) => {
  const trimmedDescription = values.description?.trim()
  emit('submit', {
    name: values.name.trim(),
    description: trimmedDescription ? trimmedDescription : null,
  })
})

watch(
  () => props.open,
  (open) => {
    if (!open) return
    if (props.project) {
      resetForm({
        values: { name: props.project.name, description: props.project.description ?? '' },
      })
    } else {
      resetForm({ values: { name: '', description: '' } })
    }
  },
)
</script>

<template>
  <BaseModal
    :open="open"
    :title="title"
    @close="emit('close')"
  >
    <template #header>
      <div class="form-head">
        <h2 class="form-head__title">
          {{ title }}
        </h2>
        <p class="form-head__sub">
          {{ subtitle }}
        </p>
      </div>
    </template>

    <template #body>
      <form
        id="project-form"
        class="project-form"
        novalidate
        @submit.prevent="onSubmit"
      >
        <FormField
          label="Назва проекту"
          required
          input-id="project-name"
          :error="errors.name"
        >
          <input
            id="project-name"
            v-model="name"
            v-bind="nameAttrs"
            type="text"
            class="field-input"
            placeholder="Напр. Запуск Q4"
            autocomplete="off"
            :aria-invalid="Boolean(errors.name)"
          >
        </FormField>

        <FormField
          label="Опис"
          input-id="project-description"
          :error="errors.description"
        >
          <textarea
            id="project-description"
            v-model="description"
            v-bind="descriptionAttrs"
            class="field-input field-input--area"
            rows="3"
            placeholder="Коротко опишіть мету проекту"
            :aria-invalid="Boolean(errors.description)"
          />
        </FormField>
      </form>
    </template>

    <template #footer>
      <BaseButton
        variant="secondary"
        @click="emit('close')"
      >
        Скасувати
      </BaseButton>
      <BaseButton
        variant="primary"
        type="submit"
        form="project-form"
        :disabled="submitting"
      >
        {{ submitting ? 'Збереження…' : 'Зберегти' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped lang="scss">
.form-head {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  &__sub {
    margin: 0;
    font-size: 13.5px;
    color: var(--text-secondary);
  }
}

.project-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 14px;
}

.field-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: var(--text-tertiary);
  }

  &:focus-visible {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--ring);
  }

  &--area {
    height: auto;
    min-height: 80px;
    padding: 10px 12px;
    line-height: 1.5;
    resize: vertical;
  }
}
</style>
