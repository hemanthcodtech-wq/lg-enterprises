import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FiImage, FiPlus, FiTrash2, FiTag, FiSearch, FiCheck, 
  FiX, FiChevronLeft, FiChevronRight, FiRefreshCw, FiInfo 
} from 'react-icons/fi';

const AdminBrands = () => {
  const { token } = useOutletContext();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({ name: '', image: null });
  
  // Filtering & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const fetchBrands = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/brands/admin`, {
        headers: { 'x-auth-token': token }
      });
      setBrands(res.data);
      if (showToast) toast.success('Brands refreshed');
    } catch (err) {
      console.error('Failed to fetch brands', err);
      toast.error('Failed to load brands');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchBrands();
  }, [token]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('image', formData.image);

      await axios.post(`${import.meta.env.VITE_API_URL}/brands`, data, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Brand saved successfully');
      setFormData({ name: '', image: null });
      if (document.getElementById('brand-image')) document.getElementById('brand-image').value = '';
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error adding brand');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/brands/${id}`, { headers: { 'x-auth-token': token } });
      toast.success('Brand removed');
      fetchBrands();
    } catch (err) {
      toast.error('Error deleting brand');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/brands/${id}/toggle`, {}, { headers: { 'x-auth-token': token } });
      toast.success('Brand status updated');
      fetchBrands();
    } catch (err) {
      toast.error('Error updating brand status');
    }
  };

  const filteredBrands = useMemo(() => {
    return brands.filter(brand => {
      const matchesSearch = brand.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' 
        ? true 
        : statusFilter === 'Active' ? brand.isActive : !brand.isActive;
      return matchesSearch && matchesStatus;
    });
  }, [brands, search, statusFilter]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage) || 1;
  const currentBrands = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBrands.slice(start, start + itemsPerPage);
  }, [filteredBrands, currentPage, itemsPerPage]);

  return (
    <div className="admin-brands-page">
      <style>{`
        /* Exact match to AdminOrders typography and scale */
        .admin-brands-page {
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
        .brands-split-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 950px) {
          .brands-split-layout {
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

        /* Modern Brand Cards Grid */
        .brands-grid-container {
          padding: 1.25rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 1rem;
        }
        .brand-tile-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
        }
        .brand-tile-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
        }
        .brand-logo-area {
          width: 100%;
          height: 110px;
          object-fit: contain;
          background: #f8fafc;
          padding: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
          box-sizing: border-box;
        }
        .brand-body-area {
          padding: 0.75rem 0.85rem;
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brand-name-title {
          font-weight: 600;
          color: #0f172a;
          font-size: 0.82rem;
          margin: 0;
        }
        .brand-status-chip {
          font-size: 0.68rem;
          font-weight: 600;
          padding: 0.15rem 0.45rem;
          border-radius: 999px;
        }
        .brand-status-chip.active {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }
        .brand-status-chip.inactive {
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }
        .brand-footer-actions {
          padding: 0.5rem 0.85rem;
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn-brand-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .btn-brand-toggle:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .btn-brand-delete {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          border: 1px solid #fecaca;
          background: #fff5f5;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .btn-brand-delete:hover {
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
            <h2>Brand Partners</h2>
            <p>Upload and manage brand partner logos highlighted in the storefront brand carousel.</p>
          </div>
          <div className="header-actions-group">
            <button 
              className="refresh-btn" 
              onClick={() => fetchBrands(true)} 
              disabled={refreshing}
              title="Refresh brands"
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Form & Brands Grid */}
      <div className="brands-split-layout">
        {/* Left Card: Add Brand */}
        <div className="table-enterprise-card">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>Add New Brand</h3>
              <p>Upload partner logo and brand identifier</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-body-padded">
            <div className="field-group">
              <label className="field-label">Brand Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="e.g. Samsung, LG, Sony" 
                className="official-input" 
                required 
              />
            </div>
            
            <div className="field-group">
              <label className="field-label">Brand Logo (Cloudinary) *</label>
              <input 
                type="file" 
                name="image" 
                id="brand-image" 
                onChange={handleChange} 
                accept="image/*"
                className="official-input file-upload-input" 
                required
              />
              <div className="aspect-ratio-notice">
                <FiInfo style={{ fontSize: '0.95rem', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Recommended Ratio:</strong> 3:2 or 1:1 (e.g. 300×150 px or 200×200 px transparent PNG) with good contrast.</span>
              </div>
            </div>

            <button type="submit" className="submit-btn-official" disabled={loading}>
              <FiPlus />
              <span>{loading ? 'Uploading Brand...' : 'Save Brand Partner'}</span>
            </button>
          </form>
        </div>

        {/* Right Card: Brands Directory */}
        <div className="table-enterprise-card">
          <div className="table-filter-bar">
            <div className="search-field-wrapper">
              <FiSearch className="search-field-icon" />
              <input 
                type="text" 
                placeholder="Search brands..." 
                className="search-field-input"
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
                All ({brands.length})
              </button>
              <button 
                className={`filter-pill ${statusFilter === 'Active' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('Active'); setCurrentPage(1); }}
              >
                Active ({brands.filter(b => b.isActive).length})
              </button>
              <button 
                className={`filter-pill ${statusFilter === 'Inactive' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('Inactive'); setCurrentPage(1); }}
              >
                Hidden ({brands.filter(b => !b.isActive).length})
              </button>
            </div>
          </div>

          {filteredBrands.length === 0 ? (
            <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏷️</div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>No brands found</p>
              <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Upload a new brand logo on the left to display on the storefront</small>
            </div>
          ) : (
            <>
              <div className="brands-grid-container">
                {currentBrands.map(brand => (
                  <div key={brand._id} className="brand-tile-card">
                    <img src={brand.imageUrl} alt={brand.name} className="brand-logo-area" />
                    <div className="brand-body-area">
                      <h4 className="brand-name-title">{brand.name}</h4>
                      <span className={`brand-status-chip ${brand.isActive ? 'active' : 'inactive'}`}>
                        {brand.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <div className="brand-footer-actions">
                      <button 
                        onClick={() => handleToggleStatus(brand._id)} 
                        className="btn-brand-toggle"
                        title="Toggle visibility"
                      >
                        {brand.isActive ? <FiCheck /> : <FiX />} {brand.isActive ? 'Visible' : 'Hidden'}
                      </button>
                      <button 
                        onClick={() => handleDelete(brand._id)} 
                        className="btn-brand-delete"
                        title="Delete brand"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBrands.length > 0 && (
                <div className="table-pagination-footer">
                  <div className="pagination-meta-info" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <span>
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBrands.length)} of {filteredBrands.length} brands
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>Cards per page:</span>
                      <select 
                        className="rows-select" 
                        style={{ padding: '0.15rem 0.4rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#f8fafc', fontSize: '0.75rem', color: '#334155', cursor: 'pointer', outline: 'none' }}
                        value={itemsPerPage} 
                        onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      >
                        <option value={6}>6</option>
                        <option value={8}>8</option>
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                      </select>
                    </div>
                  </div>
                  <div className="pagination-controls-row">
                    <button
                      className="pagination-nav-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
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
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      title="Next page"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBrands;
