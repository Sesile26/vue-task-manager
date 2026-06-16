<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useTasksStore } from '@/stores'
import {
  useTableSort,
  useColumnResize,
  useQueryFilters,
  useFilters,
  useDragSort,
  useNullableSelect,
  choiceFilter,
  choiceCodec,
  enumCodec,
  sortDirCodec,
} from '@/composables'
import type { SortOrder } from '@/composables'
import { TaskStatus, type Task } from '@/types'
import { FilterDropdown, StatusBadge, BaseAvatar, type DropdownOption } from '@/components/ui'
import {
  IconUser,
  IconFilter,
  IconChevronUp,
  IconChevronDown,
  IconGripVertical,
  IconPlus,
  IconAlertCircle,
} from '@/components/icons'
import { formatDateShort } from '@/utils/date'
import { ariaSort } from '@/utils/table'
import { TASK_STATUS_LABELS } from '@/utils/status'

const props = defineProps<{
  tasks: Task[]
  assignees: string[]
  projectId: number
}>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
}>()

const tasksStore = useTasksStore()

// assignee | status | sortKey | sortDir live in the URL so a filtered/sorted
// view is shareable & bookmarkable. The filter/sort LOGIC is untouched — only
// the storage source moved from localStorage to the query.
const assigneeFilter = ref<string>('all')
const statusFilter = ref<TaskStatus | null>(null)
const sortKey = ref<keyof Task | null>(null)
const sortOrder = ref<SortOrder>('asc')

const assigneeOptions = computed<DropdownOption<string>[]>(() => [
  { value: 'all', label: 'Усі виконавці' },
  ...props.assignees.map((name) => ({ value: name, label: name })),
  { value: 'none', label: 'Не призначено' },
])

type StatusFilterValue = TaskStatus | 'all'
const statusFilterOptions: DropdownOption<StatusFilterValue>[] = [
  { value: 'all', label: 'Усі статуси' },
  { value: TaskStatus.Todo, label: TASK_STATUS_LABELS[TaskStatus.Todo] },
  { value: TaskStatus.InProgress, label: TASK_STATUS_LABELS[TaskStatus.InProgress] },
  { value: TaskStatus.Done, label: TASK_STATUS_LABELS[TaskStatus.Done] },
]
const statusProxy = useNullableSelect(statusFilter)

// Filtering logic lives in useFilters (same composable as the projects list):
// a tri-state assignee choice ('all' = any, 'none' = unassigned) + an exact
// status filter. No filtering code is hand-written in the component.
const { filtered } = useFilters<Task>(() => props.tasks, {
  filters: [
    choiceFilter<Task, string>('assignee', assigneeFilter, { all: 'all', none: 'none' }),
    choiceFilter<Task, TaskStatus | null>('status', statusFilter, { all: null }),
  ],
})

// Bind all four params to the query. Only 'dueDate' | 'status' are sortable
// columns; any other (or legacy 'order') parses to manual sort (null).
useQueryFilters(
  { assignee: assigneeFilter, status: statusFilter, sortKey, sortDir: sortOrder },
  {
    assignee: choiceCodec('all'),
    status: enumCodec<TaskStatus>([TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done]),
    sortKey: {
      parse: (raw) => (raw === 'dueDate' || raw === 'status' ? raw : null),
      serialize: (value) => value,
    },
    sortDir: sortDirCodec(),
  },
)

// Manual (drag) mode = no column sort (sortKey null); clicking a column
// three-states it inactive → asc → desc → back to manual (null).
const { sorted, sortBy } = useTableSort<Task>(filtered, { sortKey, sortOrder })

// Sorting and manual drag-and-drop are mutually exclusive.
const isManual = computed(() => sortKey.value === null)

type ResizeKey = 'name' | 'assignee' | 'status'
const { widths, startResize } = useColumnResize<ResizeKey>({
  name: 320,
  assignee: 200,
  status: 150,
})
// Track order mirrors the columns: handle → ID (fixed) → name → assignee →
// status → due. The 64px ID track sits right after the handle so the header
// and rows (same computed) stay aligned; ID is display-only, never resized.
const gridTemplate = computed(
  () =>
    `44px 64px ${widths.value.name}px ${widths.value.assignee}px ` +
    `${widths.value.status}px minmax(140px, 1fr)`,
)

