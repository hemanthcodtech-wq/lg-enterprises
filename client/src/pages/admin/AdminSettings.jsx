import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FiSettings, FiSave, FiShield, FiGlobe, 
  FiMail, FiPhone, FiLock, FiCheckCircle, FiRefreshCw, FiAlertCircle,
  FiMapPin, FiShare2, FiExternalLink, FiClock
} from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext';

const AdminSettings = () => {
  const { token } = useOutletContext();
  const { reloadSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Settings have been updated and saved successfully!');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Store General Information & Contact
  const [storeName, setStoreName] = useState('LG Enterprises Store');
  const [supportEmail, setSupportEmail] = useState('support@lg-enterprises.com');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [whatsappNumber, setWhatsappNumber] = useState('+91 98765 43210');
  const [supportTiming, setSupportTiming] = useState('Mon – Sat: 9:00 AM – 8:30 PM');

  // Location & Pinpoint
  const [locationCity, setLocationCity] = useState('Bhimavaram, Andhra Pradesh');
  const [storeAddress, setStoreAddress] = useState('LG Complex, Main Road, Bhimavaram, AP – 534201');
  const [mapPinUrl, setMapPinUrl] = useState('https://maps.google.com/?q=Bhimavaram,+Andhra+Pradesh');
  const [mapEmbedIframe, setMapEmbedIframe] = useState('');

  // Social Media Links
  const [socialFacebook, setSocialFacebook] = useState('https://facebook.com');
  const [socialInstagram, setSocialInstagram] = useState('https://instagram.com');
  const [socialTwitter, setSocialTwitter] = useState('https://twitter.com');
  const [socialYoutube, setSocialYoutube] = useState('https://youtube.com');
  const [socialLinkedin, setSocialLinkedin] = useState('');
  const [socialWhatsapp, setSocialWhatsapp] = useState('https://wa.me/919876543210');

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
        if (s.whatsappNumber !== undefined) setWhatsappNumber(s.whatsappNumber);
        if (s.supportTiming !== undefined) setSupportTiming(s.supportTiming);

        if (s.locationCity !== undefined) setLocationCity(s.locationCity);
        if (s.storeAddress !== undefined) setStoreAddress(s.storeAddress);
        if (s.mapPinUrl !== undefined) setMapPinUrl(s.mapPinUrl);
        if (s.mapEmbedIframe !== undefined) setMapEmbedIframe(s.mapEmbedIframe);

        if (s.socialFacebook !== undefined) setSocialFacebook(s.socialFacebook);
        if (s.socialInstagram !== undefined) setSocialInstagram(s.socialInstagram);
        if (s.socialTwitter !== undefined) setSocialTwitter(s.socialTwitter);
        if (s.socialYoutube !== undefined) setSocialYoutube(s.socialYoutube);
        if (s.socialLinkedin !== undefined) setSocialLinkedin(s.socialLinkedin);
        if (s.socialWhatsapp !== undefined) setSocialWhatsapp(s.socialWhatsapp);
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
        whatsappNumber,
        supportTiming,
        locationCity,
        storeAddress,
        mapPinUrl,
        mapEmbedIframe,
        socialFacebook,
        socialInstagram,
        socialTwitter,
        socialYoutube,
        socialLinkedin,
        socialWhatsapp
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

      // Reload global site settings context immediately
      if (reloadSettings) {
        reloadSettings();
      }

      setSaveMessage('Site settings, location & social links updated and live across Footer, About & Contact pages!');
      setIsSaved(true);
      toast.success('Settings saved successfully');
      setTimeout(() => setIsSaved(false), 5000);
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
          padding: 0.45rem 0.85rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .refresh-btn:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .refresh-btn .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .settings-layout-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 868px) {
          .settings-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        .table-enterprise-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .nav-tabs-wrapper {
          padding: 0.65rem;
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
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
          width: 100%;
        }
        .settings-tab-button:hover {
          background: #f8fafc;
          color: #0f172a;
        }
        .settings-tab-button.active {
          background: #eef2ff;
          color: #4f46e5;
        }

        .card-header-bar {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          background: #fcfcfd;
        }
        .card-title-group h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem 0;
        }
        .card-title-group p {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
        }

        .form-body-padded {
          padding: 1.25rem;
        }

        .field-section-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #1e293b;
          margin: 1.25rem 0 0.75rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .field-section-title:first-child {
          margin-top: 0;
        }

        .field-group {
          margin-bottom: 1rem;
        }
        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.35rem;
        }
        .field-hint {
          display: block;
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }

        .official-input {
          width: 100%;
          padding: 0.55rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.82rem;
          color: #0f172a;
          background: #ffffff;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .official-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .toggle-switch-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .submit-btn-official {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.6rem 1.4rem;
          background: #4f46e5;
          color: #ffffff;
          border: 1px solid #4f46e5;
          border-radius: 8px;
          font-size: 0.82rem;
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
          padding: 0.75rem 0.95rem;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
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

        .map-preview-box {
          margin-top: 0.65rem;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }
      `}</style>

      {/* Top Header & Page Actions */}
      <div className="header-section">
        <div className="page-title-row">
          <div className="page-title-group">
            <h2>Site & System Settings</h2>
            <p>Update storefront contact info, physical location & pinpoint, social media links, and admin security.</p>
          </div>
          <div className="header-actions-group">
            <button 
              className="refresh-btn" 
              onClick={() => fetchSettings(true)} 
              disabled={refreshing}
              title="Refresh settings"
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Reload Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="settings-layout-grid">
        {/* Left Navigation Card */}
        <div className="table-enterprise-card">
          <div className="nav-tabs-wrapper">
            <button 
              className={`settings-tab-button ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <FiGlobe style={{ fontSize: '1rem' }} /> Store Identity & Contact
            </button>
            <button 
              className={`settings-tab-button ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              <FiMapPin style={{ fontSize: '1rem' }} /> Location & Pinpoint
            </button>
            <button 
              className={`settings-tab-button ${activeTab === 'social' ? 'active' : ''}`}
              onClick={() => setActiveTab('social')}
            >
              <FiShare2 style={{ fontSize: '1rem' }} /> Social Media Links
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
              <h3>
                {activeTab === 'general' && 'Store Information & Contact Helplines'}
                {activeTab === 'location' && 'Store Physical Location & Map Pinpoint'}
                {activeTab === 'social' && 'Social Media & Community Channels'}
                {activeTab === 'security' && 'Admin Profile & Security Credentials'}
              </h3>
              <p>
                {activeTab === 'general' && 'Auto-updates across the top banner, footer contact section, and about/contact pages'}
                {activeTab === 'location' && 'Changes here immediately update the map pinpoint, directions, and address across the website'}
                {activeTab === 'social' && 'Social icons in the footer and contact sections will direct visitors to these channels'}
                {activeTab === 'security' && 'Change super-admin password, email login, and security policies'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="form-body-padded">
            {isSaved && (
              <div className="banner-alert success">
                <FiCheckCircle style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                <span>{saveMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="banner-alert error">
                <FiAlertCircle style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: General Store & Contact */}
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
                    placeholder="e.g. LG Enterprises"
                  />
                  <span className="field-hint">Displayed in page headers, copyright, and brand labels.</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="field-group">
                    <label className="field-label">Official Support Email *</label>
                    <input 
                      type="email" 
                      className="official-input" 
                      value={supportEmail} 
                      onChange={e => setSupportEmail(e.target.value)} 
                      required 
                      placeholder="support@lgenterprises.com"
                    />
                    <span className="field-hint">Auto-updates the mailto link in the footer and contact page.</span>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Customer Care Helpline *</label>
                    <input 
                      type="text" 
                      className="official-input" 
                      value={supportPhone} 
                      onChange={e => setSupportPhone(e.target.value)} 
                      required 
                      placeholder="+91 98765 43210"
                    />
                    <span className="field-hint">Shown in footer and click-to-call buttons.</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="field-group">
                    <label className="field-label">WhatsApp Helpline Number *</label>
                    <input 
                      type="text" 
                      className="official-input" 
                      value={whatsappNumber} 
                      onChange={e => setWhatsappNumber(e.target.value)} 
                      required 
                      placeholder="+91 98765 43210"
                    />
                    <span className="field-hint">Direct number for WhatsApp chat prompts.</span>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Working Hours / Support Timing *</label>
                    <input 
                      type="text" 
                      className="official-input" 
                      value={supportTiming} 
                      onChange={e => setSupportTiming(e.target.value)} 
                      required 
                      placeholder="Mon – Sat: 9:00 AM – 8:30 PM"
                    />
                    <span className="field-hint">Displayed in contact cards and about page store schedule.</span>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: Location & Pinpoint */}
            {activeTab === 'location' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="field-group">
                    <label className="field-label">City / Region Name *</label>
                    <input 
                      type="text" 
                      className="official-input" 
                      value={locationCity} 
                      onChange={e => setLocationCity(e.target.value)} 
                      required 
                      placeholder="e.g. Bhimavaram, Andhra Pradesh"
                    />
                    <span className="field-hint">Short city identifier used in headline badges.</span>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Google Maps Pinpoint URL *</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="url" 
                        className="official-input" 
                        value={mapPinUrl} 
                        onChange={e => setMapPinUrl(e.target.value)} 
                        required 
                        placeholder="https://maps.google.com/?q=..."
                      />
                      {mapPinUrl && (
                        <a 
                          href={mapPinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="refresh-btn" 
                          style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                        >
                          <FiExternalLink /> Open
                        </a>
                      )}
                    </div>
                    <span className="field-hint">Direct link opened when customers click 'View on Map' or 'Get Directions'.</span>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Full Physical Address *</label>
                  <textarea 
                    className="official-input" 
                    rows="3" 
                    value={storeAddress} 
                    onChange={e => setStoreAddress(e.target.value)} 
                    required 
                    placeholder="LG Complex, Main Road, Bhimavaram, AP – 534201"
                  />
                  <span className="field-hint">Displayed verbatim across the website footer, contact cards, and about us section.</span>
                </div>

                <div className="field-group">
                  <label className="field-label">Google Maps Embed HTML / Iframe Source (Optional)</label>
                  <input 
                    type="text" 
                    className="official-input" 
                    value={mapEmbedIframe} 
                    onChange={e => setMapEmbedIframe(e.target.value)} 
                    placeholder="https://www.google.com/maps/embed?pb=... OR full <iframe> code"
                  />
                  <span className="field-hint">Paste either a Google Maps embed URL or the full &lt;iframe&gt; code to display an interactive live map on the Contact & About pages.</span>
                </div>

                {mapEmbedIframe && (
                  <div className="map-preview-box">
                    <div style={{ padding: '0.5rem 0.75rem', background: '#f1f5f9', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                      Live Map Preview:
                    </div>
                    {mapEmbedIframe.includes('<iframe') ? (
                      <div dangerouslySetInnerHTML={{ __html: mapEmbedIframe }} style={{ width: '100%', minHeight: '220px' }} />
                    ) : (
                      <iframe 
                        title="Store Location Preview" 
                        src={mapEmbedIframe} 
                        width="100%" 
                        height="220" 
                        style={{ border: 0 }} 
                        loading="lazy"
                      />
                    )}
                  </div>
                )}
              </>
            )}

            {/* TAB 3: Social Media Links */}
            {activeTab === 'social' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="field-group">
                    <label className="field-label">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FaFacebook style={{ color: '#1877f2' }} /> Facebook Page URL
                      </span>
                    </label>
                    <input 
                      type="url" 
                      className="official-input" 
                      value={socialFacebook} 
                      onChange={e => setSocialFacebook(e.target.value)} 
                      placeholder="https://facebook.com/lgenterprises"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FaInstagram style={{ color: '#e1306c' }} /> Instagram Profile URL
                      </span>
                    </label>
                    <input 
                      type="url" 
                      className="official-input" 
                      value={socialInstagram} 
                      onChange={e => setSocialInstagram(e.target.value)} 
                      placeholder="https://instagram.com/lgenterprises"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="field-group">
                    <label className="field-label">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FaTwitter style={{ color: '#1da1f2' }} /> Twitter / X Profile URL
                      </span>
                    </label>
                    <input 
                      type="url" 
                      className="official-input" 
                      value={socialTwitter} 
                      onChange={e => setSocialTwitter(e.target.value)} 
                      placeholder="https://twitter.com/lgenterprises"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FaYoutube style={{ color: '#ff0000' }} /> YouTube Channel URL
                      </span>
                    </label>
                    <input 
                      type="url" 
                      className="official-input" 
                      value={socialYoutube} 
                      onChange={e => setSocialYoutube(e.target.value)} 
                      placeholder="https://youtube.com/@lgenterprises"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="field-group">
                    <label className="field-label">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FaWhatsapp style={{ color: '#25d366' }} /> WhatsApp Chat Direct Link
                      </span>
                    </label>
                    <input 
                      type="url" 
                      className="official-input" 
                      value={socialWhatsapp} 
                      onChange={e => setSocialWhatsapp(e.target.value)} 
                      placeholder="https://wa.me/919876543210"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FaLinkedin style={{ color: '#0a66c2' }} /> LinkedIn Page URL (Optional)
                      </span>
                    </label>
                    <input 
                      type="url" 
                      className="official-input" 
                      value={socialLinkedin} 
                      onChange={e => setSocialLinkedin(e.target.value)} 
                      placeholder="https://linkedin.com/company/lgenterprises"
                    />
                  </div>
                </div>
              </>
            )}

            {/* TAB 4: Admin Profile & Security */}
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

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
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
