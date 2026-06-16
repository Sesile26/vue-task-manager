import { http } from './http'
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/types'

export function getProjects(): Promise<Project[]> {
  return http.get<Project[]>('/projects')
}

export function createProject(dto: CreateProjectDto): Promise<Project> {
  return http.post<Project, CreateProjectDto>('/projects', dto)
}

export function updateProject(id: number, dto: UpdateProjectDto): Promise<Project> {
  return http.put<Project, UpdateProjectDto>(`/projects/${id}`, dto)
}

export function deleteProject(id: number): Promise<void> {
  return http.delete<void>(`/projects/${id}`)
}
