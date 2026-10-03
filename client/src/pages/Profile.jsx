import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSettings, FiHeart, FiPackage, FiLogOut, FiEdit2, FiShield, FiCreditCard } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return (
      <div className="section-pad" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Login Required</h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Please log in to view your profile.</p>
        <Link to="/login" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Sign In</Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
          borderRadius: '12px', textDecoration: 'none', transition: 'all 0.3s ease',
          background: isActive ? 'linear-gradient(135deg, #cc2222, #e53935)' : 'transparent',
          color: isActive ? 'white' : '#475569',
          fontWeight: isActive ? '600' : '500',
          marginBottom: '0.5rem'
        }}
      >
        <Icon style={{ fontSize: '1.2rem', opacity: isActive ? 1 : 0.7 }} />
        {label}
      </Link>
    );
  };

  return (
    <div className="section-pad" style={{ maxWidth: '1200px', margin: '0 auto', minHeight: '80vh', display: 'flex', gap: '2rem' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem 1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', flexGrow: 1 }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #cc2222, #e53935)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800', margin: '0 auto 1rem', boxShadow: '0 8px 15px rgba(204,34,34,0.2)' }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ margin: '0 0 0.3rem 0', color: '#1e293b', fontSize: '1.2rem' }}>{user.name}</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.8rem', borderRadius: '20px' }}>Premium Member</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <NavItem to="/profile" icon={FiUser} label="My Profile" />
            <NavItem to="/orders" icon={FiPackage} label="My Orders" />
            <NavItem to="/wishlist" icon={FiHeart} label="Wishlist" />
            <div style={{ height: '1px', background: '#f1f5f9', margin: '1rem 0' }}></div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderRadius: '12px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'background 0.3s' }} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <FiLogOut style={{ fontSize: '1.2rem' }} /> Sign Out
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            { icon: FiPackage, label: 'Total Orders', value: '12', color: '#3b82f6', bg: '#eff6ff' },
            { icon: FiHeart, label: 'Wishlist Items', value: '5', color: '#ec4899', bg: '#fdf2f8' },
            { icon: FiCreditCard, label: 'Reward Points', value: '450', color: '#f59e0b', bg: '#fffbeb' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                <stat.icon />
              </div>
              <div>
                <p style={{ margin: '0 0 0.3rem 0', color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>{stat.label}</p>
                <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem', fontWeight: '800' }}>{stat.value}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Details Card */}
        <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 0.3rem 0', fontSize: '1.4rem', color: '#1e293b' }}>Personal Information</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Manage your personal details and contact info.</p>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#1e293b', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>
              <FiEdit2 /> Edit
            </button>
          </div>
          
          <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {[
              { label: 'Full Name', value: user.name, icon: FiUser },
              { label: 'Email Address', value: user.email, icon: FiMail },
              { label: 'Phone Number', value: user.phone || 'Not provided', icon: FiPhone },
              { label: 'Shipping Address', value: user.address || 'Not provided', icon: FiMapPin },
            ].map((field, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#f8fafc', color: '#cc2222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                  <field.icon />
                </div>
                <div>
                  <p style={{ margin: '0 0 0.3rem 0', color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>{field.label}</p>
                  <p style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: '600' }}>{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Profile;
