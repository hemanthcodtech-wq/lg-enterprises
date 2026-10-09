import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiShoppingBag, FiUsers, FiBox, FiUserPlus, FiMapPin, FiDollarSign, FiAward, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useOutletContext();
  const [data, setData] = useState({ user: null, orders: [], referredUsers: [], commissions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI States
  const [expandedOrders, setExpandedOrders] = useState({});
  const [ordersPage, setOrdersPage] = useState(1);
  const [commPage, setCommPage] = useState(1);
  const [refPage, setRefPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users/${id}/details`, {
          headers: { 'x-auth-token': token }
        });
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch user details', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, token]);

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading user details...</div>;
  if (error) return <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>{error}</div>;

  const { user, orders, referredUsers, commissions, orderCommissions = [] } = data;

  // Pagination Logic
  const paginatedOrders = orders.slice((ordersPage - 1) * itemsPerPage, ordersPage * itemsPerPage);
  const totalOrderPages = Math.ceil(orders.length / itemsPerPage);

  const paginatedComms = commissions.slice((commPage - 1) * itemsPerPage, commPage * itemsPerPage);
  const totalCommPages = Math.ceil(commissions.length / itemsPerPage);

  const paginatedRefs = referredUsers.slice((refPage - 1) * itemsPerPage, refPage * itemsPerPage);
  const totalRefPages = Math.ceil(referredUsers.length / itemsPerPage);

  const renderPagination = (currentPage, totalPages, setPage) => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={currentPage === 1}
          style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f1f5f9' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >Prev</button>
        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
          disabled={currentPage === totalPages}
          style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#f1f5f9' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
        >Next</button>
      </div>
    );
  };

  return (
    <div className="admin-tab-content">
      <style>{`
        .user-details-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .user-details-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .sticky-sidebar {
          position: sticky;
          top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .sticky-sidebar {
            position: relative;
            top: 0;
          }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 1);
          border-radius: 20px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
          padding: 1.5rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
        }
        @media (min-width: 600px) {
          .glass-card {
            padding: 2rem;
          }
        }
        .glass-card:hover {
          box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.08);
        }

        .glass-gradient-card {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(55, 48, 163, 0.95) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          box-shadow: 0 10px 25px -3px rgba(79, 70, 229, 0.4);
          padding: 1.5rem;
          color: white;
        }
        @media (min-width: 600px) {
          .glass-gradient-card {
            padding: 2rem;
          }
        }

        .order-card {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1.2rem 1.5rem;
          background: rgba(241, 245, 249, 0.6);
          border-bottom: 1px solid rgba(255, 255, 255, 0.9);
          cursor: pointer;
          backdrop-filter: blur(8px);
        }
        .order-header:hover {
          background: rgba(226, 232, 240, 0.7);
        }
        .order-header-right {
          text-align: left;
        }
        @media (min-width: 600px) {
          .order-header {
            align-items: center;
          }
          .order-header-right {
            text-align: right;
          }
        }
      `}</style>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          onClick={() => navigate('/admin/dashboard/users')}
          style={{ 
            background: 'white', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', 
            borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontWeight: 700, color: '#334155', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <FiArrowLeft /> Back
        </button>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem', fontWeight: 800 }}>User Profile</h2>
          <p style={{ margin: '0.3rem 0 0 0', color: '#64748b' }}>Detailed records and history for {user?.name}</p>
        </div>
      </div>

      <div className="user-details-grid">
        
        {/* LEFT COLUMN: Profile & Stats */}
        <div className="sticky-sidebar">
          
          {/* User Info Card */}
          <div className="glass-card">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, margin: '0 auto 1rem auto', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h3 style={{ margin: '0 0 0.3rem 0', color: '#0f172a' }}>{user?.name}</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', wordBreak: 'break-all' }}>{user?.email}</p>
              <span style={{ display: 'inline-block', marginTop: '0.8rem', background: 'rgba(241, 245, 249, 0.8)', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid rgba(0,0,0,0.05)' }}>
                {user?.role}
              </span>
            </div>
            
            <div style={{ borderTop: '1px dashed rgba(203, 213, 225, 0.6)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Joined Date</span>
                <div style={{ color: '#334155', fontWeight: 500 }}>{new Date(user?.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Phone</span>
                <div style={{ color: '#334155', fontWeight: 500 }}>{user?.phone || 'Not provided'}</div>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}><FiMapPin style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/>Delivery Address</span>
                <div style={{ color: '#334155', fontWeight: 500, lineHeight: 1.4 }}>{user?.address || 'No address saved.'}</div>
              </div>
            </div>
          </div>

          {/* Wallet & Referral Card */}
          <div className="glass-gradient-card">
            <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiAward /> Referral & Wallet</h4>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>Wallet Balance</span>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>₹{user?.walletBalance?.toLocaleString() || 0}</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Total Earned</span>
                <div style={{ fontWeight: 700 }}>₹{user?.totalReferralEarnings?.toLocaleString() || 0}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Referral Code</span>
                <div style={{ fontWeight: 700, fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{user?.referralCode}</div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: History & Records */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Detailed Order & Payment History */}
          <div className="glass-card">
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a' }}>
              <FiShoppingBag color="#4f46e5" /> Orders & Payment History <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: 400 }}>({orders.length})</span>
            </h3>
            
            {orders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <FiBox size={40} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>No orders placed yet.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {paginatedOrders.map(o => (
                    <div key={o._id} className="order-card">
                      
                      {/* Order Header (Click to toggle) */}
                      <div className="order-header" onClick={() => toggleOrder(o._id)}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Order #{o._id.substring(o._id.length - 8)}
                            {expandedOrders[o._id] ? <FiChevronUp color="#64748b" /> : <FiChevronDown color="#64748b" />}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>{new Date(o.createdAt).toLocaleString()} • {o.items.length} items</div>
                        </div>
                        <div className="order-header-right">
                          <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1.2rem' }}>₹{o.totalAmount?.toLocaleString()}</div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                            <span className={`status-badge ${o.paymentStatus === 'Completed' ? 'success' : 'pending'}`} style={{ fontSize: '0.7rem' }}>Pay: {o.paymentStatus}</span>
                            <span className={`status-badge ${o.status === 'Delivered' ? 'success' : 'pending'}`} style={{ fontSize: '0.7rem' }}>Ship: {o.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items (Toggleable) */}
                      {expandedOrders[o._id] && (
                        <div style={{ padding: '1.5rem', background: 'white' }}>
                          <h5 style={{ margin: '0 0 1rem 0', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Items Ordered</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {o.items.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
                                  {item.product?.images?.[0] ? (
                                    <img src={item.product.images[0]} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><FiBox /></div>
                                  )}
                                </div>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.product?.name || 'Unknown Product'}</div>
                                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</div>
                                </div>
                                <div style={{ fontWeight: 700, color: '#334155' }}>
                                  ₹{(item.quantity * item.price).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Commission Details for this order */}
                          {orderCommissions?.filter(c => c.order?._id === o._id).length > 0 && (
                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1' }}>
                              <h5 style={{ margin: '0 0 1rem 0', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Commissions Distributed</h5>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {orderCommissions.filter(c => c.order?._id === o._id).map((c, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div>
                                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.recipient?.name || 'Unknown User'}</span>
                                      <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '8px', background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px', color: '#4f46e5' }}>Level {c.level}</span>
                                    </div>
                                    <div style={{ fontWeight: 800, color: '#10b981' }}>+ ₹{c.commissionAmount?.toFixed(2)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {renderPagination(ordersPage, totalOrderPages, setOrdersPage)}
              </>
            )}
          </div>

          {/* Referred Customers History */}
          <div className="glass-card">
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a' }}>
              <FiUsers color="#3b82f6" /> Referred Customers <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: 400 }}>({referredUsers.length})</span>
            </h3>
            
            {referredUsers.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <FiUserPlus size={40} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>No users referred yet.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                  {paginatedRefs.map(ru => (
                    <div key={ru._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.3rem' }}>{ru.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{ru.email}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.3rem' }}>Joined</div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{new Date(ru.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination(refPage, totalRefPages, setRefPage)}
              </>
            )}
          </div>

          {/* Commissions Received History */}
          <div className="glass-card">
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a' }}>
              <FiDollarSign color="#10b981" /> Referral Commissions Received <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: 400 }}>({commissions.length})</span>
            </h3>
            
            {commissions.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>No commissions earned yet.</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 0' }}>Date</th>
                        <th>Buyer</th>
                        <th>Order Amount</th>
                        <th>Level / Rate</th>
                        <th style={{ textAlign: 'right' }}>Commission Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedComms.map(c => (
                        <tr key={c._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '12px 0', color: '#64748b' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 600, color: '#1e293b' }}>{c.buyer?.name || 'Unknown'}</td>
                          <td>₹{c.orderTotal?.toLocaleString()}</td>
                          <td><span style={{ background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>L{c.level} ({c.commissionPercent}%)</span></td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>+₹{c.commissionAmount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination(commPage, totalCommPages, setCommPage)}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