interface Column {
  key: 'id' | 'name' | 'assignee' | 'status' | 'dueDate'
  label: string
  sortKey: keyof Task | null
  resizeKey?: ResizeKey
}
const columns: Column[] = [
  { key: 'id', label: 'ID', sortKey: null },
  { key: 'name', label: 'Назва завдання', sortKey: null, resizeKey: 'name' },
  { key: 'assignee', label: 'Виконавець', sortKey: null, resizeKey: 'assignee' },
  { key: 'status', label: 'Статус', sortKey: 'status', resizeKey: 'status' },
  { key: 'dueDate', label: 'Термін', sortKey: 'dueDate' },
]

// Drag wiring lives in useDragSort. We only supply the rows to render (manual
// `order` vs the active column sort) and where the new id order is persisted;
// the store rewrites `order = index`.
const { list: draggableList, onEnd: onDragEnd } = useDragSort<Task>(
  () =>
    isManual.value ? [...filtered.value].sort((a, b) => a.order - b.order) : [...sorted.value],
  (orderedIds) => {
    void tasksStore.reorderTasks(props.projectId, orderedIds)
  },
)

function onHeaderClick(column: Column): void {
  if (column.sortKey !== null) sortBy(column.sortKey)
}

</script>

<template>
  <div class="tasks">
    <div class="tasks__toolbar">
      <FilterDropdown
        v-model="assigneeFilter"
        :options="assigneeOptions"
        aria-label="Виконавець"
      >
        <template #icon>
          <IconUser
            width="15"
            height="15"
          />
        </template>
        <template #option="{ option }">
          <span class="opt">
            <BaseAvatar
              v-if="option.value !== 'all' && option.value !== 'none'"
              :name="option.label"
              size="sm"
            />
            {{ option.label }}
          </span>
        </template>
      </FilterDropdown>

      <FilterDropdown
        v-model="statusProxy"
        :options="statusFilterOptions"
        aria-label="Статус"
      >
        <template #icon>
          <IconFilter
            width="15"
            height="15"
          />
        </template>
        <template #option="{ option }">
          <span class="opt">
            <span
              v-if="option.value !== 'all'"
              class="opt__dot"
              :class="`opt__dot--${option.value}`"
            />
            {{ option.label }}
          </span>
        </template>
      </FilterDropdown>
    </div>

    <div
      class="ttable"
      role="table"
      aria-label="Завдання"
    >
      <div
        class="ttable__header"
        role="row"
        :style="{ gridTemplateColumns: gridTemplate }"
      >
        <div
          class="ttable__th ttable__th--handle"
          role="columnheader"
        >
          <span class="sr-only">Порядок</span>
        </div>
        <div
          v-for="column in columns"
          :key="column.key"
          class="ttable__th"
          role="columnheader"
          :aria-sort="ariaSort(column.sortKey !== null && sortKey === column.sortKey, sortOrder)"
        >
          <button
            v-if="column.sortKey !== null"
            type="button"
            class="ttable__label ttable__label--sortable"
            @click="onHeaderClick(column)"
          >
            {{ column.label }}
            <span
              v-if="sortKey === column.sortKey"
              class="ttable__chevron"
              aria-hidden="true"
            >
              <IconChevronUp
                v-if="sortOrder === 'asc'"
                width="13"
                height="13"
              />
              <IconChevronDown
                v-else
                width="13"
                height="13"
                stroke-width="2.4"
              />
            </span>
          </button>
          <span
            v-else
            class="ttable__label"
          >{{ column.label }}</span>

          <span
            v-if="column.resizeKey"
            class="ttable__resizer"
            role="separator"
            aria-orientation="vertical"
            aria-label="Змінити ширину колонки"
            @mousedown.stop="startResize(column.resizeKey, $event)"
          />
        </div>
      </div>

      <VueDraggable
        v-model="draggableList"
        class="ttable__body"
        role="rowgroup"
        :animation="150"
        handle=".drag-handle"
        :disabled="!isManual"
        ghost-class="ttask__row--ghost"
        @end="onDragEnd"
      >
        <div
          v-for="task in draggableList"
          :key="task.id"
          class="ttask__row"
          role="row"
          tabindex="0"
          :style="{ gridTemplateColumns: gridTemplate }"
          @click="emit('edit', task)"
          @keydown.enter="emit('edit', task)"
        >
          <div
            class="ttask__cell ttask__cell--handle"
            role="cell"
          >
            <span
              class="ttask__grip drag-handle"
              :class="{ 'ttask__grip--off': !isManual }"
              :title="isManual ? 'Перетягніть, щоб змінити порядок' : 'Скиньте сортування, щоб перетягувати'"
              aria-label="Перетягнути"
              @click.stop
            >
              <IconGripVertical
                width="16"
                height="16"
              />
            </span>
          </div>

          <div
            class="ttask__cell ttask__cell--id"
            role="cell"
          >
            {{ task.id }}
          </div>

          <div
            class="ttask__cell ttask__cell--name"
            role="cell"
          >
            {{ task.name }}
          </div>

          <div
            class="ttask__cell"
            role="cell"
          >
            <span
              v-if="task.assignee"
              class="ttask__assignee"
            >
              <BaseAvatar
                :name="task.assignee"
                size="sm"
              />
              <span class="ttask__assignee-name">{{ task.assignee }}</span>
            </span>
            <span
              v-else
              class="ttask__assignee ttask__assignee--none"
            >
              <span
                class="ttask__none-avatar"
                aria-hidden="true"
              >
                <IconPlus
                  width="12"
                  height="12"
                  stroke-width="2"
                />
              </span>
              Не призначено
            </span>
          </div>

          <div
            class="ttask__cell"
            role="cell"
          >
            <StatusBadge :status="task.status" />
          </div>

          <div
            class="ttask__cell ttask__cell--muted"
            role="cell"
          >
            {{ formatDateShort(task.dueDate) }}
          </div>
        </div>
      </VueDraggable>
    </div>

    <p
      class="tasks__hint"
      :class="{ 'tasks__hint--warn': !isManual }"
      role="status"
    >
      <IconAlertCircle
        v-if="!isManual"
        width="14"
        height="14"
      />
      <IconGripVertical
        v-else
        width="14"
        height="14"
        :dot-radius="1.4"
      />
      {{
        isManual
          ? 'Перетягніть ручку зліва, щоб змінити порядок завдань.'
          : 'Скиньте сортування, щоб перетягувати.'
      }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.tasks {
  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 18px;
  }

  &__hint {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 14px 0 0;
    font-size: 12.5px;
    color: var(--text-tertiary);

    &--warn {
      color: var(--accent-fg);
    }
  }
}

