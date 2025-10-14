import { useState, useEffect } from 'react';
import '../style.css';

function MyLicenses({ sendRequest }) {
    const [licenses, setLicenses] = useState([]);
    const [displayCount, setDisplayCount] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLicenses();
    }, []);

    const fetchLicenses = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await sendRequest('GET', 'licenses/list');
            setLicenses(data);
        } catch (err) {
            if (err.status === 429) {
                setError('Too many requests. Please try again later.');
            } else {
                setError(err.message || 'Failed to fetch licenses');
            }
        } finally {
            setLoading(false);
        }
    };

    const exportToTxt = () => {
        const content = licenses.map(lic => 
            `${lic.license_key} | Uses: ${lic.uses} | Created: ${new Date(lic.created_at).toLocaleString()}`
        ).join('\n');
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `licenses_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = (key) => {
        navigator.clipboard.writeText(key);
    };

    const displayedLicenses = licenses.slice(0, displayCount);
    const hasMore = licenses.length > displayCount;

    return (
        <div className="license-container">
            <div className="license-form-card">
                <div className="licenses-header">
                    <h2 className="license-title">My Licenses</h2>
                    {licenses.length > 0 && (
                        <button className="export-btn" onClick={exportToTxt}>
                            Export to .txt
                        </button>
                    )}
                </div>

                {loading && <p className="loading-text">Loading licenses...</p>}
                {error && <div className="error-message">{error}</div>}

                {!loading && licenses.length === 0 && (
                    <p className="empty-state">No licenses found. Generate your first license!</p>
                )}

                {!loading && licenses.length > 0 && (
                    <>
                        <div className="licenses-stats">
                            <span className="stats-item">Total: <strong>{licenses.length}</strong></span>
                            <span className="stats-item">Showing: <strong>{displayedLicenses.length}</strong></span>
                        </div>

                        <div className="licenses-list">
                            {displayedLicenses.map((lic, index) => (
                                <div key={index} className="license-item">
                                    <div className="license-item-content">
                                        <code className="key-code">{lic.license_key}</code>
                                        <div className="license-meta">
                                            <span className="meta-badge">Uses: {lic.uses === 999999 ? '∞' : lic.uses}</span>
                                            <span className="meta-date">{new Date(lic.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="copy-btn"
                                        onClick={() => copyToClipboard(lic.license_key)}
                                        title="Copy to clipboard"
                                    >
                                        📋
                                    </button>
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <button 
                                className="load-more-btn"
                                onClick={() => setDisplayCount(prev => prev + 10)}
                            >
                                Load More ({licenses.length - displayCount} remaining)
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default MyLicenses;