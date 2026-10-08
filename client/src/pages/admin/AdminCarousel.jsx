import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FiSliders, FiImage, FiPlus, FiTrash2, FiExternalLink, FiLayers, FiTag } from 'react-icons/fi';

const AdminCarousel = () => {
  const { token } = useOutletContext();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badgeText: 'Trending',
    buttonText: 'Shop Now',
    buttonLink: '/#products',
    image: null
  });

  const fetchSlides = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/carousel/admin`, {
        headers: { 'x-auth-token': token }
      });
      setSlides(res.data);
    } catch (err) {
      console.error('Failed to fetch slides', err);
    }
  };

  useEffect(() => {
    if (token) fetchSlides();
  }, [token]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subtitle', formData.subtitle);
      data.append('badgeText', formData.badgeText);
      data.append('buttonText', formData.buttonText);
      data.append('buttonLink', formData.buttonLink);
      data.append('image', formData.image);

      await axios.post(`${import.meta.env.VITE_API_URL}/carousel`, data, {
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFormData({
        title: '', subtitle: '', badgeText: 'Trending', buttonText: 'Shop Now', buttonLink: '/#products', image: null
      });
      fetchSlides();
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding slide');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/carousel/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchSlides();
    } catch (err) {
      alert('Error deleting slide');
    }
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
          top: 340px;
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

        .carousel-split-grid {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 950px) {
          .carousel-split-grid {
            grid-template-columns: 1fr;
          }
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.85);
          border: 1.5px solid rgba(226, 232, 240, 0.9);
          border-radius: 12px;
          padding: 0.8rem 1.1rem;
          width: 100%;
          outline: none;
          font-family: inherit;
          font-size: 0.95rem;
          color: #0f172a;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }
        .glass-input:focus {
          border-color: #4f46e5;
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
        }

        /* File Selector Styling */
        input[type=file]::file-selector-button {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          color: #475569;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          margin-right: 0.8rem;
          transition: all 0.2s ease;
        }
        input[type=file]::file-selector-button:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .btn-indigo-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          padding: 0.85rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.32), inset 0 1px 1px rgba(255, 255, 255, 0.4);
        }
        .btn-indigo-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(79, 70, 229, 0.45);
        }
        .btn-indigo-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-action-delete {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 0.45rem 0.9rem;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
        }
        .btn-action-delete:hover {
          background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(79, 70, 229, 0.4);
        }

        .carousel-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }
        .carousel-table th {
          background: rgba(248, 250, 252, 0.7);
          color: #475569;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 1rem 1.4rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }
        .carousel-table td {
          padding: 1.1rem 1.4rem;
          border-bottom: 1px solid rgba(241, 245, 249, 0.8);
          color: #1e293b;
          font-size: 0.92rem;
          vertical-align: middle;
          transition: background 0.2s ease;
        }
        .carousel-table tr:hover td {
          background: rgba(255, 255, 255, 0.6);
        }
        .carousel-table tr:last-child td {
          border-bottom: none;
        }

        .slide-thumb {
          width: 120px;
          height: 64px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
          display: block;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.55rem;
          background: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
          border: 1px solid rgba(79, 70, 229, 0.25);
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.3rem;
        }

        .cat-icon-chip {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          border: 1px solid rgba(79, 70, 229, 0.2);
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '0.5rem', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.25rem 0', fontWeight: '800', letterSpacing: '-0.5px' }}>Hero Carousel</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Manage the featured interactive banners displayed on your storefront hero slider</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 1rem', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.25)', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5', boxShadow: '0 0 8px #4f46e5' }}></span>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#4f46e5', letterSpacing: '0.3px' }}>
            {slides.length} SLIDES ACTIVE
          </span>
        </div>
      </div>

      <div className="carousel-split-grid">
        {/* Left Form: Add Carousel Slide */}
        <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div className="cat-icon-chip">
              <FiSliders />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>Add Hero Slide</h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Configure headline, media and CTA</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', position: 'relative', zIndex: 1 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Headline Title *
              </label>
              <input 
                type="text" 
                name="title" 
                className="glass-input" 
                placeholder="e.g. Next-Gen OLED Smart TVs" 
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Subtitle Description *
              </label>
              <textarea 
                name="subtitle" 
                className="glass-input" 
                rows={2} 
                placeholder="e.g. Discover brilliant colors and unmatched contrast with up to 40% off." 
                value={formData.subtitle} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Badge Highlight
              </label>
              <input 
                type="text" 
                name="badgeText" 
                className="glass-input" 
                placeholder="e.g. Trending, Hot Deal, New Launch" 
                value={formData.badgeText} 
                onChange={handleChange} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                  Button Label
                </label>
                <input 
                  type="text" 
                  name="buttonText" 
                  className="glass-input" 
                  placeholder="e.g. Shop Now" 
                  value={formData.buttonText} 
                  onChange={handleChange} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                  Target Link
                </label>
                <input 
                  type="text" 
                  name="buttonLink" 
                  className="glass-input" 
                  placeholder="e.g. /#products" 
                  value={formData.buttonLink} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Slide Image (Cloudinary) *
              </label>
              <input 
                type="file" 
                name="image" 
                className="glass-input" 
                style={{ padding: '0.55rem' }} 
                onChange={handleChange} 
                required 
                accept="image/*" 
              />
              <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                High-resolution landscape image (16:9 recommended)
              </small>
            </div>

            <button type="submit" className="btn-indigo-submit" disabled={loading} style={{ marginTop: '0.4rem' }}>
              <FiPlus style={{ fontSize: '1.15rem' }} />
              {loading ? 'Uploading Slide...' : 'Publish Hero Slide'}
            </button>
          </form>
        </div>

        {/* Right Section: Active Slides List */}
        <div className="glass-card">
          <div style={{ padding: '1.5rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FiLayers style={{ color: '#4f46e5', fontSize: '1.2rem' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>Active Carousel Slides</h3>
            </div>
          </div>

          <div style={{ overflowX: 'auto', position: 'relative', zIndex: 1 }}>
            <table className="carousel-table">
              <thead>
                <tr>
                  <th style={{ width: '140px' }}>Preview</th>
                  <th>Slide Details</th>
                  <th>Button Action</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slides.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🖼️</div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem', color: '#475569' }}>No carousel slides found</p>
                      <small style={{ color: '#94a3b8' }}>Create your first hero banner on the left to display on the storefront</small>
                    </td>
                  </tr>
                ) : (
                  slides.map(slide => (
                    <tr key={slide._id}>
                      <td>
                        <img src={slide.imageUrl} alt={slide.title} className="slide-thumb" />
                      </td>
                      <td>
                        <div>
                          {slide.badgeText && (
                            <span className="badge-pill">{slide.badgeText}</span>
                          )}
                          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.98rem', marginBottom: '0.2rem' }}>
                            {slide.title}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: '1.3', maxWidth: '320px' }}>
                            {slide.subtitle}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.65rem', background: 'rgba(241, 245, 249, 0.8)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', color: '#334155', border: '1px solid #e2e8f0' }}>
                          <span>{slide.buttonText || 'Shop Now'}</span>
                          <FiExternalLink style={{ fontSize: '0.75rem', color: '#64748b' }} />
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-action-delete" onClick={() => handleDelete(slide._id)}>
                          <FiTrash2 style={{ fontSize: '0.9rem' }} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCarousel;
