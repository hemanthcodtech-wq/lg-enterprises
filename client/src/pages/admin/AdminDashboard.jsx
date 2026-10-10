import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiShoppingBag, FiDollarSign, FiLogOut, FiMenu, FiTag, FiSettings, FiMessageSquare, FiGrid, FiList, FiBox, FiClipboard, FiImage, FiStar, FiMessageCircle } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBottomMenuOpen, setIsBottomMenuOpen] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (!storedToken) {
      navigate('/admin/login');
      return;
    }
    setToken(storedToken);
  }, [navigate]);

  const fetchStats = async () => {
    const storedToken = localStorage.getItem('adminToken');
    if (!storedToken) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard-stats`, {
        headers: { 'x-auth-token': storedToken }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      fetchStats();
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  if (!stats || !token) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '24px', height: '24px', border: '3px solid #cbd5e1', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        Loading Dashboard...
      </div>
    </div>
  );

  return (
    <div className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Overlay (Mobile) */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/logo.png" alt="LG" className="brand-logo-img" />
            {!isCollapsed && <h2>LG Admin</h2>}
          </div>
          <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? '»' : '«'}
          </button>
        </div>
        
        <div className="sidebar-profile">
          <div className="profile-avatar">A</div>
          {!isCollapsed && (
            <div className="profile-info">
              <h4>Super Admin</h4>
              <p>admin@lg.com</p>
            </div>
          )}
        </div>
        
        <nav className="sidebar-nav">
          {!isCollapsed && <div className="nav-section-title">Menu</div>}
          <NavLink to="/admin/dashboard" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <FiGrid className="nav-icon" /> {!isCollapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/admin/dashboard/categories" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <FiList className="nav-icon" /> {!isCollapsed && <span>Categories</span>}
          </NavLink>
          <NavLink to="/admin/dashboard/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <FiBox className="nav-icon" /> {!isCollapsed && <span>Products</span>}
          </NavLink>
          <NavLink to="/admin/dashboard/reviews" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <FiMessageSquare className="nav-icon" /> {!isCollapsed && <span>Product Reviews</span>}
          </NavLink>
          <NavLink to="/admin/dashboard/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <FiClipboard className="nav-icon" /> {!isCollapsed && <span>Order History</span>}
          </NavLink>
          <NavLink to="/admin/dashboard/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <FiUsers className="nav-icon" /> {!isCollapsed && <span>Users</span>}
          </NavLink>
          <NavLink to="/admin/dashboard/promos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <FiTag className="nav-icon" /> {!isCollapsed && <span>Promo Codes</span>}
          </NavLink>
          <NavLink to="/admin/dashboard/carousel" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <FiImage className="nav-icon" /> {!isCollapsed && <span>Carousel</span>}
          </NavLink>
          <NavLink to="/admin/dashboard/brands" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <FiStar className="nav-icon" /> {!isCollapsed && <span>Top Brands</span>}
          </NavLink>
          <NavLink to="/admin/dashboard/testimonials" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <FiMessageCircle className="nav-icon" /> {!isCollapsed && <span>Testimonials</span>}
          </NavLink>

          {!isCollapsed && <div className="nav-section-title" style={{ marginTop: '1rem' }}>Settings</div>}
          <NavLink to="/admin/dashboard/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <FiSettings className="nav-icon" /> {!isCollapsed && <span>Settings</span>}
          </NavLink>
          <button onClick={handleLogout} className="nav-item logout-btn">
            <FiLogOut className="nav-icon" /> {!isCollapsed && <span>Logout</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <FiMenu />
          </button>
          <div className="header-title">
            <h1 style={{ margin: 0 }}>
              {location.pathname.includes('categories') && 'Manage Categories'}
              {location.pathname.includes('products') && 'Manage Products'}
              {location.pathname.includes('users') && 'Customer Data'}
              {location.pathname.includes('orders') && 'Order History'}
              {location.pathname.includes('promos') && 'Manage Promo Codes'}
              {location.pathname.includes('carousel') && 'Manage Carousel'}
              {location.pathname.includes('brands') && 'Manage Brands'}
              {location.pathname.includes('testimonials') && 'Manage Testimonials'}
              {location.pathname.includes('reviews') && 'Product Reviews'}
              {location.pathname.includes('settings') && 'System Settings'}
              {location.pathname === '/admin/dashboard' && 'Dashboard Overview'}
              {location.pathname === '/admin/dashboard/' && 'Dashboard Overview'}
            </h1>
          </div>
          <div className="header-profile">
            <div className="profile-avatar">A</div>
            <span className="profile-name">Super Admin</span>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="admin-content-pad">
          
          <Outlet context={{ token, stats, setStats, fetchStats }} />

        </div>

        {/* Bottom Menu Popup (Mobile only) */}
        {isBottomMenuOpen && (
          <div className="bottom-menu-overlay" onClick={() => setIsBottomMenuOpen(false)}></div>
        )}
        <div className={`bottom-menu-popup ${isBottomMenuOpen ? 'show' : ''}`}>
          <NavLink to="/admin/dashboard/categories" className="popup-item" onClick={() => setIsBottomMenuOpen(false)}>
            <FiShoppingBag className="popup-icon" /> Categories
          </NavLink>
          <NavLink to="/admin/dashboard/users" className="popup-item" onClick={() => setIsBottomMenuOpen(false)}>
            <FiUsers className="popup-icon" /> Users
          </NavLink>
          <NavLink to="/admin/dashboard/promos" className="popup-item" onClick={() => setIsBottomMenuOpen(false)}>
            <FiTag className="popup-icon" /> Promo Codes
          </NavLink>
          <NavLink to="/admin/dashboard/carousel" className="popup-item" onClick={() => setIsBottomMenuOpen(false)}>
            <FiImage className="popup-icon" /> Carousel
          </NavLink>
          <NavLink to="/admin/dashboard/brands" className="popup-item" onClick={() => setIsBottomMenuOpen(false)}>
            <FiStar className="popup-icon" /> Top Brands
          </NavLink>
          <NavLink to="/admin/dashboard/testimonials" className="popup-item" onClick={() => setIsBottomMenuOpen(false)}>
            <FiMessageCircle className="popup-icon" /> Testimonials
          </NavLink>
          <NavLink to="/admin/dashboard/reviews" className="popup-item" onClick={() => setIsBottomMenuOpen(false)}>
            <FiMessageSquare className="popup-icon" /> Product Reviews
          </NavLink>
          <NavLink to="/admin/dashboard/settings" className="popup-item" onClick={() => setIsBottomMenuOpen(false)}>
            <FiSettings className="popup-icon" /> Settings
          </NavLink>
          <button onClick={() => { setIsBottomMenuOpen(false); handleLogout(); }} className="popup-item" style={{ color: '#ef4444' }}>
            <FiLogOut className="popup-icon" /> Logout
          </button>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="mobile-bottom-nav">
          <NavLink to="/admin/dashboard" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsBottomMenuOpen(false)}>
            <FiGrid className="bottom-nav-icon" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/admin/dashboard/orders" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsBottomMenuOpen(false)}>
            <FiClipboard className="bottom-nav-icon" />
            <span>Orders</span>
          </NavLink>
          <NavLink to="/admin/dashboard/products" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsBottomMenuOpen(false)}>
            <FiBox className="bottom-nav-icon" />
            <span>Products</span>
          </NavLink>
          <button className={`bottom-nav-item ${isBottomMenuOpen ? 'active' : ''}`} onClick={() => setIsBottomMenuOpen(!isBottomMenuOpen)}>
            <FiMenu className="bottom-nav-icon" />
            <span>Menu</span>
          </button>
        </div>
      </div>

      <style>{`
        /* Scoped Admin CSS */
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f1f5f9;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        /* Sidebar */
        .admin-sidebar {
          width: 280px;
          background: white;
          color: #334155;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 50;
          transition: width 0.3s ease, transform 0.3s ease;
          overflow-y: auto;
          border-right: 1px solid #e2e8f0;
        }
        .admin-layout.collapsed .admin-sidebar {
          width: 80px;
        }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .admin-layout.collapsed .sidebar-header {
          flex-direction: column;
          padding: 1rem 0.5rem;
          gap: 1rem;
        }
        
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .brand-logo-img {
          width: 40px; height: 40px;
          border-radius: 8px; 
          object-fit: contain;
        }
        .admin-layout.collapsed .brand-logo-img {
          width: 35px; height: 35px; margin: 0 auto;
        }
        .sidebar-brand h2 { font-size: 1.3rem; font-weight: 800; margin: 0; letter-spacing: -0.5px; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        .collapse-btn {
          background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 1.2rem;
        }

        .sidebar-profile {
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .admin-layout.collapsed .sidebar-profile {
          padding: 1rem 0.5rem;
          justify-content: center;
        }
        .sidebar-profile .profile-avatar {
          width: 40px; height: 40px; min-width: 40px;
          background: var(--primary-light); color: var(--primary);
          border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;
        }
        .profile-info h4 { margin: 0; font-size: 0.95rem; font-weight: 700; color: #1e293b; }
        .profile-info p { margin: 0; font-size: 0.8rem; color: #64748b; }
        
        .sidebar-nav {
          padding: 0 1rem 2rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .admin-layout.collapsed .sidebar-nav {
          padding: 0 0.5rem 2rem 0.5rem;
        }
        
        .nav-section-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 700;
          padding: 0.8rem 1rem 0.5rem 1rem;
          letter-spacing: 1px;
        }
        
        .nav-item {
          padding: 0.6rem 1rem;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .admin-layout.collapsed .nav-item {
          padding: 0.8rem 0;
          justify-content: center;
        }
        .nav-item:hover { background: var(--primary-light); color: var(--primary); }
        .nav-item.active { background: var(--primary); color: white; box-shadow: 0 4px 12px var(--primary-alpha); }
        .nav-icon { font-size: 1.1rem; min-width: 1.1rem; }
        
        .logout-btn {
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }
        .logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        /* Main Content */
        .admin-main {
          flex: 1;
          margin-left: 280px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: calc(100% - 280px);
          transition: margin-left 0.3s ease, width 0.3s ease;
        }
        .admin-layout.collapsed .admin-main {
          margin-left: 80px;
          width: calc(100% - 80px);
        }
        .admin-header {
          height: 70px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0; z-index: 40;
        }
        .menu-btn {
          display: none;
          background: none; border: none; font-size: 1.5rem; color: #0f172a; cursor: pointer;
        }
        .header-title { flex: 1; margin: 0 1rem; }
        .header-title h1 { font-size: 1.25rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .header-profile { display: flex; align-items: center; gap: 0.8rem; }
        .profile-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .profile-name { font-weight: 600; color: #334155; font-size: 0.9rem; }
        
        .mobile-bottom-nav { display: none; }

        .admin-content-pad { padding: 2.5rem; }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-bottom: 2.5rem;
        }
        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
          transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .stat-icon-wrapper {
          width: 60px; height: 60px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }
        .stat-icon { font-size: 1.8rem; }
        .stat-users .stat-icon-wrapper { background: #e0e7ff; color: #4338ca; }
        .stat-orders .stat-icon-wrapper { background: #dcfce7; color: #15803d; }
        .stat-revenue .stat-icon-wrapper { background: #fef3c7; color: #b45309; }
        
        .stat-info h3 { font-size: 0.9rem; color: #64748b; font-weight: 600; margin-bottom: 0.2rem; }
        .stat-info p { font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 0; }

        .recent-orders-section {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
        }
        .section-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;
        }
        .section-header h2 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }
        .btn-view-all { background: var(--primary-light); color: var(--primary); border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-view-all:hover { background: var(--primary); color: white; }

        .table-responsive { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { padding: 1rem; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .admin-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 0.95rem; font-weight: 500; }
        .admin-table tbody tr:hover { background: #f8fafc; }
        
        .status-badge { padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
        .status-badge.success { background: #dcfce7; color: #15803d; }
        .status-badge.pending { background: #fef3c7; color: #b45309; }

        /* Forms & Tabs */
        .admin-tab-content { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .form-card { background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
        .form-card h3 { margin-top: 0; color: #0f172a; font-size: 1.1rem; margin-bottom: 1.5rem; }
        .table-card { background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; overflow-x: auto; }
        
        .admin-form .form-group { margin-bottom: 1.5rem; }
        .admin-form label { display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
        .admin-form input, .admin-form select, .admin-form textarea { width: 100%; padding: 0.8rem 1.2rem; border-radius: 10px; border: 1.5px solid #cbd5e1; outline: none; font-size: 0.95rem; font-family: inherit; transition: border-color 0.2s; }
        .admin-form input:focus, .admin-form select:focus, .admin-form textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-alpha); }
        
        .btn-primary { background: var(--primary); color: white; border: none; padding: 0.8rem 1.8rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 0.95rem; }
        .btn-primary:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 4px 10px var(--primary-alpha); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-delete { background: #fee2e2; color: #ef4444; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: 0.2s; }
        .btn-delete:hover { background: #fca5a5; color: #b91c1c; }

        @keyframes spin { 100% { transform: rotate(360deg); } }

        .admin-split-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
        }
        .admin-stack-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        .admin-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .mobile-bottom-nav, .bottom-menu-overlay, .bottom-menu-popup {
          display: none;
        }

        /* Mobile Responsiveness */
        .sidebar-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40;
          opacity: 0; visibility: hidden; transition: 0.3s;
        }
        .sidebar-overlay.show { opacity: 1; visibility: visible; }

        @media (max-width: 900px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { margin-left: 0; width: 100%; padding-bottom: 60px; }
          .admin-header { padding: 0 1rem; }
          .header-title h1 { font-size: 1.1rem; }
          .profile-name { display: none; }
          .menu-btn { display: none; /* Hide top menu btn, use bottom bar instead */ }
          .admin-content-pad { padding: 1.5rem; }
          .stats-grid { grid-template-columns: 1fr; }
          
          .admin-split-grid {
            grid-template-columns: 1fr;
          }
          .admin-form-grid {
            grid-template-columns: 1fr;
          }
          
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: white;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
            z-index: 60;
            justify-content: space-around;
            padding: 0.5rem 0;
            border-top: 1px solid #e2e8f0;
          }
          .bottom-nav-item {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: #64748b; font-size: 0.7rem; font-weight: 600; text-decoration: none; gap: 4px;
            background: none; border: none; cursor: pointer; padding: 0.2rem 0.5rem; outline: none;
          }
          .bottom-nav-item.active { color: #4f46e5; }
          .bottom-nav-icon { font-size: 1.3rem; }
          
          /* Bottom Popup */
          .bottom-menu-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 55;
            display: block;
          }
          .bottom-menu-popup {
            display: block;
            position: fixed;
            bottom: 60px; /* Right above bottom nav */
            left: 0; right: 0;
            background: white;
            border-radius: 20px 20px 0 0;
            box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
            z-index: 60;
            padding: 1rem 0;
            transform: translateY(100%);
            visibility: hidden;
            transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            max-height: calc(100vh - 120px);
            overflow-y: auto;
          }
          .bottom-menu-popup.show {
            transform: translateY(0);
            visibility: visible;
          }
          .popup-item {
            display: flex; align-items: center; gap: 1rem;
            padding: 1rem 2rem;
            color: #334155; font-weight: 600; text-decoration: none;
            background: none; border: none; width: 100%; text-align: left;
            font-size: 1rem;
          }
          .popup-item:hover { background: #f8fafc; }
          .popup-item.active { color: #4f46e5; background: #e0e7ff; }
          .popup-icon { font-size: 1.2rem; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
