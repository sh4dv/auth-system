import { useState, useEffect } from 'react';
import '../style.css';

function MyLicenses({ sendRequest, isPremium }) {
    const [licenses, setLicenses] = useState([]);
    const [displayCount, setDisplayCount] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [checkedLicenses, setCheckedLicenses] = useState(new Set());
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const copyToClipboard = (key) => {
        navigator.clipboard.writeText(key);
    };

    const filteredLicenses = licenses.filter(lic => 
        lic.license_key.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayedLicenses = filteredLicenses.slice(0, displayCount);
    const hasMore = filteredLicenses.length > displayCount;

    const toggleCheckLicense = (licenseKey) => {
        const newChecked = new Set(checkedLicenses);
        if (newChecked.has(licenseKey)) {
            newChecked.delete(licenseKey);
        } else {
            newChecked.add(licenseKey);
        }
        setCheckedLicenses(newChecked);
    };

    const toggleSelectAll = () => {
        // Check if all filtered licenses are already checked
        const allFilteredKeys = filteredLicenses.map(lic => lic.license_key);
        const allChecked = allFilteredKeys.every(key => checkedLicenses.has(key));
        
        if (allChecked && filteredLicenses.length > 0) {
            // Uncheck all filtered licenses
            const newChecked = new Set(checkedLicenses);
            allFilteredKeys.forEach(key => newChecked.delete(key));
            setCheckedLicenses(newChecked);
        } else {
            // Check all filtered licenses (even ones not displayed yet)
            const newChecked = new Set(checkedLicenses);
            allFilteredKeys.forEach(key => newChecked.add(key));
            setCheckedLicenses(newChecked);
        }
    };

    const handleDeleteChecked = async () => {
        setIsDeleting(true);
        setError('');
        try {
            const licenseKeys = Array.from(checkedLicenses);
            await sendRequest('POST', 'licenses/delete-batch', { license_keys: licenseKeys });
            setCheckedLicenses(new Set());
            setShowDeleteConfirm(false);
            await fetchLicenses();
        } catch (err) {
            setError(err.message || 'Failed to delete licenses');
        } finally {
            setIsDeleting(false);
        }
    };

    const ExportPopup = () => {
        const [licenseType, setLicenseType] = useState('all');
        const [formatType, setFormatType] = useState('full');
        const hasCheckedLicenses = checkedLicenses.size > 0;

        const handleExport = () => {
            let licensesToExport = [];
            
            if (hasCheckedLicenses) {
                // Export only checked licenses
                licensesToExport = licenses.filter(lic => checkedLicenses.has(lic.license_key));
            } else {
                // Filter by license type
                if (licenseType === 'unused') {
                    licensesToExport = licenses.filter(lic => lic.uses > 0);
                } else if (licenseType === 'used') {
                    licensesToExport = licenses.filter(lic => lic.uses === 0 || (lic.uses !== 999999 && lic.uses < licenses.find(l => l.license_key === lic.license_key)?.original_uses));
                } else {
                    licensesToExport = licenses;
                }
            }

            let content;
            if (formatType === 'full') {
                content = licensesToExport.map(lic => 
                    `${lic.license_key} | Uses: ${lic.uses === 999999 ? '∞' : lic.uses} | Created: ${new Date(lic.created_at).toLocaleString()}`
                ).join('\n');
            } else {
                content = licensesToExport.map(lic => lic.license_key).join('\n');
            }

            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `licenses_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setShowExportPopup(false);
        };

        return (
            <div className="popup-overlay" onClick={() => setShowExportPopup(false)}>
                <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                    <div className="popup-header">
                        <h3 className="popup-title">Export Licenses</h3>
                        <button className="popup-close" onClick={() => setShowExportPopup(false)}>✕</button>
                    </div>

                    <div className="popup-body">
                        {hasCheckedLicenses ? (
                            <div className="export-info">
                                <p className="export-notice">
                                    Exporting {checkedLicenses.size} selected license{checkedLicenses.size > 1 ? 's' : ''}
                                </p>
                            </div>
                        ) : (
                            <div className="export-section">
                                <label className="export-label">License Type:</label>
                                <div className="export-options">
                                    <label className="export-option">
                                        <input
                                            type="radio"
                                            name="licenseType"
                                            value="all"
                                            checked={licenseType === 'all'}
                                            onChange={(e) => setLicenseType(e.target.value)}
                                        />
                                        <span>All</span>
                                    </label>
                                    <label className="export-option">
                                        <input
                                            type="radio"
                                            name="licenseType"
                                            value="unused"
                                            checked={licenseType === 'unused'}
                                            onChange={(e) => setLicenseType(e.target.value)}
                                        />
                                        <span>Unused</span>
                                    </label>
                                    <label className="export-option">
                                        <input
                                            type="radio"
                                            name="licenseType"
                                            value="used"
                                            checked={licenseType === 'used'}
                                            onChange={(e) => setLicenseType(e.target.value)}
                                        />
                                        <span>Used</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="export-section">
                            <label className="export-label">Format Type:</label>
                            <div className="export-options">
                                <label className="export-option">
                                    <input
                                        type="radio"
                                        name="formatType"
                                        value="full"
                                        checked={formatType === 'full'}
                                        onChange={(e) => setFormatType(e.target.value)}
                                    />
                                    <span>license | Uses | Created</span>
                                </label>
                                <label className={`export-option ${!isPremium ? 'disabled' : ''}`}>
                                    <input
                                        type="radio"
                                        name="formatType"
                                        value="key-only"
                                        checked={formatType === 'key-only'}
                                        onChange={(e) => setFormatType(e.target.value)}
                                        disabled={!isPremium}
                                    />
                                    <span>license {!isPremium && <span className="premium-badge-small">Premium</span>}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="popup-footer">
                        <button className="popup-btn cancel-btn" onClick={() => setShowExportPopup(false)}>
                            Cancel
                        </button>
                        <button className="popup-btn export-confirm-btn" onClick={handleExport}>
                            Export
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const DeleteConfirmPopup = () => (
        <div className="popup-overlay" onClick={() => !isDeleting && setShowDeleteConfirm(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <h3 className="popup-title">Confirm Deletion</h3>
                    <button 
                        className="popup-close" 
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                    >
                        ✕
                    </button>
                </div>

                <div className="popup-body">
                    <p className="delete-warning">
                        Are you sure you want to delete {checkedLicenses.size} selected license{checkedLicenses.size > 1 ? 's' : ''}?
                        This action cannot be undone.
                    </p>
                    {isDeleting && (
                        <p className="loading-text">Deleting licenses...</p>
                    )}
                </div>

                <div className="popup-footer">
                    <button 
                        className="popup-btn cancel-btn" 
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button 
                        className="popup-btn delete-confirm-btn" 
                        onClick={handleDeleteChecked}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="license-container">
            <div className="license-form-card">
                <div className="licenses-header">
                    <h2 className="license-title">My Licenses</h2>
                    {licenses.length > 0 && (
                        <div className="header-actions">
                            <button 
                                className="delete-checked-btn" 
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={checkedLicenses.size === 0}
                            >
                                Delete Checked
                            </button>
                            <button className="export-btn" onClick={() => setShowExportPopup(true)}>
                                Export to .txt
                            </button>
                        </div>
                    )}
                </div>

                {loading && <p className="loading-text">Loading licenses...</p>}
                {error && <div className="error-message">{error}</div>}

                {!loading && licenses.length === 0 && (
                    <p className="empty-state">No licenses found. Generate your first license!</p>
                )}

                {!loading && licenses.length > 0 && (
                    <>
                        <div className="search-section">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search licenses by name..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setDisplayCount(10);
                                }}
                            />
                        </div>

                        <div className="licenses-stats">
                            <span className="stats-item">Total: <strong>{licenses.length}</strong></span>
                            <span className="stats-item">Showing: <strong>{displayedLicenses.length}</strong></span>
                            {checkedLicenses.size > 0 && (
                                <span className="stats-item checked-count">
                                    Selected: <strong>{checkedLicenses.size}</strong>
                                </span>
                            )}
                        </div>

                        {displayedLicenses.length > 0 && (
                            <div className="select-all-section">
                                <label className="select-all-label">
                                    <input
                                        type="checkbox"
                                        checked={filteredLicenses.length > 0 && filteredLicenses.every(lic => checkedLicenses.has(lic.license_key))}
                                        onChange={toggleSelectAll}
                                        className="select-all-checkbox"
                                    />
                                    <span>Select All {searchQuery && `(${filteredLicenses.length} matching)`}</span>
                                </label>
                            </div>
                        )}

                        <div className="licenses-list">
                            {displayedLicenses.map((lic, index) => (
                                <div key={index} className={`license-item ${checkedLicenses.has(lic.license_key) ? 'checked' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={checkedLicenses.has(lic.license_key)}
                                        onChange={() => toggleCheckLicense(lic.license_key)}
                                        className="license-checkbox"
                                    />
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
                                Load More ({filteredLicenses.length - displayCount} remaining)
                            </button>
                        )}

                        {filteredLicenses.length === 0 && searchQuery && (
                            <p className="empty-state">No licenses found matching "{searchQuery}"</p>
                        )}
                    </>
                )}
            </div>

            {showExportPopup && <ExportPopup />}
            {showDeleteConfirm && <DeleteConfirmPopup />}
        </div>
    );
}

export default MyLicenses;