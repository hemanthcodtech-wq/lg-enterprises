import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiHeart, FiCheck, FiTruck, FiShield, FiRefreshCcw, FiArrowLeft } from 'react-icons/fi';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);

  React.useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then(res => {
        const p = res.data;
        setProduct({
          id: p._id,
          title: p.name,
          description: p.description,
          price: p.price,
          oldPrice: p.originalPrice || Math.round(p.price * 1.2),
          image: p.images?.[0] || 'https://via.placeholder.com/600',
          category: p.category?.name?.toLowerCase() || 'other',
          discount: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
          reviews: p.reviews ? p.reviews.filter(r => r.isApproved) : [],
          rating: p.rating || 0,
          numReviews: p.numReviews || 0
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

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

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // addToCart usually expects item object. If our context doesn't handle qty natively on add, we can just call it multiple times or update context later.
    // For now we add it once (the context handles incrementing). Wait, if user sets qty to 3, adding once is buggy.
    // Assuming context handles basic add.
    for (let i=0; i<qty; i++) {
      addToCart(product);
    }
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
    <div className="section-pad">
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-gray)', marginBottom: '2rem', fontWeight: 600 }}>
        <FiArrowLeft /> Back to products
      </Link>
      
      <div className="product-detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* Left: Image */}
        <div style={{ background: 'var(--bg-page)', borderRadius: 'var(--radius)', padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={product.image} 
            alt={product.title} 
            style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
            onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x600?text=Product'; }}
          />
        </div>

        {/* Right: Details */}
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ textTransform: 'capitalize', background: 'var(--primary-alpha)', color: 'var(--primary)', padding: '0.2rem 0.8rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 600 }}>
              {product.category}
            </span>
            {product.discount && <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.8rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 600 }}>{product.discount}% OFF</span>}
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

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <button onClick={() => setQty(Math.max(1, qty-1))} style={{ padding: '0.8rem 1.2rem', background: 'var(--bg-page)', fontSize: '1.2rem', fontWeight: 600 }}>-</button>
              <span style={{ padding: '0 1.5rem', fontWeight: 700, fontSize: '1.2rem' }}>{qty}</span>
              <button onClick={() => setQty(qty+1)} style={{ padding: '0.8rem 1.2rem', background: 'var(--bg-page)', fontSize: '1.2rem', fontWeight: 600 }}>+</button>
            </div>
            
            <button onClick={handleAddToCart} className="btn-primary" style={{ flex: 1, padding: '0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: 'var(--radius-pill)' }}>
              <FiShoppingCart /> Add to Cart
            </button>
            <button onClick={handleWishlist} style={{ padding: '0 1.5rem', borderRadius: 'var(--radius-pill)', border: `2px solid ${inWishlist ? '#ef4444' : 'var(--border)'}`, background: inWishlist ? '#fee2e2' : 'white', color: inWishlist ? '#ef4444' : 'var(--text-gray)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }}>
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

      <style>{`
        @media (max-width: 900px) {
          .product-detail-layout { grid-template-columns: 1fr !important; gap: 2rem !important; padding: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
