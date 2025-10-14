import { useState, useEffect } from 'react';

function GlobalStatistics({ sendRequest }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await sendRequest('GET', 'stats/global');
            setStats(data);
        } catch (err) {
            if (err.status === 429) {
                setError('Too many requests. Please try again later.');
            } else {
                setError('Failed to load statistics');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            {error && <div className="settings-error">{error}</div>}
            
            {loading ? (
                        <div style={{ textAlign: 'center', color: '#808080', padding: '20px' }}>
                            Loading statistics...
                        </div>
                    ) : stats ? (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h3 className="stat-value">{stats.total_users.toLocaleString()}</h3>
                                    <p className="stat-label">Total Accounts</p>
                                </div>
                                <div className="stat-card">
                                    <h3 className="stat-value">{stats.total_licenses_created.toLocaleString()}</h3>
                                    <p className="stat-label">Licenses Created</p>
                                </div>
                                <div className="stat-card">
                                    <h3 className="stat-value">{stats.total_licenses_active.toLocaleString()}</h3>
                                    <p className="stat-label">Active Licenses</p>
                                </div>
                                <div className="stat-card">
                                    <h3 className="stat-value">{stats.total_licenses_deleted.toLocaleString()}</h3>
                                    <p className="stat-label">Licenses Deleted</p>
                                </div>
                            </div>
                            
                            <div className="stat-card" style={{ marginTop: '12px' }}>
                                <h3 className="stat-value">{stats.total_license_validations.toLocaleString()}</h3>
                                <p className="stat-label">License Validations</p>
                            </div>

                            <p className="stat-updated">
                                Last updated: {formatDate(stats.last_updated)}
                            </p>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#808080', padding: '20px' }}>
                            No statistics available
                        </div>
                    )}
        </div>
    );
}

export default GlobalStatistics;
