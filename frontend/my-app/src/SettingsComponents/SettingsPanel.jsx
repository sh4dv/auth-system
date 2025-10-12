import { useState } from 'react';
import './SettingsPanel.css';
import AccountInformation from './AccountInformation';
import AccountHistory from './AccountHistory';
import PasswordReset from './PasswordReset';
import PremiumSection from './PremiumSection';
import AccountDeletion from './AccountDeletion';
import GlobalStatistics from './GlobalStatistics';
import FAQ from './FAQ';
import BecomeASponsor from './BecomeASponsor';

function SettingsPanel({ isOpen, onClose, userInfo, sendRequest, isPremium, setIsPremium, setToken }) {
    const [selectedSection, setSelectedSection] = useState(null);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('settings-overlay')) {
            onClose();
        }
    };

    const sections = [
        {
            id: 'account',
            title: 'Account Information',
            hint: 'View and manage your account details',
            component: AccountInformation,
            props: { userInfo, sendRequest, isPremium, setToken }
        },
        {
            id: 'history',
            title: 'Account History',
            hint: 'View your recent account activity',
            component: AccountHistory,
            props: { sendRequest }
        },
        {
            id: 'password',
            title: 'Password Reset',
            hint: 'Change your account password securely',
            component: PasswordReset,
            props: { sendRequest }
        },
        {
            id: 'premium',
            title: 'Premium Subscription',
            hint: isPremium ? 'You are a premium member' : 'Upgrade to unlock unlimited features',
            component: PremiumSection,
            props: { isPremium, setIsPremium, sendRequest }
        },
        {
            id: 'deletion',
            title: 'Account Deletion',
            hint: 'Permanently delete your account and data',
            component: AccountDeletion,
            props: { sendRequest, setToken },
            danger: true
        },
        'divider',
        {
            id: 'stats',
            title: 'Global Statistics',
            hint: 'Platform-wide usage statistics (updated daily)',
            component: GlobalStatistics,
            props: { sendRequest }
        },
        {
            id: 'faq',
            title: 'Frequently Asked Questions',
            hint: 'Common questions about our service',
            component: FAQ,
            props: {}
        },
        {
            id: 'sponsor',
            title: 'Become a Sponsor',
            hint: 'Support the development of this platform',
            component: BecomeASponsor,
            props: {}
        }
    ];

    return (
        <div className="settings-overlay" onClick={handleOverlayClick}>
            <div className="settings-panel-container">
                <div className="settings-sidebar">
                    <div className="settings-header">
                        <h2 className="settings-title">Settings</h2>
                        <button className="settings-close-btn" onClick={onClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="settings-menu">
                        {sections.map((section, index) => {
                            if (section === 'divider') {
                                return <div key={`divider-${index}`} className="settings-menu-divider"></div>;
                            }

                            return (
                                <div
                                    key={section.id}
                                    className={`settings-menu-item ${selectedSection === section.id ? 'active' : ''} ${section.danger ? 'danger' : ''}`}
                                    onClick={() => setSelectedSection(section.id)}
                                >
                                    <div className="menu-item-content">
                                        <h3 className="menu-item-title">{section.title}</h3>
                                        <p className="menu-item-hint">{section.hint}</p>
                                    </div>
                                    <div className="menu-item-arrow">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 4l4 4-4 4" />
                                        </svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {selectedSection && (
                    <div className="settings-content-panel">
                        {sections.map((section) => {
                            if (section === 'divider' || section.id !== selectedSection) return null;
                            
                            const Component = section.component;
                            return (
                                <div key={section.id} className="settings-content-wrapper">
                                    <div className="content-header">
                                        <h2 className="content-title">{section.title}</h2>
                                        <button 
                                            className="content-close-btn" 
                                            onClick={() => setSelectedSection(null)}
                                            title="Close"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M15 5L5 15M5 5l10 10" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="content-body">
                                        <Component {...section.props} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SettingsPanel;
