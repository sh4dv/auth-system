import { useState } from 'react';
import '../style.css';

function GenerateLicense({ sendRequest, isPremium }) {
    const [licenseKey, setLicenseKey] = useState('');
    const [length, setLength] = useState(16);
    const [uses, setUses] = useState(1);
    const [amount, setAmount] = useState(1);
    const [generatedKeys, setGeneratedKeys] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const keys = [];
            if (!isPremium && amount > 1) {
                setError('Only premium users can generate multiple licenses at once.');
                setLoading(false);
                return;
            }
            for (let i = 0; i < amount; i++) {
                // Build query parameters
                const params = new URLSearchParams();
                if (licenseKey) params.append('license_key', licenseKey);
                params.append('length', length);
                params.append('uses', uses);
                params.append('amount', '1');
                
                const data = await sendRequest('POST', `licenses/generate?${params.toString()}`);
                keys.push(data.license_key);
            }
            setGeneratedKeys(keys);
            // Reset form
            setLicenseKey('');
            setLength(16);
            setUses(1);
            setAmount(1);
        } catch (err) {
            if (err.status === 429) {
                setError('Too many license generation requests. Please slow down.');
            } else {
                setError(err.message || 'Failed to generate license');
            }
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (key) => {
        navigator.clipboard.writeText(key);
    };

    const copyAllToClipboard = () => {
        navigator.clipboard.writeText(generatedKeys.join('\n'));
    };

    return (
        <div className="license-container">
            <div className="license-form-card">
                <h2 className="license-title">Generate License</h2>
                
                <form onSubmit={handleGenerate} className="license-form">
                    
                    <div className="form-group">
                        <label className="form-label">Custom Key (optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder={isPremium ? "Leave empty for random or use * for wildcards" : "Leave empty for random or use * for wildcards (will be prefixed with auth.cc-)"}
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value)}
                        />
                        <span className="form-hint">
                            {isPremium 
                                ? "Use * for random characters (e.g., KEY-****-****)"
                                : "Use * for random characters (e.g., KEY-****-**** will become auth.cc-KEY-****-****)"}
                        </span>
                        <span className="form-hint">
                            {!isPremium
                                && "Your license will become: auth.cc-" + (licenseKey || "RANDOM")}
                        </span>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Length</label>
                            <input
                                type="number"
                                className="form-input"
                                min="4"
                                max="64"
                                value={length}
                                onChange={(e) => setLength(e.target.value)}
                                disabled={licenseKey.length > 0}
                                required
                            />
                            {licenseKey.length > 0 && <span className="form-hint">Disabled with custom key</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Uses</label>
                            <input
                                type="number"
                                className="form-input"
                                min="0"
                                value={uses}
                                onChange={(e) => setUses(e.target.value)}
                                required
                            />
                            <span className="form-hint">0 = unlimited</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount</label>
                        <input
                            type="number"
                            className="form-input"
                            min="1"
                            max="100"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button 
                        type="submit" 
                        className="generate-btn"
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </button>
                </form>

                {generatedKeys.length > 0 && (
                    <div className="generated-keys-section">
                        <div className="generated-header">
                            <h3 className="generated-title">Generated Keys</h3>
                            {generatedKeys.length > 1 && (
                                <button 
                                    className="copy-all-btn"
                                    onClick={copyAllToClipboard}
                                >
                                    Copy All
                                </button>
                            )}
                        </div>
                        <div className="keys-list">
                            {generatedKeys.map((key, index) => (
                                <div key={index} className="key-item">
                                    <code className="key-code">{key}</code>
                                    <button 
                                        className="copy-btn"
                                        onClick={() => copyToClipboard(key)}
                                        title="Copy to clipboard"
                                    >
                                        📋
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GenerateLicense;