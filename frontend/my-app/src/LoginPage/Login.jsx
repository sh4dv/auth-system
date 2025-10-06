import './Login.css'
import { useState, useEffect } from 'react'

function Login({ setToken, sendRequest }) {
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState(null) // 'available', 'taken', 'checking', 'too-short', null
  const [password, setPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState(null) // 'valid', 'too-short', 'no-number', null

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
      setToken(res.access_token)
    } catch (err) {
      // 400 / 401: invalid login credentials
      setError(err.message || 'Invalid credentials')
    }
  }

  return (
    <div className="login-container">
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
          />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="input-footer">
            <div className="form-status">
              {/* Priority: Password validation > Username validation > Default */}
              {passwordStatus === 'too-short' && (
                <span className="status-too-short">At least 4 characters</span>
              )}
              {passwordStatus === 'no-number' && (
                <span className="status-taken">Must contain a number</span>
              )}
              {passwordStatus === 'valid' && (
                <span className="status-available">✓ Password strong</span>
              )}
              {!passwordStatus && usernameStatus === 'too-short' && (
                <span className="status-too-short">At least 3 characters</span>
              )}
              {!passwordStatus && usernameStatus === 'checking' && (
                <span className="status-checking">Checking username...</span>
              )}
              {!passwordStatus && usernameStatus === 'available' && (
                <span className="status-available">✓ Username available</span>
              )}
              {!passwordStatus && usernameStatus === 'taken' && (
                <span className="status-taken">✗ Username taken</span>
              )}
              {!passwordStatus && !usernameStatus && (
                <span className="status-default">Please fill out the form</span>
              )}
            </div>
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
          <button type="submit">Access</button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}

export default Login