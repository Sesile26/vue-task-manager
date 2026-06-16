import { http } from './http'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@/types'

export function getTasks(projectId: number): Promise<Task[]> {
  return http.get<Task[]>('/tasks', { params: { projectId } })
}

/** All tasks across every project — used by the list view for task counts. */
export function getAllTasks(): Promise<Task[]> {
  return http.get<Task[]>('/tasks')
}

export function createTask(dto: CreateTaskDto): Promise<Task> {
  return http.post<Task, CreateTaskDto>('/tasks', dto)
}

export function updateTask(id: number, dto: UpdateTaskDto): Promise<Task> {
  return http.put<Task, UpdateTaskDto>(`/tasks/${id}`, dto)
}

export function deleteTask(id: number): Promise<void> {
  return http.delete<void>(`/tasks/${id}`)
}
