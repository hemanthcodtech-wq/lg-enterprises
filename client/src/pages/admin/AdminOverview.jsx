import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUsers, FiShoppingBag, FiBox, 
  FiArrowRight, FiCheckCircle, FiClock, FiAlertCircle,
  FiRefreshCw, FiChevronLeft, FiChevronRight
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchLiveStats = useCallback(async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('adminToken') || context?.token;
      if (!token) return;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard-stats`, {
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
  const totalPages = Math.ceil(recentOrders.length / itemsPerPage) || 1;
  const paginatedOrders = recentOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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


        .glass-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
          position: relative;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .stats-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .stat-card-glass {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .stat-card-glass:hover {
          transform: translateY(-6px);
          box-shadow: 
            0 20px 35px -8px rgba(79, 70, 229, 0.15),
            0 1px 4px rgba(15, 23, 42, 0.04),
            inset 0 1px 2px 0 rgba(255, 255, 255, 1);
        }

        .stat-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
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
          margin: 0 0 0.15rem 0;
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .stat-data p {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .btn-refresh-stats {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #0f172a;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 0.45rem 0.8rem;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(15, 23, 42, 0.1);
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
          color: #64748b;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.65rem 1rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          white-space: nowrap;
        }
        .recent-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(241, 245, 249, 0.8);
          color: #1e293b;
          font-size: 0.8rem;
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
          gap: 0.25rem;
          background: transparent;
          color: #475569;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.3rem 0.6rem;
          font-size: 0.7rem;
          font-weight: 600;
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
          background: transparent;
          color: #334155;
          border: none;
          padding: 0;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
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

        /* Pagination Footer */
        .table-pagination-footer {
          padding: 0.8rem 1.25rem;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          border-radius: 0 0 12px 12px;
        }
        .pagination-meta {
          font-size: 0.75rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .rows-select {
          padding: 0.15rem 0.4rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: #f8fafc;
          font-size: 0.75rem;
          color: #334155;
          cursor: pointer;
        }
        .pagination-controls-row {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .pagination-nav-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          border-radius: 8px;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pagination-nav-btn:hover:not(:disabled) {
          background: #f8fafc;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .pagination-nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .page-pill-btn {
          min-width: 32px;
          height: 32px;
          padding: 0 0.5rem;
          border-radius: 8px;
          font-size: 0.825rem;
          font-weight: 600;
          border: 1px solid transparent;
          background: transparent;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .page-pill-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .page-pill-btn.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }
      `}</style>



      {/* Header section with live database indicator & refresh button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '0.25rem', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 0.15rem 0', fontWeight: '700', letterSpacing: '-0.01em' }}>Dashboard Overview</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>
            Real-time business performance, revenue and fulfillment metrics • Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', backdropFilter: 'blur(10px)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
            <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#334155', letterSpacing: '0.04em' }}>
              LIVE
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
        <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>Recent Customer Orders</h3>
            <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Latest purchases placed on your store</p>
          </div>
          <button className="btn-view-all" onClick={() => navigate('/admin/dashboard/orders')}>
            View All Orders <FiArrowRight />
          </button>
        </div>

        <div style={{ overflowX: 'auto', position: 'relative', zIndex: 1 }}>
          <table className="recent-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th style={{ textAlign: 'right' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(order => (
                <tr key={order._id}>
                  <td>
                    <span className="order-id-badge">
                      #{order._id ? order._id.substring(order._id.length - 8).toUpperCase() : 'ORD'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', flexShrink: 0 }}>
                        {(order.user?.name || 'C').charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#0f172a', fontSize: '0.8rem', lineHeight: '1.2' }}>
                          {order.user?.name || 'Customer'}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem', lineHeight: '1.2' }}>
                          {order.user?.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: order.paymentStatus === 'Completed' ? '#059669' : '#d97706' }}>
                      {order.paymentMethod || 'Online'} • {order.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${order.status?.toLowerCase() || 'pending'}`}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '0.75rem', color: '#334155', fontWeight: '500' }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
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

        {/* Enterprise Pagination Controls */}
        <div className="table-pagination-footer">
          <div className="pagination-meta">
            <span>
              Showing <strong>{recentOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * itemsPerPage, recentOrders.length)}</strong> of{' '}
              <strong>{recentOrders.length}</strong> orders
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Rows per page:</span>
              <select 
                className="rows-select" 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls-row">
              <button 
                className="pagination-nav-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                title="Previous page"
              >
                <FiChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 5) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, index, array) => {
                  if (index > 0 && array[index - 1] !== page - 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span style={{ color: '#94a3b8', padding: '0 0.2rem' }}>...</span>
                        <button 
                          className={`page-pill-btn ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  }
                  return (
                    <button 
                      key={page}
                      className={`page-pill-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })
              }

              <button 
                className="pagination-nav-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                title="Next page"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
