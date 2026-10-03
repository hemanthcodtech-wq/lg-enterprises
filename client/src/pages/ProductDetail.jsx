import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ALL_PRODUCTS } from '../utils/data';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiHeart, FiCheck, FiTruck, FiShield, FiRefreshCcw, FiArrowLeft } from 'react-icons/fi';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const product = ALL_PRODUCTS.find(p => p.id === parseInt(id));
  const [qty, setQty] = useState(1);

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
    // Wishlist logic...
  };

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
            <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>★★★★☆</span>
            <span>({product.reviews || '128'} reviews)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>₹{product.price}</span>
            {product.oldPrice && <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: '0.3rem' }}>₹{product.oldPrice}</span>}
          </div>

          <p style={{ color: 'var(--text-gray)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            This premium quality {product.title.toLowerCase()} is exactly what you need. It features top-tier durability, excellent design, and comes with a full guarantee from LG Enterprises. Grab it while stocks last!
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
            <button onClick={handleWishlist} style={{ padding: '0 1.5rem', borderRadius: 'var(--radius-pill)', border: '2px solid var(--border)', background: 'white', color: 'var(--text-gray)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }}>
              <FiHeart />
            </button>
          </div>

        </div>
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
