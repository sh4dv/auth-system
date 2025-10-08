import { useState } from 'react';
import '../style.css';

function CheckLicense({ sendRequest }) {
    const [licenseKey, setLicenseKey] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCheck = async (e) => {
        e.preventDefault();
        
        if (!licenseKey.trim()) {
            setError('Please enter a license key');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await sendRequest('GET', `licenses/validate?license_key=${encodeURIComponent(licenseKey)}`);
            setResult({
                valid: true,
                message: data.detail,
                uses: data.uses,
                licenseKey: licenseKey
            });
        } catch (err) {
            if (err.message.includes('not found')) {
                setResult({
                    valid: false,
                    message: 'License key not found',
                    licenseKey: licenseKey
                });
            } else if (err.message.includes('no uses remaining')) {
                setResult({
                    valid: false,
                    message: 'License has no uses remaining',
                    licenseKey: licenseKey
                });
            } else {
                setError(err.message || 'Failed to validate license');
            }
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setLicenseKey('');
        setResult(null);
        setError('');
    };

    return (
        <div className="license-container">
            <div className="license-form-card">
                <h2 className="license-title">Check License</h2>

                <form onSubmit={handleCheck} className="license-form">
                    <div className="form-group">
                        <label className="form-label">License Key</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter license key to validate..."
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value)}
                            disabled={loading}
                        />
                        <span className="form-hint">
                            Check if a license key exists and has uses available
                        </span>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button 
                        type="submit" 
                        className="generate-btn"
                        disabled={loading || !licenseKey.trim()}
                    >
                        {loading ? 'Checking...' : 'Validate License'}
                    </button>
                </form>

                {result && (
                    <div className="validation-result">
                        <div className={`result-card ${result.valid ? 'valid' : 'invalid'}`}>
                            <div className="result-icon">
                                {result.valid ? '✓' : '✗'}
                            </div>
                            <div className="result-content">
                                <h3 className="result-title">
                                    {result.valid ? 'Valid License' : 'Invalid License'}
                                </h3>
                                <code className="result-key">{result.licenseKey}</code>
                                <p className="result-message">{result.message}</p>
                                {result.valid && result.uses && (
                                    <p className="result-uses">
                                        Remaining uses: <strong>{result.uses === 'unlimited' ? '∞' : result.uses}</strong>
                                    </p>
                                )}
                            </div>
                        </div>
                        <button className="reset-btn" onClick={reset}>
                            Check Another License
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CheckLicense;