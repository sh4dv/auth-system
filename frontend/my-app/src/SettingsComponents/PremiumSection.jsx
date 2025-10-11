import { useState } from 'react';

function PremiumSection({ isPremium, setIsPremium, sendRequest }) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            await sendRequest('POST', 'subscribe');
            setIsPremium(true);
            setShowConfirmation(false);
        } catch (err) {
            alert('Failed to upgrade. Please try again.');
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <div>
            {isPremium ? (
                        <div className="settings-info">
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
                                <h4 style={{ color: '#00f900', margin: '0 0 8px 0', fontSize: '18px' }}>
                                    Premium Active
                                </h4>
                                <p style={{ color: '#808080', fontSize: '14px', margin: 0 }}>
                                    You have full access to all premium features including unlimited license generation and advanced tools.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="settings-info">
                                <h4 style={{ color: '#00f900', margin: '0 0 12px 0', fontSize: '16px' }}>
                                    Premium Benefits
                                </h4>
                                <ul style={{ color: '#c0c0c0', fontSize: '13px', margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                                    <li>Unlimited license generation</li>
                                    <li>Batch license creation (up to 1000 at once)</li>
                                    <li>Priority support</li>
                                    <li>Advanced analytics</li>
                                    <li>Custom license patterns</li>
                                </ul>
                            </div>

                            {!showConfirmation ? (
                                <button 
                                    className="settings-btn"
                                    onClick={() => setShowConfirmation(true)}
                                >
                                    Upgrade to Premium
                                </button>
                            ) : (
                                <div>
                                    <div style={{ 
                                        background: 'linear-gradient(135deg, #ffd70020, #ffd70010)',
                                        border: '1px solid #ffd70040',
                                        borderRadius: '6px',
                                        padding: '16px',
                                        marginBottom: '12px',
                                        textAlign: 'center'
                                    }}>
                                        <h4 style={{ color: '#ffd700', margin: '0 0 8px 0', fontSize: '20px' }}>
                                            LIFETIME Premium
                                        </h4>
                                        <p style={{ 
                                            color: '#ffd700', 
                                            fontSize: '32px', 
                                            fontWeight: '700',
                                            margin: '8px 0'
                                        }}>
                                            $0.00
                                        </p>
                                        <p style={{ color: '#808080', fontSize: '12px', margin: 0 }}>
                                            Limited time offer • One-time payment
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            className="settings-btn"
                                            onClick={handleUpgrade}
                                            disabled={isUpgrading}
                                            style={{ flex: 1 }}
                                        >
                                            {isUpgrading ? 'Processing...' : 'Confirm Upgrade'}
                                        </button>
                                        <button 
                                            className="settings-btn"
                                            onClick={() => setShowConfirmation(false)}
                                            disabled={isUpgrading}
                                            style={{ 
                                                flex: 1,
                                                borderColor: '#808080',
                                                color: '#808080'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
        </div>
    );
}

export default PremiumSection;
