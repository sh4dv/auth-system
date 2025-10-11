import { useState } from 'react';

function AccountDeletion({ sendRequest, setToken }) {
    const [password, setPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!password) {
            setError('Please enter your password');
            return;
        }

        if (confirmText !== 'DELETE') {
            setError('Please type DELETE to confirm');
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            await sendRequest('DELETE', 'auth/delete-account', {
                password: password
            });
            
            // Log out user
            setToken(null);
            alert('Your account has been permanently deleted.');
        } catch (err) {
            setError(err.message || 'Failed to delete account');
            setIsDeleting(false);
        }
    };

    const resetForm = () => {
        setPassword('');
        setConfirmText('');
        setError('');
        setShowConfirmation(false);
    };

    return (
        <div>
            <div className="settings-warning">
                <strong>⚠️ Warning:</strong> This action is permanent and cannot be undone. 
                All your data, including licenses, will be permanently deleted.
            </div>

            {error && <div className="settings-error">{error}</div>}

            {!showConfirmation ? (
                        <button 
                            className="settings-btn settings-btn-danger"
                            onClick={() => setShowConfirmation(true)}
                        >
                            Delete My Account
                        </button>
                    ) : (
                        <>
                            <div className="settings-form-group">
                                <label className="settings-label">Confirm Password</label>
                                <input
                                    type="password"
                                    className="settings-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isDeleting}
                                />
                            </div>

                            <div className="settings-form-group">
                                <label className="settings-label">
                                    Type "DELETE" to confirm
                                </label>
                                <input
                                    type="text"
                                    className="settings-input"
                                    placeholder="Type DELETE"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    disabled={isDeleting}
                                    style={{
                                        borderColor: confirmText === 'DELETE' ? '#00ae00' : 
                                                    confirmText.length > 0 ? '#ae0000' : '#00f90040'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                <button 
                                    className="settings-btn settings-btn-danger"
                                    onClick={handleDelete}
                                    disabled={isDeleting || !password || confirmText !== 'DELETE'}
                                    style={{ flex: 1 }}
                                >
                                    {isDeleting ? 'Deleting Account...' : 'Confirm Deletion'}
                                </button>
                                <button 
                                    className="settings-btn"
                                    onClick={resetForm}
                                    disabled={isDeleting}
                                    style={{ 
                                        flex: 1,
                                        borderColor: '#808080',
                                        color: '#808080'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
        </div>
    );
}

export default AccountDeletion;