.opt {
  display: inline-flex;
  align-items: center;
  gap: 9px;

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;

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
}

.ttable {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow-x: auto;

  &__header {
    display: grid;
    align-items: center;
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
  }

  &__th {
    position: relative;
    height: 44px;
    display: flex;
    align-items: center;

    &--handle {
      justify-content: center;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 100%;
    padding: 0 16px;
    border: none;
    background: none;
    font-family: inherit;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-tertiary);

    &--sortable {
      cursor: pointer;
      transition: color 0.15s;

      &:hover {
        color: var(--text-secondary);
      }

      &:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: -2px;
      }
    }
  }

  &__chevron {
    display: inline-flex;
    color: var(--accent-fg);
  }

  &__resizer {
    position: absolute;
    top: 8px;
    right: -4px;
    z-index: 5;
    display: flex;
    justify-content: center;
    width: 9px;
    height: 28px;
    cursor: col-resize;

    &::before {
      content: '';
      width: 1px;
      height: 100%;
      background: var(--border);
      transition: background 0.15s;
    }

    &:hover::before {
      background: var(--accent);
    }
  }
}

.ttask {
  &__row {
    display: grid;
    align-items: center;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.12s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--surface-2);
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: -2px;
    }

    // SortableJS drop placeholder → insertion indicator.
    &--ghost {
      background: var(--accent-soft);
      box-shadow: inset 0 2px 0 0 var(--accent);

      > * {
        opacity: 0;
      }
    }
  }

  &__cell {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--handle {
      padding: 0;
      display: flex;
      justify-content: center;
    }

    &--id {
      font-size: 13px;
      color: var(--text-tertiary);
      font-variant-numeric: tabular-nums;
      font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    }

    &--name {
      font-weight: 500;
    }

    &--muted {
      font-size: 13.5px;
      color: var(--text-secondary);
    }
  }

  &__grip {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-tertiary);
    cursor: grab;
    touch-action: none;

    &:hover {
      color: var(--text-secondary);
    }

    &:active {
      cursor: grabbing;
    }

    // Sorting active → DnD off: dim the grip and block the grab cursor.
    &--off {
      opacity: 0.35;
      cursor: not-allowed;

      &:hover {
        color: var(--text-tertiary);
      }
    }
  }

  &__assignee {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    // Constrain to the cell so a long name ellipsizes instead of overflowing.
    max-width: 100%;
    min-width: 0;

    &--none {
      color: var(--text-tertiary);
      font-size: 13.5px;
    }
  }

  &__assignee-name {
    font-size: 13.5px;
    color: var(--text);
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
}
</style>
