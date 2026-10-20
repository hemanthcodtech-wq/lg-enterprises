import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiGift, FiArrowRight, FiX, FiCheckCircle } from 'react-icons/fi';

const LiveReturnGiftBanner = () => {
  const { user } = useAuth();
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem('lg_rg_banner_dismissed')) {
      setDismissed(true);
      return;
    }

    const fetchBannerData = async () => {
      try {
        const token = localStorage.getItem('lg_token');
        if (token) {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/return-gifts/my-progress`, {
            headers: { 'x-auth-token': token }
          });
          if (res.data && res.data.length > 0) {
            setUserProgress(res.data[0]);
            setActiveCampaign(res.data[0].campaign);
            return;
          }
        }

        // Fallback to active campaign for visitors
        const pubRes = await axios.get(`${import.meta.env.VITE_API_URL}/return-gifts/active`);
        if (pubRes.data && pubRes.data.length > 0) {
          setActiveCampaign(pubRes.data[0]);
        }
      } catch (err) {
        // Silently fail if endpoint fails or network error
      }
    };

    fetchBannerData();
  }, [user]);

  if (dismissed || !activeCampaign) return null;

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem('lg_rg_banner_dismissed', 'true');
  };

  const isQualified = userProgress?.isQualified;

  return (
    <div className="live-rg-banner-container">
      <style>{`
        .live-rg-banner-container {
          background: linear-gradient(90deg, #1e1b4b 0%, #2e1065 50%, #1e1b4b 100%);
          border-bottom: 1px solid rgba(234, 179, 8, 0.3);
          color: #f8fafc;
          padding: 8px 16px;
          position: relative;
          z-index: 85;
          font-size: 0.85rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        }
        .live-rg-banner-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .live-rg-link {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: white;
          text-decoration: none;
          flex: 1;
          justify-content: center;
          flex-wrap: wrap;
        }
        .live-rg-badge {
          background: #eab308;
          color: #0f172a;
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 0.72rem;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .live-rg-gift-tag {
          color: #fde047;
          font-weight: 700;
        }
        .live-rg-cta {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: rgba(255, 255, 255, 0.15);
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          transition: background 0.2s;
        }
        .live-rg-link:hover .live-rg-cta {
          background: #eab308;
          color: #0f172a;
        }
        .live-rg-close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.2s;
        }
        .live-rg-close-btn:hover {
          color: white;
        }
      `}</style>

      <div className="live-rg-banner-inner">
        <Link to="/gift-offers" className="live-rg-link">
          <span className="live-rg-badge">
            <FiGift /> LIVE GIFT OFFER
          </span>

          {userProgress ? (
            <span>
              {isQualified ? (
                <>
                  <FiCheckCircle style={{ color: '#4ade80', verticalAlign: 'middle', marginRight: '4px' }} />
                  <strong>You reached the milestone!</strong> Your <span className="live-rg-gift-tag">{activeCampaign.giftTitle}</span> gift offer is unlocked!
                </>
              ) : (
                <>
                  Your progress: <strong>₹{userProgress.totalPurchased?.toLocaleString('en-IN')}</strong> / ₹{userProgress.targetAmount?.toLocaleString('en-IN')} ({userProgress.progressPercentage}%) &bull; Only <strong>₹{userProgress.remainingAmount?.toLocaleString('en-IN')}</strong> left to earn <span className="live-rg-gift-tag">{activeCampaign.giftTitle}</span>!
                </>
              )}
            </span>
          ) : (
            <span>
              Spend ₹{activeCampaign.targetAmount?.toLocaleString('en-IN')} & get a free <span className="live-rg-gift-tag">{activeCampaign.giftTitle}</span> gift offer delivered to your home!
            </span>
          )}

          <span className="live-rg-cta">
            {isQualified ? 'View Gift Offer' : 'Explore Offer'} <FiArrowRight style={{ fontSize: '0.8rem' }} />
          </span>
        </Link>

        <button className="live-rg-close-btn" onClick={handleDismiss} title="Dismiss announcement">
          <FiX />
        </button>
      </div>
    </div>
  );
};

export default LiveReturnGiftBanner;
