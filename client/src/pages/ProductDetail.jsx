import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  FiShoppingCart, FiHeart, FiCheck, FiTruck, FiShield, 
  FiRefreshCcw, FiArrowLeft, FiChevronLeft, FiChevronRight, 
  FiMaximize2, FiX, FiSearch, FiZoomIn, FiZoomOut 
} from 'react-icons/fi';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Amazon Gallery State
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then(res => {
        const p = res.data;
        const imgs = (p.images && Array.isArray(p.images) && p.images.length > 0)
          ? p.images
          : (p.image ? [p.image] : ['https://via.placeholder.com/600x600?text=Product']);

        setProduct({
          id: p._id,
          title: p.name,
          description: p.description,
          price: p.price,
          oldPrice: p.originalPrice || Math.round(p.price * 1.2),
          image: imgs[0],
          images: imgs,
          category: p.category?.name?.toLowerCase() || 'other',
          discount: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
          reviews: p.reviews ? p.reviews.filter(r => r.isApproved) : [],
          rating: p.rating || 0,
          numReviews: p.numReviews || 0,
          stock: p.stock !== undefined ? p.stock : 10
        });
        setSelectedImgIndex(0);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      const imgCount = product?.images?.length || 0;
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setLightboxScale(1);
      } else if (e.key === 'ArrowLeft' && imgCount > 1) {
        setSelectedImgIndex(prev => (prev === 0 ? imgCount - 1 : prev - 1));
      } else if (e.key === 'ArrowRight' && imgCount > 1) {
        setSelectedImgIndex(prev => (prev === imgCount - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, product?.images?.length]);

  if (loading) {
    return (
      <div className="section-pad" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <h2>Loading Product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section-pad" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <h2>Product not found!</h2>
        <Link to="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Home</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const images = (product.images && product.images.length > 0) ? product.images : [product.image];
  const currentImage = images[selectedImgIndex] || images[0];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomCoords({ x, y });
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setSelectedImgIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    setSelectedImgIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isOutOfStock) return;
    addToCart(product, qty);
  };

  const handleWishlist = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleWishlist(product);
  };

  const inWishlist = wishlist?.some(item => item.id === product.id);

  return (
    <div className="section-pad amazon-product-page">
      <Link to="/" className="back-to-products-link">
        <FiArrowLeft /> Back to products
      </Link>
      
      <div className="product-detail-layout">
        
        {/* Left: Amazon-Style Multi-Image Gallery */}
        <div className="amazon-gallery-wrapper">
          {/* Vertical Thumbnail Rail (Desktop) */}
          {images.length > 1 && (
            <div className="amazon-thumbnails-rail">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`amazon-thumb-card ${selectedImgIndex === idx ? 'is-active' : ''}`}
                  onMouseEnter={() => setSelectedImgIndex(idx)}
                  onClick={() => setSelectedImgIndex(idx)}
                  aria-label={`View image angle ${idx + 1}`}
                >
                  <img 
                    src={imgUrl} 
                    alt={`${product.title} angle ${idx + 1}`} 
                    onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80?text=Product'; }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image Stage Container */}
          <div className="amazon-main-stage-col">
            <div 
              className="amazon-main-stage"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              onClick={() => { setIsLightboxOpen(true); setLightboxScale(1); }}
              title="Click to expand fullscreen"
            >
              <img 
                src={currentImage} 
                alt={product.title} 
                className="amazon-main-image"
                style={isZooming ? {
                  transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                  transform: 'scale(2.2)',
                  cursor: 'crosshair'
                } : {
                  transform: 'scale(1)',
                  cursor: 'zoom-in'
                }}
                onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x600?text=Product'; }}
              />

              {/* Amazon-style "Roll over image to zoom in" banner */}
              <div className={`amazon-zoom-tooltip ${isZooming ? 'is-zoomed' : ''}`}>
                <FiSearch style={{ fontSize: '0.85rem' }} /> Roll over image to zoom in • Click to expand
              </div>

              {/* Expand to Lightbox Button */}
              <button 
                type="button"
                className="amazon-expand-btn"
                onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); setLightboxScale(1); }}
                title="Fullscreen view"
              >
                <FiMaximize2 />
              </button>

              {/* Arrow navigation on image */}
              {images.length > 1 && (
                <>
                  <button 
                    type="button" 
                    className="gallery-nav-arrow prev"
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    <FiChevronLeft />
                  </button>
                  <button 
                    type="button" 
                    className="gallery-nav-arrow next"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <FiChevronRight />
                  </button>
                </>
              )}

              {/* Image counter indicator */}
              {images.length > 1 && (
                <div className="gallery-counter-pill">
                  {selectedImgIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Mobile horizontal thumbnail strip */}
            {images.length > 1 && (
              <div className="amazon-mobile-thumb-strip">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`amazon-thumb-card ${selectedImgIndex === idx ? 'is-active' : ''}`}
                    onClick={() => setSelectedImgIndex(idx)}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="product-info-col">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ textTransform: 'capitalize', background: 'var(--primary-alpha)', color: 'var(--primary)', padding: '0.2rem 0.8rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 600 }}>
              {product.category}
            </span>
            {product.discount > 0 && <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.8rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 600 }}>{product.discount}% OFF</span>}
            
            {/* Stock status indicator badge */}
            {product.stock > 5 ? (
              <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '0.2rem 0.8rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <FiCheck /> In Stock ({product.stock} available)
              </span>
            ) : product.stock > 0 ? (
              <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '0.2rem 0.8rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 700 }}>
                ⚡ Only {product.stock} left in stock - order soon!
              </span>
            ) : (
              <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.2rem 0.8rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 700 }}>
                ✕ Out of Stock
              </span>
            )}
          </div>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-dark)', lineHeight: 1.2 }}>{product.title}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: 'var(--text-gray)' }}>
            <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>
              {'★'.repeat(Math.round(product.rating))}<span style={{ color: '#e2e8f0' }}>{'★'.repeat(5 - Math.round(product.rating))}</span>
            </span>
            <span>({product.reviews?.length || 0} reviews)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>₹{product.price}</span>
            {product.oldPrice && <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: '0.3rem' }}>₹{product.oldPrice}</span>}
          </div>

          <p style={{ color: 'var(--text-gray)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {product.description || `This premium quality ${product.title.toLowerCase()} is exactly what you need. It features top-tier durability, excellent design, and comes with a full guarantee from LG Enterprises. Grab it while stocks last!`}
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', opacity: isOutOfStock ? 0.4 : 1 }}>
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))} 
                disabled={isOutOfStock}
                style={{ padding: '0.8rem 1.2rem', background: 'var(--bg-page)', fontSize: '1.2rem', fontWeight: 600, border: 'none', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}>-</button>
              <span style={{ padding: '0 1.5rem', fontWeight: 700, fontSize: '1.2rem', minWidth: '40px', textAlign: 'center' }}>{qty}</span>
              <button 
                onClick={() => setQty(Math.min(product.stock, qty + 1))} 
                disabled={isOutOfStock || qty >= product.stock}
                style={{ padding: '0.8rem 1.2rem', background: 'var(--bg-page)', fontSize: '1.2rem', fontWeight: 600, border: 'none', cursor: (isOutOfStock || qty >= product.stock) ? 'not-allowed' : 'pointer' }}>+</button>
            </div>
            
            <button 
              onClick={handleAddToCart} 
              disabled={isOutOfStock}
              className="btn-primary" 
              style={{ 
                flex: 1, 
                padding: '0 2rem', 
                minHeight: '52px',
                fontSize: '1.1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                borderRadius: 'var(--radius-pill)',
                opacity: isOutOfStock ? 0.5 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                background: isOutOfStock ? '#94a3b8' : undefined
              }}>
              <FiShoppingCart /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button onClick={handleWishlist} style={{ padding: '0 1.5rem', borderRadius: 'var(--radius-pill)', border: `2px solid ${inWishlist ? '#ef4444' : 'var(--border)'}`, background: inWishlist ? '#fee2e2' : 'white', color: inWishlist ? '#ef4444' : 'var(--text-gray)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)', cursor: 'pointer' }}>
              <FiHeart style={{ fill: inWishlist ? '#ef4444' : 'none' }} />
            </button>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: '4rem', background: 'white', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>Customer Reviews</h2>
        
        {product.reviews && product.reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {(showAllReviews ? product.reviews : product.reviews.slice(0, 3)).map((review) => (
              <div key={review._id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '700', color: '#334155', fontSize: '1.1rem' }}>{review.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ color: '#fbbf24', fontSize: '1.1rem', marginBottom: '0.8rem' }}>
                  {'★'.repeat(review.rating)}<span style={{ color: '#e2e8f0' }}>{'★'.repeat(5 - review.rating)}</span>
                </div>
                <p style={{ color: '#475569', lineHeight: 1.6, margin: 0, fontSize: '1rem' }}>"{review.comment}"</p>
              </div>
            ))}
            
            {product.reviews.length > 3 && (
              <button 
                onClick={() => setShowAllReviews(!showAllReviews)}
                style={{ background: 'none', border: '1px solid #cbd5e1', color: '#475569', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', alignSelf: 'center', transition: 'all 0.2s', marginTop: '1rem' }}
                onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#475569'; }}
              >
                {showAllReviews ? 'Hide Reviews' : `View All ${product.reviews.length} Reviews`}
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
            <p style={{ fontSize: '1.1rem' }}>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>

      {/* Amazon-Style Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="amazon-lightbox-overlay"
          onClick={() => { setIsLightboxOpen(false); setLightboxScale(1); }}
        >
          <div className="amazon-lightbox-content" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="lightbox-header-bar">
              <div className="lightbox-title-box">
                <h4>{product.title}</h4>
                <span>Angle {selectedImgIndex + 1} of {images.length}</span>
              </div>
              <div className="lightbox-ctrls-group">
                <button 
                  type="button" 
                  className="lightbox-action-btn"
                  disabled={lightboxScale <= 1}
                  onClick={() => setLightboxScale(prev => Math.max(1, prev - 0.5))}
                  title="Zoom Out"
                >
                  <FiZoomOut />
                </button>
                <span className="lightbox-zoom-readout">{Math.round(lightboxScale * 100)}%</span>
                <button 
                  type="button" 
                  className="lightbox-action-btn"
                  disabled={lightboxScale >= 3}
                  onClick={() => setLightboxScale(prev => Math.min(3, prev + 0.5))}
                  title="Zoom In"
                >
                  <FiZoomIn />
                </button>
                <button 
                  type="button" 
                  className="lightbox-close-btn"
                  onClick={() => { setIsLightboxOpen(false); setLightboxScale(1); }}
                  title="Close (Esc)"
                >
                  <FiX />
                </button>
              </div>
            </div>

            {/* Stage */}
            <div className="lightbox-view-stage">
              {images.length > 1 && (
                <button 
                  type="button" 
                  className="lightbox-nav-arrow prev" 
                  onClick={prevImage}
                  title="Previous image"
                >
                  <FiChevronLeft />
                </button>
              )}

              <div className="lightbox-image-center">
                <img 
                  src={currentImage} 
                  alt={product.title} 
                  className="lightbox-main-img"
                  style={{ transform: `scale(${lightboxScale})` }}
                  onClick={() => setLightboxScale(prev => (prev === 1 ? 2 : 1))}
                  title="Click to toggle 2x zoom"
                />
              </div>

              {images.length > 1 && (
                <button 
                  type="button" 
                  className="lightbox-nav-arrow next" 
                  onClick={nextImage}
                  title="Next image"
                >
                  <FiChevronRight />
                </button>
              )}
            </div>

            {/* Bottom filmstrip */}
            {images.length > 1 && (
              <div className="lightbox-thumbnails-footer">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`lightbox-filmstrip-thumb ${selectedImgIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImgIndex(idx)}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .back-to-products-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-gray);
          margin-bottom: 2rem;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .back-to-products-link:hover {
          color: var(--primary);
        }

        .product-detail-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3.5rem;
          background: #ffffff;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        /* Amazon-Style Gallery Layout */
        .amazon-gallery-wrapper {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          width: 100%;
        }

        /* Vertical Thumbnail Strip (Desktop) */
        .amazon-thumbnails-rail {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          max-height: 560px;
          overflow-y: auto;
          scrollbar-width: thin;
          padding-right: 2px;
          flex-shrink: 0;
        }
        .amazon-thumbnails-rail::-webkit-scrollbar {
          width: 4px;
        }
        .amazon-thumbnails-rail::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .amazon-thumb-card {
          width: 62px;
          height: 62px;
          border-radius: 6px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          padding: 3px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
          flex-shrink: 0;
        }
        .amazon-thumb-card img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 4px;
          transition: transform 0.2s ease;
        }
        .amazon-thumb-card:hover {
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }
        /* Amazon Signature Orange/Amber Highlight */
        .amazon-thumb-card.is-active {
          border-color: #e77600;
          box-shadow: 0 0 0 1.5px #e77600, 0 2px 6px rgba(231, 118, 0, 0.25);
        }
        .amazon-thumb-card.is-active img {
          transform: scale(1.05);
        }

        /* Main Showcase Area */
        .amazon-main-stage-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-width: 0;
        }

        .amazon-main-stage {
          position: relative;
          width: 100%;
          height: 520px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          user-select: none;
        }

        .amazon-main-image {
          width: 100%;
          height: 100%;
          max-height: 480px;
          object-fit: contain;
          transition: transform 0.15s ease-out;
          will-change: transform, transform-origin;
          pointer-events: none;
        }

        /* Amazon Zoom Hint */
        .amazon-zoom-tooltip {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.75);
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 5px;
          pointer-events: none;
          transition: opacity 0.2s ease;
          backdrop-filter: blur(4px);
          white-space: nowrap;
          z-index: 5;
        }
        .amazon-zoom-tooltip.is-zoomed {
          opacity: 0;
        }

        /* Expand Button */
        .amazon-expand-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e2e8f0;
          color: #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          z-index: 5;
        }
        .amazon-expand-btn:hover {
          background: #ffffff;
          color: #0f172a;
          transform: scale(1.1);
        }

        /* Gallery Nav Arrows */
        .gallery-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e2e8f0;
          color: #1e293b;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 5;
          opacity: 0;
        }
        .amazon-main-stage:hover .gallery-nav-arrow {
          opacity: 1;
        }
        .gallery-nav-arrow.prev { left: 12px; }
        .gallery-nav-arrow.next { right: 12px; }
        .gallery-nav-arrow:hover {
          background: #ffffff;
          transform: translateY(-50%) scale(1.1);
          color: #e77600;
        }

        .gallery-counter-pill {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(15, 23, 42, 0.7);
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          z-index: 5;
          letter-spacing: 0.03em;
        }

        /* Mobile horizontal strip */
        .amazon-mobile-thumb-strip {
          display: none;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
          scrollbar-width: none;
        }
        .amazon-mobile-thumb-strip::-webkit-scrollbar {
          display: none;
        }

        /* Lightbox Fullscreen Modal */
        .amazon-lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: lightboxFade 0.2s ease;
        }
        @keyframes lightboxFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .amazon-lightbox-content {
          background: #0f172a;
          border-radius: 14px;
          width: 100%;
          max-width: 1100px;
          height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .lightbox-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: rgba(30, 41, 59, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
        .lightbox-title-box h4 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #f8fafc;
        }
        .lightbox-title-box span {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        .lightbox-ctrls-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .lightbox-action-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.15s ease;
        }
        .lightbox-action-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }
        .lightbox-action-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .lightbox-zoom-readout {
          font-size: 0.78rem;
          font-weight: 700;
          color: #cbd5e1;
          min-width: 42px;
          text-align: center;
        }
        .lightbox-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #ef4444;
          border: none;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          cursor: pointer;
          margin-left: 0.5rem;
          transition: all 0.15s ease;
        }
        .lightbox-close-btn:hover {
          background: #dc2626;
          transform: scale(1.05);
        }
        .lightbox-view-stage {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 1.5rem;
          background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
        }
        .lightbox-image-center {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
        }
        .lightbox-main-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: zoom-in;
          border-radius: 8px;
        }
        .lightbox-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }
        .lightbox-nav-arrow.prev { left: 1.5rem; }
        .lightbox-nav-arrow.next { right: 1.5rem; }
        .lightbox-nav-arrow:hover {
          background: #e77600;
          border-color: #e77600;
          transform: translateY(-50%) scale(1.1);
        }
        .lightbox-thumbnails-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          padding: 0.85rem 1.5rem;
          background: rgba(15, 23, 42, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          overflow-x: auto;
        }
        .lightbox-filmstrip-thumb {
          width: 52px;
          height: 52px;
          border-radius: 6px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: #ffffff;
          padding: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          overflow: hidden;
        }
        .lightbox-filmstrip-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 3px;
        }
        .lightbox-filmstrip-thumb.active {
          border-color: #e77600;
          box-shadow: 0 0 0 2px rgba(231, 118, 0, 0.4);
          transform: scale(1.08);
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .product-detail-layout {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            padding: 1.5rem !important;
          }
          .amazon-gallery-wrapper {
            flex-direction: column;
          }
          .amazon-thumbnails-rail {
            display: none !important;
          }
          .amazon-mobile-thumb-strip {
            display: flex !important;
          }
          .amazon-main-stage {
            height: 380px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;

