import { useState } from 'react'
import type { Task } from '../../shared/utils/storage'
import './ShareTask-simple.css'

interface ShareTaskProps {
  isOpen: boolean
  onClose: () => void
  task: Task
  onShare: (taskId: string, receiverEmail: string) => void
}

export function ShareTask({ isOpen, onClose, task, onShare }: ShareTaskProps) {
  const [receiverEmail, setReceiverEmail] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleShare = async () => {
    if (!receiverEmail.trim()) {
      setError('Please enter an email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(receiverEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSharing(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onShare(task.id, receiverEmail)
      setReceiverEmail('')
      onClose()
    } catch (err) {
      setError('Failed to share task. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  const handleClose = () => {
    setReceiverEmail('')
    setError(null)
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

        <div className="task-preview">
          <h3>"{task.title}"</h3>
          {task.notes && <p className="task-notes">{task.notes}</p>}
          <div className="task-meta">
            <span className={`priority-badge priority-${task.priority}`}>
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="due-date">Due: {task.dueDate}</span>
            )}
            {task.tags.length > 0 && (
              <div className="tags">
                {task.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="share-form">
          <label htmlFor="receiver-email">Share with:</label>
          <input
            id="receiver-email"
            type="email"
            placeholder="Enter receiver's email address"
            value={receiverEmail}
            onChange={(e) => {
              setReceiverEmail(e.target.value)
              setError(null)
            }}
            onKeyPress={(e) => e.key === 'Enter' && !isSharing && handleShare()}
            disabled={isSharing}
            className={error ? 'error' : ''}
          />
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="share-actions">
          <button onClick={handleClose} className="cancel-btn" disabled={isSharing}>
            Cancel
          </button>
          <button 
            onClick={handleShare} 
            className="share-btn"
            disabled={!receiverEmail.trim() || isSharing}
          >
            {isSharing ? 'Sharing...' : 'Share Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
