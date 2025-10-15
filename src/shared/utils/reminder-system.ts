export type NotificationPermission = 'granted' | 'denied' | 'default'

export interface Reminder {
  id: string
  taskId: string
  taskTitle: string
  dueDateTime: Date
  timeoutId?: number
}

class ReminderManager {
  private reminders: Map<string, Reminder> = new Map()
  private permissionStatus: NotificationPermission = 'default'

  constructor() {
    this.checkNotificationPermission()
  }

  private checkNotificationPermission(): void {
    if ('Notification' in window) {
      this.permissionStatus = Notification.permission as NotificationPermission
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    if (this.permissionStatus === 'granted') {
      return 'granted'
    }

    try {
      const permission = await Notification.requestPermission()
      this.permissionStatus = permission as NotificationPermission
      return this.permissionStatus
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }

  private showNotification(title: string, body: string, taskId: string): void {
    console.log('🔔 Attempting to show notification:', { title, body, taskId, permission: this.permissionStatus })
    
    if (this.permissionStatus !== 'granted') {
      console.log('❌ Cannot show notification - permission not granted:', this.permissionStatus)
      return
    }

    try {
      const options: NotificationOptions = {
        body,
        icon: '/vite.svg', // Use the vite icon since favicon.ico might not exist
        tag: `task-${taskId}`,
        requireInteraction: true, // Keep notification until user interacts
      }

      console.log('✅ Creating notification with options:', options)
      const notification = new Notification(title, options)
      console.log('📢 Notification created successfully!')

      notification.onclick = () => {
        console.log('👆 Notification clicked!')
        window.focus()
        notification.close()
        this.onNotificationClick?.(taskId)
      }

      setTimeout(() => {
        notification.close()
      }, 10000)
      
    } catch (error) {
      console.error('❌ Error creating notification:', error)
    }
  }

  onNotificationClick?: (taskId: string) => void

  scheduleReminder(taskId: string, taskTitle: string, dueDate: string, dueTime?: string): void {
    console.log('🔔 Scheduling reminder for:', { taskId, taskTitle, dueDate, dueTime })
    
    const dueDateTime = this.parseDueDateTime(dueDate, dueTime)
    console.log('📅 Parsed due date time:', dueDateTime)
    
    const currentTime = new Date()
    console.log('🕐 Current time:', currentTime)
    console.log('⏰ Due time is in future?', dueDateTime && dueDateTime > currentTime)
    
    if (!dueDateTime || dueDateTime <= currentTime) {
      console.log('❌ Not scheduling - due time is in the past or invalid:', dueDateTime)
      return // Don't schedule reminders for past dates
    }

    const timeUntilDue = dueDateTime.getTime() - Date.now()
    console.log('⏱️ Time until due (ms):', timeUntilDue, 'minutes:', Math.round(timeUntilDue / 60000))
    
    const maxScheduleTime = 24 * 60 * 60 * 1000 // 24 hours
    if (timeUntilDue > maxScheduleTime) {
      console.log('⏳ Not scheduling - more than 24 hours away')
      return
    }

    this.clearReminder(taskId)

    console.log('✅ Scheduling notification in', Math.round(timeUntilDue / 60000), 'minutes')

    const timeoutId = setTimeout(() => {
      console.log('🚨 SHOWING NOTIFICATION NOW for:', taskTitle)
      this.showNotification(
        '⏰ Task Reminder',
        `"${taskTitle}" is due now!`,
        taskId
      )
      this.reminders.delete(taskId)
    }, timeUntilDue)

    const reminder: Reminder = {
      id: `reminder-${taskId}`,
      taskId,
      taskTitle,
      dueDateTime,
      timeoutId
    }

    this.reminders.set(taskId, reminder)
    
    console.log(`Reminder scheduled for "${taskTitle}" at ${dueDateTime.toLocaleString()}`)
  }

  private parseDueDateTime(dueDate: string, dueTime?: string): Date | null {
    try {
      console.log('🔧 Parsing date:', dueDate, 'time:', dueTime)
      const date = new Date(dueDate)
      console.log('📆 Base date:', date)
      
      if (dueTime) {
        const [hours, minutes] = dueTime.split(':').map(num => parseInt(num))
        console.log('🕒 Setting time to:', hours, ':', minutes)
        date.setHours(hours, minutes, 0, 0)
        console.log('📅 Final date with time:', date)
      }
      
      return isNaN(date.getTime()) ? null : date
    } catch (error) {
      console.error('Error parsing due date/time:', error)
      return null
    }
  }

  clearReminder(taskId: string): void {
    const reminder = this.reminders.get(taskId)
    if (reminder?.timeoutId) {
      clearTimeout(reminder.timeoutId)
      this.reminders.delete(taskId)
    }
  }

  clearAllReminders(): void {
    for (const reminder of this.reminders.values()) {
      if (reminder.timeoutId) {
        clearTimeout(reminder.timeoutId)
      }
    }
    this.reminders.clear()
  }

  getActiveReminders(): Reminder[] {
    return Array.from(this.reminders.values())
  }

  scheduleRemindersForTasks(tasks: Array<{ id: string; title: string; dueDate?: string; dueTime?: string; completed: boolean }>): void {
    this.clearAllReminders()

    tasks.forEach(task => {
      if (!task.completed && task.dueDate) {
        this.scheduleReminder(task.id, task.title, task.dueDate, task.dueTime)
      }
    })
  }

  static isSupported(): boolean {
    return 'Notification' in window
  }

  getNextReminderTime(): Date | null {
    if (this.reminders.size === 0) return null
    
    const nextReminder = Array.from(this.reminders.values())
      .sort((a, b) => a.dueDateTime.getTime() - b.dueDateTime.getTime())[0]
    
    return nextReminder ? nextReminder.dueDateTime : null
  }

  testNotification(): void {
    console.log('🧪 Testing notification...')
    this.showNotification(
      '🧪 Test Notification',
      'This is a test notification to verify your browser settings!',
      'test-notification'
    )
  }
}

export const reminderManager = new ReminderManager()

export { ReminderManager }
