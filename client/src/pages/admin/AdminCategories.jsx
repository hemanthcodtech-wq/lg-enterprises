import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FiTag, FiFolder, FiPlus, FiTrash2, FiLayers, 
  FiRefreshCw, FiSearch, FiInfo, FiX, FiCheckCircle, FiClock,
  FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';

const AdminCategories = () => {
  const { token } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('active');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'active', 'coming_soon'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(res.data);
      if (showToast) toast.success('Categories refreshed');
    } catch (err) {
      console.error('Failed to fetch categories', err);
      toast.error('Failed to load categories');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('description', description);
      formData.append('status', status);
      if (image) {
        formData.append('image', image);
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/categories`,
        formData,
        { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('Category created successfully');
      setName('');
      setSlug('');
      setDescription('');
      setImage(null);
      setStatus('active');
      const fileInput = document.getElementById('category-banner-image');
      if (fileInput) fileInput.value = '';
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error creating category');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'coming_soon' : 'active';
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/categories/${id}/status`,
        { status: newStatus },
        { headers: { 'x-auth-token': token } }
      );
      toast.success(`Category marked as ${newStatus === 'active' ? 'Active' : 'Coming Soon'}`);
      fetchCategories();
    } catch (err) {
      toast.error('Error updating category status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Category removed');
      fetchCategories();
    } catch (err) {
      toast.error('Error deleting category');
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = categories.length;
    const active = categories.filter(c => c.status !== 'coming_soon').length;
    const comingSoon = categories.filter(c => c.status === 'coming_soon').length;
    return { total, active, comingSoon };
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.slug.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = 
        statusFilter === 'All' ? true :
        statusFilter === 'active' ? c.status !== 'coming_soon' :
        c.status === 'coming_soon';
      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const currentCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  return (
    <div className="admin-categories-page">
      <style>{`
        /* Exact match to AdminOrders typography and scale */
        .admin-categories-page {
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
        .category-split-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 950px) {
          .category-split-layout {
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
          flex-wrap: wrap;
          gap: 0.5rem;
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

        .status-toggle-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        .status-choice-btn {
          padding: 0.45rem 0.65rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .status-choice-btn.active-choice {
          border: 1px solid #10b981;
          background: #ecfdf5;
          color: #065f46;
        }
        .status-choice-btn.coming-choice {
          border: 1px solid #f59e0b;
          background: #fffbeb;
          color: #b45309;
        }
        .status-choice-btn.inactive {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
        }

        .file-upload-input {
          padding: 0.4rem 0.5rem;
          font-size: 0.78rem;
        }
        .file-upload-input::file-selector-button {
          background: #4f46e5;
          color: #ffffff;
          border: none;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          margin-right: 0.65rem;
          transition: background 0.2s ease;
        }
        .file-upload-input::file-selector-button:hover {
          background: #4338ca;
        }

        .aspect-ratio-notice {
          padding: 0.5rem 0.75rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          font-size: 0.72rem;
          color: #1e40af;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          line-height: 1.4;
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
          width: 100%;
        }
        .submit-btn-official:hover:not(:disabled) {
          background: #4338ca;
          border-color: #4338ca;
        }
        .submit-btn-official:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          min-width: 220px;
          flex: 1;
          max-width: 300px;
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

        .cat-thumb-box {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          color: #64748b;
          flex-shrink: 0;
        }

        .cat-slug-tag {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.5rem;
          background: #f8fafc;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
        }
        .status-badge-chip.active {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }
        .status-badge-chip.coming {
          background: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
        }

        .btn-status-switch {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 2px 7px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .btn-status-switch:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .btn-table-delete {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid #fecaca;
          background: #fff5f5;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .btn-table-delete:hover {
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
            <h2>Category Management</h2>
            <p>Organize products into hierarchical groupings, active catalogs, and upcoming launches.</p>
          </div>
          <div className="header-actions-group">
            <button 
              className="refresh-btn" 
              onClick={() => fetchCategories(true)} 
              disabled={refreshing}
              title="Refresh categories"
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Form on Left, Table on Right */}
      <div className="category-split-layout">
        {/* Left Card: Add Category */}
        <div className="table-enterprise-card">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>Add Category</h3>
              <p>Create a new product classification</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-body-padded">
            <div className="field-group">
              <label className="field-label">Category Name *</label>
              <input 
                type="text" 
                className="official-input"
                placeholder="e.g. OLED Televisions, Refrigerators"
                value={name} 
                onChange={e => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                }} 
                required 
              />
            </div>

            <div className="field-group">
              <label className="field-label">Slug Identifier *</label>
              <input 
                type="text" 
                className="official-input"
                placeholder="e.g. oled-televisions"
                value={slug} 
                onChange={e => setSlug(e.target.value)} 
                required 
              />
              <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                URL path: /products?category={slug || 'slug'}
              </small>
            </div>

            <div className="field-group">
              <label className="field-label">Description</label>
              <textarea 
                className="official-input"
                placeholder="Category summary for headers and SEO..."
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows="2"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Category Status *</label>
              <div className="status-toggle-row">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`status-choice-btn ${status === 'active' ? 'active-choice' : 'inactive'}`}
                >
                  <FiCheckCircle /> Live (Active)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('coming_soon')}
                  className={`status-choice-btn ${status === 'coming_soon' ? 'coming-choice' : 'inactive'}`}
                >
                  <FiClock /> Coming Soon
                </button>
              </div>
              <small style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.2rem' }}>
                {status === 'coming_soon' 
                  ? 'Displays preview banner with "Coming Soon" notification badge on storefront' 
                  : 'Live immediately for browsing and shopping'}
              </small>
            </div>

            <div className="field-group">
              <label className="field-label">Banner Image (Cloudinary)</label>
              <input 
                type="file" 
                id="category-banner-image"
                className="official-input file-upload-input"
                accept="image/*"
                onChange={e => setImage(e.target.files[0])} 
              />
              <div className="aspect-ratio-notice">
                <FiInfo style={{ fontSize: '0.95rem', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Recommended Ratio:</strong> 16:9 or 4:3 (e.g. 1200×675 px or 800×600 px) for high-definition category banners.</span>
              </div>
            </div>

            <button type="submit" className="submit-btn-official" disabled={loading}>
              <FiPlus />
              <span>{loading ? 'Creating...' : 'Create Category'}</span>
            </button>
          </form>
        </div>

        {/* Right Card: Directory List with Filters and Pagination */}
        <div className="table-enterprise-card">
          <div className="table-filter-bar">
            <div className="search-field-wrapper">
              <FiSearch className="search-field-icon" />
              <input 
                type="text" 
                className="search-field-input" 
                placeholder="Search categories..." 
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
                All ({categories.length})
              </button>
              <button 
                className={`filter-pill ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
              >
                Live ({metrics.active})
              </button>
              <button 
                className={`filter-pill ${statusFilter === 'coming_soon' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('coming_soon'); setCurrentPage(1); }}
              >
                Coming Soon ({metrics.comingSoon})
              </button>
            </div>
          </div>

          <div className="official-table-wrapper">
            <table className="official-table">
              <thead>
                <tr>
                  <th style={{ width: '38%' }}>Category</th>
                  <th style={{ width: '25%' }}>Slug</th>
                  <th style={{ width: '22%' }}>Status</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>No categories found</p>
                      <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Create a new category on the left to start organizing products</small>
                    </td>
                  </tr>
                ) : (
                  currentCategories.map(cat => (
                    <tr key={cat._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="cat-thumb-box" />
                          ) : (
                            <div className="cat-thumb-box">
                              <FiFolder />
                            </div>
                          )}
                          <div>
                            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem', display: 'block' }}>
                              {cat.name}
                            </span>
                            {cat.description && (
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {cat.description.substring(0, 32)}{cat.description.length > 32 ? '...' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="cat-slug-tag">
                          /{cat.slug}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`status-badge-chip ${cat.status === 'coming_soon' ? 'coming' : 'active'}`}>
                            {cat.status === 'coming_soon' ? '🚀 Coming Soon' : '● Live'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(cat._id, cat.status)}
                            className="btn-status-switch"
                            title="Toggle between Live and Coming Soon"
                          >
                            Switch
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleDelete(cat._id)} className="btn-table-delete">
                          <FiTrash2 /> Delete
                        </button>
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
                Showing {filteredCategories.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Rows:</span>
                <select 
                  className="rows-select" 
                  value={itemsPerPage} 
                  onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                >
                  <option value={5}>5</option>
                  <option value={6}>6</option>
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

export default AdminCategories;
