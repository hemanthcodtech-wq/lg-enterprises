import { useState, useEffect } from 'react';
import axios from 'axios';

const PromoBanner = () => {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/active-promos`);
        if (res.data && res.data.length > 0) {
          setPromos(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch promos', err);
      }
    };
    fetchPromos();
  }, []);

  if (promos.length === 0) return null;

  return (
    <div className="promo-banner-wrapper">
      <style>{`
        .promo-banner-wrapper {
          background-color: #0f172a; /* Sleek dark slate */
          color: #f8fafc;
          padding: 10px 0;
          overflow: hidden;
          position: relative;
          z-index: 90;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
        }
        .promo-marquee {
          display: flex;
          white-space: nowrap;
          animation: slide 30s linear infinite;
        }
        .promo-marquee:hover {
          animation-play-state: paused;
        }
        .promo-item {
          display: inline-flex;
          align-items: center;
          margin-right: 4rem;
          font-weight: 500;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
          color: #cbd5e1;
        }
        .promo-icon {
          color: #fbbf24; /* Gold */
          margin-right: 8px;
          font-size: 1rem;
        }
        .promo-code-highlight {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          border: 1px dashed rgba(251, 191, 36, 0.5);
          padding: 3px 10px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          margin: 0 8px;
          font-weight: 800;
          text-transform: uppercase;
        }
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        /* Gradient overlays for smooth fading edges */
        .promo-banner-wrapper::before,
        .promo-banner-wrapper::after {
          content: '';
          position: absolute;
          top: 0;
          width: 50px;
          height: 100%;
          z-index: 2;
        }
        .promo-banner-wrapper::before {
          left: 0;
          background: linear-gradient(to right, #0f172a, transparent);
        }
        .promo-banner-wrapper::after {
          right: 0;
          background: linear-gradient(to left, #0f172a, transparent);
        }
      `}</style>
      <div className="promo-marquee">
        {/* We duplicate the array multiple times to ensure it covers the width and loops seamlessly */}
        {[...promos, ...promos, ...promos, ...promos, ...promos, ...promos].map((p, i) => (
          <div key={i} className="promo-item">
            <span className="promo-icon">✦</span> 
            Special Offer: Use code <span className="promo-code-highlight">{p.code}</span> to get {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `₹${p.discountValue} OFF`} your order!
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;
