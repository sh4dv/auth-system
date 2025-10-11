import { useState, useEffect } from 'react';

function AccountInformation({ userInfo, sendRequest, isPremium, setToken }) {
    const [newUsername, setNewUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [licenseCount, setLicenseCount] = useState(0);

    useEffect(() => {
        fetchLicenseCount();
    }, []);

    const fetchLicenseCount = async () => {
        try {
            const data = await sendRequest('GET', 'licenses/list');
            setLicenseCount(data.length);
        } catch (err) {
            console.error('Failed to fetch license count:', err);
        }
    };

    const checkUsername = async (username) => {
        if (username.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        setIsCheckingUsername(true);
        try {
            const data = await sendRequest('GET', `auth/check-username/${username}`);
            setUsernameAvailable(data.available);
        } catch (err) {
            setUsernameAvailable(null);
        } finally {
            setIsCheckingUsername(false);
        }
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setNewUsername(value);
        setError('');
        setSuccess('');
        
        if (value.length >= 3) {
            checkUsername(value);
        } else {
            setUsernameAvailable(null);
        }
    };

    const handleChangeUsername = async () => {
        if (!newUsername || newUsername.length < 3) {
            setError('Username must be at least 3 characters long');
            return;
        }

        if (!usernameAvailable) {
            setError('Username is not available');
            return;
        }

        try {
            const data = await sendRequest('POST', 'auth/change-username', {
                new_username: newUsername
            });
            setSuccess('Username changed successfully! Your session has been updated.');
            setNewUsername('');
            setUsernameAvailable(null);
            
            // Update token with new username
            if (data.access_token) {
                setToken(data.access_token);
            }
        } catch (err) {
            setError(err.message || 'Failed to change username');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <div>
            <div className="settings-info">
                <div className="info-row">
                    <span className="info-label">Username</span>
                    <span className="info-value">{userInfo?.userName || 'Unknown'}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">User ID</span>
                    <span className="info-value">#{userInfo?.ID || '—'}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Join Date</span>
                    <span className="info-value">{formatDate(userInfo?.created_at)}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Licenses</span>
                    <span className="info-value">{licenseCount}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Account Status</span>
                    <span className="info-value">
                        {isPremium ? <span className="premium-badge">Premium</span> : 'Free'}
                    </span>
                </div>
            </div>

            {error && <div className="settings-error">{error}</div>}
            {success && <div className="settings-success">{success}</div>}

            <div className="settings-form-group">
                <label className="settings-label">Change Username</label>
                <div className="username-change-group">
                    <div className="username-input-wrapper">
                        <input
                            type="text"
                            className="settings-input"
                            placeholder="Enter new username"
                            value={newUsername}
                            onChange={handleUsernameChange}
                            style={{
                                borderColor: newUsername.length >= 3 
                                    ? (usernameAvailable ? '#00ae00' : usernameAvailable === false ? '#ae0000' : '#00f90040')
                                    : '#00f90040'
                            }}
                        />
                    </div>
                    <button 
                        className="username-change-btn"
                        onClick={handleChangeUsername}
                        disabled={!usernameAvailable || isCheckingUsername || newUsername.length < 3}
                    >
                        {isCheckingUsername ? 'Checking...' : 'Change'}
                    </button>
                </div>
                {newUsername.length >= 3 && (
                    <p style={{ 
                        fontSize: '12px', 
                        marginTop: '4px',
                        color: usernameAvailable ? '#6bff6b' : usernameAvailable === false ? '#ff6b6b' : '#808080'
                    }}>
                        {isCheckingUsername 
                            ? 'Checking availability...' 
                            : usernameAvailable 
                                ? '✓ Username available' 
                                : usernameAvailable === false 
                                    ? '✗ Username taken' 
                                    : ''}
                    </p>
                )}
            </div>
        </div>
    );
}

export default AccountInformation;
