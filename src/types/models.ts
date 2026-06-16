import type { ProjectStatus, TaskStatus } from './enums'

// Core domain models. These mirror what the API persists — nothing computed.

export interface Project {
  id: number
  name: string
  description: string | null
  status: ProjectStatus
  /** Creation timestamp, ISO 8601 date-time string (e.g. 2026-06-16T10:30:00Z). */
  createdAt: string
}

export interface Task {
  id: number
  projectId: number
  name: string
  assignee: string | null
  status: TaskStatus
  /** Due date, ISO 8601 date string (e.g. 2026-06-16). */
  dueDate: string
  /** Sort position within a project — used for drag-and-drop ordering. */
  order: number
}

// `taskCount` is intentionally NOT a field on `Project`: it is a reactive
// value computed in the store from the task list, never persisted on the
// model itself. This view type is for components that need the count
// alongside a project (e.g. a list row), where it is provided as a computed.
export interface ProjectWithTaskCount extends Project {
  taskCount: number
}

// Task counts per status (+ total), computed reactively in the tasks store from
// the task list — never persisted. Drives the distribution donut on both the
// projects list (all projects) and a single project page.
export interface StatusDistribution {
  todo: number
  in_progress: number
  done: number
  total: number
}
