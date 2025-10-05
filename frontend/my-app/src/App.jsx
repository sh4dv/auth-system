import { useState, useEffect } from 'react'
import './App.css'
import Login from './Login.jsx'
import MainPage from './MainPage.jsx'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [apiStatus, setApiStatus] = useState('checking...')
  const [error, setError] = useState(null)
  const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || null
    });

  const sendRequest = async (method = 'GET', endpoint = '', body = null) => {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    const options = { method, headers }
    if (body && method !== 'GET') options.body = JSON.stringify(body)

    const res = await fetch(`${apiUrl}/${endpoint}`, options)
    if (!res.ok) {
      // 401 -> token invalid
      if (res.status === 401) {
        setToken(null)
      }
      let msg = 'Request failed'
      try { const data = await res.json(); msg = data.detail || msg } catch {}
      throw new Error(msg)
    }
    return res.json()
  }

  useEffect(() => {
    let cancelled = false
    sendRequest('GET', 'health')
      .then(data => {
        if (cancelled) return
        setApiStatus(data.status || 'unknown')
      })
      .catch(() => {
        if (!cancelled) {
          setApiStatus('down')
          setError('Unable to reach API')
        }
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
      }, [token]);

  return (
    <div className='StatusBar'>
      {apiStatus != "ok" ? <h1 style={{ color: 'red' }}>Oh no! API is down. Or you just didn't turn it on.</h1> : apiStatus == 'checking' && <h1>Checking API status... please wait</h1>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!token ? <Login sendRequest={sendRequest} setToken={setToken} /> : <MainPage token={token} setToken={setToken} sendRequest={sendRequest} />}
    </div>
  )
}

export default App