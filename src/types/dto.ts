import type { Project, Task } from './models'

// Create: client supplies the editable fields; `id` and `createdAt` are
// assigned by the server.
export type CreateProjectDto = Omit<Project, 'id' | 'createdAt'>

// Update: any editable field may change; identity/timestamp stay fixed.
export type UpdateProjectDto = Partial<Omit<Project, 'id' | 'createdAt'>>

// Create: `id` is server-assigned; `order` is assigned on insert (appended).
export type CreateTaskDto = Omit<Task, 'id' | 'order'>

// Update: any field except identity and owning project may change
// (covers status moves and DnD `order` updates).
export type UpdateTaskDto = Partial<Omit<Task, 'id' | 'projectId'>>
