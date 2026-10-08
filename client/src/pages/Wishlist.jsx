import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const { user } = useAuth();
  
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="section-pad" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Login Required</h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Please log in to view your wishlist.</p>
        <Link to="/login" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Sign In</Link>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <h2 className="section-title">My Wishlist</h2>
      
      {wishlist.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fee2e2', color: '#cc2222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem' }}>
            <FiHeart />
          </div>
          <h3 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.5rem' }}>Your wishlist is empty</h3>
          <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Save items you love to your wishlist. Review them anytime and easily move them to your cart.
          </p>
          <Link to="/" className="btn-primary" style={{ padding: '0.8rem 2.5rem', fontSize: '1rem' }}>Discover Products</Link>
        </div>
      ) : (
        <div className="products-grid">
          {wishlist.map(product => (
            <div key={product.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', background: '#f8fafc', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                <img src={product.image} alt={product.title} style={{ width: '100%', height: '180px', objectFit: 'contain' }} />
                <button 
                  onClick={() => toggleWishlist(product)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', width: '36px', height: '36px', borderRadius: '50%', background: '#fee2e2', color: '#cc2222', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  <FiTrash2 />
                </button>
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#1e293b' }}>{product.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>₹{product.price}</span>
                  {product.oldPrice && <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '0.9rem' }}>₹{product.oldPrice}</span>}
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <button 
                    onClick={() => { addToCart(product); navigate('/cart'); }}
                    className="btn-primary" 
                    style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <FiShoppingCart /> Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
