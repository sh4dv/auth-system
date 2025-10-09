import { useEffect, useState } from 'react'
import './style.css'
import Header from './Header.jsx'
import ViewsHandler from './ViewsHandler.jsx'
import MyLicenses from './Views/MyLicenses.jsx'
import GenerateLicense from './Views/GenerateLicense.jsx'
import DeleteLicense from './Views/DeleteLicense.jsx'
import CheckLicense from './Views/CheckLicense.jsx'
import IntegrateSystem from './Views/IntegrateSystem.jsx'

function MainPage({ token, setToken, sendRequest }) {
  const [userInfo, setUserInfo] = useState({});
  const [viewState, setViewState] = useState('my-licenses'); // states according to files in /Views folder
  const [isPremium, setIsPremium] = useState(0);

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
        <>
          <Header token={token} setToken={setToken} userInfo={userInfo} sendRequest={sendRequest} isPremium={isPremium} setIsPremium={setIsPremium} />
          <ViewsHandler viewState={viewState} setViewState={setViewState} />
          {viewState === 'my-licenses' && <MyLicenses sendRequest={sendRequest} />}
          {viewState === 'generate-license' && <GenerateLicense sendRequest={sendRequest} />}
          {viewState === 'delete-license' && <DeleteLicense sendRequest={sendRequest} />}
          {viewState === 'check-license' && <CheckLicense sendRequest={sendRequest} />}
          {viewState === 'integrate-system' && <IntegrateSystem />}
          
        </>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  )
}

export default MainPage;