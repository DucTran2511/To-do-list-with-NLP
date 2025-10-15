import Dexie, { type Table } from 'dexie'

export type Task = {
  id: string
  title: string
  notes?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string // ISO string
  dueTime?: string // HH:MM format
  projectId?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null // for trash/undo
}

export type Project = {
  id: string
  name: string
  color: string
  createdAt: string
}

export type UndoAction = {
  id: string
  type: 'delete_task' | 'complete_task' | 'delete_project'
  data: any
  timestamp: string
}

class TodoDatabase extends Dexie {
  tasks!: Table<Task>
  projects!: Table<Project>
  undoActions!: Table<UndoAction>

  constructor() {
    super('TodoApp')
    this.version(1).stores({
      tasks: 'id, title, completed, priority, dueDate, projectId, createdAt, deletedAt',
      projects: 'id, name, createdAt',
      undoActions: 'id, type, timestamp'
    })
    
    this.tasks.hook('creating', function(_primKey, obj, _trans) {
      obj.deletedAt = obj.deletedAt || null
    })
  }
}

export const db = new TodoDatabase()

export async function initializeDefaults() {
  const projectCount = await db.projects.count()
  if (projectCount === 0) {
    await db.projects.add({
      id: 'default',
      name: 'Personal',
      color: '#5ff281',
      createdAt: new Date().toISOString()
    })
  }
}
