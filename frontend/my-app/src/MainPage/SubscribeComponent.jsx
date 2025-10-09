import { useState } from 'react';

function SubscribeComponent({ isPremium, setIsPremium, sendRequest }) {
    const [showPopup, setShowPopup] = useState(false);

    const SubscribeToPremium = async () => {
        try {
            await sendRequest("POST", "subscribe");
            setIsPremium(true);
            setShowPopup(false);
        } catch (error) {
            console.error("Failed to upgrade to premium:", error);
            alert("Failed to upgrade. Please try again.");
        }
    };

    const handleUpgradeClick = () => {
        setShowPopup(true);
    };

    const handleCancel = () => {
        setShowPopup(false);
    };

    return (
        <>
            <span className="Header-premium Header-object">
                {isPremium ? (
                    <span className='premium'>Premium User</span>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>Free User</span>
                        <button className="Header-upgrade-btn" onClick={handleUpgradeClick}>
                            Upgrade
                        </button>
                    </div>
                )}
            </span>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-modal">
                        <h2 className="popup-title">
                            Upgrade to LIFETIME premium subscription for 0,00$
                        </h2>
                        <div className="popup-buttons">
                            <button className="popup-btn-buy" onClick={SubscribeToPremium}>
                                BUY
                            </button>
                            <button className="popup-btn-cancel" onClick={handleCancel}>
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default SubscribeComponent;