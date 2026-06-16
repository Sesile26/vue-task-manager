import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/types'
import {
  getProjects,
  createProject,
  updateProject as apiUpdateProject,
  deleteProject,
  settle,
} from '@/api'
import { useToast } from '@/composables'
import { useTasksStore } from './tasks.store'

/**
 * Projects state. The store keeps projects in memory and reloads through the
 * API; persistence already lives in the mock adapter, so it is not duplicated
 * here. Task counts are derived reactively from the tasks store — never stored
 * on the Project model.
 */
export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const tasksStore = useTasksStore()
  const toast = useToast()

  async function fetchProjects(): Promise<void> {
    loading.value = true
    error.value = null
    const result = await settle(getProjects())
    if (result.ok) projects.value = result.data
    else error.value = result.error
    loading.value = false
  }

  async function addProject(dto: CreateProjectDto): Promise<Project | null> {
    error.value = null
    const result = await settle(createProject(dto))
    if (!result.ok) {
      error.value = result.error
      toast.error('Не вдалося створити проект', result.error)
      return null
    }
    projects.value.push(result.data)
    toast.success('Проект створено', `«${result.data.name}» додано до списку.`)
    return result.data
  }

  async function updateProject(id: number, dto: UpdateProjectDto): Promise<Project | null> {
    error.value = null
    const result = await settle(apiUpdateProject(id, dto))
    if (!result.ok) {
      error.value = result.error
      toast.error('Не вдалося оновити проект', result.error)
      return null
    }
    const index = projects.value.findIndex((p) => p.id === id)
    if (index !== -1) projects.value[index] = result.data
    toast.success('Проект оновлено', `«${result.data.name}» збережено.`)
    return result.data
  }

  async function removeProject(id: number): Promise<void> {
    error.value = null
    const name = projects.value.find((p) => p.id === id)?.name
    const result = await settle(deleteProject(id))
    if (!result.ok) {
      error.value = result.error
      toast.error('Не вдалося видалити проект', result.error)
      return
    }
    projects.value = projects.value.filter((p) => p.id !== id)
    toast.success('Проект видалено', name ? `«${name}» видалено.` : undefined)
  }

  /**
   * Reactive task counter sourced from the tasks store. Returns a lookup
   * function so it can be called per project id from templates; it re-evaluates
   * whenever the tasks list changes.
   */
  const taskCountByProject = computed(() => {
    return (projectId: number): number =>
      tasksStore.tasks.filter((t) => t.projectId === projectId).length
  })

  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    removeProject,
    taskCountByProject,
  }
})
