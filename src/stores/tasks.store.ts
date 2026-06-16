import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  TaskStatus,
  type Task,
  type CreateTaskDto,
  type UpdateTaskDto,
  type StatusDistribution,
} from '@/types'
import {
  getTasks,
  getAllTasks,
  createTask,
  updateTask as apiUpdateTask,
  deleteTask,
  settle,
} from '@/api'
import { useToast } from '@/composables'
import { TASK_STATUS_LABELS } from '@/utils/status'

/**
 * Tasks are the single source of truth for the board. Mutations update the
 * in-memory state immediately (optimistic) so status/order changes reflect
 * everywhere at once, then persist via the API.
 */
export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toast = useToast()

  /**
   * Task counts per status (+ total), derived from whatever is currently in
   * `tasks` — all projects on the list page, a single project on its page.
   * Reactive: any status change updates it (and the distribution donut) at once.
   */
  const statusDistribution = computed<StatusDistribution>(() => {
    const dist: StatusDistribution = { todo: 0, in_progress: 0, done: 0, total: tasks.value.length }
    for (const task of tasks.value) {
      if (task.status === TaskStatus.Todo) dist.todo += 1
      else if (task.status === TaskStatus.InProgress) dist.in_progress += 1
      else if (task.status === TaskStatus.Done) dist.done += 1
    }
    return dist
  })

  async function fetchTasks(projectId: number): Promise<void> {
    loading.value = true
    error.value = null
    const result = await settle(getTasks(projectId))
    if (result.ok) tasks.value = result.data
    else error.value = result.error
    loading.value = false
  }

  /** Load every task (e.g. for the projects list, where counts span projects). */
  async function fetchAllTasks(): Promise<void> {
    loading.value = true
    error.value = null
    const result = await settle(getAllTasks())
    if (result.ok) tasks.value = result.data
    else error.value = result.error
    loading.value = false
  }

  async function addTask(dto: CreateTaskDto): Promise<Task | null> {
    error.value = null
    const result = await settle(createTask(dto))
    if (!result.ok) {
      error.value = result.error
      toast.error('Не вдалося зберегти', result.error)
      return null
    }
    tasks.value.push(result.data)
    toast.success(
      'Завдання успішно додано',
      `«${result.data.name}» у колонці ${TASK_STATUS_LABELS[result.data.status]}.`,
    )
    return result.data
  }

  async function updateTask(id: number, dto: UpdateTaskDto): Promise<Task | null> {
    error.value = null
    const result = await settle(apiUpdateTask(id, dto))
    if (!result.ok) {
      error.value = result.error
      toast.error('Не вдалося зберегти', result.error)
      return null
    }
    const index = tasks.value.findIndex((t) => t.id === id)
    if (index !== -1) tasks.value[index] = result.data
    toast.success('Завдання оновлено', `«${result.data.name}» збережено.`)
    return result.data
  }

  async function removeTask(id: number): Promise<void> {
    error.value = null
    const name = tasks.value.find((t) => t.id === id)?.name
    const result = await settle(deleteTask(id))
    if (!result.ok) {
      error.value = result.error
      toast.error('Не вдалося видалити', result.error)
      return
    }
    tasks.value = tasks.value.filter((t) => t.id !== id)
    toast.success('Завдання видалено', name ? `«${name}» видалено.` : undefined)
  }

  /**
   * Persist a new ordering. `orderedIds` is the full flat list of a project's
   * task ids in their new visual order; each task's `order` becomes its index
   * (its position in the project's flat list). Local state is updated first so
   * the UI reorders instantly, then changes are persisted via the API.
   */
  async function reorderTasks(projectId: number, orderedIds: number[]): Promise<void> {
    error.value = null
    // Optimistic update; collect only the tasks whose order actually changed.
    const changed: { id: number; order: number }[] = []
    orderedIds.forEach((id, index) => {
      const task = tasks.value.find((t) => t.id === id && t.projectId === projectId)
      if (task && task.order !== index) {
        task.order = index
        changed.push({ id, order: index })
      }
    })
    if (changed.length === 0) return

    const result = await settle(
      Promise.all(changed.map((c) => apiUpdateTask(c.id, { order: c.order }))),
    )
    if (!result.ok) error.value = result.error
  }

  /**
   * Reconcile the whole kanban board from its actual layout. Walks the columns
   * todo → in_progress → done and gives each task the status of its column and
   * a through-running `order` (a flat counter across all columns), so `order`
   * stays unique and shared with the table. Only changed tasks are persisted.
   */
  async function syncBoard(
    projectId: number,
    columns: { todo: number[]; in_progress: number[]; done: number[] },
  ): Promise<void> {
    error.value = null

    const layout: { id: number; status: TaskStatus }[] = [
      ...columns.todo.map((id) => ({ id, status: TaskStatus.Todo })),
      ...columns.in_progress.map((id) => ({ id, status: TaskStatus.InProgress })),
      ...columns.done.map((id) => ({ id, status: TaskStatus.Done })),
    ]

    const changed: Task[] = []
    let movedTo: TaskStatus | null = null
    let statusChanges = 0

    layout.forEach(({ id, status }, order) => {
      const task = tasks.value.find((t) => t.id === id && t.projectId === projectId)
      if (!task) return
      if (task.status !== status) {
        statusChanges += 1
        movedTo = status
      }
      if (task.status !== status || task.order !== order) {
        task.status = status // optimistic — shared store object, the table sees it instantly
        task.order = order
        changed.push(task)
      }
    })

    if (changed.length === 0) return

    // A single cross-column move → mirror the previous "moved" toast.
    if (statusChanges === 1 && movedTo !== null) {
      toast.success('Завдання переміщено', `до колонки «${TASK_STATUS_LABELS[movedTo]}».`)
    }

    const result = await settle(
      Promise.all(
        changed.map((task) => apiUpdateTask(task.id, { status: task.status, order: task.order })),
      ),
    )
    if (!result.ok) {
      error.value = result.error
      toast.error('Не вдалося зберегти дошку', result.error)
    }
  }

  return {
    tasks,
    loading,
    error,
    statusDistribution,
    fetchTasks,
    fetchAllTasks,
    addTask,
    updateTask,
    removeTask,
    reorderTasks,
    syncBoard,
  }
})
