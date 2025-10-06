import { useEffect, useState } from 'react'
import Header from './Header.jsx'

function MainPage({ token, setToken, sendRequest }) {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    // Validate token by sending API /me request
    const validateToken = async () => {
      try {
        const userData = await sendRequest('GET', 'me')
        setUserInfo({  ID: userData.id, userName: userData.username });
      } catch (err) {
        console.error('Token validation failed:', err)
        setToken(null)
      }
    }
    if (token) {
      validateToken()
    }
  }, [token, sendRequest, setToken])

  return (
    <div>
      {token ? (
        <Header token={token} setToken={setToken} userInfo={userInfo} />
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  )
}

export default MainPage;