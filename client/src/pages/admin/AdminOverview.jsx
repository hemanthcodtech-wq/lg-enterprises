import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUsers, FiShoppingBag, FiBox, 
  FiArrowRight, FiCheckCircle, FiClock, FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const AdminOverview = () => {
  const context = useOutletContext() || {};
  const { stats: outletStats, setStats: setOutletStats } = context;
  const navigate = useNavigate();

  const [stats, setStats] = useState(outletStats || null);
  const [loading, setLoading] = useState(!outletStats);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchLiveStats = useCallback(async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('adminToken') || context?.token;
      if (!token) return;

      const res = await axios.get('http://localhost:5000/api/admin/dashboard-stats', {
        headers: { 'x-auth-token': token }
      });
      setStats(res.data);
      if (setOutletStats) {
        setOutletStats(res.data);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch live stats from server:', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [context?.token, setOutletStats]);

  useEffect(() => {
    fetchLiveStats();
  }, [fetchLiveStats]);

  // Keep local stats synced if outletStats updates externally
  useEffect(() => {
    if (outletStats && !stats) {
      setStats(outletStats);
      setLoading(false);
    }
  }, [outletStats, stats]);

  if (loading && !stats) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid rgba(79, 70, 229, 0.2)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }}></div>
        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Fetching live MongoDB analytics...</p>
      </div>
    );
  }

  const currentStats = stats || outletStats || {
    revenue: 0,
    ordersCount: 0,
    usersCount: 0,
    productsCount: 0,
    recentOrders: []
  };

  const recentOrders = currentStats.recentOrders || [];

  return (
    <div className="admin-tab-content">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning-icon {
          animation: spin 0.8s linear infinite;
        }

        .admin-tab-content {
          position: relative;
          min-height: 100%;
        }
        .ambient-glow-1 {
          position: absolute;
          top: 20px;
          right: 5%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.16) 0%, rgba(79, 70, 229, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(60px);
        }
        .ambient-glow-2 {
          position: absolute;
          top: 360px;
          left: 3%;
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(236, 72, 153, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(60px);
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
          transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .glass-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%);
          pointer-events: none;
          z-index: 0;
        }

        .stats-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }

        .stat-card-glass {
          padding: 1.8rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .stat-card-glass:hover {
          transform: translateY(-6px);
          box-shadow: 
            0 20px 35px -8px rgba(79, 70, 229, 0.15),
            0 1px 4px rgba(15, 23, 42, 0.04),
            inset 0 1px 2px 0 rgba(255, 255, 255, 1);
        }

        .stat-icon-box {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }
        .stat-icon-box.revenue {
          background: rgba(79, 70, 229, 0.12);
          color: #4f46e5;
          border: 1px solid rgba(79, 70, 229, 0.25);
        }
        .stat-icon-box.orders {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }
        .stat-icon-box.users {
          background: rgba(14, 165, 233, 0.12);
          color: #0284c7;
          border: 1px solid rgba(14, 165, 233, 0.25);
        }
        .stat-icon-box.products {
          background: rgba(245, 158, 11, 0.12);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.25);
        }

        .stat-data {
          position: relative;
          z-index: 1;
        }
        .stat-data h3 {
          margin: 0 0 0.3rem 0;
          font-size: 0.85rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .stat-data p {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .btn-refresh-stats {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #4f46e5;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 0.55rem 1.15rem;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
        }
        .btn-refresh-stats:hover:not(:disabled) {
          background: #4338ca;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.4);
        }
        .btn-refresh-stats:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .recent-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }
        .recent-table th {
          background: rgba(248, 250, 252, 0.7);
          color: #475569;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 1rem 1.4rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }
        .recent-table td {
          padding: 1.1rem 1.4rem;
          border-bottom: 1px solid rgba(241, 245, 249, 0.8);
          color: #1e293b;
          font-size: 0.92rem;
          vertical-align: middle;
          transition: background 0.2s ease;
        }
        .recent-table tr:hover td {
          background: rgba(255, 255, 255, 0.6);
        }
        .recent-table tr:last-child td {
          border-bottom: none;
        }

        .btn-view-all {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(79, 70, 229, 0.08);
          color: #4f46e5;
          border: 1px solid rgba(79, 70, 229, 0.2);
          border-radius: 10px;
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-view-all:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
        }

        .order-id-badge {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          background: rgba(241, 245, 249, 0.8);
          color: #334155;
          border: 1px solid #e2e8f0;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 700;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
        }
        .status-pill.delivered {
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
          border: 1px solid rgba(16, 185, 129, 0.28);
        }
        .status-pill.processing {
          background: rgba(14, 165, 233, 0.12);
          color: #0369a1;
          border: 1px solid rgba(14, 165, 233, 0.28);
        }
        .status-pill.pending {
          background: rgba(245, 158, 11, 0.12);
          color: #b45309;
          border: 1px solid rgba(245, 158, 11, 0.28);
        }
        .status-pill.cancelled {
          background: rgba(239, 68, 68, 0.12);
          color: #b91c1c;
          border: 1px solid rgba(239, 68, 68, 0.28);
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Header section with live database indicator & refresh button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '0.5rem', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.25rem 0', fontWeight: '800', letterSpacing: '-0.5px' }}>Dashboard Overview</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            Real-time business performance, revenue and fulfillment metrics • Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 1rem', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.22)', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#4f46e5', letterSpacing: '0.3px' }}>
              LIVE MONGODB CONNECTED
            </span>
          </div>

          <button 
            className="btn-refresh-stats"
            onClick={fetchLiveStats}
            disabled={refreshing}
            title="Fetch real-time data from database"
          >
            <FiRefreshCw className={refreshing ? 'spinning-icon' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Live Stats Cards Grid */}
      <div className="stats-grid-modern">
        {/* Total Revenue with Indian Rupee Icon */}
        <div className="glass-card stat-card-glass">
          <div className="stat-icon-box revenue">
            <FaRupeeSign />
          </div>
          <div className="stat-data">
            <h3>Total Revenue</h3>
            <p>₹{Number(currentStats.revenue || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
        
        {/* Total Orders */}
        <div className="glass-card stat-card-glass">
          <div className="stat-icon-box orders">
            <FiShoppingBag />
          </div>
          <div className="stat-data">
            <h3>Total Orders</h3>
            <p>{currentStats.ordersCount ?? 0}</p>
          </div>
        </div>

        {/* Customers */}
        <div className="glass-card stat-card-glass">
          <div className="stat-icon-box users">
            <FiUsers />
          </div>
          <div className="stat-data">
            <h3>Customers</h3>
            <p>{currentStats.usersCount ?? 0}</p>
          </div>
        </div>

        {/* Live Products */}
        <div className="glass-card stat-card-glass">
          <div className="stat-icon-box products">
            <FiBox />
          </div>
          <div className="stat-data">
            <h3>Live Products</h3>
            <p>{currentStats.productsCount ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Real Recent Orders Section */}
      <div className="glass-card" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '1.5rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>Recent Customer Orders</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>Latest purchases placed on your store</p>
          </div>
          <button className="btn-view-all" onClick={() => navigate('/admin/dashboard/orders')}>
            View All Orders <FiArrowRight />
          </button>
        </div>

        <div style={{ overflowX: 'auto', position: 'relative', zIndex: 1 }}>
          <table className="recent-table">
            <thead>
              <tr>
                <th style={{ width: '16%' }}>Order ID</th>
                <th style={{ width: '28%' }}>Customer</th>
                <th style={{ width: '16%' }}>Amount</th>
                <th style={{ width: '15%' }}>Payment</th>
                <th style={{ width: '15%' }}>Fulfillment</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id}>
                  <td>
                    <span className="order-id-badge">
                      #{order._id ? order._id.substring(order._id.length - 8).toUpperCase() : 'ORD'}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {order.user?.name || 'Customer'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                        {order.user?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: order.paymentStatus === 'Completed' ? '#047857' : '#b45309' }}>
                      {order.paymentMethod || 'Online'} • {order.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${order.status?.toLowerCase() || 'pending'}`}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Today'}
                  </td>
                </tr>
              ))}

              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛍️</div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem', color: '#475569' }}>No orders placed yet</p>
                    <small style={{ color: '#94a3b8' }}>Orders made on your store will appear live here in real time</small>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
