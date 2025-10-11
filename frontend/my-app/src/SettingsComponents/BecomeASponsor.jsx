function BecomeASponsor() {
    return (
        <div>
            <div className="sponsor-placeholder">
                <div className="sponsor-icon">💝</div>
                <div className="sponsor-text">
                    <p style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#00f900', fontWeight: 600 }}>
                        Support Our Platform
                    </p>
                    <p style={{ margin: '0 0 8px 0' }}>
                        Help us maintain and improve this service by becoming a sponsor.
                    </p>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                        Your support enables us to keep the service running, add new features, 
                        and provide better support to all users.
                    </p>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button 
                        className="settings-btn"
                        onClick={() => alert('Sponsorship options coming soon!')}
                        style={{ maxWidth: '200px', margin: '0 auto' }}
                    >
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BecomeASponsor;
