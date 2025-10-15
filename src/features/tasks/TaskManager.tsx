import '../../App.css'
import { useEffect, useState } from 'react'
import { format, isToday, isPast, parseISO } from 'date-fns'
import { parseNaturalLanguage } from '../../shared/utils/nlp-parser'
import { reminderManager } from '../../shared/utils/reminder-system'

type Task = {
  id: string
  title: string
  notes?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  dueTime?: string
  projectId?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

type Project = {
  id: string
  name: string
  color: string
  createdAt: string
}

type UndoAction = {
  id: string
  type: 'delete_task' | 'complete_task'
  data: any
  timestamp: string
}

const STORAGE_KEY = 'todo-mvp:v1'
const PROJECTS_KEY = 'todo-projects:v1'
const UNDO_KEY = 'todo-undo:v1'

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to load tasks:', e)
    return []
  }
}

function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('Failed to save tasks:', e)
  }
}

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    return raw ? JSON.parse(raw) : [
      { id: 'default', name: 'Personal', color: '#5ff281', createdAt: new Date().toISOString() }
    ]
  } catch (e) {
    return [{ id: 'default', name: 'Personal', color: '#5ff281', createdAt: new Date().toISOString() }]
  }
}

function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  } catch (e) {
    console.error('Failed to save projects:', e)
  }
}

