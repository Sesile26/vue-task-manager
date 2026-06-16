<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectsStore } from '@/stores'
import {
  useTableSort,
  useColumnResize,
  useQueryFilters,
  sortDirCodec,
  type SortOrder,
} from '@/composables'
import type { Project, ProjectWithTaskCount } from '@/types'
import { StatusBadge, RowActionMenu, type ActionItem } from '@/components/ui'
import { IconChevronUp, IconChevronDown, IconCheckSquare } from '@/components/icons'
import { formatDateLong } from '@/utils/date'
import { ariaSort } from '@/utils/table'

const props = defineProps<{
  projects: Project[]
}>()

const emit = defineEmits<{
  (e: 'select', id: number): void
  (e: 'edit', project: Project): void
  (e: 'delete', project: Project): void
}>()

const rowActions: ActionItem[] = [
  { key: 'edit', label: 'Редагувати', icon: 'edit' },
  { key: 'delete', label: 'Видалити', icon: 'delete', danger: true },
]

function onRowAction(project: Project, key: string): void {
  if (key === 'edit') emit('edit', project)
  else if (key === 'delete') emit('delete', project)
}

const projectsStore = useProjectsStore()

type ColumnKey = 'id' | 'name' | 'taskCount' | 'status' | 'createdAt'
type ResizeKey = 'id' | 'name' | 'taskCount' | 'status'

interface Column {
  key: ColumnKey
  label: string
  resizeKey?: ResizeKey
}

const columns: Column[] = [
  { key: 'id', label: 'ID', resizeKey: 'id' },
  { key: 'name', label: 'Назва проекту', resizeKey: 'name' },
  { key: 'taskCount', label: 'Завдань', resizeKey: 'taskCount' },
  { key: 'status', label: 'Статус', resizeKey: 'status' },
  { key: 'createdAt', label: 'Дата створення' },
]

const rows = computed<ProjectWithTaskCount[]>(() =>
  props.projects.map((project) => ({
    ...project,
    taskCount: projectsStore.taskCountByProject(project.id),
  })),
)

// Sort state lives in the URL query (sortKey + sortDir) so a sorted view is
// shareable. The sorting logic itself stays in useTableSort — only the storage
// source changed. sortKey is validated against the real column keys.
const sortKey = ref<keyof ProjectWithTaskCount | null>(null)
const sortOrder = ref<SortOrder>('asc')
const sortableKeys: readonly string[] = columns.map((column) => column.key)
useQueryFilters(
  { sortKey, sortDir: sortOrder },
  {
    sortKey: {
      parse: (raw) =>
        raw !== null && sortableKeys.includes(raw) ? (raw as keyof ProjectWithTaskCount) : null,
      serialize: (value) => value,
    },
    sortDir: sortDirCodec(),
  },
)
const { sorted, sortBy } = useTableSort<ProjectWithTaskCount>(rows, { sortKey, sortOrder })

const { widths, startResize } = useColumnResize<ResizeKey>({
  id: 96,
  name: 360,
  taskCount: 150,
  status: 150,
})

const gridTemplate = computed(
  () =>
    `${widths.value.id}px ${widths.value.name}px ${widths.value.taskCount}px ` +
    `${widths.value.status}px minmax(140px, 1fr) 52px`,
)

</script>

<template>
  <div
    class="ptable"
    role="table"
    aria-label="Проекти"
  >
    <div
      class="ptable__header"
      role="row"
      :style="{ gridTemplateColumns: gridTemplate }"
    >
      <div
        v-for="column in columns"
        :key="column.key"
        class="ptable__th"
        role="columnheader"
        :aria-sort="ariaSort(sortKey === column.key, sortOrder)"
      >
        <button
          type="button"
          class="ptable__sort"
          @click="sortBy(column.key)"
        >
          {{ column.label }}
          <span
            v-if="sortKey === column.key"
            class="ptable__chevron"
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
          v-if="column.resizeKey"
          class="ptable__resizer"
          role="separator"
          aria-orientation="vertical"
          aria-label="Змінити ширину колонки"
          @mousedown="startResize(column.resizeKey, $event)"
        />
      </div>
      <div
        class="ptable__th"
        role="columnheader"
      >
        <span class="sr-only">Дії</span>
      </div>
    </div>

    <div
      class="ptable__body"
      role="rowgroup"
    >
      <div
        v-for="row in sorted"
        :key="row.id"
        class="ptable__row"
        role="row"
        tabindex="0"
        :style="{ gridTemplateColumns: gridTemplate }"
        @click="emit('select', row.id)"
        @keydown.enter.self="emit('select', row.id)"
      >
        <div
          class="ptable__cell ptable__cell--id"
          role="cell"
        >
          {{ row.id }}
        </div>
        <div
          class="ptable__cell ptable__cell--name"
          role="cell"
        >
          {{ row.name }}
        </div>
        <div
          class="ptable__cell"
          role="cell"
        >
          <span class="ptable__tasks">
            <IconCheckSquare
              width="14"
              height="14"
            />
            {{ row.taskCount }}
          </span>
        </div>
        <div
          class="ptable__cell"
          role="cell"
        >
          <StatusBadge :status="row.status" />
        </div>
        <div
          class="ptable__cell ptable__cell--muted"
          role="cell"
        >
          {{ formatDateLong(row.createdAt) }}
        </div>
        <div
          class="ptable__cell ptable__cell--actions"
          role="cell"
        >
          <RowActionMenu
            :items="rowActions"
            :aria-label="`Дії для «${row.name}»`"
            @select="onRowAction(row, $event)"
          />
        </div>
      </div>
    </div>
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

.ptable {
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
  }

  &__sort {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    height: 44px;
    padding: 0 16px;
    border: none;
    background: none;
    font-family: inherit;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    text-align: left;
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
  }

  &__cell {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--id {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-tertiary);
    }

    &--name {
      font-weight: 500;
    }

    &--muted {
      font-size: 13.5px;
      color: var(--text-secondary);
    }

    &--actions {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      overflow: visible;
    }
  }

  &__tasks {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--text-secondary);
  }
}
</style>
