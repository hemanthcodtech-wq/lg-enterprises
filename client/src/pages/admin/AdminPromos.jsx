import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FiTag, FiPlus, FiTrash2, FiGift, FiSearch, 
  FiRefreshCw, FiX, FiCheckCircle, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';

const AdminPromos = () => {
  const { token } = useOutletContext();
  const [promos, setPromos] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Inactive'
  const [typeFilter, setTypeFilter] = useState('All'); // 'All', 'percentage', 'fixed'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxUses, setMaxUses] = useState('');

  const fetchPromos = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/promos`, {
        headers: { 'x-auth-token': token }
      });
      setPromos(res.data);
      if (showToast) toast.success('Promo codes refreshed');
    } catch (err) {
      console.error('Failed to fetch promos', err);
      toast.error('Failed to load promo codes');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/promos`,
        { 
          code, 
          discountType, 
          discountValue: Number(discountValue), 
          minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
          maxUses: maxUses ? Number(maxUses) : null,
          isActive: true
        },
        { headers: { 'x-auth-token': token } }
      );
      toast.success('Promo code created successfully');
      setCode(''); setDiscountValue(''); setMinOrderAmount(''); setMaxUses('');
      fetchPromos();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error creating promo code');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/promos/${id}`, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Promo code deleted');
      fetchPromos();
    } catch (err) {
      toast.error('Error deleting promo code');
    }
  };

  // Filter promos
  const filteredPromos = useMemo(() => {
    return promos.filter(p => {
      const term = search.toLowerCase();
      const matchesSearch = p.code.toLowerCase().includes(term);
      const matchesStatus = 
        statusFilter === 'All' ? true :
        statusFilter === 'Active' ? p.isActive : !p.isActive;
      const matchesType = 
        typeFilter === 'All' ? true :
        p.discountType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [promos, search, statusFilter, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage) || 1;
  const currentPromos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPromos.slice(start, start + itemsPerPage);
  }, [filteredPromos, currentPage, itemsPerPage]);

  return (
    <div className="admin-promos-page">
      <style>{`
        /* Exact match to AdminOrders typography and scale */
        .admin-promos-page {
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

        .badge-count-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
        }
        .badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
        }

        /* 2-Column Split Layout */
        .promo-split-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 950px) {
          .promo-split-layout {
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
          min-width: 180px;
          flex: 1;
          max-width: 240px;
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

        .promo-code-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #f8fafc;
          color: #0f172a;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 0.2rem 0.55rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .discount-badge-pill {
          display: inline-flex;
          align-items: center;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
        }
        .discount-badge-pill.pct {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }
        .discount-badge-pill.fixed {
          background: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
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
        .status-badge-chip.inactive {
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #e2e8f0;
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
            <h2>Promo Codes</h2>
            <p>Create and configure promotional discount vouchers, minimum cart thresholds, and usage caps.</p>
          </div>
          <div className="header-actions-group">
            <div className="badge-count-pill">
              <span className="badge-dot"></span>
              <span>{promos.length} PROMOS ACTIVE</span>
            </div>
            <button 
              className="refresh-btn" 
              onClick={() => fetchPromos(true)} 
              disabled={refreshing}
              title="Refresh promo vouchers"
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Form & Promos Table */}
      <div className="promo-split-layout">
        {/* Left Card: Create Promo */}
        <div className="table-enterprise-card">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>New Promo Code</h3>
              <p>Configure discount voucher rules</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-body-padded">
            <div className="field-group">
              <label className="field-label">Voucher Code *</label>
              <input 
                type="text" 
                className="official-input" 
                placeholder="e.g. SUMMER50" 
                value={code} 
                onChange={e => setCode(e.target.value.toUpperCase())} 
                required 
                style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}
              />
            </div>
            
            <div className="field-group">
              <label className="field-label">Discount Type *</label>
              <select className="official-input" value={discountType} onChange={e => setDiscountType(e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">
                Discount Value ({discountType === 'percentage' ? '%' : '₹'}) *
              </label>
              <input 
                type="number" 
                min="1" 
                className="official-input" 
                placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'} 
                value={discountValue} 
                onChange={e => setDiscountValue(e.target.value)} 
                required 
              />
            </div>

            <div className="field-group">
              <label className="field-label">Minimum Order Amount (₹)</label>
              <input 
                type="number" 
                min="0" 
                className="official-input" 
                placeholder="e.g. 1000 (0 for any order)" 
                value={minOrderAmount} 
                onChange={e => setMinOrderAmount(e.target.value)} 
              />
              <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                Cart subtotal must equal or exceed this amount to apply
              </small>
            </div>

            <div className="field-group">
              <label className="field-label">Maximum Redemptions</label>
              <input 
                type="number" 
                min="1" 
                className="official-input" 
                placeholder="e.g. 100 (Leave blank for unlimited)" 
                value={maxUses} 
                onChange={e => setMaxUses(e.target.value)} 
              />
              <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                Optional cap on total allowable customer uses
              </small>
            </div>

            <button type="submit" className="submit-btn-official" disabled={loading}>
              <FiPlus />
              <span>{loading ? 'Creating...' : 'Create Promo Code'}</span>
            </button>
          </form>
        </div>

        {/* Right Card: Promos Table with Search, Filter Pills & Pagination */}
        <div className="table-enterprise-card">
          <div className="table-filter-bar">
            <div className="search-field-wrapper">
              <FiSearch className="search-field-icon" />
              <input 
                type="text" 
                className="search-field-input" 
                placeholder="Search promo..." 
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
                All ({promos.length})
              </button>
              <button 
                className={`filter-pill ${statusFilter === 'Active' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('Active'); setCurrentPage(1); }}
              >
                Active ({promos.filter(p => p.isActive).length})
              </button>
              <button 
                className={`filter-pill ${statusFilter === 'Inactive' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('Inactive'); setCurrentPage(1); }}
              >
                Inactive ({promos.filter(p => !p.isActive).length})
              </button>

              <select 
                className="filter-select-official"
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Types</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
          </div>

          <div className="official-table-wrapper">
            <table className="official-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Voucher Code</th>
                  <th style={{ width: '20%' }}>Discount</th>
                  <th style={{ width: '18%' }}>Min. Order</th>
                  <th style={{ width: '15%' }}>Usage</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPromos.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏷️</div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>No promo codes found</p>
                      <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Create a new promo code on the left to offer customer discounts</small>
                    </td>
                  </tr>
                ) : (
                  currentPromos.map(p => (
                    <tr key={p._id}>
                      <td>
                        <span className="promo-code-tag">
                          <FiTag style={{ fontSize: '0.75rem' }} /> {p.code}
                        </span>
                      </td>
                      <td>
                        <span className={`discount-badge-pill ${p.discountType === 'percentage' ? 'pct' : 'fixed'}`}>
                          {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `₹${p.discountValue?.toLocaleString('en-IN')} OFF`}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: p.minOrderAmount > 0 ? '#0f172a' : '#64748b', fontSize: '0.8rem' }}>
                          {p.minOrderAmount > 0 ? `₹${p.minOrderAmount.toLocaleString('en-IN')}+` : 'None (₹0)'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                          {p.currentUses || 0} <span style={{ color: '#94a3b8', fontWeight: 400 }}>/ {p.maxUses ? p.maxUses : '∞'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge-chip ${p.isActive ? 'active' : 'inactive'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleDelete(p._id)} className="btn-table-delete">
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
                Showing {filteredPromos.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPromos.length)} of {filteredPromos.length} codes
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

export default AdminPromos;
