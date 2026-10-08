import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const AdminWithdrawals = () => {
  const { token } = useOutletContext();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, [token]);

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/withdrawals`, {
        headers: { 'x-auth-token': token }
      });
      setWithdrawals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    const note = prompt('Add an optional note (e.g. Transaction ID):');
    if (note === null) return; // cancelled
    
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/withdrawals/${id}/status`, { status, adminNote: note }, {
        headers: { 'x-auth-token': token }
      });
      alert('Withdrawal status updated!');
      fetchWithdrawals();
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div className="admin-tab-content">
      <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Withdrawal Requests</h2>
      
      <div className="table-card" style={{ overflowX: 'auto', borderRadius: '16px' }}>
        <table className="admin-table" style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map(w => (
              <tr key={w._id}>
                <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                <td>
                  <strong>{w.user?.name}</strong><br/>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{w.user?.email}</span>
                </td>
                <td style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{w.amount.toFixed(2)}</td>
                <td><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>{w.method}</span></td>
                <td style={{ maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-all', fontSize: '0.85rem' }}>{w.details}</td>
                <td>
                  <span className={`status-badge ${w.status === 'Approved' ? 'success' : w.status === 'Rejected' ? 'cancelled' : 'pending'}`}>
                    {w.status}
                  </span>
                  {w.adminNote && <div style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0 0' }}>Note: {w.adminNote}</div>}
                </td>
                <td>
                  {w.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => updateStatus(w._id, 'Approved')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Approve</button>
                      <button onClick={() => updateStatus(w._id, 'Rejected')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Reject</button>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Processed</span>
                  )}
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No withdrawal requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminWithdrawals;
