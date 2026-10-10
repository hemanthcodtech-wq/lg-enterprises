import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiSearch, FiShoppingCart, FiUser, FiHeart,
  FiMenu, FiX, FiLogOut, FiPackage, FiChevronDown,
  FiHome, FiInfo, FiPhone, FiCreditCard, FiGift
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, clearCart, clearWishlist } = useCart();
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
    if (clearCart) clearCart();
    if (clearWishlist) clearWishlist();
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
          <Link to="/products" className="nav-action" title="Products">
            <FiPackage />
            <span>Products</span>
          </Link>
          <Link to="/about" className="nav-action" title="About Us">
            <FiInfo />
            <span>About</span>
          </Link>
          <Link to="/contact" className="nav-action" title="Contact Us">
            <FiPhone />
            <span>Contact</span>
          </Link>
          {/* Wishlist */}
          <Link to="/wishlist" className="nav-action" title="Wishlist">
            <FiHeart />
            <span>Wishlist</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="cart-btn">
            <FiShoppingCart />
            <span>Cart</span>
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </Link>

          {/* Account */}
          {user ? (
            <div className="nav-user-menu" ref={dropdownRef} style={{ position: 'relative' }}>
              <button className="nav-action" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ background: 'none', border: 'none', padding: '0.4rem 0.7rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
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
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 0.6rem', width: '100%', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textAlign: 'left', marginTop: '0.3rem', borderTop: '1px solid #f1f5f9', fontSize: '0.9rem', fontWeight: '600' }}>
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
          <div className="mobile-menu" onClick={e => e.stopPropagation()} style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>Navigation</span>
              <button 
                onClick={() => setMenuOpen(false)} 
                style={{ background: 'none', border: 'none', fontSize: '1.35rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '4px' }}
                aria-label="Close menu"
              >
                <FiX />
              </button>
            </div>

            {user ? (
              <div className="mobile-user-info" style={{ textAlign: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                <div className="user-avatar large" style={{ margin: '0 auto 0.5rem' }}>{user.name?.charAt(0).toUpperCase()}</div>
                <p className="user-name" style={{ margin: '0 0 0.2rem 0', fontWeight: 700, color: '#0f172a' }}>{user.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>{user.email}</p>
                
                {/* Mobile Wallet Balance Chip */}
                <Link 
                  to="/profile#referrals" 
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                    color: '#1d4ed8',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    border: '1px solid #bfdbfe',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.08)'
                  }}
                >
                  <FiCreditCard /> Wallet: ₹{(user.walletBalance || 0).toFixed(2)}
                </Link>
              </div>
            ) : (
              <div className="mobile-auth-btns" style={{ marginBottom: '1rem' }}>
                <Link to="/login" className="btn-primary" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn-outline-primary" onClick={() => setMenuOpen(false)}>Register</Link>
              </div>
            )}

            <nav className="mobile-nav-links" style={{ overflowY: 'auto', flex: 1, paddingRight: '0.3rem', gap: '1rem' }}>
              {user && (
                <>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0.2rem 0 0.1rem 0' }}>
                    My Account
                  </div>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}><FiUser /> My Profile</Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)}><FiPackage /> My Orders</Link>
                  <Link to="/profile#referrals" onClick={() => setMenuOpen(false)}><FiGift /> Wallet & Referrals</Link>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)}><FiHeart /> Wishlist</Link>
                  
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '0.25rem 0' }}></div>
                </>
              )}

              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0.2rem 0 0.1rem 0' }}>
                Explore Store
              </div>
              <Link to="/" onClick={() => setMenuOpen(false)}><FiHome /> Home</Link>
              <Link to="/products" onClick={() => setMenuOpen(false)}><FiPackage /> All Products</Link>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>
                <FiShoppingCart /> Cart {cartCount > 0 && <span style={{ background: '#2563eb', color: 'white', borderRadius: '10px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', marginLeft: 'auto', fontWeight: 700 }}>{cartCount}</span>}
              </Link>
              <Link to="/about" onClick={() => setMenuOpen(false)}><FiInfo /> About Us</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)}><FiPhone /> Contact</Link>

              {user && (
                <>
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '0.4rem 0' }}></div>
                  <button onClick={handleLogout} style={{ color: '#ef4444', fontWeight: 700, padding: '0.4rem 0' }}><FiLogOut /> Sign Out</button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
