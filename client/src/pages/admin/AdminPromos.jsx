import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const AdminPromos = () => {
  const { token } = useOutletContext();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');

  useEffect(() => {
    fetchPromos();
  }, [token]);

  const fetchPromos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/promos', {
        headers: { 'x-auth-token': token }
      });
      setPromos(res.data);
    } catch (err) {
      console.error('Failed to fetch promos', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/admin/promos',
        { 
          code, 
          discountType, 
          discountValue: Number(discountValue), 
          maxUses: maxUses ? Number(maxUses) : null,
          isActive: true
        },
        { headers: { 'x-auth-token': token } }
      );
      setCode(''); setDiscountValue(''); setMaxUses('');
      fetchPromos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating promo code');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/promos/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchPromos();
    } catch (err) {
      alert('Error deleting promo code');
    }
  };

  return (
    <div className="admin-tab-content">
      
      <div className="admin-split-grid">
        <div className="form-card">
          <h3>Create Promo Code</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Promo Code (e.g. SUMMER50)</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required />
            </div>
            
            <div className="form-group">
              <label>Discount Type</label>
              <select value={discountType} onChange={e => setDiscountType(e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Discount Value</label>
              <input type="number" min="1" value={discountValue} onChange={e => setDiscountValue(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Max Uses (Leave empty for unlimited)</label>
              <input type="number" min="1" value={maxUses} onChange={e => setMaxUses(e.target.value)} />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating...' : 'Create Code'}
            </button>
          </form>
        </div>

        <div className="table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Uses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map(p => (
                <tr key={p._id}>
                  <td><strong>{p.code}</strong></td>
                  <td>{p.discountType === 'percentage' ? `${p.discountValue}%` : `₹${p.discountValue}`}</td>
                  <td>{p.currentUses} / {p.maxUses ? p.maxUses : '∞'}</td>
                  <td>
                    <span className={`status-badge ${p.isActive ? 'success' : 'pending'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(p._id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
              {promos.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No promo codes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPromos;
