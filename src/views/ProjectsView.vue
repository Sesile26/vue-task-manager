<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProjectsStore, useTasksStore } from '@/stores'
import { useFilters, choiceFilter, useQueryFilters, textCodec, enumCodec } from '@/composables'
import ProjectsToolbar from '@/components/ProjectsToolbar.vue'
import ProjectsTable from '@/components/ProjectsTable.vue'
import TaskDistributionChart from '@/components/TaskDistributionChart.vue'
import ProjectFormModal, { type ProjectFormPayload } from '@/components/ProjectFormModal.vue'
import { BaseButton, ConfirmDialog } from '@/components/ui'
import { IconFolder, IconPlus } from '@/components/icons'
import { ProjectStatus, type Project } from '@/types'
import { pluralUk } from '@/utils/plural'

const router = useRouter()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

const { projects, loading, error } = storeToRefs(projectsStore)

// Filter state lives in the URL query (shareable/bookmarkable): q + status.
// Filtering logic itself stays in useFilters — only the storage source changed.
const search = ref('')
const filterValue = ref<ProjectStatus | null>(null)
useQueryFilters(
  { q: search, status: filterValue },
  {
    q: textCodec(300),
    status: enumCodec<ProjectStatus>([ProjectStatus.Active, ProjectStatus.Archived]),
  },
)
const { filtered } = useFilters<Project>(projects, {
  searchKey: 'name',
  search,
  filters: [choiceFilter<Project, ProjectStatus | null>('status', filterValue, { all: null })],
})

const modalOpen = ref(false)
const submitting = ref(false)
const editingProject = ref<Project | null>(null)

const deletingProject = ref<Project | null>(null)
const confirmOpen = ref(false)
const deleting = ref(false)

const deletingTaskCount = computed(() =>
  deletingProject.value ? projectsStore.taskCountByProject(deletingProject.value.id) : 0,
)

const subtitle = computed(() => {
  const total = projects.value.length
  const active = projects.value.filter((p) => p.status === ProjectStatus.Active).length
  return `${total} ${pluralUk(total, ['проект', 'проекти', 'проектів'])} · ${active} активних`
})

const isFiltering = computed(() => search.value.trim() !== '' || filterValue.value !== null)
const emptyTitle = computed(() =>
  isFiltering.value ? 'Нічого не знайдено' : 'Проектів ще немає',
)
const emptyHint = computed(() =>
  isFiltering.value
    ? 'Спробуйте змінити пошуковий запит або скинути фільтр статусу.'
    : 'Створіть свій перший проект, щоб організувати завдання команди.',
)

onMounted(() => {
  // Projects for the table; all tasks so the count column is populated.
  void projectsStore.fetchProjects()
  void tasksStore.fetchAllTasks()
})

function openModal(): void {
  editingProject.value = null
  modalOpen.value = true
}

function openEdit(project: Project): void {
  editingProject.value = project
  modalOpen.value = true
}

function closeModal(): void {
  modalOpen.value = false
  editingProject.value = null
}

async function handleSubmit(payload: ProjectFormPayload): Promise<void> {
  submitting.value = true
  // Same modal serves both flows; the presence of an editing target decides.
  const saved = editingProject.value
    ? await projectsStore.updateProject(editingProject.value.id, payload)
    : await projectsStore.addProject({ ...payload, status: ProjectStatus.Active })
  submitting.value = false
  // toast is raised by the store action
  if (saved) closeModal()
}

function requestDelete(project: Project): void {
  deletingProject.value = project
  confirmOpen.value = true
}

function cancelDelete(): void {
  confirmOpen.value = false
  deletingProject.value = null
}

async function confirmDelete(): Promise<void> {
  if (!deletingProject.value) return
  deleting.value = true
  await projectsStore.removeProject(deletingProject.value.id)
  deleting.value = false
  // Store filters the row out reactively and raises the toast.
  cancelDelete()
}

function goToProject(id: number): void {
  void router.push(`/projects/${id}`)
}
</script>

<template>
  <main class="projects">
    <header class="projects__head">
      <h1 class="projects__title">
        Проекти
      </h1>
      <p class="projects__subtitle">
        {{ subtitle }}
      </p>
    </header>

    <ProjectsToolbar
      v-model:search="search"
      v-model:status="filterValue"
      @add="openModal"
    />

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
      Завантаження проектів…
    </p>

    <template v-else>
      <ProjectsTable
        v-if="filtered.length > 0"
        :projects="filtered"
        @select="goToProject"
        @edit="openEdit"
        @delete="requestDelete"
      />

      <div
        v-else
        class="empty"
      >
        <div
          class="empty__icon"
          aria-hidden="true"
        >
          <IconFolder
            width="30"
            height="30"
          />
        </div>
        <div class="empty__title">
          {{ emptyTitle }}
        </div>
        <p class="empty__hint">
          {{ emptyHint }}
        </p>
        <BaseButton
          variant="primary"
          @click="openModal"
        >
          <template #icon>
            <IconPlus
              width="16"
              height="16"
            />
          </template>
          Додати проект
        </BaseButton>
      </div>

      <!-- Distribution across ALL projects' tasks — its own full-width section
           below the table. Counting lives in the store getter (no new endpoint),
           so it reacts to any status change anywhere. -->
      <TaskDistributionChart
        v-if="tasksStore.statusDistribution.total > 0"
        :distribution="tasksStore.statusDistribution"
        class="projects__chart"
      />
    </template>

    <ProjectFormModal
      :open="modalOpen"
      :project="editingProject"
      :submitting="submitting"
      @close="closeModal"
      @submit="handleSubmit"
    />

    <ConfirmDialog
      :open="confirmOpen"
      title="Видалити проект?"
      confirm-label="Видалити"
      cancel-label="Скасувати"
      danger
      :confirming="deleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    >
      <template v-if="deletingProject">
        Проект <strong>«{{ deletingProject.name }}»</strong> буде видалено
        {{
          deletingTaskCount > 0
            ? `разом із ${deletingTaskCount} ${pluralUk(deletingTaskCount, ['завданням', 'завданнями', 'завданнями'])}`
            : 'без пов’язаних завдань'
        }}. Цю дію не можна скасувати.
      </template>
    </ConfirmDialog>
  </main>
</template>

<style scoped lang="scss">
.projects {
  max-width: 1160px;
  margin: 0 auto;
  padding: 32px 32px 64px;

  &__head {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 24px;
  }

  &__title {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  &__subtitle {
    margin: 0;
    font-size: 14px;
    color: var(--text-secondary);
  }

  // Full-width distribution section below the table; gap above, none below.
  // Card styling (surface/border/radius/shadow) lives in the component.
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

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 72px 32px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
    border-radius: 16px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-tertiary);
  }

  &__title {
    margin-bottom: 8px;
    font-size: 17px;
    font-weight: 700;
    color: var(--text);
  }

  &__hint {
    max-width: 360px;
    margin: 0 0 24px;
    font-size: 14px;
    line-height: 1.55;
    color: var(--text-secondary);
  }
}
</style>
