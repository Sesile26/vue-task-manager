<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTasksStore, useProjectsStore } from '@/stores'
import { usePersistedRef } from '@/composables'
import ViewModeToggle from '@/components/ViewModeToggle.vue'
import TasksTable from '@/components/TasksTable.vue'
import KanbanBoard from '@/components/KanbanBoard.vue'
import TaskDistributionChart from '@/components/TaskDistributionChart.vue'
import TaskFormModal, { type TaskFormPayload } from '@/components/TaskFormModal.vue'
import { BaseButton, StatusBadge } from '@/components/ui'
import { IconChevronLeft, IconPlus } from '@/components/icons'
import { TaskStatus, type Task } from '@/types'
import { pluralUk } from '@/utils/plural'

const route = useRoute()
const projectId = computed(() => Number(route.params.id))

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const { tasks, loading, error } = storeToRefs(tasksStore)

// Persisted view mode (Table / Kanban) — shared key across projects.
const mode = usePersistedRef<'table' | 'kanban'>('project-view-mode', 'table')

// Stand-in roster (no users API); merged with assignees already on tasks.
const ROSTER = ['Anna', 'Bob', 'Carl', 'Diana']
const assignees = computed<string[]>(() => {
  const set = new Set<string>(ROSTER)
  for (const task of tasks.value) {
    if (task.assignee) set.add(task.assignee)
  }
  return [...set].sort()
})

const currentProject = computed(() =>
  projectsStore.projects.find((p) => p.id === projectId.value) ?? null,
)
const title = computed(() => currentProject.value?.name ?? `Проект #${projectId.value}`)

const subtitle = computed(() => {
  const total = tasks.value.length
  const done = tasks.value.filter((t) => t.status === TaskStatus.Done).length
  return `${total} ${pluralUk(total, ['завдання', 'завдання', 'завдань'])} · ${done} виконано`
})

const modalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const submitting = ref(false)

async function load(): Promise<void> {
  await tasksStore.fetchTasks(projectId.value)
  // Load projects (for the title) if we arrived here directly.
  if (projectsStore.projects.length === 0) void projectsStore.fetchProjects()
}

onMounted(() => {
  void load()
})
watch(projectId, () => {
  void load()
})

function openCreate(): void {
  editingTask.value = null
  modalOpen.value = true
}

function openEdit(task: Task): void {
  editingTask.value = task
  modalOpen.value = true
}

function closeModal(): void {
  modalOpen.value = false
}

async function handleSubmit(payload: TaskFormPayload): Promise<void> {
  submitting.value = true
  const result = editingTask.value
    ? await tasksStore.updateTask(editingTask.value.id, payload)
    : await tasksStore.addTask({ ...payload, projectId: projectId.value })
  submitting.value = false
  // toast is raised by the store action
  if (result) closeModal()
}

async function handleDelete(): Promise<void> {
  if (!editingTask.value) return
  await tasksStore.removeTask(editingTask.value.id)
  // toast is raised by the store action; close unless it failed
  if (!tasksStore.error) closeModal()
}
</script>

<template>
  <main class="project-view">
    <RouterLink
      to="/"
      class="project-view__back"
    >
      <IconChevronLeft
        width="16"
        height="16"
      />
      Усі проекти
    </RouterLink>

    <header class="project-view__head">
      <div class="project-view__heading">
        <div class="project-view__title-row">
          <h1 class="project-view__title">
            {{ title }}
          </h1>
          <StatusBadge
            v-if="currentProject"
            :status="currentProject.status"
          />
        </div>
        <p class="project-view__subtitle">
          {{ subtitle }}
        </p>
      </div>

      <div class="project-view__actions">
        <ViewModeToggle v-model="mode" />
        <BaseButton
          variant="primary"
          @click="openCreate"
        >
          <template #icon>
            <IconPlus
              width="16"
              height="16"
            />
          </template>
          Додати завдання
        </BaseButton>
      </div>
    </header>

    <p
      v-if="error"
      class="banner banner--error"
      role="alert"
    >
      {{ error }}
    </p>
    <p
      v-else-if="loading"
      class="banner"
      role="status"
    >
      Завантаження завдань…
    </p>

    <template v-else>
      <p
        v-if="tasks.length === 0"
        class="banner"
      >
        Завдань ще немає. Натисніть «Додати завдання», щоб створити перше.
      </p>

      <template v-else>
        <!-- Plain conditional: an out-in <Transition> deadlocks when the
             leaving pane holds vue-draggable-plus (SortableJS) instances. -->
        <div
          v-if="mode === 'table'"
          key="table"
          class="mode-pane"
        >
          <TasksTable
            :tasks="tasks"
            :assignees="assignees"
            :project-id="projectId"
            @edit="openEdit"
          />
        </div>
        <div
          v-else
          key="kanban"
          class="mode-pane"
        >
          <KanbanBoard
            :tasks="tasks"
            :project-id="projectId"
            @edit="openEdit"
          />
        </div>

        <!-- Distribution sits below the tasks as its own full-width section,
             outside the mode v-if so it shows identically in both modes. -->
        <TaskDistributionChart
          :distribution="tasksStore.statusDistribution"
          class="project-view__chart"
        />
      </template>
    </template>

    <TaskFormModal
      :open="modalOpen"
      :task="editingTask"
      :assignees="assignees"
      :project-name="currentProject?.name"
      :submitting="submitting"
      @close="closeModal"
      @submit="handleSubmit"
      @delete="handleDelete"
    />
  </main>
</template>

<style scoped lang="scss">
.project-view {
  max-width: 1160px;
  margin: 0 auto;
  padding: 28px 32px 64px;

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 18px;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.15s;

    &:hover {
      color: var(--text);
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
      border-radius: 4px;
    }
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }

  &__heading {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__title {
    margin: 0;
    font-size: 25px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  &__subtitle {
    margin: 0;
    font-size: 14px;
    color: var(--text-secondary);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  // Full-width distribution section below the tasks block: gap above it,
  // none below (it's the last element). Card styling lives in the component.
  &__chart {
    margin-top: 28px;
    margin-bottom: 0;
  }
}

.banner {
  margin: 0;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);

  &--error {
    border-color: var(--error);
    color: var(--error);
    background: color-mix(in srgb, var(--error) 8%, var(--surface));
  }
}
</style>
