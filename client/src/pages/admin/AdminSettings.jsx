import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FiSettings, FiSave, FiShield, FiGlobe, FiShoppingBag, 
  FiMail, FiPhone, FiLock, FiCheckCircle, FiBell, FiDollarSign 
} from 'react-icons/fi';

const AdminSettings = () => {
  const { token } = useOutletContext();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // General Settings
  const [storeName, setStoreName] = useState('LG Enterprises Store');
  const [supportEmail, setSupportEmail] = useState('support@lg-enterprises.com');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [storeAddress, setStoreAddress] = useState('Ground Floor, Tech Park, Mumbai, MH 400001');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  // Security & Admin Profile
  const [adminName, setAdminName] = useState('Super Admin');
  const [adminEmail, setAdminEmail] = useState('admin@lg.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  // Store & Checkout Preferences
  const [enablePromos, setEnablePromos] = useState(true);
  const [enableFreeShipping, setEnableFreeShipping] = useState(true);
  const [freeShippingMin, setFreeShippingMin] = useState(999);
  const [taxRate, setTaxRate] = useState(18);
  const [lowStockAlert, setLowStockAlert] = useState(5);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [orderEmailAlerts, setOrderEmailAlerts] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    }, 600);
  };

  return (
    <div className="admin-tab-content">
      <style>{`
        .admin-tab-content {
          position: relative;
          min-height: 100%;
        }
        .ambient-glow-1 {
          position: absolute;
          top: 30px;
          right: 8%;
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(79, 70, 229, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(55px);
        }
        .ambient-glow-2 {
          position: absolute;
          top: 380px;
          left: 5%;
          width: 340px;
          height: 340px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(236, 72, 153, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(55px);
        }

        .glass-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.45) 100%);
          backdrop-filter: blur(24px) saturate(190%);
          -webkit-backdrop-filter: blur(24px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 20px;
          box-shadow: 
            0 10px 30px -5px rgba(15, 23, 42, 0.05),
            0 2px 6px -1px rgba(15, 23, 42, 0.03),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .glass-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%);
          pointer-events: none;
          z-index: 0;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 900px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }
        }

        .settings-nav-btn {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          width: 100%;
          padding: 0.9rem 1.2rem;
          border-radius: 14px;
          border: 1px solid transparent;
          background: transparent;
          color: #475569;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: left;
        }
        .settings-nav-btn:hover {
          background: rgba(255, 255, 255, 0.7);
          color: #0f172a;
          transform: translateX(3px);
        }
        .settings-nav-btn.active {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(99, 102, 241, 0.06) 100%);
          color: #4f46e5;
          border: 1px solid rgba(79, 70, 229, 0.25);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.08);
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.85);
          border: 1.5px solid rgba(226, 232, 240, 0.9);
          border-radius: 12px;
          padding: 0.8rem 1.1rem;
          width: 100%;
          outline: none;
          font-family: inherit;
          font-size: 0.92rem;
          color: #0f172a;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }
        .glass-input:focus {
          border-color: #4f46e5;
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
        }

        .btn-indigo-save {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          padding: 0.85rem 2rem;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.32), inset 0 1px 1px rgba(255, 255, 255, 0.4);
        }
        .btn-indigo-save:hover:not(:disabled) {
          background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(79, 70, 229, 0.45);
        }
        .btn-indigo-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Modern Toggle Switch */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 26px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #cbd5e1;
          transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 34px;
        }
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input:checked + .toggle-slider {
          background-color: #4f46e5;
        }
        input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }

        .cat-icon-chip {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          border: 1px solid rgba(79, 70, 229, 0.2);
        }

        .toast-banner {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1.25rem;
          background: rgba(16, 185, 129, 0.15);
          color: #047857;
          border: 1px solid rgba(16, 185, 129, 0.35);
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          animation: popToast 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popToast {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '0.5rem', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.25rem 0', fontWeight: '800', letterSpacing: '-0.5px' }}>System Settings</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Configure store metadata, checkout preferences, and administrative security</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#047857', letterSpacing: '0.3px' }}>
            ALL SYSTEMS NORMAL
          </span>
        </div>
      </div>

      <div className="settings-layout">
        {/* Left Navigation Tabs */}
        <div className="glass-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
            <button 
              className={`settings-nav-btn ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <FiGlobe style={{ fontSize: '1.15rem' }} /> Store Details
            </button>
            <button 
              className={`settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <FiShield style={{ fontSize: '1.15rem' }} /> Admin & Security
            </button>
            <button 
              className={`settings-nav-btn ${activeTab === 'checkout' ? 'active' : ''}`}
              onClick={() => setActiveTab('checkout')}
            >
              <FiShoppingBag style={{ fontSize: '1.15rem' }} /> Store & Orders
            </button>
            <button 
              className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <FiBell style={{ fontSize: '1.15rem' }} /> Alerts & Logs
            </button>
          </div>
        </div>

        {/* Right Tab Content */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {isSaved && (
              <div className="toast-banner">
                <FiCheckCircle style={{ fontSize: '1.2rem' }} />
                <span>Settings have been updated and saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSave}>
              {/* TAB 1: General Store Details */}
              {activeTab === 'general' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.8rem' }}>
                    <div className="cat-icon-chip">
                      <FiGlobe />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>Store Information</h3>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>Public branding and regional configuration</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                        Storefront Brand Name
                      </label>
                      <input 
                        type="text" 
                        className="glass-input" 
                        value={storeName} 
                        onChange={e => setStoreName(e.target.value)} 
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                        Customer Support Email
                      </label>
                      <input 
                        type="email" 
                        className="glass-input" 
                        value={supportEmail} 
                        onChange={e => setSupportEmail(e.target.value)} 
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                        Support Helpline Phone
                      </label>
                      <input 
                        type="text" 
                        className="glass-input" 
                        value={supportPhone} 
                        onChange={e => setSupportPhone(e.target.value)} 
                        required 
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                        Physical Dispatch / Warehouse Address
                      </label>
                      <input 
                        type="text" 
                        className="glass-input" 
                        value={storeAddress} 
                        onChange={e => setStoreAddress(e.target.value)} 
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                        Store Currency
                      </label>
                      <select className="glass-input" value={currency} onChange={e => setCurrency(e.target.value)}>
                        <option value="INR">Indian Rupee (₹ INR)</option>
                        <option value="USD">US Dollar ($ USD)</option>
                        <option value="EUR">Euro (€ EUR)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                        Server Timezone
                      </label>
                      <select className="glass-input" value={timezone} onChange={e => setTimezone(e.target.value)}>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Security & Admin Profile */}
              {activeTab === 'security' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.8rem' }}>
                    <div className="cat-icon-chip">
                      <FiShield />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>Admin Profile & Security</h3>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>Credentials and administrative access control</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                        Administrator Name
                      </label>
                      <input 
                        type="text" 
                        className="glass-input" 
                        value={adminName} 
                        onChange={e => setAdminName(e.target.value)} 
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                        Admin Email
                      </label>
                      <input 
                        type="email" 
                        className="glass-input" 
                        value={adminEmail} 
                        onChange={e => setAdminEmail(e.target.value)} 
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                        Current Password
                      </label>
                      <input 
                        type="password" 
                        className="glass-input" 
                        placeholder="••••••••" 
                        value={currentPassword} 
                        onChange={e => setCurrentPassword(e.target.value)} 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                        New Password
                      </label>
                      <input 
                        type="password" 
                        className="glass-input" 
                        placeholder="Leave blank to keep current" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', background: 'rgba(248, 250, 252, 0.7)', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Two-Factor Authentication (2FA)</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Require OTP confirmation on every super-admin login</div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={twoFactorAuth} 
                        onChange={e => setTwoFactorAuth(e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 3: Store & Orders */}
              {activeTab === 'checkout' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.8rem' }}>
                    <div className="cat-icon-chip">
                      <FiShoppingBag />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>Store & Checkout Policies</h3>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>Shipping limits, sales tax, and promo activation</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1.25rem', background: 'rgba(248, 250, 252, 0.7)', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Enable Promotional Vouchers</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Allow shoppers to redeem coupon codes during cart checkout</div>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={enablePromos} 
                          onChange={e => setEnablePromos(e.target.checked)} 
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div style={{ padding: '1.25rem', background: 'rgba(248, 250, 252, 0.7)', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Free Shipping Threshold</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Auto-apply free delivery when order total exceeds minimum</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input 
                          type="number" 
                          className="glass-input" 
                          style={{ width: '120px', padding: '0.5rem 0.8rem' }}
                          value={freeShippingMin} 
                          onChange={e => setFreeShippingMin(Number(e.target.value))} 
                        />
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={enableFreeShipping} 
                            onChange={e => setEnableFreeShipping(e.target.checked)} 
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                          Standard Tax / GST Rate (%)
                        </label>
                        <input 
                          type="number" 
                          className="glass-input" 
                          value={taxRate} 
                          onChange={e => setTaxRate(Number(e.target.value))} 
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                          Low Stock Alert Threshold
                        </label>
                        <input 
                          type="number" 
                          className="glass-input" 
                          value={lowStockAlert} 
                          onChange={e => setLowStockAlert(Number(e.target.value))} 
                        />
                      </div>
                    </div>

                    <div style={{ padding: '1.25rem', background: 'rgba(254, 242, 242, 0.6)', borderRadius: '14px', border: '1px solid rgba(254, 205, 211, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#b91c1c', fontSize: '0.95rem' }}>Maintenance Mode</div>
                        <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>Display a temporary maintenance splash page to non-admin visitors</div>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={maintenanceMode} 
                          onChange={e => setMaintenanceMode(e.target.checked)} 
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Alerts & Notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.8rem' }}>
                    <div className="cat-icon-chip">
                      <FiBell />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>Alerts & Notifications</h3>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>Automated email dispatches and system log alerts</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1.25rem', background: 'rgba(248, 250, 252, 0.7)', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>New Order Email Dispatch</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Send real-time order confirmation emails to customers and warehouse admins</div>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={orderEmailAlerts} 
                          onChange={e => setOrderEmailAlerts(e.target.checked)} 
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div style={{ padding: '1.25rem', background: 'rgba(248, 250, 252, 0.7)', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Low Inventory Push Warnings</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Flag products when available stock drops below the configured alert threshold</div>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          defaultChecked={true} 
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div style={{ borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-indigo-save" disabled={loading}>
                  <FiSave style={{ fontSize: '1.1rem' }} />
                  {loading ? 'Saving Changes...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
