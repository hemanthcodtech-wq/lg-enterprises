import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiHeart, FiPackage, FiLogOut, 
  FiEdit2, FiCreditCard, FiTag, FiCopy, FiShare2, FiUsers, FiTrendingUp, 
  FiCheckCircle, FiClock, FiDollarSign, FiChevronRight, FiGift, FiSearch, FiChevronLeft
} from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Orders from './Orders';
import Wishlist from './Wishlist';

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('/orders')) return 'orders';
    if (location.pathname.includes('/wishlist')) return 'wishlist';
    return 'profile';
  });
  const [referralData, setReferralData] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'UPI', details: '' });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);

  // Commission filtering & pagination state
  const [commSearch, setCommSearch] = useState('');
  const [commStatus, setCommStatus] = useState('All');
  const [commPage, setCommPage] = useState(1);
  const [commPerPage, setCommPerPage] = useState(10);

  useEffect(() => {
    if (location.pathname.includes('/orders')) setActiveTab('orders');
    else if (location.pathname.includes('/wishlist')) setActiveTab('wishlist');
  }, [location]);

  useEffect(() => {
    if (user) {
      fetchReferralStats();
      fetchWithdrawals();
      fetchOrdersCount();
    }
  }, [user]);

  const fetchOrdersCount = async () => {
    try {
      const token = localStorage.getItem('lg_token');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/myorders`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setOrdersCount(data.length);
      }
    } catch (err) {
      console.error('Error fetching orders count:', err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('lg_token');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/withdrawals`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data);
      }
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      setWithdrawLoading(true);
      const token = localStorage.getItem('lg_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          amount: Number(withdrawForm.amount),
          method: withdrawForm.method,
          details: withdrawForm.details
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to request withdrawal');
      
      alert('Withdrawal request submitted successfully!');
      setShowWithdrawModal(false);
      setWithdrawForm({ amount: '', method: 'UPI', details: '' });
      fetchWithdrawals();
      refreshUser(); // Refresh wallet balance
    } catch (err) {
      alert(err.message);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const fetchReferralStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('lg_token');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/referral-stats`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setReferralData(data);
      }
    } catch (err) {
      console.error('Error fetching referral stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const filteredCommissions = useMemo(() => {
    if (!referralData?.recentCommissions) return [];
    return referralData.recentCommissions.filter(c => {
      const matchesSearch = c.buyerName.toLowerCase().includes(commSearch.toLowerCase()) || 
                            (c.orderId && c.orderId.toLowerCase().includes(commSearch.toLowerCase()));
      const matchesStatus = commStatus === 'All' || c.status === commStatus;
      return matchesSearch && matchesStatus;
    });
  }, [referralData, commSearch, commStatus]);

  const currentCommissions = useMemo(() => {
    const start = (commPage - 1) * commPerPage;
    return filteredCommissions.slice(start, start + commPerPage);
  }, [filteredCommissions, commPage, commPerPage]);
  
  const totalCommPages = Math.ceil(filteredCommissions.length / commPerPage);

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

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddress, setEditAddress] = useState(user?.address || '');

  const handleSaveAddress = async () => {
    try {
      const token = localStorage.getItem('lg_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ address: editAddress })
      });
      if (res.ok) {
        setIsEditingAddress(false);
        refreshUser();
      }
    } catch(err) {
      console.error(err);
    }
  };

  const referralLink = user.referralCode 
    ? `${window.location.origin}/register?ref=${user.referralCode}` 
    : '';

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShare = (textToShare) => {
    if (navigator.share) {
      navigator.share({
        title: 'Shop on LG Enterprises & Earn Rewards!',
        text: `Use my referral code ${user.referralCode} to join LG Enterprises and unlock exclusive shopping benefits!`,
        url: textToShare
      }).catch(console.error);
    } else {
      copyToClipboard(textToShare, 'link');
    }
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
          borderRadius: '12px', textDecoration: 'none', transition: 'all 0.3s ease',
          background: isActive && activeTab === 'profile' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'transparent',
          color: isActive && activeTab === 'profile' ? 'white' : '#475569',
          fontWeight: isActive && activeTab === 'profile' ? '600' : '500',
          marginBottom: '0.5rem'
        }}
        onClick={() => setActiveTab('profile')}
      >
        <Icon style={{ fontSize: '1.2rem', opacity: isActive ? 1 : 0.7 }} />
        {label}
      </Link>
    );
  };

  return (
    <div className="section-pad profile-layout" style={{ maxWidth: '1400px', margin: '0 auto', minHeight: '80vh', paddingTop: '2.5rem', position: 'relative', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      
      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a' }}>Withdraw Wallet Funds</h3>
            <form onSubmit={handleWithdraw}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Amount (₹)</label>
                <input 
                  type="number" 
                  max={user.walletBalance}
                  required 
                  value={withdrawForm.amount}
                  onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                  placeholder={`Max: ₹${user.walletBalance?.toFixed(2)}`}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Payout Method</label>
                <select 
                  value={withdrawForm.method}
                  onChange={e => setWithdrawForm({ ...withdrawForm, method: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="UPI">UPI Transfer</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
                  {withdrawForm.method === 'UPI' ? 'UPI ID' : 'Bank Account Details'}
                </label>
                <textarea 
                  required
                  value={withdrawForm.details}
                  onChange={e => setWithdrawForm({ ...withdrawForm, details: e.target.value })}
                  rows="3"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none' }}
                  placeholder={withdrawForm.method === 'UPI' ? 'e.g., 9876543210@ybl' : 'Acct No: ..., IFSC: ..., Name: ...'}
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowWithdrawModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={withdrawLoading} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 600, cursor: withdrawLoading ? 'not-allowed' : 'pointer' }}>
                  {withdrawLoading ? 'Processing...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Sidebar Navigation */}
      <div className="profile-sidebar" style={{ position: 'sticky', top: '100px', flex: '0 0 280px' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem 1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800', margin: '0 auto 1rem', boxShadow: '0 8px 15px rgba(79,70,229,0.25)' }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ margin: '0 0 0.3rem 0', color: '#1e293b', fontSize: '1.2rem' }}>{user.name}</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.8rem', borderRadius: '20px' }}>Member</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
                borderRadius: '12px', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s ease',
                background: activeTab === 'profile' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'transparent',
                color: activeTab === 'profile' ? 'white' : '#475569',
                fontWeight: activeTab === 'profile' ? '600' : '500',
                marginBottom: '0.5rem'
              }}
            >
              <FiUser style={{ fontSize: '1.2rem' }} /> My Profile
            </button>

            <button 
              onClick={() => setActiveTab('referrals')}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
                borderRadius: '12px', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s ease',
                background: activeTab === 'referrals' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'transparent',
                color: activeTab === 'referrals' ? 'white' : '#475569',
                fontWeight: activeTab === 'referrals' ? '600' : '500',
                marginBottom: '0.5rem',
                position: 'relative'
              }}
            >
              <FiGift style={{ fontSize: '1.2rem', flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>5-Tier Referrals</span>
              <span style={{ whiteSpace: 'nowrap', marginLeft: 'auto', background: activeTab === 'referrals' ? '#fff' : '#e0e7ff', color: '#4f46e5', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', flexShrink: 0 }}>
                5% - 1%
              </span>
            </button>

            <button 
              onClick={() => { setActiveTab('orders'); navigate('/orders'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
                borderRadius: '12px', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s ease',
                background: activeTab === 'orders' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'transparent',
                color: activeTab === 'orders' ? 'white' : '#475569',
                fontWeight: activeTab === 'orders' ? '600' : '500',
                marginBottom: '0.5rem'
              }}
            >
              <FiPackage style={{ fontSize: '1.2rem', opacity: activeTab === 'orders' ? 1 : 0.7 }} /> My Orders
            </button>
            <button 
              onClick={() => { setActiveTab('wishlist'); navigate('/wishlist'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
                borderRadius: '12px', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s ease',
                background: activeTab === 'wishlist' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'transparent',
                color: activeTab === 'wishlist' ? 'white' : '#475569',
                fontWeight: activeTab === 'wishlist' ? '600' : '500',
                marginBottom: '0.5rem'
              }}
            >
              <FiHeart style={{ fontSize: '1.2rem', opacity: activeTab === 'wishlist' ? 1 : 0.7 }} /> Wishlist
            </button>
            <div style={{ height: '1px', background: '#f1f5f9', margin: '1rem 0' }}></div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderRadius: '12px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'background 0.3s' }} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <FiLogOut style={{ fontSize: '1.2rem' }} /> Sign Out
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="profile-main" style={{ flex: 1, minWidth: 0 }}>
        {activeTab === 'orders' && <Orders />}
        {activeTab === 'wishlist' && <Wishlist />}
        
        {activeTab === 'profile' && (
          <>
            {/* Top Wallet & Summary Banner */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
          borderRadius: '24px', 
          padding: '2rem', 
          color: 'white', 
          marginBottom: '2rem', 
          boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Active Wallet Balance</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#38bdf8' }}>₹{(user.walletBalance || 0).toFixed(2)}</span>
            </div>
            <div style={{ fontSize: '0.95rem', color: '#e2e8f0', marginTop: '4px', fontWeight: 500 }}>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>₹{(user.pendingWalletBalance || 0).toFixed(2)}</span> Pending (Awaiting Delivery)
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
              Instant credit from 5-level referral commissions. 100% redeemable on any order!
            </p>
          </div>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Total Referral Earnings</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80' }}>
                ₹{((referralData?.totalCommissionEarned || user.totalReferralEarnings || 0)).toFixed(2)}
              </span>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
              {referralData?.levelCounts?.totalDownline || 0} shoppers across your 5-tier network
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <Link to="/cart" className="btn-primary" style={{ padding: '0.75rem 1.2rem', textAlign: 'center', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
              Shop With Wallet
            </Link>
            <button 
              onClick={() => setShowWithdrawModal(true)}
              style={{ padding: '0.75rem 1.2rem', textAlign: 'center', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, background: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Withdraw to Bank/UPI
            </button>
            <button 
              onClick={() => setActiveTab('referrals')}
              style={{ padding: '0.75rem 1.2rem', textAlign: 'center', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
            >
              View 5-Tier Network
            </button>
          </div>
        </div>

        {/* TAB 1: Profile Details */}
            {/* Quick Stats Grid */}
            <div className="profile-stats-grid" style={{ marginBottom: '2rem' }}>
              {[
                { icon: FiPackage, label: 'My Orders', value: ordersCount, color: '#3b82f6', bg: '#eff6ff' },
                { icon: FiUsers, label: 'Direct Referrals (L1)', value: referralData?.levelCounts?.level1 || 0, color: '#10b981', bg: '#dcfce7' },
                { icon: FiTrendingUp, label: 'Total Network Size', value: referralData?.levelCounts?.totalDownline || 0, color: '#8b5cf6', bg: '#f5f3ff' },
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
            <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', overflow: 'hidden', marginBottom: '2rem' }}>
              <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.3rem 0', fontSize: '1.4rem', color: '#1e293b' }}>Personal Information</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Account details and referral credentials.</p>
                </div>
              </div>
              
              <div className="profile-details-grid" style={{ padding: '2rem' }}>
                {[
                  { label: 'Full Name', value: user.name, icon: FiUser },
                  { label: 'Email Address', value: user.email, icon: FiMail },
                  { label: 'Phone Number', value: user.phone || 'Not provided', icon: FiPhone },
                  { label: 'Saved Address', value: user.address || 'No address saved yet', icon: FiMapPin, isAddress: true },
                  { label: 'My Unique Referral Code', value: user.referralCode || 'N/A', icon: FiTag, isCode: true },
                  { label: 'My Shareable Link', value: referralLink || 'N/A', icon: FiShare2, isLink: true },
                ].map((field, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#f8fafc', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      <field.icon />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ margin: '0 0 0.3rem 0', color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>{field.label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {field.isAddress && isEditingAddress ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                            <textarea
                              value={editAddress}
                              onChange={e => setEditAddress(e.target.value)}
                              rows="3"
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none' }}
                              placeholder="Street, City, State, ZIP..."
                            ></textarea>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => setIsEditingAddress(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                              <button onClick={handleSaveAddress} style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                            </div>
                          </div>
                        ) : (
                          <p style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {field.value}
                          </p>
                        )}
                        {field.isAddress && !isEditingAddress && (
                          <button 
                            onClick={() => setIsEditingAddress(true)} 
                            style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FiEdit2 /> Edit
                          </button>
                        )}
                        {field.isCode && user.referralCode && (
                          <button 
                            onClick={() => copyToClipboard(user.referralCode, 'code')} 
                            style={{ background: copiedCode ? '#dcfce7' : '#eff6ff', color: copiedCode ? '#16a34a' : '#2563eb', border: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FiCopy /> {copiedCode ? 'Copied!' : 'Copy Code'}
                          </button>
                        )}
                        {field.isLink && referralLink && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => copyToClipboard(referralLink, 'link')} 
                              style={{ background: copiedLink ? '#dcfce7' : '#eff6ff', color: copiedLink ? '#16a34a' : '#2563eb', border: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FiCopy /> {copiedLink ? 'Copied!' : 'Copy Link'}
                            </button>
                            <button 
                              onClick={() => handleShare(referralLink)} 
                              style={{ background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FiShare2 /> Share
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Dedicated 5-Tier Referral System Hub */}
        {activeTab === 'referrals' && (
          <div>
            {/* Share Card */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.4rem 0', fontSize: '1.4rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiGift style={{ color: '#4f46e5' }} /> 5-Tier Affiliate & Referral Program
                  </h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                    Share your code or link with friends. When they buy electronics, furniture, or groceries, you receive commissions across 5 levels directly to your wallet!
                  </p>
                </div>
                <Link to="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4f46e5', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                  Learn how 5-tier works <FiChevronRight />
                </Link>
              </div>

              {/* Referral Code Share Box */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', border: '1px dashed #cbd5e1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Your Referral Code</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '2px', background: 'white', padding: '4px 16px', borderRadius: '10px', border: '1px solid #c7d2fe' }}>
                      {user.referralCode || 'Generating...'}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(user.referralCode, 'code')}
                      style={{ background: copiedCode ? '#16a34a' : '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' }}
                    >
                      <FiCopy /> {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>1-Click Invitation Link</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <input 
                      readOnly 
                      value={referralLink} 
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.85rem', color: '#334155' }}
                    />
                    <button 
                      onClick={() => handleShare(referralLink)}
                      style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                    >
                      <FiShare2 /> Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Tier Level Cards */}
            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiTrendingUp style={{ color: '#4f46e5' }} /> Your 5-Tier Network Breakdown
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              {(referralData?.tiers || [
                { level: 1, rate: 5.0, count: 0, earned: 0, description: 'Direct Referrals' },
                { level: 2, rate: 2.5, count: 0, earned: 0, description: '2nd-Gen Referrals' },
                { level: 3, rate: 2.0, count: 0, earned: 0, description: '3rd-Gen Referrals' },
                { level: 4, rate: 1.5, count: 0, earned: 0, description: '4th-Gen Referrals' },
                { level: 5, rate: 1.0, count: 0, earned: 0, description: '5th-Gen Referrals' },
              ]).map((tier, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    padding: '1.2rem', 
                    border: '1px solid #f1f5f9', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: idx === 0 ? '#4f46e5' : idx === 1 ? '#6366f1' : idx === 2 ? '#0284c7' : idx === 3 ? '#059669' : '#d97706' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>Level {tier.level}</span>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: '8px' }}>
                      {tier.rate}%
                    </span>
                  </div>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: '#64748b' }}>{tier.description}</p>
                  
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b' }}>Members:</span>
                      <strong style={{ color: '#0f172a' }}>{tier.count || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b' }}>Earned:</span>
                      <strong style={{ color: '#16a34a' }}>₹{(tier.earned || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Referrals (Customers) List */}
            {referralData?.directReferrals && referralData.directReferrals.length > 0 && (
              <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1.3rem', color: '#1e293b' }}>My Direct Referrals (L1)</h3>
                <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.85rem' }}>Users who joined directly using your referral link.</p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 16px' }}>Name</th>
                        <th style={{ padding: '12px 16px' }}>Email</th>
                        <th style={{ padding: '12px 16px' }}>Joined Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralData.directReferrals.map((ref, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{ref.name}</td>
                          <td style={{ padding: '14px 16px', color: '#64748b' }}>{ref.email}</td>
                          <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>
                            {ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : (ref._id ? new Date(parseInt(ref._id.substring(0, 8), 16) * 1000).toLocaleDateString() : 'N/A')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Commission Transactions */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1.3rem', color: '#1e293b' }}>Recent Referral Commissions</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Real-time audit log of wallet credits from downline purchases.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                  {/* Search Bar */}
                  <div style={{ position: 'relative', minWidth: '300px', flex: 1 }}>
                    <FiSearch style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search shopper or order..."
                      value={commSearch}
                      onChange={(e) => { setCommSearch(e.target.value); setCommPage(1); }}
                      style={{
                        padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                        width: '100%', outline: 'none', fontSize: '0.9rem', color: '#1e293b'
                      }}
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <select
                    value={commStatus}
                    onChange={(e) => { setCommStatus(e.target.value); setCommPage(1); }}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                      outline: 'none', background: 'white', color: '#1e293b', fontSize: '0.9rem', cursor: 'pointer'
                    }}
                  >
                    <option value="All">All Status</option>
                    <option value="Credited">Credited</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <button onClick={fetchReferralStats} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', fontSize: '0.9rem', color: '#475569', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiClock /> Refresh
                  </button>
                </div>
              </div>

              {filteredCommissions.length > 0 ? (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '12px 8px' }}>Shopper</th>
                          <th style={{ padding: '12px 8px' }}>Order ID</th>
                          <th style={{ padding: '12px 8px' }}>Tier Level</th>
                          <th style={{ padding: '12px 8px' }}>Commission Rate</th>
                          <th style={{ padding: '12px 8px' }}>Order Amount</th>
                          <th style={{ padding: '12px 8px' }}>Wallet Credit</th>
                          <th style={{ padding: '12px 8px' }}>Status</th>
                          <th style={{ padding: '12px 8px' }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentCommissions.map((comm, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                            <td style={{ padding: '14px 8px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{comm.buyerName}</td>
                            <td style={{ padding: '14px 8px', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              {comm.orderId ? comm.orderId.substring(comm.orderId.length - 8) : 'N/A'}
                            </td>
                            <td style={{ padding: '14px 8px', whiteSpace: 'nowrap' }}>
                              <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-block' }}>
                                Level {comm.level}
                              </span>
                            </td>
                            <td style={{ padding: '14px 8px', fontWeight: 700, color: '#4f46e5', whiteSpace: 'nowrap' }}>{comm.percent}%</td>
                            <td style={{ padding: '14px 8px', color: '#64748b', whiteSpace: 'nowrap' }}>₹{comm.orderTotal}</td>
                            <td style={{ padding: '14px 8px', fontWeight: 800, color: '#16a34a', whiteSpace: 'nowrap' }}>+₹{comm.amount.toFixed(2)}</td>
                            <td style={{ padding: '14px 8px', whiteSpace: 'nowrap' }}>
                              {comm.status === 'Credited' && <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-block' }}>Credited</span>}
                              {comm.status === 'Pending' && <span style={{ background: '#fef9c3', color: '#854d0e', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-block' }}>Pending</span>}
                              {comm.status === 'Cancelled' && <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-block' }}>Cancelled</span>}
                            </td>
                            <td style={{ padding: '14px 8px', color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              {new Date(comm.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Showing {((commPage - 1) * commPerPage) + 1} to {Math.min(commPage * commPerPage, filteredCommissions.length)} of {filteredCommissions.length} commissions
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        disabled={commPage === 1}
                        onClick={() => setCommPage(p => p - 1)}
                        style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: commPage === 1 ? '#f8fafc' : 'white', borderRadius: '6px', cursor: commPage === 1 ? 'not-allowed' : 'pointer', color: commPage === 1 ? '#94a3b8' : '#1e293b' }}
                      >
                        <FiChevronLeft />
                      </button>
                      <span style={{ padding: '6px 12px', border: '1px solid #4f46e5', background: '#eef2ff', color: '#4f46e5', borderRadius: '6px', fontWeight: 600 }}>
                        {commPage}
                      </span>
                      <button
                        disabled={commPage >= totalCommPages}
                        onClick={() => setCommPage(p => p + 1)}
                        style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: commPage >= totalCommPages ? '#f8fafc' : 'white', borderRadius: '6px', cursor: commPage >= totalCommPages ? 'not-allowed' : 'pointer', color: commPage >= totalCommPages ? '#94a3b8' : '#1e293b' }}
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  <FiClock style={{ fontSize: '2.5rem', marginBottom: '0.8rem', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    {commSearch || commStatus !== 'All' 
                      ? 'No commissions match your filters.' 
                      : 'No commissions earned yet.'}
                  </p>
                  {!commSearch && commStatus === 'All' && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem' }}>
                      Share your referral code <strong>{user.referralCode}</strong> with friends. When they buy electronics, furniture or groceries, you'll see instant wallet credits here!
                    </p>
                  )}
                </div>
              )}
            </div>
            {/* Withdrawal Requests History */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1.3rem', color: '#1e293b' }}>Withdrawal Requests</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Track your payouts to Bank or UPI.</p>
                </div>
                <button onClick={fetchWithdrawals} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '6px 14px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
                  Refresh
                </button>
              </div>

              {withdrawals.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 16px' }}>Date</th>
                        <th style={{ padding: '12px 16px' }}>Amount</th>
                        <th style={{ padding: '12px 16px' }}>Method</th>
                        <th style={{ padding: '12px 16px' }}>Details</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px' }}>Admin Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '14px 16px', color: '#64748b' }}>{new Date(w.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>₹{w.amount.toFixed(2)}</td>
                          <td style={{ padding: '14px 16px' }}><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{w.method}</span></td>
                          <td style={{ padding: '14px 16px', color: '#64748b', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.details}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ 
                              background: w.status === 'Approved' ? '#dcfce7' : w.status === 'Rejected' ? '#fee2e2' : '#fef9c3', 
                              color: w.status === 'Approved' ? '#16a34a' : w.status === 'Rejected' ? '#ef4444' : '#ca8a04', 
                              padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 
                            }}>
                              {w.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.85rem' }}>{w.adminNote || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>No withdrawal requests found.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
