import './style.css';

function Header({ token, setToken, userInfo }) {

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
        {token && <button onClick={handleLogout} className='Header-logout-btn Header-object'>Logout</button>}
      </header>
    );
  }
  
export default Header;