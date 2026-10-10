import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiMessageSquare } from 'react-icons/fi';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/reviews`, {
        headers: { 'x-auth-token': token }
      });
      setReviews(res.data);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId, reviewId, isApproved) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/reviews/${productId}/${reviewId}/approve`, 
      { isApproved },
      { headers: { 'x-auth-token': token } });
      
      toast.success(`Review ${isApproved ? 'approved' : 'rejected'}`);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to update review status');
    }
  };

  return (
    <div className="admin-tab-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.25rem 0', fontWeight: '800' }}>Product Reviews</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Approve or reject customer product reviews</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#94a3b8' }}>
              <FiMessageSquare size={28} />
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem' }}>No reviews yet</h4>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Customer</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Product</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Review</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(r => (
                  <tr key={r._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#3b82f6', fontWeight: 500 }}>
                      {r.product?.name}
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '300px' }}>
                      <div style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: '0.2rem' }}>
                        {'★'.repeat(r.rating)}<span style={{ color: '#e2e8f0' }}>{'★'.repeat(5 - r.rating)}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#475569' }}>"{r.comment}"</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, 
                        background: r.isApproved ? '#dcfce7' : '#fef9c3', 
                        color: r.isApproved ? '#166534' : '#854d0e',
                        border: `1px solid ${r.isApproved ? '#bbf7d0' : '#fef08a'}`
                      }}>
                        {r.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {!r.isApproved ? (
                        <button onClick={() => handleApprove(r.product._id, r._id, true)} style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', marginRight: '0.5rem' }}>
                          Approve
                        </button>
                      ) : (
                        <button onClick={() => handleApprove(r.product._id, r._id, false)} style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', marginRight: '0.5rem' }}>
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {reviews.length > itemsPerPage && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', gap: '0.5rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  style={{ padding: '0.5rem 1rem', background: currentPage === 1 ? '#f1f5f9' : '#3b82f6', color: currentPage === 1 ? '#94a3b8' : 'white', border: 'none', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                >
                  Previous
                </button>
                <span style={{ padding: '0.5rem 1rem', color: '#475569', fontWeight: 600 }}>
                  Page {currentPage} of {Math.ceil(reviews.length / itemsPerPage)}
                </span>
                <button 
                  disabled={currentPage === Math.ceil(reviews.length / itemsPerPage)}
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(reviews.length / itemsPerPage), prev + 1))}
                  style={{ padding: '0.5rem 1rem', background: currentPage === Math.ceil(reviews.length / itemsPerPage) ? '#f1f5f9' : '#3b82f6', color: currentPage === Math.ceil(reviews.length / itemsPerPage) ? '#94a3b8' : 'white', border: 'none', borderRadius: '6px', cursor: currentPage === Math.ceil(reviews.length / itemsPerPage) ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