function loadUndoActions(): UndoAction[] {
  try {
    const raw = localStorage.getItem(UNDO_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function saveUndoActions(actions: UndoAction[]) {
  try {
    localStorage.setItem(UNDO_KEY, JSON.stringify(actions.slice(0, 5))) // Keep only last 5
  } catch (e) {
    console.error('Failed to save undo actions:', e)
  }
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [projects] = useState<Project[]>(() => loadProjects())
  const [undoActions, setUndoActions] = useState<UndoAction[]>(() => loadUndoActions())
  const [value, setValue] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'today' | 'overdue' | 'trash'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'default'>('default')
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  useEffect(() => {
    saveProjects(projects)
  }, [projects])

  useEffect(() => {
    saveUndoActions(undoActions)
  }, [undoActions])

  useEffect(() => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return
    }

    const currentPermission = Notification.permission
    setNotificationPermission(currentPermission)

    const hasTasksWithDueDates = tasks.some(task => !task.completed && task.dueDate)
    if (currentPermission === 'default' && hasTasksWithDueDates) {
      setShowNotificationPrompt(true)
    }

    reminderManager.onNotificationClick = (taskId: string) => {
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`)
      if (taskElement) {
        taskElement.scrollIntoView({ behavior: 'smooth' })
      }
    }

    return () => {
      reminderManager.clearAllReminders()
    }
  }, [])

  useEffect(() => {
    if (notificationPermission === 'granted') {
      reminderManager.scheduleRemindersForTasks(tasks)
    }
  }, [tasks, notificationPermission])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault()
            document.getElementById('search-input')?.focus()
            break
          case 'n':
            e.preventDefault()
            document.getElementById('add-input')?.focus()
            break
          case 'z':
            e.preventDefault()
            if (undoActions.length > 0) performUndo(undoActions[0])
            break
        }
      }
      if (e.key === 'Escape') {
        setEditingId(null)
        setSearchQuery('')
        setValue('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undoActions])

  const addTask = (input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return

    const parsed = parseNaturalLanguage(trimmed)
    let projectId = 'default'

    if (parsed.projectHint) {
      const project = projects.find((p: Project) => 
        p.name.toLowerCase().includes(parsed.projectHint!.toLowerCase())
      )
      if (project) projectId = project.id
    }

    const newTask: Task = {
      id: makeId(),
      title: parsed.title,
      completed: false,
      priority: parsed.priority || 'medium',
      dueDate: parsed.dueDate,
      dueTime: parsed.dueTime,
      projectId,
      tags: parsed.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setTasks((prev: Task[]) => [newTask, ...prev])
    setValue('')
  }

  const handleRequestNotifications = async () => {
    const permission = await reminderManager.requestPermission()
    setNotificationPermission(permission)
    setShowNotificationPrompt(false)
    
    if (permission === 'granted') {
      reminderManager.scheduleRemindersForTasks(tasks)
    }
  }

  const dismissNotificationPrompt = () => {
    setShowNotificationPrompt(false)
  }

  const toggleTask = (id: string) => {
    const task = tasks.find((t: Task) => t.id === id)
    if (!task) return

    if (!task.completed) {
      const undoAction: UndoAction = {
        id: makeId(),
        type: 'complete_task',
        data: { taskId: id, wasCompleted: task.completed },
        timestamp: new Date().toISOString()
      }
      setUndoActions((prev: UndoAction[]) => [undoAction, ...prev.slice(0, 4)])
    }

    setTasks((prev: Task[]) =>
      prev.map((t: Task) => 
        t.id === id 
          ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
          : t
      )
    )
  }

  const deleteTask = (id: string) => {
    const task = tasks.find((t: Task) => t.id === id)
    if (!task) return

    const undoAction: UndoAction = {
      id: makeId(),
      type: 'delete_task',
      data: task,
      timestamp: new Date().toISOString()
    }
    setUndoActions((prev: UndoAction[]) => [undoAction, ...prev.slice(0, 4)])

    setTasks((prev: Task[]) =>
      prev.map((t: Task) => 
        t.id === id 
          ? { ...t, deletedAt: new Date().toISOString() }
          : t
      )
    )
  }

  const permanentlyDeleteTask = (id: string) => {
    setTasks((prev: Task[]) => prev.filter((t: Task) => t.id !== id))
  }

  const restoreTask = (id: string) => {
    setTasks((prev: Task[]) =>
      prev.map((t: Task) => 
        t.id === id 
          ? { ...t, deletedAt: undefined, updatedAt: new Date().toISOString() }
          : t
      )
    )
  }

  const performUndo = (action: UndoAction) => {
    switch (action.type) {
      case 'delete_task':
        setTasks((prev: Task[]) => [{ ...action.data, deletedAt: undefined }, ...prev])
        break
      case 'complete_task':
        setTasks((prev: Task[]) =>
          prev.map((t: Task) => 
            t.id === action.data.taskId
              ? { ...t, completed: action.data.wasCompleted, updatedAt: new Date().toISOString() }
              : t
          )
        )
        break
    }
    setUndoActions((prev: UndoAction[]) => prev.filter((a: UndoAction) => a.id !== action.id))
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditingValue(task.title)
  }

  const saveEdit = (id: string) => {
    const trimmed = editingValue.trim()
    if (!trimmed) return

    setTasks((prev: Task[]) =>
      prev.map((t: Task) => 
        t.id === id 
          ? { ...t, title: trimmed, updatedAt: new Date().toISOString() }
          : t
      )
    )
    setEditingId(null)
    setEditingValue('')
  }

  const filteredTasks = (() => {
    let filtered = tasks.filter((task: Task) => {
      if (filter === 'trash') {
        return task.deletedAt
      } else {
        if (task.deletedAt) return false
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return task.title.toLowerCase().includes(query) ||
               task.tags.some((tag: string) => tag.toLowerCase().includes(query)) ||
               (task.notes && task.notes.toLowerCase().includes(query))
      }
      return true
    })

    if (selectedProject !== 'all') {
      filtered = filtered.filter((task: Task) => task.projectId === selectedProject)
    }

    switch (filter) {
      case 'active':
        return filtered.filter((task: Task) => !task.completed)
      case 'completed':
        return filtered.filter((task: Task) => task.completed)
      case 'today':
        return filtered.filter((task: Task) => 
          task.dueDate && isToday(parseISO(task.dueDate))
        )
      case 'overdue':
        return filtered.filter((task: Task) => {
          if (!task.dueDate || task.completed) return false
          
          const dueDate = parseISO(task.dueDate)
          let dueDateTime = dueDate
          
          if (task.dueTime) {
            const [hours, minutes] = task.dueTime.split(':').map(Number)
            dueDateTime = new Date(dueDate)
            dueDateTime.setHours(hours, minutes, 0, 0)
          } else {
            dueDateTime = new Date(dueDate)
            dueDateTime.setHours(23, 59, 59, 999)
          }
          
          return isPast(dueDateTime)
        })
      default:
        return filtered
    }
  })()

  const formatDueDate = (task: Task) => {
    if (!task.dueDate) return null
    const date = parseISO(task.dueDate)
    let dateStr = format(date, 'MMM d')
    if (isToday(date)) dateStr = 'Today'
    if (task.dueTime) dateStr += ` ${task.dueTime}`
    return dateStr
  }

  const activeTasks = tasks.filter((t: Task) => !t.deletedAt)

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Enhanced To‑Do MVP</h1>
        <div className="counts">
          {activeTasks.length} tasks • {activeTasks.filter((t: Task) => t.completed).length} done
          {/* Notification Status Indicator */}
          <span 
            className={`notification-status ${notificationPermission}`}
            title={
              notificationPermission === 'granted' 
                ? 'Notifications enabled - you\'ll get reminders at due times'
                : notificationPermission === 'denied'
                ? 'Notifications blocked - enable in browser settings'
                : 'Click to enable notifications for reminders'
            }
          >
            {notificationPermission === 'granted' && '🔔'}
            {notificationPermission === 'denied' && '🔕'}
            {notificationPermission === 'default' && '🔔?'}
          </span>
          {undoActions.length > 0 && (
            <button 
              className="undo-btn" 
              onClick={() => performUndo(undoActions[0])}
              title="Undo last action (Ctrl+Z)"
            >
              ↶ Undo
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {showNotificationPrompt && (
          <div className="notification-prompt">
            <div className="notification-content">
              <h3>🔔 Enable Notifications</h3>
              <p>Get reminded when your tasks are due!</p>
              <div className="notification-actions">
                <button 
                  className="btn-primary" 
                  onClick={handleRequestNotifications}
                >
                  Enable Notifications
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={dismissNotificationPrompt}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}
        
        <section className="composer">
          <input
            id="add-input"
            aria-label="Add task with natural language"
            placeholder='Try: "call mom tomorrow 9am" or "meeting today 22:35 #work urgent"'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTask(value)
            }}
            className="input-add"
          />
          
          <div className="search-filters">
            <input
              id="search-input"
              type="search"
              placeholder="Search tasks... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            
            <select 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
              className="project-select"
            >
              <option value="all">All Projects</option>
              {projects.map((project: Project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="filters">
            {(['all', 'active', 'today', 'overdue', 'completed', 'trash'] as const).map(f => (
              <button 
                key={f}
                className={filter === f ? 'active' : ''} 
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </section>

        <section className="list">
          {filteredTasks.length === 0 ? (
            <div className="empty">
              {filter === 'trash' ? 'Trash is empty' : 'No tasks found'}
            </div>
          ) : (
            filteredTasks.map((task: Task) => (
              <div key={task.id} className={`task ${task.completed ? 'done' : ''} priority-${task.priority}`}>
                {filter !== 'trash' && (
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} completed`}
                  />
                )}

                <div className="task-content">
                  {editingId === task.id ? (
                    <input
                      className="input-edit"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => saveEdit(task.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(task.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                    />
                  ) : (
                    <div>
                      <div 
                        className="title" 
                        onDoubleClick={() => startEdit(task)}
                      >
                        {task.title}
                      </div>
                      <div className="meta">
                        {formatDueDate(task) && (
                          <span className="due-date">{formatDueDate(task)}</span>
                        )}
                        {task.tags.map((tag: string) => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                        {projects.find((p: Project) => p.id === task.projectId)?.name && (
                          <span className="project">
                            @{projects.find((p: Project) => p.id === task.projectId)?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="actions">
                  {filter === 'trash' ? (
                    <>
                      <button onClick={() => restoreTask(task.id)}>Restore</button>
                      <button 
                        onClick={() => permanentlyDeleteTask(task.id)} 
                        className="danger"
                      >
                        Delete Forever
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(task)}>Edit</button>
                      <button onClick={() => deleteTask(task.id)} className="danger">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      <footer className="app-footer">
        Enhanced MVP • LocalStorage • NLP • Shortcuts (Ctrl+N, Ctrl+K, Ctrl+Z) • {activeTasks.length} total tasks
      </footer>
    </div>
  )
}
