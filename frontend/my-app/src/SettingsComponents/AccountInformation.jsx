import { useState, useEffect } from 'react';

function AccountInformation({ userInfo, sendRequest, isPremium, setToken }) {
    const [newUsername, setNewUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [licenseCount, setLicenseCount] = useState(0);
    
    // Secret token states
    const [showSecretTokenModal, setShowSecretTokenModal] = useState(false);
    const [verifyPassword, setVerifyPassword] = useState('');
    const [secretToken, setSecretToken] = useState('');
    const [secretTokenError, setSecretTokenError] = useState('');
    const [secretTokenRevealed, setSecretTokenRevealed] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [tokenCopied, setTokenCopied] = useState(false);

    const copyTokenToClipboard = () => {
        navigator.clipboard.writeText(secretToken).then(() => {
            setTokenCopied(true);
            setTimeout(() => setTokenCopied(false), 2000);
        });
    };

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
            if (err.status === 429) {
                setError('Too many username change attempts. Please try again later.');
            } else {
                setError(err.message || 'Failed to change username');
            }
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

    const handleViewSecretToken = () => {
        setShowSecretTokenModal(true);
        setVerifyPassword('');
        setSecretToken('');
        setSecretTokenError('');
        setSecretTokenRevealed(false);
    };

    const handleRevealSecretToken = async () => {
        setSecretTokenError('');
        
        if (!verifyPassword) {
            setSecretTokenError('Please enter your password');
            return;
        }

        try {
            const data = await sendRequest('GET', `auth/get-secret-token?password=${encodeURIComponent(verifyPassword)}`);
            setSecretToken(data.secret_token);
            setSecretTokenRevealed(true);
        } catch (err) {
            if (err.status === 429) {
                setSecretTokenError('Too many attempts. Please try again later.');
            } else {
                setSecretTokenError(err.message || 'Failed to retrieve secret token');
            }
        }
    };

    const closeSecretTokenModal = () => {
        setShowSecretTokenModal(false);
        setVerifyPassword('');
        setSecretToken('');
        setSecretTokenRevealed(false);
    };

    const handleResetSecretToken = async () => {
        if (!window.confirm('Are you sure you want to reset your secret token? Your old token will no longer work for password recovery.')) {
            return;
        }

        setSecretTokenError('');
        setIsResetting(true);

        try {
            const data = await sendRequest('POST', 'auth/reset-secret-token', {
                password: verifyPassword
            });
            setSecretToken(data.secret_token);
            setSecretTokenError('');
            alert('Secret token reset successfully! Please save your new token.');
        } catch (err) {
            if (err.status === 429) {
                setSecretTokenError('Too many attempts. Please try again later.');
            } else {
                setSecretTokenError(err.message || 'Failed to reset secret token');
            }
        } finally {
            setIsResetting(false);
        }
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

            <div className="settings-form-group">
                <label className="settings-label">Secret Recovery Token</label>
                <p style={{ fontSize: '14px', color: '#808080', marginBottom: '12px' }}>
                    Your secret token is used to reset your password if you forget it.
                    {' '}
                    <span 
                        className="view-token-link"
                        onClick={handleViewSecretToken}
                    >
                        View token
                    </span>
                </p>
            </div>

            {/* Secret Token Modal */}
            {showSecretTokenModal && (
                <div className="modal-overlay" onClick={closeSecretTokenModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeSecretTokenModal}>×</button>
                        <h3>View Secret Token</h3>
                        
                        {!secretTokenRevealed ? (
                            <>
                                <p className="modal-description">
                                    Enter your password to view your secret recovery token.
                                </p>
                                <div className="modal-form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={verifyPassword}
                                        onChange={(e) => setVerifyPassword(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleRevealSecretToken()}
                                    />
                                </div>
                                {secretTokenError && <p className="modal-error">{secretTokenError}</p>}
                                <button className="modal-btn" onClick={handleRevealSecretToken}>
                                    Reveal Token
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="modal-description">
                                    This is your secret recovery token. Keep it safe!
                                </p>
                                <div className="secret-token-display">
                                    <code className="secret-token-blur">{secretToken}</code>
                                    <button className="copy-token-btn" onClick={copyTokenToClipboard}>
                                        {tokenCopied ? '✓ Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <p className="modal-note">
                                    Hover over the token to reveal it. You'll need this token to reset your password if you forget it.
                                </p>
                                <button 
                                    className="modal-btn-secondary" 
                                    onClick={handleResetSecretToken}
                                    disabled={isResetting}
                                    style={{ marginTop: '16px' }}
                                >
                                    {isResetting ? 'Resetting Token...' : 'Reset Token'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccountInformation;
