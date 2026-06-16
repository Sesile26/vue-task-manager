<script lang="ts">
import type { TaskStatus } from '@/types'

export interface TaskFormPayload {
  name: string
  status: TaskStatus
  dueDate: string
  assignee: string | null
}
</script>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { BaseModal, FormField, BaseButton, FilterDropdown, type DropdownOption } from '@/components/ui'
import { IconChevronDown } from '@/components/icons'
import { TaskStatus as TaskStatusEnum, type Task } from '@/types'
import { TASK_STATUS_LABELS } from '@/utils/status'

const props = defineProps<{
  open: boolean
  task?: Task | null
  assignees: string[]
  projectName?: string
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: TaskFormPayload): void
  (e: 'delete'): void
}>()

const isEdit = computed(() => Boolean(props.task))

// Local date (YYYY-MM-DD) — en-CA formats ISO-style.
const todayStr = new Date().toLocaleDateString('en-CA')

const statusValues = [
  TaskStatusEnum.Todo,
  TaskStatusEnum.InProgress,
  TaskStatusEnum.Done,
] as const

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: TaskStatusEnum.Todo, label: TASK_STATUS_LABELS[TaskStatusEnum.Todo] },
  { value: TaskStatusEnum.InProgress, label: TASK_STATUS_LABELS[TaskStatusEnum.InProgress] },
  { value: TaskStatusEnum.Done, label: TASK_STATUS_LABELS[TaskStatusEnum.Done] },
]

const assigneeOptions = computed<DropdownOption<string>[]>(() => [
  { value: '', label: 'Не призначено' },
  ...props.assignees.map((name) => ({ value: name, label: name })),
])

// Schema is reactive to the edited task so an existing (possibly past) due
// date can be kept on edit, while any newly chosen date must be >= today.
const schema = computed(() =>
  toTypedSchema(
    z.object({
      name: z
        .string({ required_error: "Поле обов'язкове" })
        .trim()
        .min(1, "Поле обов'язкове")
        .min(3, 'від 3 до 120 символів')
        .max(120, 'від 3 до 120 символів'),
      status: z.enum(statusValues, { errorMap: () => ({ message: 'Оберіть статус' }) }),
      dueDate: z
        .string({ required_error: "Поле обов'язкове" })
        .min(1, "Поле обов'язкове")
        .refine((value) => value >= todayStr || value === (props.task?.dueDate ?? ''), {
          message: 'Дата не може бути в минулому',
        }),
      assignee: z.string().optional(),
    }),
  ),
)

const fieldOpts = { validateOnModelUpdate: false, validateOnBlur: true } as const

const { handleSubmit, errors, defineField, resetForm } = useForm({ validationSchema: schema })
const [name, nameAttrs] = defineField('name', fieldOpts)
const [status, statusAttrs] = defineField('status', fieldOpts)
const [dueDate, dueDateAttrs] = defineField('dueDate', fieldOpts)
const [assignee] = defineField('assignee', fieldOpts)

// The custom BaseSelect needs a non-undefined string model.
const assigneeValue = computed<string>({
  get: () => assignee.value ?? '',
  set: (value) => {
    assignee.value = value
  },
})

const onSubmit = handleSubmit((values) => {
  const trimmedAssignee = values.assignee?.trim()
  emit('submit', {
    name: values.name.trim(),
    status: values.status,
    dueDate: values.dueDate,
    assignee: trimmedAssignee ? trimmedAssignee : null,
  })
})

watch(
  () => [props.open, props.task] as const,
  () => {
    if (!props.open) return
    if (props.task) {
      resetForm({
        values: {
          name: props.task.name,
          status: props.task.status,
          dueDate: props.task.dueDate,
          assignee: props.task.assignee ?? '',
        },
      })
    } else {
      resetForm({ values: { name: '', dueDate: '', assignee: '' } })
    }
  },
  { immediate: true },
)
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Редагувати завдання' : 'Нове завдання'"
    @close="emit('close')"
  >
    <template #header>
      <div class="form-head">
        <h2 class="form-head__title">
          {{ isEdit ? 'Редагувати завдання' : 'Нове завдання' }}
        </h2>
        <p
          v-if="projectName"
          class="form-head__sub"
        >
          {{ projectName }}
        </p>
      </div>
    </template>

    <template #body>
      <form
        id="task-form"
        class="task-form"
        novalidate
        @submit.prevent="onSubmit"
      >
        <FormField
          label="Назва завдання"
          required
          input-id="task-name"
          :error="errors.name"
        >
          <input
            id="task-name"
            v-model="name"
            v-bind="nameAttrs"
            type="text"
            class="field-input"
            placeholder="Напр. Інтеграція Stripe-платежів"
            autocomplete="off"
            :aria-invalid="Boolean(errors.name)"
          >
        </FormField>

        <FormField
          label="Виконавець"
          input-id="task-assignee"
        >
          <FilterDropdown
            v-model="assigneeValue"
            :options="assigneeOptions"
            aria-label="Виконавець"
            class="field-select"
          />
        </FormField>

        <FormField
          label="Статус"
          required
          input-id="task-status"
          :error="errors.status"
        >
          <span class="select">
            <select
              id="task-status"
              v-model="status"
              v-bind="statusAttrs"
              class="field-input select__control"
              :aria-invalid="Boolean(errors.status)"
            >
              <option
                value=""
                disabled
              >Оберіть статус</option>
              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <IconChevronDown
              class="select__chevron"
              width="16"
              height="16"
            />
          </span>
        </FormField>

        <FormField
          label="Термін виконання"
          required
          input-id="task-due"
          :error="errors.dueDate"
        >
          <input
            id="task-due"
            v-model="dueDate"
            v-bind="dueDateAttrs"
            type="date"
            class="field-input"
            :min="todayStr"
            :aria-invalid="Boolean(errors.dueDate)"
          >
        </FormField>
      </form>
    </template>

    <template #footer>
      <BaseButton
        v-if="isEdit"
        variant="danger"
        class="task-form__delete"
        @click="emit('delete')"
      >
        Видалити
      </BaseButton>
      <BaseButton
        variant="secondary"
        @click="emit('close')"
      >
        Скасувати
      </BaseButton>
      <BaseButton
        variant="primary"
        type="submit"
        form="task-form"
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
  gap: 3px;

  &__title {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  &__sub {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 14px;

  &__delete {
    margin-right: auto;
  }
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
}

.field-select {
  display: block;

  :deep(.dropdown__trigger) {
    width: 100%;
    justify-content: space-between;
  }
}

.select {
  position: relative;
  display: flex;
  align-items: center;

  &__control {
    appearance: none;
    -webkit-appearance: none;
    padding-right: 36px;
    cursor: pointer;
  }

  &__chevron {
    position: absolute;
    right: 12px;
    pointer-events: none;
    color: var(--text-tertiary);
  }
}
</style>
