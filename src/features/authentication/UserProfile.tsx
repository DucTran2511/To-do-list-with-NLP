import { useState, useRef } from 'react'
import type { User } from '../../shared/types/auth'
import { authService } from './auth'
import './UserProfile.css'

interface UserProfileProps {
  user: User
  onUpdateUser: (user: User) => void
  onLogout: () => void
}

export function UserProfile({ user, onUpdateUser, onLogout }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [editForm, setEditForm] = useState({
    displayName: user.displayName,
    username: user.username,
    preferences: { ...user.preferences }
  })

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedUser = await authService.updateProfile({
        ...user,
        displayName: editForm.displayName,
        username: editForm.username,
        preferences: editForm.preferences
      })
      
      onUpdateUser(updatedUser)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditForm({
      displayName: user.displayName,
      username: user.username,
      preferences: { ...user.preferences }
    })
    setIsEditing(false)
    setError(null)
  }

  const generateAvatar = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    const colors = ['#4f46e5', '#7c3aed', '#dc2626', '#ea580c', '#16a34a', '#0891b2']
    const color = colors[name.length % colors.length]
    
    return (
      <div className="avatar-placeholder" style={{ backgroundColor: color }}>
        {initials}
      </div>
    )
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="avatar-section">
          {user.avatar ? (
            <img src={user.avatar} alt={user.displayName} className="user-avatar" />
          ) : (
            generateAvatar(user.displayName)
          )}
          
          {isEditing && (
            <button 
              className="avatar-upload"
              onClick={() => fileInputRef.current?.click()}
              title="Change avatar"
            >
              📷
            </button>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              console.log('Avatar upload:', e.target.files?.[0])
            }}
          />
        </div>

        <div className="profile-info">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                value={editForm.displayName}
                onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                className="edit-input"
                placeholder="Display Name"
              />
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                className="edit-input"
                placeholder="Username"
              />
            </div>
          ) : (
            <>
              <h3>{user.displayName}</h3>
              <p className="username">@{user.username}</p>
              <p className="email">{user.email}</p>
            </>
          )}
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave} 
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? '💾 Saving...' : '💾 Save'}
              </button>
              <button onClick={handleCancel} className="btn-secondary">
                ❌ Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-secondary">
                ✏️ Edit
              </button>
              <button onClick={onLogout} className="btn-danger">
                🚪 Logout
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="profile-error">
          ⚠️ {error}
        </div>
      )}

      <div className="preferences-section">
        <h4>🎨 Preferences</h4>
        
        <div className="preference-group">
          <label>Theme</label>
          <select
            value={editForm.preferences.theme}
            onChange={(e) => setEditForm(prev => ({
              ...prev,
              preferences: { ...prev.preferences, theme: e.target.value as any }
            }))}
            disabled={!isEditing}
            className="preference-select"
          >
            <option value="light">☀️ Light</option>
            <option value="dark">🌙 Dark</option>
            <option value="auto">🔄 Auto</option>
          </select>
        </div>

        <div className="preference-group">
          <label>Default View</label>
          <select
            value={editForm.preferences.defaultView}
            onChange={(e) => setEditForm(prev => ({
              ...prev,
              preferences: { ...prev.preferences, defaultView: e.target.value as any }
            }))}
            disabled={!isEditing}
            className="preference-select"
          >
            <option value="list">📋 List</option>
            <option value="calendar">🗓️ Calendar</option>
          </select>
        </div>

        <div className="preference-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={editForm.preferences.notifications}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                preferences: { ...prev.preferences, notifications: e.target.checked }
              }))}
              disabled={!isEditing}
            />
            <span>🔔 Enable Notifications</span>
          </label>
        </div>
      </div>

      <div className="account-info">
        <h4>📊 Account Info</h4>
        <div className="info-grid">
          <div>
            <span className="info-label">Member since:</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="info-label">Last login:</span>
            <span>{new Date(user.lastLoginAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="info-label">Timezone:</span>
            <span>{user.preferences.timezone}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
