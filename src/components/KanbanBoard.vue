<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { useTasksStore } from '@/stores'
import { useKanbanDrag } from '@/composables'
import { TaskStatus, type Task } from '@/types'
import { TASK_STATUS_LABELS } from '@/utils/status'
import KanbanCard from './KanbanCard.vue'

const props = defineProps<{
  tasks: Task[]
  projectId: number
}>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
}>()

const store = useTasksStore()

const columns: { status: TaskStatus; title: string }[] = [
  { status: TaskStatus.Todo, title: TASK_STATUS_LABELS[TaskStatus.Todo] },
  { status: TaskStatus.InProgress, title: TASK_STATUS_LABELS[TaskStatus.InProgress] },
  { status: TaskStatus.Done, title: TASK_STATUS_LABELS[TaskStatus.Done] },
]

// Drag/board glue — per-column writable mirrors + layout reporting — lives in
// useKanbanDrag. syncBoard remains the single place that derives status + a
// through-running order, so the table and board stay reconciled both ways.
const { listFor, setList, onEnd } = useKanbanDrag<TaskStatus, Task>(
  () => props.tasks,
  [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done],
  (layout) => {
    void store.syncBoard(props.projectId, {
      todo: layout[TaskStatus.Todo],
      in_progress: layout[TaskStatus.InProgress],
      done: layout[TaskStatus.Done],
    })
  },
)

// Shared group so cards can be dragged between columns.
const group = { name: 'tasks' }
</script>

<template>
  <div class="kanban">
    <section
      v-for="col in columns"
      :key="col.status"
      class="kanban__column"
      :aria-label="col.title"
    >
      <header class="kanban__head">
        <span
          class="kanban__dot"
          :class="`kanban__dot--${col.status}`"
          aria-hidden="true"
        />
        <h2 class="kanban__title">
          {{ col.title }}
        </h2>
        <span
          class="kanban__count"
          :aria-label="`${listFor(col.status).value.length} завдань`"
        >
          {{ listFor(col.status).value.length }}
        </span>
      </header>

      <VueDraggable
        :model-value="listFor(col.status).value"
        :group="group"
        :animation="150"
        class="kanban__list"
        @update:model-value="(list: Task[]) => setList(col.status, list)"
        @end="onEnd"
      >
        <KanbanCard
          v-for="task in listFor(col.status).value"
          :key="task.id"
          :data-id="task.id"
          :task="task"
          @edit="emit('edit', task)"
        />
      </VueDraggable>

      <p
        v-if="listFor(col.status).value.length === 0"
        class="kanban__empty"
      >
        Немає завдань
      </p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.kanban {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.kanban__column {
  display: flex;
  flex-direction: column;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
}

.kanban__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px 12px;
}

.kanban__dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  flex-shrink: 0;

  &--todo {
    background: var(--todo);
  }

  &--in_progress {
    background: var(--progress);
  }

  &--done {
    background: var(--done);
  }
}

.kanban__title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text);
}

.kanban__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.kanban__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 60px;
}

.kanban__empty {
  margin: 0;
  padding: 18px 0;
  text-align: center;
  font-size: 12.5px;
  color: var(--text-tertiary);
  border: 1px dashed var(--border);
  border-radius: 8px;
}

// Placeholder slot where the card will drop (design's empty phStyle).
:deep(.kanban-card.sortable-ghost) {
  background: var(--accent-soft);
  border: 2px dashed var(--accent);
  box-shadow: none;

  > * {
    visibility: hidden;
  }
}

// The lifted card following the cursor (design's dragging ghost).
:deep(.kanban-card.sortable-drag),
:deep(.kanban-card.sortable-chosen) {
  box-shadow: var(--shadow-drag);
  border-color: var(--accent);
  cursor: grabbing;
}
</style>
