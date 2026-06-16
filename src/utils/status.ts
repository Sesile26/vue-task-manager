import { ProjectStatus, TaskStatus } from '@/types'

/** Single source of truth for task-status labels (Ukrainian). */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'До виконання',
  [TaskStatus.InProgress]: 'В роботі',
  [TaskStatus.Done]: 'Виконано',
}

/** Single source of truth for project-status labels (Ukrainian). */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.Active]: 'Активний',
  [ProjectStatus.Archived]: 'Архівний',
}
