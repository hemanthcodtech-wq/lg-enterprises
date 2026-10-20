import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FiGift, FiCheckCircle, FiClock, FiPackage,
  FiShoppingBag, FiArrowRight, FiInfo, FiMapPin,
  FiAward, FiStar, FiLock, FiChevronRight, FiEdit2,
  FiCheck, FiX, FiTrendingUp, FiShield, FiTruck
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ReturnGifts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingClaim, setEditingClaim] = useState(null);
  const [addressForm, setAddressForm] = useState({ name: '', phone: '', address: '' });
  const [savingAddress, setSavingAddress] = useState(false);

  // Helper to format titles cleanly (Title Case & replace legacy "Return Gift" text)
  const formatCampaignTitle = (title) => {
    if (!title) return 'Exclusive Gift Offer';
    const sanitized = title
      .replace(/return gift/gi, 'Gift Offer')
      .replace(/return gifts/gi, 'Gift Offers');
    return sanitized.replace(/\b\w/g, l => l.toUpperCase());
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('lg_token');

      // Public active campaigns
      const publicRes = await axios.get(`${import.meta.env.VITE_API_URL}/return-gifts/active`);
      setActiveCampaigns(publicRes.data);

      // If user logged in, fetch personalized progress
      if (token) {
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/return-gifts/my-progress`, {
          headers: { 'x-auth-token': token }
        });
        setProgressData(userRes.data);
      }
    } catch (err) {
      console.error('Error fetching gift offers data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Open edit address modal
  const handleOpenAddressModal = (claim) => {
    setEditingClaim(claim);
    setAddressForm({
      name: claim.shippingAddress?.name || user?.name || '',
      phone: claim.shippingAddress?.phone || user?.phone || '',
      address: claim.shippingAddress?.address || user?.address || ''
    });
    setShowAddressModal(true);
  };

  // Submit address update
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!editingClaim?._id) return;
    try {
      setSavingAddress(true);
      const token = localStorage.getItem('lg_token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/return-gifts/my-claims/${editingClaim._id}/address`,
        addressForm,
        { headers: { 'x-auth-token': token } }
      );
      toast.success('Delivery address updated successfully');
      setShowAddressModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update address');
    } finally {
      setSavingAddress(false);
    }
  };

  // Calculate countdown time string
  const getRemainingTime = (endDateStr) => {
    const total = Date.parse(endDateStr) - Date.parse(new Date());
    if (total <= 0) return 'Campaign ended';
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((total / 1000 / 60) % 60);
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h ${mins}m left`;
  };

  return (
    <div className="gift-offers-page">
      <style>{`
        .gift-offers-page {
          background-color: #f8fafc;
          min-height: 90vh;
          padding-bottom: 5rem;
          font-family: inherit;
        }

        /* ─── Hero Section ────────────────────────────── */
        .go-hero {
          background: radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.28) 0%, transparent 45%),
                      radial-gradient(circle at 85% 15%, rgba(245, 158, 11, 0.22) 0%, transparent 40%),
                      linear-gradient(135deg, #090d16 0%, #11142e 50%, #1e1b4b 100%);
          color: white;
          padding: 4rem 1.5rem 6.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .go-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.35);
          padding: 0.45rem 1.25rem;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
          letter-spacing: 0.5px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.15);
        }
        .go-hero-title {
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 800;
          margin: 0 0 1rem 0;
          letter-spacing: -0.03em;
          line-height: 1.15;
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .go-hero-desc {
          max-width: 680px;
          margin: 0 auto;
          font-size: clamp(0.95rem, 2vw, 1.1rem);
          color: #cbd5e1;
          line-height: 1.6;
          font-weight: 400;
        }

        /* ─── Content Wrapper ─────────────────────────── */
        .go-content-wrapper {
          max-width: 1200px;
          margin: -4rem auto 0;
          padding: 0 1.25rem;
          position: relative;
          z-index: 10;
        }

        /* ─── Modern Card Container ──────────────────── */
        .go-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.1), 0 8px 16px -4px rgba(15, 23, 42, 0.04);
          overflow: hidden;
          margin-bottom: 2.5rem;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .go-card:hover {
          box-shadow: 0 25px 55px -10px rgba(15, 23, 42, 0.14), 0 10px 20px -4px rgba(15, 23, 42, 0.05);
        }

        /* Card Top Header - High Contrast Light Gradient */
        .go-card-header {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-bottom: 1px solid #e2e8f0;
          padding: 1.35rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          position: relative;
        }
        .go-card-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #4f46e5 0%, #06b6d4 50%, #10b981 100%);
        }

        .go-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          display: inline-block;
          box-shadow: 0 0 0 rgba(16, 185, 129, 0.7);
          animation: goPulse 2s infinite;
        }
        @keyframes goPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .go-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .go-timer-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .go-card-title {
          margin: 0.25rem 0 0 0;
          font-size: clamp(1.3rem, 2.5vw, 1.7rem);
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .go-milestone-box {
          text-align: right;
          background: #ffffff;
          padding: 0.6rem 1.15rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .go-milestone-label {
          font-size: 0.72rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .go-milestone-val {
          font-size: 1.5rem;
          font-weight: 800;
          color: #d97706;
          letter-spacing: -0.02em;
        }

        /* ─── 2-Column Responsive Body ───────────────── */
        .go-card-body {
          padding: 2.25rem;
        }
        .go-grid-layout {
          display: grid;
          grid-template-columns: 1.18fr 0.82fr;
          gap: 2.25rem;
          align-items: stretch;
        }

        /* Left Column: Progress & Status */
        .go-progress-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 1.75rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .go-spend-stat {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }
        .go-spend-title {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 800;
          color: #4f46e5;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .go-spend-amount {
          font-size: clamp(1.8rem, 3.5vw, 2.5rem);
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
          margin-top: 4px;
          letter-spacing: -0.03em;
        }
        .go-spend-target {
          font-size: clamp(0.95rem, 1.8vw, 1.2rem);
          color: #64748b;
          font-weight: 500;
          letter-spacing: 0;
        }

        /* Progress Bar with sheen */
        .go-bar-track {
          width: 100%;
          height: 16px;
          background: #e2e8f0;
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        .go-bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .go-bar-fill.completed {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          box-shadow: 0 0 14px rgba(16, 185, 129, 0.45);
        }
        .go-bar-fill.progressing {
          background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%);
          box-shadow: 0 0 14px rgba(79, 70, 229, 0.35);
        }

        .go-bar-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          color: #64748b;
          font-weight: 600;
          margin-top: 0.5rem;
          margin-bottom: 1.5rem;
        }

        /* Unlocked Celebration Banner */
        .go-celebration-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1.5px solid #86efac;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.08);
        }
        .go-celebration-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #10b981;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.35rem;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
        }
        .go-dispatch-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .go-dispatch-pill.pending {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        .go-dispatch-pill.dispatched {
          background: #e0f2fe;
          color: #0369a1;
          border: 1px solid #bae6fd;
        }
        .go-dispatch-pill.delivered {
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #86efac;
        }

        /* Delivery Destination Box */
        .go-address-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.15rem 1.35rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .go-btn-edit-addr {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #4f46e5;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s ease;
        }
        .go-btn-edit-addr:hover {
          background: #eef2ff;
          border-color: #a5b4fc;
        }

        /* Contributing Orders Breakdown */
        .go-orders-section {
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid #f1f5f9;
        }
        .go-order-chip {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.45rem 0.85rem;
          font-size: 0.78rem;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .go-order-chip:hover {
          background: #ffffff;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        /* Right Column: Featured Gift Showcase Spotlight */
        .go-gift-showcase {
          background: linear-gradient(145deg, #ffffff 0%, #faf5ff 100%);
          border-radius: 20px;
          border: 1px solid #e9d5ff;
          padding: 2rem 1.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          box-shadow: 0 6px 20px rgba(147, 51, 234, 0.04);
        }
        .go-gift-image-wrap {
          width: 100%;
          max-width: 320px;
          height: 250px;
          border-radius: 16px;
          overflow: hidden;
          background: radial-gradient(circle at center, #ffffff 0%, #f3e8ff 100%);
          border: 1px solid #e9d5ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          position: relative;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }
        .go-gift-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .go-gift-image-wrap:hover img {
          transform: scale(1.06);
        }
        .go-free-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 9999px;
          letter-spacing: 0.3px;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
        }

        .go-feature-tag-list {
          display: flex;
          justify-content: center;
          gap: 0.6rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        .go-feature-tag {
          background: #ffffff;
          color: #475569;
          border: 1px solid #e2e8f0;
          padding: 5px 12px;
          border-radius: 9999px;
          font-size: 0.76rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        /* ─── How It Works Grid ──────────────────────── */
        .go-how-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .go-how-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 1.75rem;
          border: 1px solid #e2e8f0;
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .go-how-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
        }
        .go-how-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;
        }

        /* ─── Responsive Media Queries ───────────────── */
        @media (max-width: 960px) {
          .go-grid-layout {
            grid-template-columns: 1fr;
            gap: 1.75rem;
          }
          .go-card-body {
            padding: 1.5rem;
          }
          .go-card-header {
            padding: 1.25rem 1.5rem;
          }
        }

        @media (max-width: 640px) {
          .go-hero {
            padding: 2.75rem 1rem 5rem;
          }
          .go-content-wrapper {
            margin-top: -3rem;
            padding: 0 0.85rem;
          }
          .go-card {
            border-radius: 18px;
            margin-bottom: 1.75rem;
          }
          .go-card-header {
            padding: 1rem 1.2rem;
            flex-direction: column;
            align-items: flex-start;
          }
          .go-milestone-box {
            text-align: left;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-sizing: border-box;
          }
          .go-card-body {
            padding: 1.2rem;
          }
          .go-progress-card, .go-gift-showcase {
            padding: 1.25rem;
          }
          .go-spend-stat {
            flex-direction: column;
            align-items: flex-start;
          }
          .go-address-box {
            flex-direction: column;
            align-items: flex-start;
          }
          .go-btn-edit-addr {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {/* ─── HERO BANNER ────────────────────────────────────────────── */}
      <div className="go-hero">
        <div className="go-hero-badge">
          <FiGift /> 100% FREE MILESTONE GIFT OFFERS
        </div>
        <h1 className="go-hero-title">
          Live Gift Offers &amp; Shopping Rewards
        </h1>
        <p className="go-hero-desc">
          Shop electronics, appliances, furniture, and groceries. When your cumulative orders reach the target milestone within the event window, unlock complimentary premium gifts dispatched straight to your home with free delivery!
        </p>
      </div>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────── */}
      <div className="go-content-wrapper">
        {loading ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', color: '#64748b', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '42px', height: '42px', border: '3.5px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#334155' }}>Loading active gift offers...</div>
          </div>
        ) : user && progressData.length > 0 ? (
          /* ─── LOGGED IN USER MILESTONE CARDS ──────────────────────── */
          <div>
            {progressData.map((item, idx) => {
              const camp = item.campaign;
              const isQualified = item.isQualified;
              const claim = item.claim;
              const status = claim?.status || (isQualified ? 'Pending Dispatch' : 'In Progress');
              const displayTitle = formatCampaignTitle(camp.title);

              return (
                <div key={idx} className="go-card">
                  {/* Card Header */}
                  <div className="go-card-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span className="go-status-pill">
                          <span className="go-pulse-dot"></span> LIVE EVENT
                        </span>
                        <span className="go-timer-pill">
                          <FiClock /> {getRemainingTime(camp.endDate)}
                        </span>
                      </div>
                      <h2 className="go-card-title">{displayTitle}</h2>
                    </div>

                    <div className="go-milestone-box">
                      <div className="go-milestone-label">Target Milestone</div>
                      <div className="go-milestone-val">
                        ₹{camp.targetAmount?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Balanced Body */}
                  <div className="go-card-body">
                    <div className="go-grid-layout">
                      {/* Left: Spend Progress & Unlock Box */}
                      <div className="go-progress-card">
                        <div>
                          {/* Spend Stat Header */}
                          <div className="go-spend-stat">
                            <div>
                              <div className="go-spend-title">
                                <FiTrendingUp /> Cumulative Spend In Campaign
                              </div>
                              <div className="go-spend-amount">
                                ₹{item.totalPurchased?.toLocaleString('en-IN')}{' '}
                                <span className="go-spend-target">
                                  / ₹{item.targetAmount?.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>

                            {/* Qualification Status Chip */}
                            <div>
                              {isQualified ? (
                                <div style={{ background: '#dcfce7', color: '#15803d', border: '1.5px solid #86efac', padding: '0.5rem 1.15rem', borderRadius: '9999px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem', boxShadow: '0 2px 8px rgba(34,197,94,0.15)' }}>
                                  <FiCheckCircle style={{ fontSize: '1.2rem' }} /> Milestone Achieved!
                                </div>
                              ) : (
                                <div style={{ background: '#eef2ff', color: '#4f46e5', border: '1.5px solid #c7d2fe', padding: '0.5rem 1.15rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.88rem' }}>
                                  ₹{item.remainingAmount?.toLocaleString('en-IN')} more to unlock
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="go-bar-track">
                            <div
                              className={`go-bar-fill ${isQualified ? 'completed' : 'progressing'}`}
                              style={{ width: `${item.progressPercentage}%` }}
                            />
                          </div>

                          <div className="go-bar-meta">
                            <span>Progress: <strong>{item.progressPercentage}%</strong></span>
                            <span>
                              {isQualified ? '🎉 Goal Completed!' : `Only ₹${item.remainingAmount?.toLocaleString('en-IN')} needed`}
                            </span>
                          </div>

                          {/* UNLOCKED: Celebratory Banner & Dispatch Status */}
                          {isQualified ? (
                            <div>
                              <div className="go-celebration-card">
                                <div className="go-celebration-icon">
                                  <FiAward />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '4px' }}>
                                    <h4 style={{ margin: 0, color: '#065f46', fontSize: '1.05rem', fontWeight: 800 }}>
                                      Gift Offer Unlocked!
                                    </h4>
                                    {status === 'Delivered' && (
                                      <span className="go-dispatch-pill delivered">
                                        <FiCheckCircle /> Delivered to Doorstep
                                      </span>
                                    )}
                                    {status === 'Dispatched' && (
                                      <span className="go-dispatch-pill dispatched">
                                        <FiPackage /> Dispatched {claim?.dispatchDetails?.dispatchedAt ? `on ${new Date(claim.dispatchDetails.dispatchedAt).toLocaleDateString()}` : ''}
                                      </span>
                                    )}
                                    {status === 'Pending Dispatch' && (
                                      <span className="go-dispatch-pill pending">
                                        <FiClock /> Preparing for Dispatch
                                      </span>
                                    )}
                                  </div>
                                  <p style={{ margin: 0, color: '#047857', fontSize: '0.86rem', lineHeight: 1.5 }}>
                                    {status === 'Delivered'
                                      ? 'Your complimentary gift offer has been delivered! We hope you love it.'
                                      : status === 'Dispatched'
                                      ? 'Your gift offer has been dispatched and is on its way directly to your home.'
                                      : 'Congratulations! Our dispatch team is preparing your complimentary gift for shipment.'}
                                  </p>
                                </div>
                              </div>

                              {/* Destination Address Card */}
                              <div className="go-address-box">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                                    <FiMapPin />
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Destination:</div>
                                    <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 700, marginTop: '1px' }}>
                                      {claim?.shippingAddress?.address || user?.address || 'Address registered on profile'}
                                    </div>
                                  </div>
                                </div>

                                {status === 'Pending Dispatch' && claim && (
                                  <button
                                    onClick={() => handleOpenAddressModal(claim)}
                                    className="go-btn-edit-addr"
                                  >
                                    <FiEdit2 /> Update Address
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* IN PROGRESS: Motivation Card & CTA */
                            <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                              <p style={{ margin: '0 0 1.15rem 0', fontSize: '0.92rem', color: '#334155', lineHeight: 1.55 }}>
                                You are only <strong>₹{item.remainingAmount?.toLocaleString('en-IN')}</strong> away from receiving a complimentary <strong>{camp.giftTitle}</strong>!
                              </p>
                              <Link
                                to="/products"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.8rem 1.75rem',
                                  borderRadius: '12px',
                                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                  color: 'white',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  fontSize: '0.92rem',
                                  boxShadow: '0 6px 16px rgba(79, 70, 229, 0.28)',
                                  transition: 'transform 0.2s ease'
                                }}
                              >
                                <FiShoppingBag /> Shop Products &amp; Qualify <FiArrowRight />
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Contributing Orders Breakdown */}
                        {item.qualifyingOrders?.length > 0 && (
                          <div className="go-orders-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>
                                Contributing Orders in this Window ({item.qualifyingOrders.length})
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Cumulative total</span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {item.qualifyingOrders.map((ord, oIdx) => (
                                <div key={oIdx} className="go-order-chip">
                                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#4f46e5' }}>
                                    #{ord._id?.slice(-6).toUpperCase()}
                                  </span>
                                  <span style={{ fontWeight: 800, color: '#0f172a' }}>
                                    ₹{ord.totalAmount?.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Featured Gift Showcase Spotlight */}
                      <div className="go-gift-showcase">
                        <div className="go-gift-image-wrap">
                          <img
                            src={camp.giftImage}
                            alt={camp.giftTitle}
                          />
                          {camp.giftValue > 0 && (
                            <div className="go-free-badge">
                              Worth ₹{camp.giftValue.toLocaleString('en-IN')} FREE
                            </div>
                          )}
                        </div>

                        <div style={{ width: '100%' }}>
                          <span style={{ fontSize: '0.76rem', color: '#7c3aed', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                            OFFICIAL REWARD SPOTLIGHT
                          </span>
                          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0.4rem 0 0.5rem 0', color: '#0f172a', letterSpacing: '-0.02em' }}>
                            {camp.giftTitle}
                          </h3>
                          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.55, margin: '0 0 1.25rem 0' }}>
                            {camp.giftDescription || camp.description}
                          </p>

                          <div className="go-feature-tag-list">
                            <span className="go-feature-tag">
                              <FiTruck style={{ color: '#4f46e5' }} /> Free Doorstep Delivery
                            </span>
                            <span className="go-feature-tag">
                              <FiGift style={{ color: '#d97706' }} /> 100% Free Reward
                            </span>
                            <span className="go-feature-tag">
                              <FiShield style={{ color: '#10b981' }} /> Zero Hidden Fees
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── PUBLIC VIEW (NOT LOGGED IN OR NO PROGRESS DATA) ─────── */
          <div>
            {activeCampaigns.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '24px', padding: '4.5rem 2rem', textAlign: 'center', border: '2px dashed #cbd5e1' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.25rem auto' }}>
                  <FiGift />
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: 800 }}>New Gift Offers Coming Soon!</h3>
                <p style={{ color: '#64748b', fontSize: '0.98rem', margin: 0, maxWidth: '480px', marginInline: 'auto', lineHeight: 1.6 }}>
                  Stay tuned for our upcoming milestone shopping events where qualifying purchases unlock complimentary gifts!
                </p>
              </div>
            ) : (
              activeCampaigns.map((camp, idx) => {
                const displayTitle = formatCampaignTitle(camp.title);
                return (
                  <div key={idx} className="go-card">
                    {/* Header */}
                    <div className="go-card-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '6px' }}>
                          <span className="go-status-pill">
                            <span className="go-pulse-dot"></span> LIMITED PERIOD EVENT
                          </span>
                          <span className="go-timer-pill">
                            <FiClock /> {getRemainingTime(camp.endDate)}
                          </span>
                        </div>
                        <h2 className="go-card-title">{displayTitle}</h2>
                      </div>

                      <div className="go-milestone-box">
                        <div className="go-milestone-label">Target Milestone</div>
                        <div className="go-milestone-val">
                          Spend ₹{camp.targetAmount?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="go-card-body">
                      <div className="go-grid-layout">
                        {/* Left: Event Details & Sign In Call */}
                        <div className="go-progress-card">
                          <div>
                            <div className="go-spend-title">
                              <FiAward /> Exclusive Milestone Event
                            </div>
                            <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.75rem 0', letterSpacing: '-0.02em' }}>
                              Unlock A Free {camp.giftTitle}
                            </h3>
                            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                              {camp.description || `Shop for ₹${camp.targetAmount.toLocaleString('en-IN')} or more during this event window. When your orders reach the threshold, admin will send your free gift offer directly to your doorstep!`}
                            </p>

                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                                <FiStar style={{ color: '#f59e0b' }} /> Offer Highlights:
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#64748b', fontSize: '0.88rem', lineHeight: 1.65 }}>
                                <li>All store purchases (electronics, groceries, furniture) count toward target.</li>
                                <li>Orders within the event window accumulate automatically.</li>
                                <li>Free doorstep delivery when target is completed.</li>
                              </ul>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <Link
                              to="/login?redirect=/gift-offers"
                              style={{
                                padding: '0.85rem 1.75rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                color: 'white',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.92rem',
                                boxShadow: '0 6px 16px rgba(79, 70, 229, 0.28)'
                              }}
                            >
                              <FiLock /> Sign In to Check Progress
                            </Link>

                            <Link
                              to="/products"
                              style={{
                                padding: '0.85rem 1.5rem',
                                borderRadius: '12px',
                                background: '#ffffff',
                                color: '#334155',
                                fontWeight: 700,
                                textDecoration: 'none',
                                border: '1px solid #cbd5e1',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.92rem'
                              }}
                            >
                              <FiShoppingBag /> Browse Products
                            </Link>
                          </div>
                        </div>

                        {/* Right: Gift Spotlight */}
                        <div className="go-gift-showcase">
                          <div className="go-gift-image-wrap">
                            <img
                              src={camp.giftImage}
                              alt={camp.giftTitle}
                            />
                            {camp.giftValue > 0 && (
                              <div className="go-free-badge">
                                Worth ₹{camp.giftValue.toLocaleString('en-IN')} FREE
                              </div>
                            )}
                          </div>

                          <div style={{ width: '100%' }}>
                            <span style={{ fontSize: '0.76rem', color: '#7c3aed', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                              OFFICIAL REWARD SPOTLIGHT
                            </span>
                            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0.4rem 0 0.5rem 0', color: '#0f172a', letterSpacing: '-0.02em' }}>
                              {camp.giftTitle}
                            </h3>
                            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.55, margin: '0 0 1.25rem 0' }}>
                              {camp.giftDescription || camp.description}
                            </p>

                            <div className="go-feature-tag-list">
                              <span className="go-feature-tag">
                                <FiTruck style={{ color: '#4f46e5' }} /> Free Doorstep Delivery
                              </span>
                              <span className="go-feature-tag">
                                <FiGift style={{ color: '#d97706' }} /> 100% Free Reward
                              </span>
                              <span className="go-feature-tag">
                                <FiShield style={{ color: '#10b981' }} /> Zero Hidden Fees
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── HOW GIFT OFFERS WORK ───────────────────────────────────── */}
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3.5vw, 1.85rem)', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            How Gift Offers Work
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', margin: '0 auto 2.5rem auto', maxWidth: '540px', fontSize: '0.96rem', lineHeight: 1.6 }}>
            A transparent and rewarding shopping milestone program designed for our valued customers.
          </p>

          <div className="go-how-grid">
            <div className="go-how-card">
              <div className="go-how-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <FiShoppingBag />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.08rem', fontWeight: 800 }}>1. Shop Any Product</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem', lineHeight: 1.55 }}>
                  Place orders across electronics, furniture, appliances, or groceries during active campaign windows.
                </p>
              </div>
            </div>

            <div className="go-how-card">
              <div className="go-how-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <FiAward />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.08rem', fontWeight: 800 }}>2. Unlock Milestone</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem', lineHeight: 1.55 }}>
                  Your live purchase meter automatically tracks cumulative spend toward the qualifying order value.
                </p>
              </div>
            </div>

            <div className="go-how-card">
              <div className="go-how-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <FiPackage />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.08rem', fontWeight: 800 }}>3. Free Gift Dispatched</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem', lineHeight: 1.55 }}>
                  Once qualified, our team prepares and sends your complimentary gift straight to your doorstep for free!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ADDRESS UPDATE MODAL ─────────────────────────────────────── */}
      {showAddressModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>Update Delivery Address</h3>
              <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveAddress}>
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Recipient Name</label>
                <input
                  type="text"
                  required
                  value={addressForm.name}
                  onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Complete Shipping Address</label>
                <textarea
                  rows="3"
                  required
                  value={addressForm.address}
                  onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', background: '#4f46e5', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnGifts;
