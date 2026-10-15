import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FiEdit2, FiTrash2, FiMessageCircle, FiCheckCircle, 
  FiRefreshCw, FiStar, FiPlus, FiX, FiSearch,
  FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search, Filter & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Hidden'
  const [ratingFilter, setRatingFilter] = useState('All'); // 'All', '5', '4', '3', '2', '1'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    role: 'Customer',
    message: '',
    rating: 5,
    isActive: true
  });
  
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/testimonials/admin`, {
        headers: { 'x-auth-token': token }
      });
      setTestimonials(res.data);
      if (showToast) toast.success('Feedbacks refreshed');
    } catch (err) {
      toast.error('Failed to load feedbacks');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleEdit = (t) => {
    setFormData({
      id: t._id,
      name: t.name,
      role: t.role || 'Customer',
      message: t.message,
      rating: t.rating || 5,
      isActive: t.isActive
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${import.meta.env.VITE_API_URL}/testimonials/${id}`, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Feedback deleted');
      fetchTestimonials();
    } catch (err) {
      toast.error('Failed to delete feedback');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        name: formData.name,
        role: formData.role,
        message: formData.message,
        rating: Number(formData.rating),
        isActive: formData.isActive
      };

      if (formData.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/testimonials/${formData.id}`, payload, {
          headers: { 'x-auth-token': token }
        });
        toast.success('Feedback updated');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/testimonials`, payload, {
          headers: { 'x-auth-token': token }
        });
        toast.success('Feedback added');
      }
      
      resetForm();
      fetchTestimonials();
    } catch (err) {
      toast.error('Failed to save feedback');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '', name: '', role: 'Customer', message: '', rating: 5, isActive: true
    });
  };

  // Filter feedbacks
  const filteredFeedbacks = useMemo(() => {
    return testimonials.filter(t => {
      const term = search.toLowerCase();
      const matchesSearch = 
        (t.name || '').toLowerCase().includes(term) ||
        (t.message || '').toLowerCase().includes(term) ||
        (t.role || '').toLowerCase().includes(term);

      const matchesStatus = 
        statusFilter === 'All' ? true :
        statusFilter === 'Active' ? t.isActive : !t.isActive;

      const matchesRating = 
        ratingFilter === 'All' ? true :
        Number(t.rating) === Number(ratingFilter);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [testimonials, search, statusFilter, ratingFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage) || 1;
  const currentFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFeedbacks.slice(start, start + itemsPerPage);
  }, [filteredFeedbacks, currentPage, itemsPerPage]);

  return (
    <div className="admin-feedbacks-page">
      <style>{`
        /* Exact match to AdminOrders typography and scale */
        .admin-feedbacks-page {
          padding-bottom: 3rem;
          color: #0f172a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .header-section {
          margin-bottom: 1.5rem;
        }
        .page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .page-title-group h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem 0;
          letter-spacing: -0.01em;
        }
        .page-title-group p {
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

        /* 2-Column Split Layout */
        .feedback-split-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 950px) {
          .feedback-split-layout {
            grid-template-columns: 1fr;
          }
        }

        /* Enterprise Card Container */
        .table-enterprise-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
          overflow: hidden;
        }

        .card-header-bar {
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .card-title-group h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .card-title-group p {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0.15rem 0 0 0;
        }

        /* Form Controls */
        .form-body-padded {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .field-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
        }
        .official-input {
          width: 100%;
          padding: 0.45rem 0.75rem;
          font-size: 0.8rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
          font-family: inherit;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .official-input:focus {
          outline: none;
          background: #ffffff;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .submit-btn-official {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.55rem 1rem;
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
        .submit-btn-official:hover:not(:disabled) {
          background: #4338ca;
          border-color: #4338ca;
        }
        .submit-btn-official:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-btn-official {
          padding: 0.55rem 1rem;
          background: #ffffff;
          color: #475569;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        .cancel-btn-official:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        /* Filter Toolbar */
        .table-filter-bar {
          padding: 0.75rem 1.25rem;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .search-field-wrapper {
          position: relative;
          min-width: 200px;
          flex: 1;
          max-width: 260px;
        }
        .search-field-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 0.85rem;
        }
        .search-field-input {
          width: 100%;
          padding: 0.45rem 2rem 0.45rem 2rem;
          font-size: 0.8rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
          box-sizing: border-box;
        }
        .search-field-input:focus {
          border-color: #4f46e5;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .search-clear-btn {
          position: absolute;
          right: 0.6rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 0.8rem;
          padding: 2px;
          display: flex;
          align-items: center;
        }

        .filter-controls-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .filter-pill {
          padding: 0.35rem 0.7rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          background: #ffffff;
          color: #64748b;
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
          font-weight: 600;
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

        .active-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }
        .inactive-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .btn-table-action {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border-radius: 6px;
          padding: 0.35rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .btn-action-edit {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
        }
        .btn-action-edit:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .btn-action-delete {
          background: #fff5f5;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .btn-action-delete:hover {
          background: #fee2e2;
          color: #b91c1c;
        }

        /* Pagination Footer */
        .table-pagination-footer {
          padding: 0.75rem 1.25rem;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .pagination-meta-info {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 1.25rem;
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
      `}</style>

      {/* Top Header & Page Actions */}
      <div className="header-section">
        <div className="page-title-row">
          <div className="page-title-group">
            <h2>Customer Feedbacks</h2>
            <p>Showcase real customer stories, verified testimonials, and store reviews on your storefront homepage.</p>
          </div>
          <div className="header-actions-group">
            <button 
              className="refresh-btn" 
              onClick={() => fetchTestimonials(true)} 
              disabled={refreshing}
              title="Refresh feedbacks"
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Form & Feedback Table */}
      <div className="feedback-split-layout">
        {/* Left Card: Add/Edit Feedback */}
        <div className="table-enterprise-card">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>{formData.id ? 'Edit Feedback' : 'New Feedback'}</h3>
              <p>Configure testimonial details and rating</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-body-padded">
            <div className="field-group">
              <label className="field-label">Customer Name *</label>
              <input 
                type="text" 
                className="official-input"
                placeholder="e.g. John Doe"
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
            </div>
            
            <div className="field-group">
              <label className="field-label">Role or Location</label>
              <input 
                type="text" 
                className="official-input"
                placeholder="e.g. Verified Buyer, Mumbai"
                value={formData.role} 
                onChange={e => setFormData({ ...formData, role: e.target.value })} 
              />
            </div>

            <div className="field-group">
              <label className="field-label">Feedback Message *</label>
              <textarea 
                className="official-input"
                rows="3"
                placeholder="Write the customer's testimonial review..."
                value={formData.message} 
                onChange={e => setFormData({ ...formData, message: e.target.value })} 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
              <div className="field-group">
                <label className="field-label">Rating (1-5) *</label>
                <input 
                  type="number" 
                  min="1" max="5" step="1"
                  className="official-input"
                  value={formData.rating} 
                  onChange={e => setFormData({ ...formData, rating: e.target.value })} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                <input 
                  type="checkbox" 
                  id="feedback-is-active"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#4f46e5', cursor: 'pointer' }}
                />
                <label htmlFor="feedback-is-active" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Show on Storefront
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              {formData.id && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="cancel-btn-official"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                disabled={saving}
                className="submit-btn-official"
                style={{ flex: 1 }}
              >
                <FiPlus />
                <span>{saving ? 'Saving...' : formData.id ? 'Update Feedback' : 'Publish Feedback'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Feedbacks Table with Filters and Pagination */}
        <div className="table-enterprise-card">
          <div className="table-filter-bar">
            <div className="search-field-wrapper">
              <FiSearch className="search-field-icon" />
              <input 
                type="text" 
                className="search-field-input" 
                placeholder="Search feedback..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              />
              {search && (
                <button className="search-clear-btn" onClick={() => setSearch('')}>
                  <FiX />
                </button>
              )}
            </div>

            <div className="filter-controls-group">
              <button 
                className={`filter-pill ${statusFilter === 'All' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('All'); setCurrentPage(1); }}
              >
                All ({testimonials.length})
              </button>
              <button 
                className={`filter-pill ${statusFilter === 'Active' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('Active'); setCurrentPage(1); }}
              >
                Active ({testimonials.filter(t => t.isActive).length})
              </button>
              <button 
                className={`filter-pill ${statusFilter === 'Hidden' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('Hidden'); setCurrentPage(1); }}
              >
                Hidden ({testimonials.filter(t => !t.isActive).length})
              </button>

              <select 
                className="filter-select-official"
                value={ratingFilter}
                onChange={e => { setRatingFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          <div className="official-table-wrapper">
            <table className="official-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Customer</th>
                  <th>Feedback Review</th>
                  <th style={{ width: '15%' }}>Visibility</th>
                  <th style={{ textAlign: 'right', width: '130px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>No customer feedback found</p>
                      <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Use the form on the left to add your first customer review</small>
                    </td>
                  </tr>
                ) : (
                  currentFeedbacks.map(t => (
                    <tr key={t._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>{t.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>{t.role}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span style={{ color: '#f59e0b', fontSize: '0.82rem', letterSpacing: '1px' }}>
                            {'★'.repeat(t.rating)}<span style={{ color: '#e2e8f0' }}>{'★'.repeat(5 - t.rating)}</span>
                          </span>
                          <span style={{ color: '#475569', fontSize: '0.78rem', lineHeight: '1.4', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            "{t.message}"
                          </span>
                        </div>
                      </td>
                      <td>
                        {t.isActive ? (
                          <span className="active-status-pill">
                            <FiCheckCircle size={11}/> Active
                          </span>
                        ) : (
                          <span className="inactive-status-pill">Hidden</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button 
                            onClick={() => handleEdit(t)} 
                            className="btn-table-action btn-action-edit"
                            title="Edit feedback"
                          >
                            <FiEdit2 /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(t._id)} 
                            className="btn-table-action btn-action-delete"
                            title="Delete feedback"
                          >
                            <FiTrash2 /> Delete
                          </button>
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
            <div className="pagination-meta-info">
              <span>
                Showing {filteredFeedbacks.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFeedbacks.length)} of {filteredFeedbacks.length} feedbacks
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Rows:</span>
                <select 
                  className="rows-select" 
                  value={itemsPerPage} 
                  onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                >
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            <div className="pagination-controls-row">
              <button 
                className="pagination-nav-btn" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                title="Previous page"
              >
                <FiChevronLeft />
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                title="Next page"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTestimonials;
