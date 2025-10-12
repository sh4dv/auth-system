import { useState, useEffect } from 'react';

function AccountHistory({ sendRequest }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await sendRequest('GET', 'account/history');
            setHistory(data);
        } catch (err) {
            setError('Failed to load account history');
            console.error('Failed to fetch history:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActionLabel = (action, details) => {
        const actionMap = {
            'generate_license': `Generated ${details || 'license'}`,
            'delete_license': `Deleted ${details || 'license'}`,
            'register': details || 'Registered new account',
            'login': 'Logged into account',
            'change_name': details || 'Changed username',
            'reset_password': 'Changed password',
            'reset_secret_token': 'Reset secret token',
            'view_secret_token': 'Viewed secret token',
            'upgrade_premium': 'Upgraded to premium'
        };
        return actionMap[action] || `Unknown action: ${action}`;
    };

    const getActionIcon = (action) => {
        const iconMap = {
            'generate_license': (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            ),
            'delete_license': (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                </svg>
            ),
            'register': (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                </svg>
            ),
            'login': (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
            ),
            'change_name': (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            ),
            'reset_password': (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
            ),
            'reset_secret_token': (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
                </svg>
            ),
            'view_secret_token': (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            ),
            'upgrade_premium': (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            )
        };
        return iconMap[action] || (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
            </svg>
        );
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    if (loading) {
        return (
            <div className="history-loading">
                <div className="loading-spinner"></div>
                <p>Loading account history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="history-error">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>{error}</p>
                <button className="retry-btn" onClick={fetchHistory}>
                    Retry
                </button>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="history-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                </svg>
                <p>No recent activity</p>
                <span className="empty-hint">Your account actions will appear here</span>
            </div>
        );
    }

    return (
        <div className="account-history-container">
            <div className="history-description">
                <p>Your last 5 account actions are displayed below. Recent actions of the same type are grouped together.</p>
            </div>

            <div className="history-list">
                {history.map((item, index) => (
                    <div key={index} className="history-item">
                        <div className="history-item-left">
                            <div className="history-icon">
                                {getActionIcon(item.action)}
                            </div>
                            <div className="history-content">
                                {item.count > 1 && (
                                    <span className="history-count">{item.count}×</span>
                                )}
                                <span className="history-action">
                                    {getActionLabel(item.action, item.details)}
                                </span>
                            </div>
                        </div>
                        <div className="history-item-right">
                            <div className="history-time-container">
                                <span className="history-date">{formatDate(item.timestamp)}</span>
                                <span className="history-time">{formatTime(item.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="history-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>History is retained for the last 30 days</span>
            </div>
        </div>
    );
}

export default AccountHistory;
