import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AdminUsers = () => {
  const { token } = useOutletContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  
  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
          headers: { 'x-auth-token': token }
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, [token]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.referralCode?.toLowerCase().includes(term);
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

  return (
    <div className="admin-tab-content">
      <style>{`
        .table-responsive-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          width: 100%;
          border-radius: 16px;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        .admin-table th, .admin-table td {
          padding: 1rem;
        }
        .admin-filters-bar {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          align-items: center;
          background: white;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .search-wrapper {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          flex: 1;
          min-width: 200px;
        }
        .search-wrapper input {
          border: none;
          background: transparent;
          outline: none;
          padding-left: 0.5rem;
          width: 100%;
        }
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
          background: white;
          border-top: 1px solid #f1f5f9;
        }
      `}</style>
      
      <div className="admin-filters-bar">
        <div className="search-wrapper">
          <FiSearch color="#64748b" />
          <input 
            type="text" 
            placeholder="Search by name, email, or ref code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select 
          style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      <div className="table-card table-responsive-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Ref. Code</th>
              <th>Wallet Bal.</th>
              <th>Referred By</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(u => (
              <tr key={u._id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>
                  <span className={`status-badge ${u.role === 'admin' ? 'success' : 'pending'}`}>
                    {u.role}
                  </span>
                </td>
                <td><span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{u.referralCode || 'N/A'}</span></td>
                <td style={{ color: '#10b981', fontWeight: 'bold' }}>₹{u.walletBalance?.toFixed(2) || '0.00'}</td>
                <td>{u.referredBy ? u.referredBy.name : '-'}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => navigate(`/admin/dashboard/users/${u._id}`)} style={{ padding: '0.5rem 1.2rem', whiteSpace: 'nowrap', background: 'rgba(59, 130, 246, 0.9)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.3s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>View Details</button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>No customers match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {filteredUsers.length > 0 && (
          <div className="pagination-container">
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <FiChevronLeft />
              </button>
              <span style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminUsers;
