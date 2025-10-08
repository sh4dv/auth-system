import { useState, useEffect } from 'react';
import '../style.css';

function DeleteLicense({ sendRequest }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [licenses, setLicenses] = useState([]);
    const [filteredLicenses, setFilteredLicenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchLicenses();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            // Filter licenses that contain the search query
            const filtered = licenses.filter(lic => 
                lic.license_key.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredLicenses(filtered);
        } else {
            setFilteredLicenses([]);
        }
    }, [searchQuery, licenses]);

    const fetchLicenses = async () => {
        try {
            const data = await sendRequest('GET', 'licenses/list');
            setLicenses(data);
        } catch (err) {
            console.error('Failed to fetch licenses:', err);
        }
    };

    const handleDelete = async (licenseKey) => {
        if (!confirm(`Are you sure you want to delete license: ${licenseKey}?`)) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await sendRequest('DELETE', `licenses/delete?license_key=${encodeURIComponent(licenseKey)}`);
            setSuccess(`License "${licenseKey}" deleted successfully!`);
            setSearchQuery('');
            // Refresh the licenses list
            await fetchLicenses();
        } catch (err) {
            setError(err.message || 'Failed to delete license');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="license-container">
            <div className="license-form-card">
                <h2 className="license-title">Delete License</h2>

                <div className="form-group">
                    <label className="form-label">Search License Key</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Type to search or paste full license key..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="form-hint">
                        Search will show matching licenses from your collection
                    </span>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {searchQuery.trim() && filteredLicenses.length === 0 && (
                    <p className="empty-state">No matching licenses found</p>
                )}

                {filteredLicenses.length > 0 && (
                    <div className="search-results">
                        <h3 className="results-title">Matching Licenses ({filteredLicenses.length})</h3>
                        <div className="licenses-list">
                            {filteredLicenses.map((lic, index) => (
                                <div key={index} className="license-item delete-item">
                                    <div className="license-item-content">
                                        <code className="key-code">{lic.license_key}</code>
                                        <div className="license-meta">
                                            <span className="meta-badge">Uses: {lic.uses === 999999 ? '∞' : lic.uses}</span>
                                            <span className="meta-date">{new Date(lic.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDelete(lic.license_key)}
                                        disabled={loading}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!searchQuery.trim() && licenses.length === 0 && (
                    <p className="empty-state">No licenses available to delete</p>
                )}
            </div>
        </div>
    );
}

export default DeleteLicense;