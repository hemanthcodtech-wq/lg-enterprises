import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaQuoteLeft } from 'react-icons/fa';

const TestimonialSlider = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/testimonials`);
        setTestimonials(res.data);
      } catch (err) {
        console.error('Failed to load testimonials:', err);
      }
    };
    fetchTestimonials();
  }, []);

  // Ensure there are at least 5 cards available so 5 cards in 3 layers are always rendered
  const displayList = useMemo(() => {
    if (!testimonials || testimonials.length === 0) return [];
    if (testimonials.length >= 5) return testimonials;
    let list = [...testimonials];
    while (list.length < 5) {
      list = [...list, ...testimonials];
    }
    return list;
  }, [testimonials]);

  useEffect(() => {
    if (displayList.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayList, isPaused]);

  if (testimonials.length === 0) return null;

  const next = () => setCurrentIndex(prev => (prev + 1) % displayList.length);
  const prev = () => setCurrentIndex(prev => (prev - 1 + displayList.length) % displayList.length);

  // 3-layer, 5-card position calculation
  const getPositionClass = (index) => {
    const len = displayList.length;
    if (len < 3) return index === currentIndex ? 'active' : 'hidden';

    if (index === currentIndex) return 'active';
    if (index === (currentIndex - 1 + len) % len) return 'prev';
    if (index === (currentIndex + 1) % len) return 'next';
    if (index === (currentIndex - 2 + len) % len) return 'far-prev';
    if (index === (currentIndex + 2) % len) return 'far-next';
    return 'hidden';
  };

  return (
    <section 
      className="testimonial-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <style>{`
        .testimonial-section {
          padding: 2.75rem 1.5rem 2.25rem 1.5rem;
          background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 50%, #f1f5f9 100%);
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .testimonial-section::before {
          content: '';
          position: absolute;
          top: -70px;
          left: 50%;
          transform: translateX(-50%);
          width: 750px;
          height: 280px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
          pointer-events: none;
        }

        /* Compact Header */
        .testimonial-header {
          max-width: 650px;
          margin: 0 auto 1.75rem auto;
          position: relative;
          z-index: 2;
        }

        .testimonial-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #2563eb;
          background: #eff6ff;
          padding: 0.28rem 0.9rem;
          border-radius: 9999px;
          border: 1px solid #bfdbfe;
          margin-bottom: 0.5rem;
        }

        .testimonial-header h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.35rem 0;
          letter-spacing: -0.5px;
        }

        .testimonial-header p {
          font-size: 0.95rem;
          color: #64748b;
          margin: 0;
        }

        /* Streamlined container height to match 4:3 cards */
        .testimonial-slider-container {
          position: relative;
          width: 100%;
          max-width: 1440px;
          height: 350px;
          margin: 0 auto;
          perspective: 1200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* 4:3 Aspect Ratio Highlighted Cards */
        .testimonial-card-3d {
          position: absolute;
          width: 420px;
          aspect-ratio: 4 / 3;
          max-width: calc(100% - 2rem);
          background: #ffffff;
          padding: 1.65rem 1.85rem 1.5rem 1.85rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 0 0 1.5px rgba(226, 232, 240, 0.9);
          transition: all 0.75s cubic-bezier(0.25, 1, 0.5, 1);
          color: #1e293b;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          overflow: hidden;
        }

        /* Top highlight accent bar for active card */
        .testimonial-card-3d.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4.5px;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
        }

        /* LAYER 1: Front / Center Active Highlighted Card */
        .testimonial-card-3d.active {
          transform: translateX(0) scale(1) translateZ(0);
          z-index: 5;
          opacity: 1;
          border: 2px solid #2563eb;
          box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.25), 0 0 24px rgba(59, 130, 246, 0.15);
          cursor: default;
        }

        /* LAYER 2: Middle Layer (Prev & Next) Highlighted */
        .testimonial-card-3d.prev {
          transform: translateX(-68%) scale(0.86) translateZ(-80px);
          z-index: 3;
          opacity: 0.72;
          border: 1.5px solid #cbd5e1;
          filter: blur(0.5px) contrast(0.95);
        }

        .testimonial-card-3d.prev:hover {
          opacity: 0.92;
          filter: blur(0px);
        }

        .testimonial-card-3d.next {
          transform: translateX(68%) scale(0.86) translateZ(-80px);
          z-index: 3;
          opacity: 0.72;
          border: 1.5px solid #cbd5e1;
          filter: blur(0.5px) contrast(0.95);
        }

        .testimonial-card-3d.next:hover {
          opacity: 0.92;
          filter: blur(0px);
        }

        /* LAYER 3: Back Layer (Far-Prev & Far-Next) */
        .testimonial-card-3d.far-prev {
          transform: translateX(-132%) scale(0.72) translateZ(-160px);
          z-index: 1;
          opacity: 0.42;
          border: 1px solid #e2e8f0;
          filter: blur(1.5px) contrast(0.9);
        }

        .testimonial-card-3d.far-prev:hover {
          opacity: 0.7;
          filter: blur(0.5px);
        }

        .testimonial-card-3d.far-next {
          transform: translateX(132%) scale(0.72) translateZ(-160px);
          z-index: 1;
          opacity: 0.42;
          border: 1px solid #e2e8f0;
          filter: blur(1.5px) contrast(0.9);
        }

        .testimonial-card-3d.far-next:hover {
          opacity: 0.7;
          filter: blur(0.5px);
        }

        .testimonial-card-3d.hidden {
          transform: translateX(0) scale(0.5) translateZ(-250px);
          z-index: 0;
          opacity: 0;
          pointer-events: none;
        }

        /* Card Header */
        .testimonial-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 0.85rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .testimonial-user-info {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .testimonial-avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: 700;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
          overflow: hidden;
          flex-shrink: 0;
        }

        .testimonial-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .testimonial-user-meta {
          display: flex;
          flex-direction: column;
        }

        .testimonial-author-3d {
          font-weight: 700;
          color: #0f172a;
          font-size: 1.05rem;
          margin: 0;
          line-height: 1.2;
        }

        .testimonial-role-3d {
          font-size: 0.75rem;
          color: #2563eb;
          font-weight: 700;
          margin-top: 0.15rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .testimonial-rating-wrap {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }

        .testimonial-rating-3d {
          color: #f59e0b;
          font-size: 1.05rem;
          display: flex;
          gap: 2px;
        }

        .testimonial-quote-icon {
          color: #3b82f6;
          font-size: 1.25rem;
          opacity: 0.85;
        }

        .testimonial-quote-3d {
          font-size: 1rem;
          color: #334155;
          line-height: 1.6;
          margin: 0;
          font-style: italic;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
        }

        .slider-controls-3d {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          max-width: 1480px;
          display: flex;
          justify-content: space-between;
          pointer-events: none;
          z-index: 10;
          padding: 0 0.5rem;
        }

        .slider-btn-3d {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #334155;
          pointer-events: auto;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
          transition: all 0.25s ease;
        }

        .slider-btn-3d:hover {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
          transform: scale(1.08);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
        }

        .testimonial-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 1.35rem;
          position: relative;
          z-index: 4;
        }

        .testimonial-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #cbd5e1;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .testimonial-dot:hover {
          background: #94a3b8;
        }

        .testimonial-dot.active {
          width: 26px;
          background: #2563eb;
          border-radius: 9999px;
        }

        @media (max-width: 1200px) {
          .testimonial-card-3d.prev { transform: translateX(-58%) scale(0.85) translateZ(-80px); }
          .testimonial-card-3d.next { transform: translateX(58%) scale(0.85) translateZ(-80px); }
          .testimonial-card-3d.far-prev { transform: translateX(-112%) scale(0.72) translateZ(-160px); }
          .testimonial-card-3d.far-next { transform: translateX(112%) scale(0.72) translateZ(-160px); }
        }

        @media (max-width: 900px) {
          .testimonial-card-3d.far-prev,
          .testimonial-card-3d.far-next {
            opacity: 0;
            pointer-events: none;
          }
          .testimonial-card-3d.prev { transform: translateX(-45%) scale(0.85) translateZ(-80px); }
          .testimonial-card-3d.next { transform: translateX(45%) scale(0.85) translateZ(-80px); }
        }

        @media (max-width: 768px) {
          .testimonial-section {
            padding: 2.5rem 1rem 1.75rem 1rem;
          }
          .testimonial-header h2 {
            font-size: 1.75rem;
          }
          .testimonial-slider-container {
            height: 290px;
          }
          .testimonial-card-3d {
            width: 90%;
            max-width: 360px;
            aspect-ratio: 4 / 3;
            padding: 1.35rem 1.25rem;
            border-radius: 16px;
          }
          .testimonial-quote-3d {
            font-size: 0.95rem;
            line-height: 1.5;
          }
          .testimonial-card-3d.prev,
          .testimonial-card-3d.next,
          .testimonial-card-3d.far-prev,
          .testimonial-card-3d.far-next { 
            opacity: 0; 
            pointer-events: none; 
          }
          .slider-controls-3d {
            width: 100%;
            padding: 0 0.25rem;
          }
          .slider-btn-3d {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
      
      <div className="testimonial-header">
        <span className="testimonial-badge">Testimonials</span>
        <h2>Customer Experiences</h2>
        <p>Real stories and reviews from our valued clients</p>
      </div>
      
      <div className="testimonial-slider-container">
        {displayList.length > 1 && (
          <div className="slider-controls-3d">
            <button className="slider-btn-3d" onClick={prev} aria-label="Previous testimonial">
              <FiChevronLeft size={24} />
            </button>
            <button className="slider-btn-3d" onClick={next} aria-label="Next testimonial">
              <FiChevronRight size={24} />
            </button>
          </div>
        )}
        
        {displayList.map((t, idx) => {
          const position = getPositionClass(idx);
          return (
            <div 
              key={`${t._id || 'card'}-${idx}`} 
              className={`testimonial-card-3d ${position}`}
              onClick={() => {
                if (position === 'next' || position === 'far-next') next();
                if (position === 'prev' || position === 'far-prev') prev();
              }}
            >
              <div className="testimonial-card-top">
                <div className="testimonial-user-info">
                  <div className="testimonial-avatar">
                    {t.image ? (
                      <img src={t.image} alt={t.name} />
                    ) : (
                      <span>{t.name ? t.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="testimonial-user-meta">
                    <h4 className="testimonial-author-3d">{t.name}</h4>
                    <span className="testimonial-role-3d">{t.role || 'Customer'}</span>
                  </div>
                </div>

                <div className="testimonial-rating-wrap">
                  <div className="testimonial-rating-3d">
                    {'★'.repeat(t.rating || 5)}
                    <span style={{ color: '#e2e8f0' }}>{'★'.repeat(5 - (t.rating || 5))}</span>
                  </div>
                  <FaQuoteLeft className="testimonial-quote-icon" />
                </div>
              </div>

              <p className="testimonial-quote-3d">
                "{t.message}"
              </p>
            </div>
          );
        })}
      </div>

      {testimonials.length > 1 && (
        <div className="testimonial-dots">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              className={`testimonial-dot ${idx === (currentIndex % testimonials.length) ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default TestimonialSlider;
