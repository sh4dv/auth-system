import { useEffect, useState } from 'react';
import './style.css';
import SubscribeComponent from './SubscribeComponent';

function Header({ token, setToken, userInfo, sendRequest, isPremium, setIsPremium }) {
    

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
      <header className="App-header">
      <span className="Header-title Header-object">
        Logged in as:
        <span className="RevealWrapper">
        <span className="Header-username"> {userInfo?.userName || 'Unknown'} </span>
        <span className="Header-secret" aria-hidden="true"> (ID: {userInfo?.ID ?? '—'})</span>
        </span>
      </span>

      <SubscribeComponent isPremium={isPremium} setIsPremium={setIsPremium} sendRequest={sendRequest} />

      {token && <button onClick={handleLogout} className='Header-logout-btn Header-object'>Logout</button>}
      </header>
    );
  }
  
export default Header;