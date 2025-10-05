import './App.css'
import { useState } from 'react'

function Login({ setToken, sendRequest }) {
    const [error, setError] = useState(null)
    const [showPassword, setShowPassword] = useState(false);

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
              <input type="text" name="username" placeholder="Username" required />
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" required />
                <label>
                  <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
                  Show password
                </label>
              <button type="submit">Access</button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
          </form>
      </div>
    );
}

export default Login;