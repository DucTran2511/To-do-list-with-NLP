export type User = {
  id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    notifications: boolean
    defaultView: 'list' | 'calendar'
    timezone: string
  }
  createdAt: string
  lastLoginAt: string
}

export type AuthState = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export type LoginCredentials = {
  email: string
  password: string
}

export type SignupCredentials = {
  email: string
  username: string
  displayName: string
  password: string
  confirmPassword: string
}

export type SharedList = {
  id: string
  name: string
  description?: string
  ownerId: string
  members: ShareMember[]
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canInvite: boolean
  }
  createdAt: string
  updatedAt: string
}

export type ShareMember = {
  userId: string
  username: string
  displayName: string
  avatar?: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joinedAt: string
}

export type TaskComment = {
  id: string
  taskId: string
  userId: string
  username: string
  displayName: string
  avatar?: string
  content: string
  attachments?: TaskAttachment[]
  createdAt: string
  updatedAt?: string
}

export type TaskAttachment = {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedBy: string
  uploadedAt: string
}
