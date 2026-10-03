import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiSearch, FiShoppingCart, FiUser, FiHeart,
  FiMenu, FiX, FiLogOut, FiPackage, FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const popularSearches = ['Samsung TV', 'Sofa Set', 'Rice 5kg', 'Laptop', 'Refrigerator'];

  return (
    <>
      <nav className="navbar">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <img src="/logo.png" alt="LG Enterprises" className="brand-logo" />
          <div className="brand-info">
            <span className="brand-name">LG ENTERPRISES</span>
            <span className="brand-sub">Electronic · Furniture · Cloth · Grocery</span>
            <span className="brand-tag">All Your Needs Under One Roof</span>
          </div>
        </Link>

        {/* Search */}
        <div className="nav-search">
          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn"><FiSearch /></button>
          </form>
          <div className="search-hint">
            <span>Popular:</span>
            {popularSearches.map((s, i) => (
              <a key={i} href="#" onClick={e => { e.preventDefault(); setSearchQuery(s); }}>
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {/* Cart */}
          <Link to="/cart" className="cart-btn">
            <FiShoppingCart />
            <span>Cart</span>
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </Link>

          {/* Wishlist */}
          <Link to="/wishlist" className="nav-action" title="Wishlist">
            <FiHeart />
            <span>Wishlist</span>
          </Link>

          {/* Account */}
          {user ? (
            <div className="nav-user-menu" ref={dropdownRef} style={{ position: 'relative' }}>
              <button className="nav-action" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ background: 'none', border: 'none', padding: '0.4rem 0.7rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#cc2222', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '3px' }}>
                  <span>{user.name?.split(' ')[0]}</span>
                  <FiChevronDown style={{ fontSize: '12px', marginBottom: 0 }} />
                </div>
              </button>
              {dropdownOpen && (
                <div className="user-dropdown" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: '0', background: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', borderRadius: '12px', padding: '0.5rem', width: '240px', zIndex: 1000, border: '1px solid #f1f5f9' }}>
                  <div className="dropdown-header" style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                    <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', color: '#334155', textDecoration: 'none', fontSize: '0.9rem', borderRadius: '6px', transition: '0.2s' }}>
                    <FiUser /> My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', color: '#334155', textDecoration: 'none', fontSize: '0.9rem', borderRadius: '6px', transition: '0.2s' }}>
                    <FiPackage /> My Orders
                  </Link>
                  <Link to="/wishlist" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', color: '#334155', textDecoration: 'none', fontSize: '0.9rem', borderRadius: '6px', transition: '0.2s' }}>
                    <FiHeart /> Wishlist
                  </Link>
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 0.6rem', width: '100%', background: 'none', border: 'none', color: '#cc2222', cursor: 'pointer', textAlign: 'left', marginTop: '0.3rem', borderTop: '1px solid #f1f5f9', fontSize: '0.9rem', fontWeight: '600' }}>
                    <FiLogOut /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-action">
                <FiUser />
                <span>Sign In</span>
              </Link>
              <Link to="/register" className="nav-action">
                <FiUser />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {/* Mobile Search */}
      <div className="mobile-search">
        <form className="search-box" onSubmit={handleSearch} style={{ borderRadius: '8px' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn" style={{ borderRadius: '0 8px 8px 0' }}>
            <FiSearch />
          </button>
        </form>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            {user ? (
              <div className="mobile-user-info">
                <div className="user-avatar large">{user.name?.charAt(0).toUpperCase()}</div>
                <p className="user-name">{user.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
            ) : (
              <div className="mobile-auth-btns">
                <Link to="/login" className="btn-primary" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn-outline-primary" onClick={() => setMenuOpen(false)}>Register</Link>
              </div>
            )}
            <nav className="mobile-nav-links">
              <Link to="/" onClick={() => setMenuOpen(false)}>🏠 Home</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)}>ℹ️ About Us</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>📞 Contact</Link>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>🛒 Cart ({cartCount})</Link>
              {user && <button onClick={handleLogout}>🚪 Sign Out</button>}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
