import { useState, useEffect } from 'react'
import type { User, ShareMember } from '../../shared/types/auth'
import { authService } from '../authentication/auth'
import './ShareTask.css'

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
  assignedTo?: string
  assignedBy?: string
  createdBy: string
  sharedWith?: string[]
  comments?: any[]
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

interface ShareTaskProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
  task: Task
  onShare: (taskId: string, members: ShareMember[]) => void
}

export function ShareTask({ isOpen, onClose, currentUser, task, onShare }: ShareTaskProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedMembers, setSelectedMembers] = useState<ShareMember[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    if (task.sharedWith) {
      const existingMembers: ShareMember[] = task.sharedWith.map(userId => {
        return {
          userId,
          username: `user${userId}`,
          displayName: `User ${userId}`,
          role: 'viewer' as const,
          joinedAt: new Date().toISOString()
        }
      })
      setSelectedMembers(existingMembers)
    }
  }, [task])

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const searchUsers = async () => {
      setIsSearching(true)
      try {
        const results = await authService.searchUsers(searchQuery)
        const filtered = results.filter(
          (user: User) => user.id !== currentUser.id && 
          !selectedMembers.some(member => member.userId === user.id)
        )
        setSearchResults(filtered)
      } catch (error) {
        console.error('Failed to search users:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const timeoutId = setTimeout(searchUsers, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, currentUser.id, selectedMembers])

  const addMemberFromSearch = (user: User, role: 'viewer' | 'member' = 'viewer') => {
    const newMember: ShareMember = {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      role,
      joinedAt: new Date().toISOString()
    }
    
    setSelectedMembers(prev => [...prev, newMember])
    setSearchQuery('')
    setSearchResults([])
  }

  const addMemberByEmail = () => {
    if (!inviteEmail.trim()) return

    const newMember: ShareMember = {
      userId: `invite_${Date.now()}`,
      username: inviteEmail.split('@')[0],
      displayName: inviteEmail.split('@')[0],
      role: 'viewer',
      joinedAt: new Date().toISOString()
    }

    setSelectedMembers(prev => [...prev, newMember])
    setInviteEmail('')
  }

  const removeMember = (userId: string) => {
    setSelectedMembers(prev => prev.filter(member => member.userId !== userId))
  }

  const updateMemberRole = (userId: string, role: 'viewer' | 'member' | 'admin') => {
    setSelectedMembers(prev => 
      prev.map(member => 
        member.userId === userId ? { ...member, role } : member
      )
    )
  }

  const handleShare = () => {
    onShare(task.id, selectedMembers)
    onClose()
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    setInviteEmail('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="share-task-overlay">
      <div className="share-task-modal">
        <div className="share-task-header">
          <h2>Share Task</h2>
          <button onClick={handleClose} className="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="task-info">
          <h3>"{task.title}"</h3>
          {task.notes && <p className="task-notes">{task.notes}</p>}
          <div className="task-meta">
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

        <div className="share-task-content">
          <div className="search-section">
            <label>Add people</label>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {isSearching && <div className="search-spinner">⏳</div>}
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(user => (
                  <div key={user.id} className="search-result-item">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.displayName} />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.displayName}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="add-buttons">
                      <button
                        onClick={() => addMemberFromSearch(user, 'viewer')}
                        className="add-btn viewer"
                      >
                        Add as Viewer
                      </button>
                      <button
                        onClick={() => addMemberFromSearch(user, 'member')}
                        className="add-btn editor"
                      >
                        Add as Member
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="invite-section">
            <label>Or invite by email</label>
            <div className="invite-input-container">
              <input
                type="email"
                placeholder="Enter email address..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="invite-input"
                onKeyPress={(e) => e.key === 'Enter' && addMemberByEmail()}
              />
              <button
                onClick={addMemberByEmail}
                disabled={!inviteEmail.trim()}
                className="invite-btn"
              >
                Invite
              </button>
            </div>
          </div>

          {selectedMembers.length > 0 && (
            <div className="selected-members">
              <label>People with access</label>
              <div className="members-list">
                {selectedMembers.map(member => (
                  <div key={member.userId} className="member-item">
                    <div className="member-info">
                      <div className="member-avatar">
                        <div className="avatar-placeholder">
                          {member.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                      </div>
                      <div className="member-details">
                        <div className="member-name">{member.displayName}</div>
                        <div className="member-username">@{member.username}</div>
                      </div>
                    </div>
                    <div className="member-controls">
                      <select
                        value={member.role}
                        onChange={(e) => updateMemberRole(member.userId, e.target.value as 'viewer' | 'member' | 'admin')}
                        className="role-select"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => removeMember(member.userId)}
                        className="remove-btn"
                        title="Remove access"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="share-task-footer">
          <div className="permission-info">
            <strong>Viewer:</strong> Can see the task<br />
            <strong>Member:</strong> Can edit the task<br />
            <strong>Admin:</strong> Can edit and share the task
          </div>
          <div className="footer-buttons">
            <button onClick={handleClose} className="cancel-btn">
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={selectedMembers.length === 0}
              className="share-btn"
            >
              Share Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
