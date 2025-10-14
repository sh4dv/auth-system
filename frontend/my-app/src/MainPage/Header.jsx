import { useEffect, useState } from 'react';
import './style.css';
import SubscribeComponent from './SubscribeComponent';
import SettingsPanel from '../SettingsComponents/SettingsPanel';

function Header({ token, setToken, userInfo, sendRequest, isPremium, setIsPremium }) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
      // Check if user is premium, with every token change
      const checkPremiumStatus = async () => {
        if (token) {
          try {
            const data = await sendRequest('GET', 'me');
            setIsPremium(data.is_premium);
          } catch (err) {
            setIsPremium(0);
          }
        }
      };
      checkPremiumStatus();
    }, [token, sendRequest]);

    const handleLogout = () => {
      setToken(null);
    };

    return (
      <>
      <header className="App-header">
      <span className="Header-title Header-object">
        <button 
          className="Header-settings-btn" 
          onClick={() => setIsSettingsOpen(true)}
          title="Settings"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15l-5-5h10l-5 5z" />
          </svg>
        </button>
        Logged in as: ‎ 
        <span className="RevealWrapper">
        <span className="Header-username">{userInfo?.userName || 'Unknown'} </span>
        <span className="Header-secret" aria-hidden="true"> (ID: {userInfo?.ID ?? '—'})</span>
        </span>
      </span>

      <SubscribeComponent isPremium={isPremium} setIsPremium={setIsPremium} sendRequest={sendRequest} />

      {token && <button onClick={handleLogout} className='Header-logout-btn Header-object'>Logout</button>}
      </header>

      <SettingsPanel 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userInfo={userInfo}
        sendRequest={sendRequest}
        isPremium={isPremium}
        setIsPremium={setIsPremium}
        setToken={setToken}
      />
      </>
    );
  }
  
export default Header;