import type { User, LoginCredentials, SignupCredentials } from '../../shared/types/auth'

class AuthService {
  private users: User[] = []
  private currentSession: string | null = null

  constructor() {
    const stored = localStorage.getItem('todo-users')
    if (stored) {
      this.users = JSON.parse(stored)
    }
    
    this.currentSession = localStorage.getItem('todo-session')
  }

  private saveUsers() {
    localStorage.setItem('todo-users', JSON.stringify(this.users))
  }

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
  }

  async login(credentials: LoginCredentials): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = this.users.find(u => 
      u.email.toLowerCase() === credentials.email.toLowerCase()
    )

    if (!user) {
      throw new Error('User not found')
    }

    if (!credentials.password) {
      throw new Error('Invalid password')
    }

    user.lastLoginAt = new Date().toISOString()
    this.saveUsers()

    const sessionId = this.generateId()
    localStorage.setItem('todo-session', sessionId)
    localStorage.setItem('todo-current-user', JSON.stringify(user))
    this.currentSession = sessionId

    return user
  }

  async signup(credentials: SignupCredentials): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1200))

    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    const existingUser = this.users.find(u => 
      u.email.toLowerCase() === credentials.email.toLowerCase() ||
      u.username.toLowerCase() === credentials.username.toLowerCase()
    )

    if (existingUser) {
      throw new Error('User already exists')
    }

    const newUser: User = {
      id: this.generateId(),
      email: credentials.email,
      username: credentials.username,
      displayName: credentials.displayName,
      preferences: {
        theme: 'auto',
        notifications: true,
        defaultView: 'list',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }

    this.users.push(newUser)
    this.saveUsers()

    const sessionId = this.generateId()
    localStorage.setItem('todo-session', sessionId)
    localStorage.setItem('todo-current-user', JSON.stringify(newUser))
    this.currentSession = sessionId

    return newUser
  }

  async logout(): Promise<void> {
    localStorage.removeItem('todo-session')
    localStorage.removeItem('todo-current-user')
    this.currentSession = null
  }

  getCurrentUser(): User | null {
    if (!this.currentSession) return null
    
    const stored = localStorage.getItem('todo-current-user')
    return stored ? JSON.parse(stored) : null
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')

    const userIndex = this.users.findIndex(u => u.id === currentUser.id)
    if (userIndex === -1) throw new Error('User not found')

    const updatedUser = { ...this.users[userIndex], ...updates }
    this.users[userIndex] = updatedUser
    this.saveUsers()

    localStorage.setItem('todo-current-user', JSON.stringify(updatedUser))
    return updatedUser
  }

  async searchUsers(query: string): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const lowerQuery = query.toLowerCase()
    return this.users.filter(user => 
      user.username.toLowerCase().includes(lowerQuery) ||
      user.displayName.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery)
    ).slice(0, 10) // Limit results
  }
}

export const authService = new AuthService()
