<script setup lang="ts">
import { TaskStatus, type Task } from '@/types'
import { BaseAvatar } from '@/components/ui'
import { IconPlus, IconCalendar } from '@/components/icons'
import { formatDateShort } from '@/utils/date'

defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  (e: 'edit'): void
}>()
</script>

<template>
  <article
    class="kanban-card"
    :class="{ 'kanban-card--done': task.status === TaskStatus.Done }"
    tabindex="0"
    :aria-label="`Завдання: ${task.name}`"
    @click="emit('edit')"
    @keydown.enter="emit('edit')"
  >
    <h3 class="kanban-card__title">
      {{ task.name }}
    </h3>

    <div class="kanban-card__footer">
      <span
        v-if="task.assignee"
        class="kanban-card__assignee"
      >
        <BaseAvatar
          :name="task.assignee"
          size="sm"
        />
        <span class="kanban-card__assignee-name">{{ task.assignee }}</span>
      </span>
      <span
        v-else
        class="kanban-card__assignee kanban-card__assignee--none"
      >
        <span
          class="kanban-card__none-avatar"
          aria-hidden="true"
        >
          <IconPlus
            width="11"
            height="11"
            stroke-width="2"
          />
        </span>
        Не призначено
      </span>

      <span class="kanban-card__due">
        <IconCalendar
          width="13"
          height="13"
        />
        {{ formatDateShort(task.dueDate) }}
      </span>
    </div>
  </article>
</template>

<style scoped lang="scss">
.kanban-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 13px 14px;
  box-shadow: var(--shadow);
  cursor: grab;
  touch-action: none;
  transition: border-color 0.15s, transform 0.1s;

  &:hover {
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  &:active {
    cursor: grabbing;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  &__title {
    margin: 0 0 14px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--text);
    overflow-wrap: anywhere;
  }

  &--done &__title {
    color: var(--text-secondary);
    text-decoration: line-through;
    text-decoration-color: var(--text-tertiary);
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__assignee {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-width: 0;

    &--none {
      color: var(--text-tertiary);
    }
  }

  &__assignee-name {
    font-size: 12.5px;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__none-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    border: 1.5px dashed var(--border);
    color: var(--text-tertiary);
  }

  &__due {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
  }
}
</style>
