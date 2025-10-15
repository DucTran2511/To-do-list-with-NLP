export type Task = {
  id: string
  title: string
  notes?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  dueTime?: string
  projectId?: string
  tags: string[]
  assignedTo?: string
  assignedBy?: string
  createdBy: string
  sharedWith?: string[]
  isShared?: boolean
  sharedBy?: string
  sharedFrom?: string
  sharedTo?: string
  originalTaskId?: string
  sharedAt?: string
  comments?: any[]
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type Project = {
  id: string
  name: string
  color: string
  createdAt: string
}

export type UndoAction = {
  id: string
  type: 'delete_task' | 'complete_task'
  data: any
  timestamp: string
}

const STORAGE_KEY = 'todo-mvp:v1'
const PROJECTS_KEY = 'todo-projects:v1'
const UNDO_KEY = 'todo-undo:v1'

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to load tasks:', e)
    return []
  }
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('Failed to save tasks:', e)
  }
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    return raw ? JSON.parse(raw) : [
      { id: 'default', name: 'Personal', color: '#5ff281', createdAt: new Date().toISOString() }
    ]
  } catch (e) {
    return [{ id: 'default', name: 'Personal', color: '#5ff281', createdAt: new Date().toISOString() }]
  }
}

export function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  } catch (e) {
    console.error('Failed to save projects:', e)
  }
}

export function loadUndoActions(): UndoAction[] {
  try {
    const raw = localStorage.getItem(UNDO_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export function saveUndoActions(actions: UndoAction[]) {
  try {
    localStorage.setItem(UNDO_KEY, JSON.stringify(actions.slice(0, 5)))
  } catch (e) {
    console.error('Failed to save undo actions:', e)
  }
}
