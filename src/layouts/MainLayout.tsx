import '../App.css'
import { useEffect, useState } from 'react'
import { format, isToday, isPast, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addMonths, isWithinInterval, isSameDay, startOfDay } from 'date-fns'
import { parseNaturalLanguage, type Task, type Project, type UndoAction, loadTasks, saveTasks, loadProjects, saveProjects, loadUndoActions, saveUndoActions } from '../shared/utils'
import { type User, AuthModal, UserProfile, authService } from '../features/authentication'
import { ShareTask, SharingService } from '../features/sharing'

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export default function MainLayout() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showShareTaskModal, setShowShareTaskModal] = useState(false)
  const [taskToShare, setTaskToShare] = useState<Task | null>(null)

  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [projects] = useState<Project[]>(() => loadProjects())
  const [undoActions, setUndoActions] = useState<UndoAction[]>(() => loadUndoActions())
  const [pendingSharedTasks, setPendingSharedTasks] = useState<Task[]>([])
  const [value, setValue] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'today' | 'overdue' | 'trash'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())
  const [timeFilter, setTimeFilter] = useState<'all' | 'custom'>('all')
  const [customStartTime, setCustomStartTime] = useState<string>('')
  const [customEndTime, setCustomEndTime] = useState<string>('')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagSearchQuery, setTagSearchQuery] = useState<string>('')
  const [showTagDropdown, setShowTagDropdown] = useState<boolean>(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showIntro, setShowIntro] = useState(() => {
    const hasSeenIntro = localStorage.getItem('todo-intro-seen')
    return !hasSeenIntro || loadTasks().length === 0
  })

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  useEffect(() => {
    saveProjects(projects)
  }, [projects])

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = authService.getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('Auth initialization failed:', error)
      }
    }

    initAuth()
  }, [])


  useEffect(() => {
    const loadSharedTasks = async () => {
      if (currentUser) {
        try {
          const userSharedTasks = await SharingService.getSharedTasks(currentUser.email);
          console.log('Loaded shared tasks from server:', userSharedTasks);
          setPendingSharedTasks(userSharedTasks);
        } catch (error) {
          console.error('Failed to load shared tasks from server:', error);
          const sharedTasks = JSON.parse(localStorage.getItem('shared_tasks') || '[]')
          const userSharedTasks = sharedTasks.filter((task: any) => task.sharedTo === currentUser.email)
          setPendingSharedTasks(userSharedTasks);
        }
      } else {
        setPendingSharedTasks([])
      }
    };

    loadSharedTasks();
  }, [currentUser])

  useEffect(() => {
    saveUndoActions(undoActions)
  }, [undoActions])

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

    console.log('🔍 Input:', trimmed)
    const parsed = parseNaturalLanguage(trimmed)
    console.log('📝 Parsed result:', parsed)
    
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
      tags: parsed.tags.slice(0, 5), // Limit to 5 tags
      createdBy: currentUser?.id || 'anonymous',
      sharedWith: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log('✅ Created task:', newTask)
    setTasks((prev: Task[]) => [newTask, ...prev])
    setValue('')
  }

  const toggleTask = (id: string) => {
    const task = tasks.find((t: Task) => t.id === id)
    if (!task) return

    if (!task.completed) {
      const undoAction: UndoAction = {
        id: makeId(),
        type: 'complete_task',
        data: { taskId: id },
        timestamp: new Date().toISOString()
      }
      setUndoActions((prev: UndoAction[]) => [undoAction, ...prev])
    }

    setTasks((prev: Task[]) => prev.map((t: Task) => 
      t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
    ))
  }

  const deleteTask = (id: string) => {
    const task = tasks.find((t: Task) => t.id === id)
    if (!task) return

    const undoAction: UndoAction = {
      id: makeId(),
      type: 'delete_task',
      data: { task: { ...task } },
      timestamp: new Date().toISOString()
    }
    setUndoActions((prev: UndoAction[]) => [undoAction, ...prev])

    setTasks((prev: Task[]) => prev.map((t: Task) => 
      t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t
    ))
  }

  const restoreTask = (id: string) => {
    setTasks((prev: Task[]) => prev.map((t: Task) => 
      t.id === id ? { ...t, deletedAt: undefined } : t
    ))
  }

  const permanentlyDeleteTask = (id: string) => {
    setTasks((prev: Task[]) => prev.filter((t: Task) => t.id !== id))
  }

  const performUndo = (action: UndoAction) => {
    switch (action.type) {
      case 'delete_task':
        setTasks((prev: Task[]) => [action.data.task, ...prev])
        break
      case 'complete_task':
        setTasks((prev: Task[]) => prev.map((t: Task) => 
          t.id === action.data.taskId ? { ...t, completed: false } : t
        ))
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

    const parsed = parseNaturalLanguage(trimmed)
    
    setTasks((prev: Task[]) => prev.map((t: Task) => 
      t.id === id ? { 
        ...t, 
        title: parsed.title,
        priority: parsed.priority || t.priority,
        dueDate: parsed.dueDate || t.dueDate,
        dueTime: parsed.dueTime || t.dueTime,
        tags: parsed.tags.length > 0 ? parsed.tags.slice(0, 5) : t.tags, // Limit to 5 tags
        updatedAt: new Date().toISOString()
      } : t
    ))

    setEditingId(null)
    setEditingValue('')
  }

  const getAllTags = () => {
    const allTags = tasks.flatMap((task: Task) => task.tags || [])
    return [...new Set(allTags)].sort()
  }

  const addTagFilter = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
    setTagSearchQuery('')
    setShowTagDropdown(false)
  }

  const removeTagFilter = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const handleAuthSuccess = async () => {
    const user = authService.getCurrentUser()
    if (user) {
      try {
        await SharingService.registerUser(user.email, user.username, user.displayName);
        console.log('User registered on sharing server');
      } catch (error) {
        console.error('Failed to register user on sharing server:', error);
      }
    }
    setCurrentUser(user)
    setShowAuthModal(false)
  }

  const handleLogout = async () => {
    await authService.logout()
    setCurrentUser(null)
    setShowProfile(false)
  }

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser)
  }

  const handleShareTask = (task: Task) => {
    setTaskToShare(task)
    setShowShareTaskModal(true)
  }

  const handleTaskShare = async (taskId: string, receiverEmail: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || !currentUser) return

    try {
      const result = await SharingService.shareTask(task, receiverEmail, currentUser.email);
      
      setTasks(prevTasks => prevTasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            sharedWith: [receiverEmail],
            updatedAt: new Date().toISOString()
          }
        }
        return t
      }))
      
      setShowShareTaskModal(false)
      setTaskToShare(null)
      
      alert(result.message || `Task shared successfully with ${receiverEmail}!`)
    } catch (error) {
      console.error('Failed to share task via server:', error);
      const sharedTask = {
        ...task,
        id: makeId(),
        sharedFrom: currentUser.email,
        sharedTo: receiverEmail,
        isShared: true,
        originalTaskId: taskId,
        sharedAt: new Date().toISOString(),
        createdBy: currentUser.id
      }

      const existingSharedTasks = JSON.parse(localStorage.getItem('shared_tasks') || '[]')
      existingSharedTasks.push(sharedTask)
      localStorage.setItem('shared_tasks', JSON.stringify(existingSharedTasks))
      
      setTasks(prevTasks => prevTasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            sharedWith: [receiverEmail],
            updatedAt: new Date().toISOString()
          }
        }
        return t
      }))
      
      setShowShareTaskModal(false)
      setTaskToShare(null)
      
      alert(`Task shared successfully with ${receiverEmail}! (using local storage)`)
    }
  }

  const handleAddToMyList = async (sharedTask: Task) => {
    if (!currentUser) return

    try {
      const result = await SharingService.acceptSharedTask(sharedTask.id, currentUser.email);
      
      setTasks(prevTasks => [...prevTasks, result.personalTask])
      
      setPendingSharedTasks(prevTasks => prevTasks.filter(task => task.id !== sharedTask.id))
      
      alert(result.message || 'Task added to your personal list!')
    } catch (error) {
      console.error('Failed to accept shared task via server:', error);
      const personalTask: Task = {
        ...sharedTask,
        id: makeId(),
        isShared: false,
        sharedBy: undefined,
        sharedFrom: undefined,
        sharedTo: undefined,
        originalTaskId: undefined,
        sharedAt: undefined,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setTasks(prevTasks => [...prevTasks, personalTask])
      setPendingSharedTasks(prevTasks => prevTasks.filter(task => task.id !== sharedTask.id))

      const existingSharedTasks = JSON.parse(localStorage.getItem('shared_tasks') || '[]')
      const updatedSharedTasks = existingSharedTasks.filter((task: any) => task.id !== sharedTask.id)
      localStorage.setItem('shared_tasks', JSON.stringify(updatedSharedTasks))
      
      alert('Task added to your personal list! (using local storage)')
    }
  }

  const clearAllTagFilters = () => {
    setSelectedTags([])
  }

  const getFilteredTags = () => {
    const allTags = getAllTags()
    if (!tagSearchQuery) return allTags
    return allTags.filter(tag => 
      tag.toLowerCase().includes(tagSearchQuery.toLowerCase()) &&
      !selectedTags.includes(tag)
    )
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

    if (selectedTags.length > 0) {
      filtered = filtered.filter((task: Task) => 
        task.tags && task.tags.some(tag => selectedTags.includes(tag))
      )
    }

    if (timeFilter === 'custom' && customStartTime && customEndTime) {
      filtered = filtered.filter((task: Task) => {
        if (!task.dueTime) return false
        
        const taskTime = task.dueTime
        return taskTime >= customStartTime && taskTime <= customEndTime
      })
    }

    if (customStartDate && customEndDate) {
      const startDate = parseISO(customStartDate)
      const endDate = parseISO(customEndDate)

      filtered = filtered.filter((task: Task) => {
        if (!task.dueDate) return false
        const taskDate = parseISO(task.dueDate)
        return isWithinInterval(taskDate, { 
          start: startOfDay(startDate), 
          end: startOfDay(endDate) 
        })
      })
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
        return filtered.filter((task: Task) => 
          task.dueDate && isPast(parseISO(task.dueDate)) && !task.completed
        )
      default:
        return filtered
    }
  })()

  const getTasksChronological = () => {
    const tasksWithDates = filteredTasks.filter((task: Task) => task.dueDate)
    const tasksWithoutDates = filteredTasks.filter((task: Task) => !task.dueDate)
    
    tasksWithDates.sort((a, b) => {
      const dateA = parseISO(a.dueDate!)
      const dateB = parseISO(b.dueDate!)
      
      const dateDiff = dateA.getTime() - dateB.getTime()
      if (dateDiff !== 0) return dateDiff
      
      if (a.dueTime && b.dueTime) {
        return a.dueTime.localeCompare(b.dueTime)
      }
      if (a.dueTime && !b.dueTime) return -1
      if (!a.dueTime && b.dueTime) return 1
      
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
    
    const groupedTasks: { date: string | null, tasks: Task[] }[] = []
    let currentDate: string | null = null
    let currentGroup: Task[] = []
    
    tasksWithDates.forEach((task) => {
      const taskDate = format(parseISO(task.dueDate!), 'yyyy-MM-dd')
      
      if (taskDate !== currentDate) {
        if (currentGroup.length > 0) {
          groupedTasks.push({ date: currentDate, tasks: currentGroup })
        }
        currentDate = taskDate
        currentGroup = [task]
      } else {
        currentGroup.push(task)
      }
    })
    
    if (currentGroup.length > 0) {
      groupedTasks.push({ date: currentDate, tasks: currentGroup })
    }
    
    if (tasksWithoutDates.length > 0) {
      tasksWithoutDates.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      groupedTasks.push({ date: null, tasks: tasksWithoutDates })
    }
    
    return groupedTasks
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task: Task) => 
      !task.deletedAt && 
      task.dueDate && 
      isSameDay(parseISO(task.dueDate), date)
    )
  }

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const startCalendar = startOfWeek(start)
    const endCalendar = endOfWeek(end)
    
    const days = []
    let current = startCalendar
    
    while (current <= endCalendar) {
      days.push(new Date(current))
      current = addDays(current, 1)
    }
    
    return days
  }

  const CalendarView = () => {
    const days = getDaysInMonth(calendarDate)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    return (
      <div className="calendar-view">
        <div className="calendar-header">
          <button 
            onClick={() => setCalendarDate(addMonths(calendarDate, -1))}
            className="nav-btn"
          >
            ←
          </button>
          <h3>{format(calendarDate, 'MMMM yyyy')}</h3>
          <button 
            onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
            className="nav-btn"
          >
            →
          </button>
        </div>
        
        <div className="calendar-grid">
          {daysOfWeek.map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          
          {days.map(day => {
            const tasksForDay = getTasksForDate(day)
            const isCurrentMonth = format(day, 'M') === format(calendarDate, 'M')
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            
            return (
              <div 
                key={day.toISOString()}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="day-number">{format(day, 'd')}</div>
                {tasksForDay.length > 0 && (
                  <div className="task-indicators">
                    {tasksForDay.slice(0, 3).map((task) => (
                      <div 
                        key={task.id}
                        className={`task-dot priority-${task.priority} ${task.completed ? 'completed' : ''}`}
                        title={task.title}
                      />
                    ))}
                    {tasksForDay.length > 3 && (
                      <div className="task-dot more">+{tasksForDay.length - 3}</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const activeTasks = tasks.filter((t: Task) => !t.deletedAt)

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        {/* Auth Modal - Always Open */}
        <AuthModal
          isOpen={true}
          onClose={() => {}} // No close functionality when login is required
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Enhanced To‑Do MVP</h1>
        <div className="header-right">
          <div className="counts">
            {activeTasks.length} tasks • {activeTasks.filter((t: Task) => t.completed).length} done
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
          
          {/* Authentication UI */}
          <div className="auth-section">
            {currentUser ? (
              <div className="user-menu">
                <button 
                  className="user-profile-btn"
                  onClick={() => setShowProfile(!showProfile)}
                  title={`Logged in as ${currentUser.displayName}`}
                >
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.displayName} className="user-avatar-small" />
                  ) : (
                    <div className="user-avatar-small user-avatar-placeholder">
                      {currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <span>{currentUser.displayName}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
              </div>
            ) : (
              <button 
                className="login-btn"
                onClick={() => setShowAuthModal(true)}
              >
                🔐 Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </header>

      {showIntro && (
        <div className="intro-section">
          <div className="intro-content">
            <h2>🚀 Welcome to Enhanced To-Do MVP</h2>
            <p>A powerful task manager with natural language parsing and smart tags!</p>
            
            <div className="intro-grid">
              <div className="intro-card">
                <h3>🏷️ Smart Tags</h3>
                <div className="tag-examples">
                  <div><code>:d2025-12-25</code> - Set specific date</div>
                  <div><code>:dtomorrow</code> - Relative dates</div>
                  <div><code>:t14:30</code> - 24-hour time</div>
                  <div><code>:t2pm</code> - 12-hour time</div>
                  <div><code>:phigh</code> - Set priority</div>
                  <div><code>#work</code> - Add tags (max 5 per task)</div>
                  <div><code>@project</code> - Assign to a project</div>
                </div>
              </div>
              
              <div className="intro-card">
                <h3>📝 Quick Examples</h3>
                <div className="example-list">
                  <div><code>"meeting :d2025-12-25 :t14:30 #work #urgent @bigproject :phigh"</code></div>
                  <div><code>"call mom :dtomorrow :t9am #family #important @personal"</code></div>
                  <div><code>"gym workout :dtoday :t6am #fitness #health #routine"</code></div>
                </div>
              </div>
              
              <div className="intro-card">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <div className="shortcut-list">
                  <div><kbd>Ctrl+N</kbd> - New task</div>
                  <div><kbd>Ctrl+K</kbd> - Search</div>
                  <div><kbd>Ctrl+Z</kbd> - Undo</div>
                  <div><kbd>Esc</kbd> - Cancel/Clear</div>
                </div>
              </div>
              
              <div className="intro-card">
                <h3>🔧 Features</h3>
                <div className="feature-list">
                  <div>✅ Natural language parsing</div>
                  <div>📅 Date & time scheduling</div>
                  <div>🔔 Browser notifications</div>
                  <div>🏷️ Tags and projects</div>
                  <div>⚡ Priority levels</div>
                  <div>🔍 Advanced filtering</div>
                </div>
              </div>
            </div>
            
            <div className="intro-actions">
              <button 
                className="btn-primary" 
                onClick={() => {
                  localStorage.setItem('todo-intro-seen', 'true')
                  setShowIntro(false)
                  document.getElementById('add-input')?.focus()
                }}
              >
                Get Started
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => setShowIntro(false)}
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="app-main">
        <section className="composer">
          <input
            id="add-input"
            aria-label="Add task with natural language"
            placeholder='Try: "meeting :d2025-12-25 :t14:30 #work #urgent @project :phigh" (max 5 tags)'
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
            
            <div className="tag-filter-container">
              <div className="tag-search-input-container">
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  onFocus={() => setShowTagDropdown(true)}
                  onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                  className="tag-search-input"
                />
                {showTagDropdown && getFilteredTags().length > 0 && (
                  <div className="tag-dropdown">
                    {getFilteredTags().slice(0, 8).map((tag: string) => (
                      <div
                        key={tag}
                        className="tag-dropdown-item"
                        onClick={() => addTagFilter(tag)}
                      >
                        #{tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedTags.length > 0 && (
                <div className="selected-tags">
                  {selectedTags.map((tag: string) => (
                    <span key={tag} className="selected-tag-chip">
                      #{tag}
                      <button
                        onClick={() => removeTagFilter(tag)}
                        className="remove-tag-btn"
                        aria-label={`Remove ${tag} filter`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={clearAllTagFilters}
                    className="clear-all-tags-btn"
                    aria-label="Clear all tag filters"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="advanced-filters-toggle"
            >
              {showAdvancedFilters ? '▼' : '▶'} Filtering
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="advanced-filters">
              <div className="filter-row">
                <label>Time Range:</label>
                <select 
                  value={timeFilter} 
                  onChange={(e) => setTimeFilter(e.target.value as any)}
                  className="time-filter-select"
                >
                  <option value="all">All Times</option>
                  <option value="custom">Custom Time Range</option>
                </select>
              </div>
              
              {timeFilter === 'custom' && (
                <div className="filter-row">
                  <label>Time Range:</label>
                  <div className="time-range-inputs">
                    <input
                      type="time"
                      value={customStartTime}
                      onChange={(e) => setCustomStartTime(e.target.value)}
                      className="time-input"
                      placeholder="Start time"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={customEndTime}
                      onChange={(e) => setCustomEndTime(e.target.value)}
                      className="time-input"
                      placeholder="End time"
                    />
                  </div>
                </div>
              )}
              
              <div className="filter-row">
                <label>Date Range:</label>
                <div className="date-range-inputs">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="date-input"
                    placeholder="Start date"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="date-input"
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="filters">
            <div className="view-toggle">
              <button 
                className={viewMode === 'list' ? 'active' : ''} 
                onClick={() => setViewMode('list')}
              >
                📋 List
              </button>
              <button 
                className={viewMode === 'calendar' ? 'active' : ''} 
                onClick={() => setViewMode('calendar')}
              >
                🗓️ Calendar
              </button>
            </div>
            
            <div className="status-filters">
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
          </div>
        </section>

        <section className="list">
          {viewMode === 'calendar' && <CalendarView />}
          
          {viewMode === 'list' && (
            <>
              {filteredTasks.length === 0 ? (
                <div className="empty">
                  {filter === 'trash' ? 'Trash is empty' : 'No tasks found'}
                </div>
              ) : (
                (() => {
                  const chronologicalGroups = getTasksChronological()
                  
                  return chronologicalGroups.map((group) => (
                    <div key={group.date || 'no-date'} className="task-group">
                      {group.date && (
                        <div className="date-header">
                          <h3>
                            {(() => {
                              const date = parseISO(group.date)
                              if (isToday(date)) return 'Today'
                              if (format(date, 'yyyy') === format(new Date(), 'yyyy')) {
                                return format(date, 'EEEE, MMMM d')
                              }
                              return format(date, 'EEEE, MMMM d, yyyy')
                            })()}
                          </h3>
                          <span className="task-count">({group.tasks.length})</span>
                        </div>
                      )}
                      
                      {!group.date && (
                        <div className="date-header">
                          <h3>No Due Date</h3>
                          <span className="task-count">({group.tasks.length})</span>
                        </div>
                      )}
                      
                      <div className="task-list">
                        {group.tasks.map((task: Task) => (
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
                                    {task.dueTime && (
                                      <span className="due-time">{task.dueTime}</span>
                                    )}
                                    {task.isShared && (
                                      <span className="shared-label" title={`Shared by ${task.sharedBy}`}>
                                        Shared
                                      </span>
                                    )}
                                    {task.tags.map((tag: string) => (
                                      <span key={tag} className="tag">#{tag}</span>
                                    ))}
                                    {task.tags.length === 5 && (
                                      <span className="tag-limit-badge" title="Maximum tags reached (5/5)">
                                        MAX
                                      </span>
                                    )}
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
                                  {!task.isShared && (
                                    <button 
                                      onClick={() => handleShareTask(task)}
                                      className="share-btn"
                                      title="Share this task"
                                    >
                                      Share
                                    </button>
                                  )}
                                  {task.isShared && (
                                    <button 
                                      onClick={() => handleAddToMyList(task)}
                                      className="add-to-list-btn"
                                      title="Add this shared task to your personal list"
                                    >
                                      Add to My List
                                    </button>
                                  )}
                                  <button onClick={() => deleteTask(task.id)} className="danger">
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                })()
              )}
            </>
          )}
        </section>

        {/* Pending Shared Tasks Section */}
        {pendingSharedTasks.length > 0 && (
          <section className="pending-shared-section">
            <h3>📤 Tasks Shared With You</h3>
            <div className="shared-tasks-list">
              {pendingSharedTasks.map((task: Task) => (
                <div key={task.id} className="shared-task-item">
                  <div className="shared-task-content">
                    <div className="task-title">{task.title}</div>
                    {task.notes && <div className="task-notes">{task.notes}</div>}
                    <div className="shared-meta">
                      <span className="shared-from">From: {task.sharedFrom}</span>
                      {task.priority && (
                        <span className={`priority-badge priority-${task.priority}`}>
                          {task.priority}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="due-date">Due: {task.dueDate}</span>
                      )}
                    </div>
                  </div>
                  <div className="shared-actions">
                    <button 
                      onClick={() => handleAddToMyList(task)}
                      className="add-to-list-btn"
                    >
                      Add to My List
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          await SharingService.declineSharedTask(task.id, currentUser.email);
                          setPendingSharedTasks(prev => prev.filter(t => t.id !== task.id));
                        } catch (error) {
                          console.error('Failed to decline via server, using localStorage:', error);
                          setPendingSharedTasks(prev => prev.filter(t => t.id !== task.id))
                          const existingSharedTasks = JSON.parse(localStorage.getItem('shared_tasks') || '[]')
                          const updatedSharedTasks = existingSharedTasks.filter((t: any) => t.id !== task.id)
                          localStorage.setItem('shared_tasks', JSON.stringify(updatedSharedTasks))
                        }
                      }}
                      className="decline-btn"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        Enhanced MVP • LocalStorage • NLP • Shortcuts (Ctrl+N, Ctrl+K, Ctrl+Z) • {activeTasks.length} total tasks
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {showProfile && currentUser && (
        <div className="profile-overlay" onClick={() => setShowProfile(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn"
              onClick={() => setShowProfile(false)}
              aria-label="Close profile"
            >
              ×
            </button>
            <UserProfile 
              user={currentUser}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* ShareTask Modal */}
      {taskToShare && currentUser && (
        <ShareTask
          isOpen={showShareTaskModal}
          onClose={() => {
            setShowShareTaskModal(false)
            setTaskToShare(null)
          }}
          task={taskToShare}
          onShare={handleTaskShare}
        />
      )}
    </div>
  )
}
