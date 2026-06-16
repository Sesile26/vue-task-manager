import { AxiosError, AxiosHeaders } from 'axios'
import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import {
  ProjectStatus,
  TaskStatus,
  type Project,
  type Task,
  type CreateProjectDto,
  type UpdateProjectDto,
  type CreateTaskDto,
  type UpdateTaskDto,
} from '@/types'

const STORAGE_KEYS = {
  projects: 'projects',
  tasks: 'tasks',
} as const

function read<T>(key: string): T[] {
  const raw = localStorage.getItem(key)
  if (raw === null) return []
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function write<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function nextId<T extends { id: number }>(items: T[]): number {
  return items.reduce((max, item) => (item.id > max ? item.id : max), 0) + 1
}

function seedIfEmpty(): void {
  if (localStorage.getItem(STORAGE_KEYS.projects) !== null) return

  const projects: Project[] = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Marketing site refresh',
      status: ProjectStatus.Active,
      createdAt: '2026-01-10T09:00:00.000Z',
    },
    {
      id: 2,
      name: 'Mobile App',
      description: null,
      status: ProjectStatus.Active,
      createdAt: '2026-02-15T12:30:00.000Z',
    },
    {
      id: 3,
      name: 'Legacy Migration',
      description: 'Move off the old platform',
      status: ProjectStatus.Archived,
      createdAt: '2025-11-01T08:00:00.000Z',
    },
  ]

  const tasks: Task[] = [
    { id: 1, projectId: 1, name: 'Wireframes', assignee: 'Anna', status: TaskStatus.Done, dueDate: '2026-01-20', order: 0 },
    { id: 2, projectId: 1, name: 'Hero section', assignee: 'Bob', status: TaskStatus.InProgress, dueDate: '2026-02-05', order: 1 },
    { id: 3, projectId: 1, name: 'Contact form', assignee: null, status: TaskStatus.Todo, dueDate: '2026-02-12', order: 2 },
    { id: 4, projectId: 2, name: 'Auth flow', assignee: 'Anna', status: TaskStatus.InProgress, dueDate: '2026-03-01', order: 0 },
    { id: 5, projectId: 2, name: 'Push notifications', assignee: null, status: TaskStatus.Todo, dueDate: '2026-03-15', order: 1 },
    { id: 6, projectId: 3, name: 'Export old data', assignee: 'Carl', status: TaskStatus.Done, dueDate: '2025-11-20', order: 0 },
  ]

  write(STORAGE_KEYS.projects, projects)
  write(STORAGE_KEYS.tasks, tasks)
}

/** Artificial latency in the 150–300 ms range. */
function delay(): Promise<void> {
  const ms = 150 + Math.floor(Math.random() * 151)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  404: 'Not Found',
}

function makeResponse<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: STATUS_TEXT[status] ?? '',
    headers: new AxiosHeaders(),
    config,
  }
}

function fail(config: InternalAxiosRequestConfig, status: number, message: string): never {
  const response = makeResponse(config, { message }, status)
  throw new AxiosError(message, `E${status}`, config, undefined, response)
}

/** Bodies arrive JSON-stringified (axios transformRequest); parse back. */
function parseBody<T>(raw: unknown): T {
  if (typeof raw === 'string') return JSON.parse(raw) as T
  return raw as T
}

const RE_PROJECTS = /^\/projects\/?$/
const RE_PROJECT_ID = /^\/projects\/(\d+)\/?$/
const RE_TASKS = /^\/tasks\/?$/
const RE_TASK_ID = /^\/tasks\/(\d+)\/?$/

/**
 * Custom Axios adapter — chosen over axios-mock-adapter to keep the mock
 * self-contained and fully typed (no extra dependency, no `any`). It serves
 * every request from localStorage with a small random delay.
 */
export const mockAdapter: AxiosAdapter = async (
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse<unknown>> => {
  seedIfEmpty()
  await delay()

  const method = (config.method ?? 'get').toLowerCase()
  const url = config.url ?? ''
  const params = (config.params ?? {}) as Record<string, unknown>

  if (RE_PROJECTS.test(url)) {
    const projects = read<Project>(STORAGE_KEYS.projects)

    if (method === 'get') {
      return makeResponse(config, projects)
    }
    if (method === 'post') {
      const dto = parseBody<CreateProjectDto>(config.data)
      const project: Project = {
        id: nextId(projects),
        name: dto.name,
        description: dto.description,
        status: dto.status,
        createdAt: new Date().toISOString(),
      }
      write(STORAGE_KEYS.projects, [...projects, project])
      return makeResponse(config, project, 201)
    }
  }

  const projectIdMatch = url.match(RE_PROJECT_ID)
  if (projectIdMatch) {
    const id = Number(projectIdMatch[1])
    const projects = read<Project>(STORAGE_KEYS.projects)
    const index = projects.findIndex((p) => p.id === id)
    if (index === -1) fail(config, 404, `Project ${id} not found`)

    if (method === 'put') {
      const dto = parseBody<UpdateProjectDto>(config.data)
      const updated: Project = { ...projects[index], ...dto, id }
      const next = [...projects]
      next[index] = updated
      write(STORAGE_KEYS.projects, next)
      return makeResponse(config, updated)
    }
    if (method === 'delete') {
      write(STORAGE_KEYS.projects, projects.filter((p) => p.id !== id))
      // Cascade: drop the project's tasks too.
      const tasks = read<Task>(STORAGE_KEYS.tasks)
      write(STORAGE_KEYS.tasks, tasks.filter((t) => t.projectId !== id))
      return makeResponse(config, null, 200)
    }
  }

  if (RE_TASKS.test(url)) {
    const tasks = read<Task>(STORAGE_KEYS.tasks)

    if (method === 'get') {
      const projectIdRaw = params.projectId
      if (projectIdRaw === undefined) {
        return makeResponse(config, tasks)
      }
      const projectId = Number(projectIdRaw)
      const filtered = tasks
        .filter((t) => t.projectId === projectId)
        .sort((a, b) => a.order - b.order)
      return makeResponse(config, filtered)
    }
    if (method === 'post') {
      const dto = parseBody<CreateTaskDto>(config.data)
      const siblings = tasks.filter((t) => t.projectId === dto.projectId)
      const order = siblings.reduce((max, t) => (t.order > max ? t.order : max), -1) + 1
      const task: Task = {
        id: nextId(tasks),
        projectId: dto.projectId,
        name: dto.name,
        assignee: dto.assignee,
        status: dto.status,
        dueDate: dto.dueDate,
        order,
      }
      write(STORAGE_KEYS.tasks, [...tasks, task])
      return makeResponse(config, task, 201)
    }
  }

  const taskIdMatch = url.match(RE_TASK_ID)
  if (taskIdMatch) {
    const id = Number(taskIdMatch[1])
    const tasks = read<Task>(STORAGE_KEYS.tasks)
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) fail(config, 404, `Task ${id} not found`)

    if (method === 'put') {
      const dto = parseBody<UpdateTaskDto>(config.data)
      const updated: Task = { ...tasks[index], ...dto, id }
      const next = [...tasks]
      next[index] = updated
      write(STORAGE_KEYS.tasks, next)
      return makeResponse(config, updated)
    }
    if (method === 'delete') {
      write(STORAGE_KEYS.tasks, tasks.filter((t) => t.id !== id))
      return makeResponse(config, null, 200)
    }
  }

  return fail(config, 404, `No mock handler for ${method.toUpperCase()} ${url}`)
}
