import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';

const Wishlist = () => {
  const { user } = useAuth();
  
  // Dummy state for wishlist
  const wishlistItems = [];

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
    <div className="section-pad" style={{ maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
      <h2 className="section-title">My Wishlist</h2>
      
      {wishlistItems.length === 0 ? (
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
          {/* Wishlist items mapping would go here */}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
