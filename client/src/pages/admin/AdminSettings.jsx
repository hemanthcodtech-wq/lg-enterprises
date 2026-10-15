import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FiSettings, FiSave, FiShield, FiGlobe, 
  FiMail, FiPhone, FiLock, FiCheckCircle, FiRefreshCw, FiAlertCircle 
} from 'react-icons/fi';

const AdminSettings = () => {
  const { token } = useOutletContext();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Settings have been updated and saved successfully!');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // General Settings (Currency and Timezone removed as requested)
  const [storeName, setStoreName] = useState('LG Enterprises Store');
  const [supportEmail, setSupportEmail] = useState('support@lg-enterprises.com');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [storeAddress, setStoreAddress] = useState('Ground Floor, Tech Park, Mumbai, MH 400001');

  // Security & Admin Profile
  const [adminName, setAdminName] = useState('Super Admin');
  const [adminEmail, setAdminEmail] = useState('admin@lg.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  const fetchSettings = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/settings`, {
        headers: { 'x-auth-token': token }
      });
      if (res.data.settings) {
        const s = res.data.settings;
        if (s.storeName !== undefined) setStoreName(s.storeName);
        if (s.supportEmail !== undefined) setSupportEmail(s.supportEmail);
        if (s.supportPhone !== undefined) setSupportPhone(s.supportPhone);
        if (s.storeAddress !== undefined) setStoreAddress(s.storeAddress);
      }
      if (res.data.admin) {
        if (res.data.admin.name) setAdminName(res.data.admin.name);
        if (res.data.admin.email) setAdminEmail(res.data.admin.email);
      }
      if (showToast) toast.success('Settings reloaded');
    } catch (err) {
      console.error('Failed to load settings:', err);
      toast.error('Failed to load settings');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchSettings();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Save store settings
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/settings`, {
        storeName,
        supportEmail,
        supportPhone,
        storeAddress
      }, {
        headers: { 'x-auth-token': token }
      });

      // 2. If password change or admin profile update
      if (newPassword || adminName || adminEmail) {
        if (newPassword && !currentPassword) {
          setErrorMessage('Current password is required to change your password');
          setLoading(false);
          return;
        }
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/change-password`, {
          currentPassword,
          newPassword,
          adminName,
          adminEmail
        }, {
          headers: { 'x-auth-token': token }
        });
        setCurrentPassword('');
        setNewPassword('');
      }

      setSaveMessage('System settings & credentials have been updated successfully!');
      setIsSaved(true);
      toast.success('Settings saved successfully');
      setTimeout(() => setIsSaved(false), 4500);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save settings. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-settings-page">
      <style>{`
        /* Exact match to AdminOrders typography and scale */
        .admin-settings-page {
          padding-bottom: 3rem;
          color: #0f172a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .header-section {
          margin-bottom: 1.5rem;
        }
        .page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .page-title-group h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem 0;
          letter-spacing: -0.01em;
        }
        .page-title-group p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        .header-actions-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.8rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          font-family: inherit;
        }
        .refresh-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .refresh-btn .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 2-Column Split Layout */
        .settings-layout-grid {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .settings-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Enterprise Card Container */
        .table-enterprise-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
          overflow: hidden;
        }

        .card-header-bar {
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .card-title-group h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .card-title-group p {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0.15rem 0 0 0;
        }

        /* Left Navigation Tabs */
        .nav-tabs-wrapper {
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .settings-tab-button {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          text-align: left;
          width: 100%;
        }
        .settings-tab-button:hover {
          background: #f8fafc;
          color: #0f172a;
        }
        .settings-tab-button.active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
        }

        /* Form Controls */
        .form-body-padded {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .field-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
        }
        .official-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
          font-family: inherit;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .official-input:focus {
          outline: none;
          background: #ffffff;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .toggle-switch-card {
          padding: 0.85rem 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .submit-btn-official {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.55rem 1.25rem;
          background: #4f46e5;
          color: #ffffff;
          border: 1px solid #4f46e5;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
          font-family: inherit;
        }
        .submit-btn-official:hover:not(:disabled) {
          background: #4338ca;
          border-color: #4338ca;
        }
        .submit-btn-official:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .banner-alert {
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .banner-alert.success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .banner-alert.error {
          background: #fff5f5;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
      `}</style>

      {/* Top Header & Page Actions */}
      <div className="header-section">
        <div className="page-title-row">
          <div className="page-title-group">
            <h2>System Settings</h2>
            <p>Configure store branding, support contact details, and administrator credentials.</p>
          </div>
          <div className="header-actions-group">
            <button 
              className="refresh-btn" 
              onClick={() => fetchSettings(true)} 
              disabled={refreshing}
              title="Refresh settings"
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="settings-layout-grid">
        {/* Left Navigation Card (Filtered to only Store Details & Security) */}
        <div className="table-enterprise-card">
          <div className="nav-tabs-wrapper">
            <button 
              className={`settings-tab-button ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <FiGlobe style={{ fontSize: '1rem' }} /> Store Details
            </button>
            <button 
              className={`settings-tab-button ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <FiShield style={{ fontSize: '1rem' }} /> Admin & Security
            </button>
          </div>
        </div>

        {/* Right Configuration Card */}
        <div className="table-enterprise-card">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>{activeTab === 'general' ? 'Store & Public Information' : 'Admin Profile & Security'}</h3>
              <p>{activeTab === 'general' ? 'Storefront identity and customer support points' : 'Change password and update credentials'}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="form-body-padded">
            {isSaved && (
              <div className="banner-alert success">
                <FiCheckCircle />
                <span>{saveMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="banner-alert error">
                <FiAlertCircle />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: General Store Details (Store Currency & Server Timezone removed) */}
            {activeTab === 'general' && (
              <>
                <div className="field-group">
                  <label className="field-label">Storefront Brand Name *</label>
                  <input 
                    type="text" 
                    className="official-input" 
                    value={storeName} 
                    onChange={e => setStoreName(e.target.value)} 
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="field-group">
                    <label className="field-label">Customer Support Email *</label>
                    <input 
                      type="email" 
                      className="official-input" 
                      value={supportEmail} 
                      onChange={e => setSupportEmail(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Support Helpline Phone *</label>
                    <input 
                      type="text" 
                      className="official-input" 
                      value={supportPhone} 
                      onChange={e => setSupportPhone(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Physical Warehouse / Dispatch Address *</label>
                  <input 
                    type="text" 
                    className="official-input" 
                    value={storeAddress} 
                    onChange={e => setStoreAddress(e.target.value)} 
                    required 
                  />
                </div>
              </>
            )}

            {/* TAB 2: Admin Profile & Security */}
            {activeTab === 'security' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="field-group">
                    <label className="field-label">Administrator Name *</label>
                    <input 
                      type="text" 
                      className="official-input" 
                      value={adminName} 
                      onChange={e => setAdminName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Admin Login Email *</label>
                    <input 
                      type="email" 
                      className="official-input" 
                      value={adminEmail} 
                      onChange={e => setAdminEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="field-group">
                    <label className="field-label">Current Password</label>
                    <input 
                      type="password" 
                      className="official-input" 
                      placeholder="Required only if changing password" 
                      value={currentPassword} 
                      onChange={e => setCurrentPassword(e.target.value)} 
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">New Password</label>
                    <input 
                      type="password" 
                      className="official-input" 
                      placeholder="Leave blank to keep current" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="toggle-switch-card">
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>Two-Factor Authentication (2FA)</div>
                    <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Require OTP confirmation on every super-admin login</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={twoFactorAuth} 
                    onChange={e => setTwoFactorAuth(e.target.checked)} 
                    style={{ width: '16px', height: '16px', accentColor: '#4f46e5', cursor: 'pointer' }}
                  />
                </div>
              </>
            )}

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="submit-btn-official" disabled={loading}>
                <FiSave />
                <span>{loading ? 'Saving Changes...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
