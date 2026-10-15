import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FiCheckCircle, FiXCircle, FiMessageSquare, FiSearch, 
  FiDownload, FiRefreshCw, FiClock, FiStar, FiX, 
  FiChevronLeft, FiChevronRight, FiCheck
} from 'react-icons/fi';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Approved', 'Pending'
  const [ratingFilter, setRatingFilter] = useState('All'); // 'All', '5', '4', '3', '2', '1'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchReviews = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/reviews`, {
        headers: { 'x-auth-token': token }
      });
      setReviews(res.data);
      if (showToast) {
        toast.success('Reviews refreshed successfully');
      }
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (productId, reviewId, isApproved) => {
    setUpdatingId(reviewId);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/reviews/${productId}/${reviewId}/approve`, 
        { isApproved },
        { headers: { 'x-auth-token': token } }
      );
      
      toast.success(`Review ${isApproved ? 'approved' : 'rejected'}`);
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, isApproved } : r));
    } catch (err) {
      toast.error('Failed to update review status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = reviews.length;
    const approved = reviews.filter(r => r.isApproved).length;
    const pending = reviews.filter(r => !r.isApproved).length;
    const avgRating = total > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total).toFixed(1) 
      : '0.0';
    return { total, approved, pending, avgRating };
  }, [reviews]);

  // Filtering logic
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        (r.name || '').toLowerCase().includes(term) ||
        (r.comment || '').toLowerCase().includes(term) ||
        (r.product?.name || '').toLowerCase().includes(term);
      
      const matchesStatus = 
        statusFilter === 'All' ? true :
        statusFilter === 'Approved' ? r.isApproved :
        statusFilter === 'Pending' ? !r.isApproved : true;

      const matchesRating = 
        ratingFilter === 'All' ? true :
        Number(r.rating) === Number(ratingFilter);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [reviews, searchTerm, statusFilter, ratingFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage) || 1;
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(start, start + itemsPerPage);
  }, [filteredReviews, currentPage, itemsPerPage]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Customer Name', 'Product', 'Rating', 'Comment', 'Status', 'Date'];
    const csvRows = [headers.join(',')];

    filteredReviews.forEach(r => {
      const row = [
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.product?.name || '').replace(/"/g, '""')}"`,
        r.rating || 0,
        `"${(r.comment || '').replace(/"/g, '""')}"`,
        r.isApproved ? 'Approved' : 'Pending',
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `LG_Reviews_${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
    toast.success('Reviews CSV downloaded');
  };

  return (
    <div className="admin-reviews-page">
      <style>{`
        /* Exact match to AdminOrders typography and scale */
        .admin-reviews-page {
          padding-bottom: 3rem;
          color: #0f172a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Top Header & Page Actions */
        .reviews-header-section {
          margin-bottom: 1.5rem;
        }
        .reviews-page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .reviews-page-title-group h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem 0;
          letter-spacing: -0.01em;
        }
        .reviews-page-title-group p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        .header-actions-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.8rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          font-family: inherit;
        }
        .refresh-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .refresh-btn .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .export-btn-official {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.8rem;
          background: #4f46e5;
          color: #ffffff;
          border: 1px solid #4f46e5;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
          font-family: inherit;
        }
        .export-btn-official:hover {
          background: #4338ca;
          border-color: #4338ca;
        }

        /* KPI Metric Cards */
        .metrics-grid-official {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .metric-card-official {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .metric-card-official:hover {
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
          border-color: #cbd5e1;
        }
        .metric-icon-bubble {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .metric-icon-bubble.blue { background: #eff6ff; color: #2563eb; }
        .metric-icon-bubble.green { background: #ecfdf5; color: #059669; }
        .metric-icon-bubble.amber { background: #fffbeb; color: #d97706; }
        .metric-icon-bubble.yellow { background: #fefce8; color: #ca8a04; }

        .metric-title {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.15rem;
        }
        .metric-value {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        /* Table Enterprise Card */
        .table-enterprise-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
          overflow: hidden;
        }

        /* Filter Controls Bar */
        .table-filter-bar {
          padding: 0.75rem 1.25rem;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .search-field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          min-width: 200px;
          max-width: 280px;
          flex: 1;
        }
        .search-field-icon {
          position: absolute;
          left: 0.75rem;
          color: #94a3b8;
          font-size: 0.85rem;
          pointer-events: none;
        }
        .search-field-input {
          width: 100%;
          padding: 0.45rem 1.8rem 0.45rem 2.1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          font-size: 0.8rem;
          color: #0f172a;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .search-field-input:focus {
          outline: none;
          background: #ffffff;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }
        .search-field-clear {
          position: absolute;
          right: 0.7rem;
          color: #94a3b8;
          cursor: pointer;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          padding: 0.2rem;
        }

        .status-filter-pills {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-wrap: wrap;
        }
        .filter-pill {
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: inherit;
        }
        .filter-pill:hover {
          background: #f1f5f9;
          color: #334155;
        }
        .filter-pill.active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
          box-shadow: 0 1px 2px rgba(79, 70, 229, 0.2);
          font-weight: 600;
        }
        .filter-pill-badge {
          font-size: 0.65rem;
          padding: 0.05rem 0.35rem;
          border-radius: 999px;
          background: #e2e8f0;
          color: #475569;
        }
        .filter-pill.active .filter-pill-badge {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .filter-select-official {
          padding: 0.4rem 0.65rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #f8fafc;
          font-size: 0.75rem;
          color: #334155;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          font-family: inherit;
        }

        /* Modern Official Table */
        .official-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          width: 100%;
        }
        .official-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }
        .official-table th {
          background: #f8fafc;
          padding: 0.65rem 1rem;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .official-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          background: #ffffff;
          font-size: 0.8rem;
          transition: background-color 0.15s ease;
        }
        .official-table tr:last-child td {
          border-bottom: none;
        }
        .official-table tr:hover td {
          background: #f8fafc;
        }

        .customer-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.7rem;
          flex-shrink: 0;
          text-transform: uppercase;
        }

        .action-approve-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.28rem 0.6rem;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .action-approve-btn:hover {
          background: #d1fae5;
        }
        .action-reject-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.28rem 0.6rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .action-reject-btn:hover {
          background: #fee2e2;
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
          outline: none;
          font-family: inherit;
        }
        .pagination-controls-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .pagination-nav-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pagination-nav-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .pagination-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .page-pill-btn {
          min-width: 32px;
          height: 32px;
          padding: 0 0.5rem;
          border-radius: 8px;
          font-size: 0.8rem;
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
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
        }

        @media (max-width: 768px) {
          .reviews-page-title-row {
            flex-direction: column;
            align-items: stretch;
          }
          .table-filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .search-field-wrapper {
            max-width: 100%;
          }
          .table-pagination-footer {
            flex-direction: column;
            align-items: stretch;
          }
          .pagination-controls-row {
            justify-content: center;
          }
        }
      `}</style>

      {/* Top Header & Page Actions */}
      <div className="reviews-header-section">
        <div className="reviews-page-title-row">
          <div className="reviews-page-title-group">
            <h2>Product Reviews & Moderation</h2>
            <p>Review customer feedback, moderate testimonials, and verify product ratings.</p>
          </div>
          <div className="header-actions-group">
            <button 
              className="refresh-btn" 
              onClick={() => fetchReviews(true)} 
              disabled={refreshing}
              title="Refresh review records"
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="export-btn-official" onClick={exportToCSV} title="Export filtered reviews to CSV">
              <FiDownload size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="metrics-grid-official">
          <div className="metric-card-official">
            <div className="metric-icon-bubble blue">
              <FiMessageSquare />
            </div>
            <div className="metric-details">
              <span className="metric-title">Total Reviews</span>
              <span className="metric-value">{metrics.total}</span>
            </div>
          </div>

          <div className="metric-card-official">
            <div className="metric-icon-bubble green">
              <FiCheckCircle />
            </div>
            <div className="metric-details">
              <span className="metric-title">Approved Reviews</span>
              <span className="metric-value">{metrics.approved}</span>
            </div>
          </div>

          <div className="metric-card-official">
            <div className="metric-icon-bubble amber">
              <FiClock />
            </div>
            <div className="metric-details">
              <span className="metric-title">Pending Moderation</span>
              <span className="metric-value">{metrics.pending}</span>
            </div>
          </div>

          <div className="metric-card-official">
            <div className="metric-icon-bubble yellow">
              <FiStar />
            </div>
            <div className="metric-details">
              <span className="metric-title">Average Rating</span>
              <span className="metric-value">{metrics.avgRating} ★</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Table Container */}
      <div className="table-enterprise-card">
        
        {/* Table Filters & Search */}
        <div className="table-filter-bar">
          <div className="status-filter-pills">
            {[
              { id: 'All', label: 'All Reviews', count: metrics.total },
              { id: 'Approved', label: 'Approved', count: metrics.approved },
              { id: 'Pending', label: 'Pending', count: metrics.pending }
            ].map(f => (
              <button
                key={f.id}
                className={`filter-pill ${statusFilter === f.id ? 'active' : ''}`}
                onClick={() => { setStatusFilter(f.id); setCurrentPage(1); }}
              >
                <span>{f.label}</span>
                <span className="filter-pill-badge">{f.count}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-field-wrapper">
              <FiSearch className="search-field-icon" />
              <input 
                type="text" 
                className="search-field-input"
                placeholder="Search reviewer or comment..." 
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              {searchTerm && (
                <button className="search-field-clear" onClick={() => { setSearchTerm(''); setCurrentPage(1); }}>
                  <FiX size={14} />
                </button>
              )}
            </div>

            <select
              value={ratingFilter}
              onChange={e => { setRatingFilter(e.target.value); setCurrentPage(1); }}
              className="filter-select-official"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={itemsPerPage}
              onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="filter-select-official"
            >
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="official-table-wrapper">
          <table className="official-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Rating & Comment</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && reviews.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Loading reviews...
                  </td>
                </tr>
              ) : paginatedReviews.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: '#64748b' }}>
                    <FiMessageSquare size={36} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>No reviews found</div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                      Try clearing filters or search query.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedReviews.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className="customer-avatar">
                          {(r.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>{r.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.8rem' }}>
                        {r.product?.name || 'Catalog Item'}
                      </span>
                    </td>

                    <td style={{ maxWidth: '320px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                        {'★'.repeat(r.rating || 5)}
                        <span style={{ color: '#e2e8f0' }}>{'★'.repeat(Math.max(0, 5 - (r.rating || 5)))}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.35 }}>
                        "{r.comment}"
                      </div>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: r.isApproved ? '#ecfdf5' : '#fffbeb',
                        color: r.isApproved ? '#047857' : '#b45309',
                        border: `1px solid ${r.isApproved ? '#a7f3d0' : '#fde68a'}`
                      }}>
                        {r.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {!r.isApproved ? (
                          <button 
                            className="action-approve-btn"
                            disabled={updatingId === r._id}
                            onClick={() => handleApprove(r.product?._id, r._id, true)}
                          >
                            <FiCheck size={12} />
                            <span>Approve</span>
                          </button>
                        ) : (
                          <button 
                            className="action-reject-btn"
                            disabled={updatingId === r._id}
                            onClick={() => handleApprove(r.product?._id, r._id, false)}
                          >
                            <FiX size={12} />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="table-pagination-footer">
          <div className="pagination-meta">
            <span>
              Showing <strong>{filteredReviews.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * itemsPerPage, filteredReviews.length)}</strong> of{' '}
              <strong>{filteredReviews.length}</strong> reviews
            </span>
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls-row">
              <button 
                className="pagination-nav-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                title="Previous page"
              >
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-pill-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="pagination-nav-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

export default AdminReviews;
