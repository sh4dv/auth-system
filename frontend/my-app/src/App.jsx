import { useState, useEffect } from 'react'
import './App.css'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [apiStatus, setApiStatus] = useState('checking...')
  const [error, setError] = useState(null)

  const sendRequest = async (method = 'GET', endpoint = '', body = null) => {
    const opts = { method, headers: { 'Content-Type': 'application/json' } }
    if (body && method !== 'GET') opts.body = JSON.stringify(body)
    const res = await fetch(`${apiUrl}/${endpoint}`)
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

  return (
    <div className='StatusBar'>
      <h1>API Status: {apiStatus}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default App