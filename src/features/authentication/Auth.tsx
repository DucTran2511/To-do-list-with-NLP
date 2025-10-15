import { useState } from 'react'
import type { LoginCredentials, SignupCredentials } from '../../shared/types/auth'
import { authService } from './auth'
import './Auth.css'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  
  const [signupForm, setSignupForm] = useState<SignupCredentials>({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: ''
  })

  if (!isOpen) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await authService.login(loginForm)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await authService.signup(signupForm)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError(null)
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <div className="auth-header">
          <h2>{mode === 'login' ? '🔐 Welcome Back' : '🚀 Join Todo'}</h2>
          <button className="auth-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? '🔄 Signing in...' : '🔐 Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                required
                value={signupForm.displayName}
                onChange={(e) => setSignupForm(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Your Name"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                required
                value={signupForm.username}
                onChange={(e) => setSignupForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="username"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signupEmail">Email</label>
              <input
                id="signupEmail"
                type="email"
                required
                value={signupForm.email}
                onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signupPassword">Password</label>
              <input
                id="signupPassword"
                type="password"
                required
                minLength={6}
                value={signupForm.password}
                onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={signupForm.confirmPassword}
                onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? '🔄 Creating account...' : '🚀 Create Account'}
            </button>
          </form>
        )}

        <div className="auth-switch">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={switchMode} className="auth-link">
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={switchMode} className="auth-link">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
