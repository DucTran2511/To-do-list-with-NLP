import { useState, useEffect } from 'react'
import type { User, ShareMember } from '../../shared/types/auth'
import { authService } from '../authentication/auth'
import './ShareList.css'

interface ShareListProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
  listName: string
  onShare: (members: ShareMember[]) => void
}

export function ShareList({ isOpen, onClose, currentUser, listName, onShare }: ShareListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedMembers, setSelectedMembers] = useState<ShareMember[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const searchUsers = async () => {
      setIsSearching(true)
      try {
        const results = await authService.searchUsers(searchQuery)
        const filtered = results.filter((user: User) => 
          user.id !== currentUser.id && 
          !selectedMembers.some(member => member.userId === user.id)
        )
        setSearchResults(filtered)
      } catch (err) {
        console.error('Search failed:', err)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, currentUser.id, selectedMembers])

  if (!isOpen) return null

  const addMember = (user: User, role: ShareMember['role'] = 'member') => {
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

  const removeMember = (userId: string) => {
    setSelectedMembers(prev => prev.filter(member => member.userId !== userId))
  }

  const updateMemberRole = (userId: string, role: ShareMember['role']) => {
    setSelectedMembers(prev => prev.map(member => 
      member.userId === userId ? { ...member, role } : member
    ))
  }

  const handleInviteByEmail = () => {
    if (!inviteEmail.trim()) return
    
    const placeholderMember: ShareMember = {
      userId: `pending-${Date.now()}`,
      username: inviteEmail.split('@')[0],
      displayName: `${inviteEmail.split('@')[0]} (Pending)`,
      role: 'member',
      joinedAt: new Date().toISOString()
    }
    
    setSelectedMembers(prev => [...prev, placeholderMember])
    setInviteEmail('')
  }

  const handleShare = () => {
    onShare(selectedMembers)
    onClose()
  }

  const generateAvatar = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    const colors = ['#4f46e5', '#7c3aed', '#dc2626', '#ea580c', '#16a34a', '#0891b2']
    const color = colors[name.length % colors.length]
    
    return (
      <div className="member-avatar" style={{ backgroundColor: color }}>
        {initials}
      </div>
    )
  }

  return (
    <div className="share-overlay">
      <div className="share-modal">
        <div className="share-header">
          <h3>👥 Share "{listName}"</h3>
          <button className="share-close" onClick={onClose}>×</button>
        </div>

        <div className="share-content">
          {/* Search Users */}
          <div className="search-section">
            <h4>🔍 Add Team Members</h4>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search by username, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {isSearching && <div className="search-loading">🔄</div>}
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(user => (
                  <div key={user.id} className="search-result">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.displayName} className="member-avatar" />
                    ) : (
                      generateAvatar(user.displayName)
                    )}
                    <div className="user-info">
                      <div className="user-name">{user.displayName}</div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                    <button 
                      onClick={() => addMember(user)}
                      className="add-member-btn"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invite by Email */}
          <div className="invite-section">
            <h4>✉️ Invite by Email</h4>
            <div className="invite-input-container">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="invite-input"
                onKeyDown={(e) => e.key === 'Enter' && handleInviteByEmail()}
              />
              <button 
                onClick={handleInviteByEmail}
                className="invite-btn"
                disabled={!inviteEmail.trim()}
              >
                Send Invite
              </button>
            </div>
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div className="members-section">
              <h4>👥 Team Members ({selectedMembers.length})</h4>
              <div className="members-list">
                {selectedMembers.map(member => (
                  <div key={member.userId} className="member-item">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.displayName} className="member-avatar" />
                    ) : (
                      generateAvatar(member.displayName)
                    )}
                    <div className="member-info">
                      <div className="member-name">{member.displayName}</div>
                      <div className="member-username">@{member.username}</div>
                    </div>
                    <select
                      value={member.role}
                      onChange={(e) => updateMemberRole(member.userId, e.target.value as ShareMember['role'])}
                      className="role-select"
                    >
                      <option value="viewer">👀 Viewer</option>
                      <option value="member">✏️ Member</option>
                      <option value="admin">🛡️ Admin</option>
                    </select>
                    <button 
                      onClick={() => removeMember(member.userId)}
                      className="remove-member-btn"
                      title="Remove member"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="share-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button 
            onClick={handleShare}
            className="btn-primary"
            disabled={selectedMembers.length === 0}
          >
            Share List
          </button>
        </div>
      </div>
    </div>
  )
}
