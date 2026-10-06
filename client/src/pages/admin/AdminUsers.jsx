import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingBag, FiUsers, FiBox, FiUserPlus, FiX } from 'react-icons/fi';

const AdminUsers = () => {
  const { token } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userDetails, setUserDetails] = useState({ orders: [], referredUsers: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { 'x-auth-token': token }
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, [token]);

  const toggleUserDetails = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    setLoadingDetails(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/users/${userId}/details`, {
        headers: { 'x-auth-token': token }
      });
      setUserDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch user details', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="admin-tab-content">
      
      <div className="table-card">
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
            {users.map(u => (
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
                  <button onClick={() => toggleUserDetails(u._id)} style={{ padding: '0.5rem 1.2rem', whiteSpace: 'nowrap', background: 'rgba(59, 130, 246, 0.9)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.3s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>View Details</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Side Drawer for User Details */}
      {expandedUser && (
        <>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .drawer-overlay {
              position: fixed; top: 0; left: 0; width: 100%; height: 100%;
              background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px); z-index: 1000;
            }
            .glass-drawer {
              position: absolute; top: 0; right: 0; height: 100vh; width: 100%; max-width: 480px;
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.4) 100%);
              backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
              border-left: 1px solid rgba(255, 255, 255, 0.7);
              padding: 2.5rem; overflow-y: auto;
              box-shadow: -20px 0 60px rgba(0,0,0,0.1);
              animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @media (max-width: 500px) {
              .glass-drawer { max-width: 100%; padding: 1.5rem; }
            }
            .glass-item {
              background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.8);
              padding: 1.2rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: all 0.3s ease;
            }
            .glass-item:hover {
              transform: translateY(-2px); background: rgba(255, 255, 255, 0.95);
              box-shadow: 0 10px 25px rgba(0,0,0,0.08); border-color: white;
            }
            .empty-state {
              padding: 2.5rem 1rem; text-align: center; background: rgba(255, 255, 255, 0.4);
              border-radius: 16px; border: 2px dashed rgba(100, 116, 139, 0.2);
            }
            .drawer-close-btn {
              position: absolute; top: 1.5rem; right: 1.5rem; background: white; border: none;
              font-size: 1.5rem; width: 40px; height: 40px; border-radius: 50%; display: flex;
              align-items: center; justify-content: center; cursor: pointer; color: #64748b;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.2s ease;
            }
            .drawer-close-btn:hover {
              color: #ef4444; transform: rotate(90deg); background: #fef2f2; box-shadow: 0 6px 16px rgba(239, 68, 68, 0.15);
            }
          `}</style>
          <div className="drawer-overlay" onClick={() => setExpandedUser(null)}>
            <div className="glass-drawer" onClick={e => e.stopPropagation()}>
              <button className="drawer-close-btn" onClick={() => setExpandedUser(null)}><FiX /></button>
              <h2 style={{ marginBottom: '2.5rem', color: '#1e293b', fontSize: '1.8rem', fontWeight: '800', background: 'linear-gradient(90deg, #1e293b, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>User Details</h2>
              {loadingDetails ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading details...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                  
                  {/* Orders History */}
                  <div>
                  <h4 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiShoppingBag /> Order History <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 'normal' }}>({userDetails.orders.length})</span></h4>
                  {userDetails.orders.length === 0 ? (
                    <div className="empty-state">
                      <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#94a3b8' }}><FiBox size={40} /></span>
                      <p style={{ color: '#64748b', margin: 0, fontWeight: '500' }}>No orders placed yet.</p>
                    </div>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {userDetails.orders.map(o => (
                        <li key={o._id} className="glass-item">
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{o.items.length} items</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem', marginBottom: '0.3rem' }}>₹{o.totalAmount}</div>
                            <span className={`status-badge ${o.status === 'Delivered' ? 'success' : 'pending'}`} style={{ fontSize: '0.75rem' }}>{o.status}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Referred Users */}
                <div>
                  <h4 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiUsers /> Referred Customers <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 'normal' }}>({userDetails.referredUsers.length})</span></h4>
                  {userDetails.referredUsers.length === 0 ? (
                    <div className="empty-state">
                      <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#94a3b8' }}><FiUserPlus size={40} /></span>
                      <p style={{ color: '#64748b', margin: 0, fontWeight: '500' }}>Has not referred anyone yet.</p>
                    </div>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {userDetails.referredUsers.map(ru => (
                        <li key={ru._id} className="glass-item">
                          <div>
                            <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.3rem' }}>{ru.name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{ru.email}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>Joined</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{new Date(ru.createdAt).toLocaleDateString()}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
        </>
      )}

    </div>
  );
};

export default AdminUsers;
