import { useEffect } from 'react'

function MainPage({ token, setToken, sendRequest }) {
  const handleLogout = () => {
    setToken(null)
  }

  useEffect(() => {
    // Validate token by sending API /me request
    const validateToken = async () => {
      try {
        await sendRequest('GET', 'me')
      } catch (err) {
        console.error('Token validation failed:', err)
        setToken(null)
      }
    }
    if (token) {
      validateToken()
    }
  }, [])

  return (
    <div>
      <h2>Main Page</h2>
      {token ? (
        <>
          <p>Welcome back!</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  )
}

export default MainPage;