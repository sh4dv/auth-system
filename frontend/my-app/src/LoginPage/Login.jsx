import './Login.css'
import { useState, useEffect } from 'react'

function Login({ setToken, sendRequest }) {
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState(null) // 'available', 'taken', 'checking', 'too-short', null
  const [password, setPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState(null) // 'valid', 'too-short', 'no-number', null
  const [lastFocused, setLastFocused] = useState('username') // Track which field was last focused
  const [usersCount, setUsersCount] = useState(0)
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotUsername, setForgotUsername] = useState('')
  const [forgotSecretToken, setForgotSecretToken] = useState('')
  const [tokenVerified, setTokenVerified] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotPasswordError, setForgotPasswordError] = useState('')
  
  // New user secret token display
  const [showSecretToken, setShowSecretToken] = useState(false)
  const [secretToken, setSecretToken] = useState('')
  const [canCloseToken, setCanCloseToken] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)

  const copyTokenToClipboard = () => {
    navigator.clipboard.writeText(secretToken).then(() => {
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 2000)
    })
  }
  
  useEffect(() => {
    // Fetch total users count on component mount
    const fetchUsersCount = async () => {
      try {
        const data = await sendRequest('GET', 'users/count');
        setUsersCount(data.count);
      } catch {
        setUsersCount(0);
      }
    };
    fetchUsersCount();
  }, [sendRequest]);

  useEffect(() => {
    if (!username) {
      setUsernameStatus(null)
      return
    }

    if (username.length < 3) {
      setUsernameStatus('too-short')
      return
    }

    const timeoutId = setTimeout(async () => {
      setUsernameStatus('checking')
      try {
        const result = await sendRequest('GET', `auth/check-username/${encodeURIComponent(username)}`)
        setUsernameStatus(result.available ? 'available' : 'taken')
      } catch (err) {
        setUsernameStatus(null)
      }
    }, 500) // Debounce 500ms

    return () => clearTimeout(timeoutId)
  }, [username, sendRequest])

  useEffect(() => {
    if (!password) {
      setPasswordStatus(null)
      return
    }

    if (password.length < 4) {
      setPasswordStatus('too-short')
      return
    }

    if (!/\d/.test(password)) {
      setPasswordStatus('no-number')
      return
    }

    setPasswordStatus('valid')
  }, [password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.target)
    const username = formData.get('username')
    const password = formData.get('password')
    try {
      const res = await sendRequest('POST', 'auth/login', { username, password })
      
      // Check if this is a new user registration
      if (res.is_new_user && res.secret_token) {
        setSecretToken(res.secret_token)
        setShowSecretToken(true)
        setCanCloseToken(false)
        
        // Enable closing after 5 seconds
        setTimeout(() => {
          console.log('5 seconds passed, enabling close button')
          setCanCloseToken(true)
        }, 5000)
        
        // Store token temporarily, will be set when modal closes
        window.pendingAuthToken = res.access_token
        console.log('Token stored, waiting for user to close modal')
      } else {
        console.log('Existing user, logging in immediately')
        // Existing user, set token immediately
        setToken(res.access_token)
      }
    } catch (err) {
      // 400 / 401: invalid login credentials
      if (err.status === 400 || err.status === 401) {
        setError('Invalid username or password')
      } else if (err.status === 429) {
        setError('Too many login attempts. Please try again later.')
      } else {
        setError(err.message)
        console.log('Login error:', err)
      }
    }
  }

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true)
    setTokenVerified(false)
    setForgotUsername('')
    setForgotSecretToken('')
    setNewPassword('')
    setConfirmPassword('')
    setForgotPasswordError('')
  }

  const handleVerifyToken = async () => {
    setForgotPasswordError('')
    
    if (!forgotUsername || forgotUsername.length < 3) {
      setForgotPasswordError('Username must be at least 3 characters')
      return
    }
    
    if (!forgotSecretToken) {
      setForgotPasswordError('Please enter your secret token')
      return
    }
    
    try {
      await sendRequest('POST', 'auth/verify-secret-token', {
        username: forgotUsername,
        secret_token: forgotSecretToken
      })
      setTokenVerified(true)
    } catch (err) {
      if (err.status === 429) {
        setForgotPasswordError('Too many verification attempts. Please try again later.');
      } else {
        setForgotPasswordError(err.message || 'Invalid username or secret token');
      }
    }
  }

  const handleResetPassword = async () => {
    setForgotPasswordError('')
    
    if (newPassword.length < 4) {
      setForgotPasswordError('Password must be at least 4 characters')
      return
    }
    
    if (!/\d/.test(newPassword)) {
      setForgotPasswordError('Password must contain at least one number')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setForgotPasswordError('Passwords do not match')
      return
    }
    
    try {
      await sendRequest('POST', 'auth/reset-password', {
        username: forgotUsername,
        secret_token: forgotSecretToken,
        new_password: newPassword
      })
      
      // Close modal and show success
      setShowForgotPassword(false)
      setError(null)
      alert('Password reset successfully! You can now login with your new password.')
    } catch (err) {
      if (err.status === 429) {
        setForgotPasswordError('Too many password reset attempts. Please try again later.');
      } else {
        setForgotPasswordError(err.message || 'Failed to reset password');
      }
    }
  }

  const closeSecretTokenModal = () => {
    console.log('closeSecretTokenModal called, canCloseToken:', canCloseToken)
    if (canCloseToken) {
      setShowSecretToken(false)
      // Set the pending token after user has seen the secret token
      if (window.pendingAuthToken) {
        console.log('Setting pending token and logging in user')
        setToken(window.pendingAuthToken)
        window.pendingAuthToken = null
      }
    }
  }

  return (
    <div className="login-container">
      <p className="users-count">Total users: {usersCount}</p>
      <h2>Login or register</h2>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setLastFocused('username')}
          />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setLastFocused('password')}
          />
          <div className="input-footer">
            <span
              className="forgot-password-link"
              onClick={handleForgotPasswordClick}
            >
              Forgot password?
            </span>
            <button
              type="button"
              className="pw-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(p => !p)}
            >
              {/* Eye / Eye-off inline SVG icons */}
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 3L21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.58 10.58A3 3 0 0 0 13.42 13.42M9.999 5.13A9.77 9.77 0 0 1 12 5c7 0 11 7 11 7a18.38 18.38 0 0 1-2.64 3.56M6.61 6.61C3.51 8.47 1 12 1 12s4 7 11 7c1.8 0 3.42-.37 4.86-.99"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
          
          {/* Status messages moved below the input footer */}
          <div className="form-status-below">
            {lastFocused === 'password' ? (
              <>
                {passwordStatus === 'too-short' && (
                  <span className="status-too-short">At least 4 characters</span>
                )}
                {passwordStatus === 'no-number' && (
                  <span className="status-taken">Must contain a number</span>
                )}
                {passwordStatus === 'valid' && (
                  <span className="status-available">✓ Password strong</span>
                )}
                {!passwordStatus && (
                  <span className="status-default">Enter password</span>
                )}
              </>
            ) : (
              <>
                {usernameStatus === 'too-short' && (
                  <span className="status-too-short">At least 3 characters</span>
                )}
                {usernameStatus === 'checking' && (
                  <span className="status-checking">Checking username...</span>
                )}
                {usernameStatus === 'available' && (
                  <span className="status-available">✓ Username available</span>
                )}
                {usernameStatus === 'taken' && (
                  <span className="status-taken">✗ Username taken</span>
                )}
                {!usernameStatus && (
                  <span className="status-default">Enter username</span>
                )}
              </>
            )}
          </div>

          <button type="submit">Access</button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForgotPassword(false)}>×</button>
            <h3>Reset Password</h3>
            
            {!tokenVerified ? (
              <>
                <p className="modal-description">Enter your username and secret token to reset your password.</p>
                <div className="modal-form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                  />
                </div>
                <div className="modal-form-group">
                  <label>Secret Token</label>
                  <input
                    type="password"
                    placeholder="Enter your secret token"
                    value={forgotSecretToken}
                    onChange={(e) => setForgotSecretToken(e.target.value)}
                  />
                </div>
                {forgotPasswordError && <p className="modal-error">{forgotPasswordError}</p>}
                <button className="modal-btn" onClick={handleVerifyToken}>
                  Verify Token
                </button>
              </>
            ) : (
              <>
                <p className="modal-description">Token verified! Enter your new password.</p>
                <div className="modal-form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <p className="input-hint">At least 4 characters with 1 number</p>
                </div>
                <div className="modal-form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      borderColor: confirmPassword && newPassword 
                        ? (confirmPassword === newPassword ? '#00ae00' : '#ae0000')
                        : '#333'
                    }}
                  />
                  {confirmPassword && newPassword && (
                    <p className="input-hint" style={{ 
                      color: confirmPassword === newPassword ? '#6bff6b' : '#ff6b6b'
                    }}>
                      {confirmPassword === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
                {forgotPasswordError && <p className="modal-error">{forgotPasswordError}</p>}
                <button className="modal-btn" onClick={handleResetPassword}>
                  Reset Password
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Secret Token Display Modal (for new users) */}
      {showSecretToken && (
        <div className="modal-overlay" onClick={closeSecretTokenModal}>
          <div className="modal-content secret-token-modal" onClick={(e) => e.stopPropagation()}>
            {canCloseToken && (
              <button className="modal-close" onClick={closeSecretTokenModal}>×</button>
            )}
            <h3>⚠️ Important: Save Your Secret Token</h3>
            <p className="modal-description">
              This is your <strong>secret recovery token</strong>. You'll need it to reset your password if you forget it.
              <br /><br />
              <strong>Save it somewhere safe!</strong> This token will not be shown again.
            </p>
            <div className="secret-token-display">
              <code className="secret-token-blur">{secretToken}</code>
              <button className="copy-token-btn" onClick={copyTokenToClipboard}>
                {tokenCopied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <p className="modal-note">
              Hover over the token to reveal it. You can also view this token later in Account Settings (requires password confirmation).
            </p>
            {!canCloseToken && (
              <p className="modal-timer">You can close this in a few seconds...</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login