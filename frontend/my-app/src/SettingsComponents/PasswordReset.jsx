import { useState } from 'react';

function PasswordReset({ sendRequest }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validatePassword = (password) => {
        if (password.length < 4) {
            return 'Password must be at least 4 characters long';
        }
        if (!/\d/.test(password)) {
            return 'Password must contain at least one number';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!currentPassword) {
            setError('Please enter your current password');
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different from current password');
            return;
        }

        setIsSubmitting(true);
        try {
            await sendRequest('POST', 'auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            setSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Failed to change password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {error && <div className="settings-error">{error}</div>}
            {success && <div className="settings-success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="settings-form-group">
                    <label className="settings-label">Current Password</label>
                    <input
                        type="password"
                        className="settings-input"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="settings-form-group">
                    <label className="settings-label">New Password</label>
                    <input
                        type="password"
                        className="settings-input"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <p style={{ fontSize: '12px', color: '#808080', marginTop: '4px' }}>
                        At least 4 characters with 1 number
                    </p>
                </div>

                <div className="settings-form-group">
                    <label className="settings-label">Confirm New Password</label>
                    <input
                        type="password"
                        className="settings-input"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        style={{
                            borderColor: confirmPassword && newPassword 
                                ? (confirmPassword === newPassword ? '#00ae00' : '#ae0000')
                                : '#00f90040'
                        }}
                    />
                    {confirmPassword && newPassword && (
                        <p style={{ 
                            fontSize: '12px', 
                            marginTop: '4px',
                            color: confirmPassword === newPassword ? '#6bff6b' : '#ff6b6b'
                        }}>
                            {confirmPassword === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                    )}
                </div>

                <button 
                    type="submit" 
                    className="settings-btn"
                    disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
                >
                    {isSubmitting ? 'Changing Password...' : 'Change Password'}
                </button>
            </form>
        </div>
    );
}

export default PasswordReset;
