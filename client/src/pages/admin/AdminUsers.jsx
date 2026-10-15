import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FiSearch, FiChevronLeft, FiChevronRight, FiUsers, 
  FiUserCheck, FiShield, FiDownload, FiRefreshCw, FiX,
  FiArrowUpRight
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const AdminUsers = () => {
  const { token } = useOutletContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchUsers = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: { 'x-auth-token': token }
      });
      setUsers(res.data);
      if (showToast) {
        toast.success('User records refreshed');
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
      toast.error('Failed to load user accounts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Executive metrics computation
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const customerCount = users.filter(u => u.role !== 'admin').length;
    const totalWallet = users.reduce((sum, u) => sum + (u.walletBalance || 0), 0);
    return { totalUsers, adminCount, customerCount, totalWallet };
  }, [users]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        (u.name || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        (u.referralCode || '').toLowerCase().includes(term);
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  
  // Reset to page 1 if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, itemsPerPage]);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Referral Code', 'Wallet Balance (INR)', 'Referred By', 'Joined Date'];
    const csvRows = [headers.join(',')];

    filteredUsers.forEach(u => {
      const row = [
        `"${(u.name || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        u.role || 'user',
        u.referralCode || '',
        (u.walletBalance || 0).toFixed(2),
        `"${(u.referredBy?.name || '').replace(/"/g, '""')}"`,
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `LG_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
    toast.success('Customer CSV exported successfully');
  };

  return (
    <div className="admin-users-page">
      <style>{`
        /* Exact match to AdminOrders typography, layout, and font-scale */
        .admin-users-page {
          padding-bottom: 3rem;
          color: #0f172a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Top Header & Page Actions */
        .users-header-section {
          margin-bottom: 1.5rem;
        }
        .users-page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .users-page-title-group h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem 0;
          letter-spacing: -0.01em;
        }
        .users-page-title-group p {
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
        .metric-icon-bubble.purple { background: #f5f3ff; color: #7c3aed; }
        .metric-icon-bubble.amber { background: #fffbeb; color: #d97706; }

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

        /* Unified Table Enterprise Card */
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
          max-width: 300px;
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

        .role-badge {
          display: inline-block;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .role-badge.admin {
          background: #f5f3ff;
          color: #6d28d9;
          border: 1px solid #ddd6fe;
        }
        .role-badge.user {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .ref-code-tag {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #334155;
        }

        .wallet-amount-figure {
          font-weight: 600;
          font-size: 0.8rem;
          white-space: nowrap;
        }
        .wallet-amount-figure.positive {
          color: #059669;
        }
        .wallet-amount-figure.zero {
          color: #64748b;
        }

        .view-details-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.3rem 0.6rem;
          background: transparent;
          color: #475569;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-family: inherit;
        }
        .view-details-action-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
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
          .users-page-title-row {
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
      <div className="users-header-section">
        <div className="users-page-title-row">
          <div className="users-page-title-group">
            <h2>User & Customer Accounts</h2>
            <p>Manage customer profiles, account security, referral commissions, and wallet balances.</p>
          </div>
          <div className="header-actions-group">
            <button 
              className="refresh-btn" 
              onClick={() => fetchUsers(true)} 
              disabled={refreshing}
              title="Refresh customer records"
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="export-btn-official" onClick={exportToCSV} title="Export customer accounts to CSV">
              <FiDownload size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="metrics-grid-official">
          <div className="metric-card-official">
            <div className="metric-icon-bubble blue">
              <FiUsers />
            </div>
            <div className="metric-details">
              <span className="metric-title">Total Accounts</span>
              <span className="metric-value">{metrics.totalUsers}</span>
            </div>
          </div>

          <div className="metric-card-official">
            <div className="metric-icon-bubble green">
              <FiUserCheck />
            </div>
            <div className="metric-details">
              <span className="metric-title">Active Customers</span>
              <span className="metric-value">{metrics.customerCount}</span>
            </div>
          </div>

          <div className="metric-card-official">
            <div className="metric-icon-bubble purple">
              <FiShield />
            </div>
            <div className="metric-details">
              <span className="metric-title">Administrators</span>
              <span className="metric-value">{metrics.adminCount}</span>
            </div>
          </div>

          <div className="metric-card-official">
            <div className="metric-icon-bubble amber">
              <FaRupeeSign />
            </div>
            <div className="metric-details">
              <span className="metric-title">Wallet Liabilities</span>
              <span className="metric-value">₹{metrics.totalWallet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
              { id: 'All', label: 'All Accounts', count: metrics.totalUsers },
              { id: 'user', label: 'Customers', count: metrics.customerCount },
              { id: 'admin', label: 'Admins', count: metrics.adminCount }
            ].map(f => (
              <button
                key={f.id}
                className={`filter-pill ${roleFilter === f.id ? 'active' : ''}`}
                onClick={() => { setRoleFilter(f.id); setCurrentPage(1); }}
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
                placeholder="Search name, email, or code..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="search-field-clear" onClick={() => setSearchTerm('')}>
                  <FiX size={14} />
                </button>
              )}
            </div>

            <select
              value={itemsPerPage}
              onChange={e => setItemsPerPage(Number(e.target.value))}
              className="filter-select-official"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
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
                <th>Role</th>
                <th>Referral Code</th>
                <th style={{ textAlign: 'right' }}>Wallet Balance</th>
                <th>Referred By</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Loading user accounts...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: '#64748b' }}>
                    <FiUsers size={36} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>No accounts match your criteria</div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                      Try adjusting the search query or role filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className="customer-avatar">
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>

                    <td>
                      {u.referralCode ? (
                        <span className="ref-code-tag">{u.referralCode}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <span className={`wallet-amount-figure ${u.walletBalance > 0 ? 'positive' : 'zero'}`}>
                        ₹{Number(u.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.8rem', color: u.referredBy?.name ? '#334155' : '#94a3b8' }}>
                        {u.referredBy?.name || '—'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="view-details-action-btn"
                        onClick={() => navigate(`/admin/dashboard/users/${u._id}`)}
                      >
                        <span>Details</span>
                        <FiArrowUpRight size={13} />
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
          <div className="pagination-meta">
            <span>
              Showing <strong>{filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</strong> of{' '}
              <strong>{filteredUsers.length}</strong> accounts
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

export default AdminUsers;
