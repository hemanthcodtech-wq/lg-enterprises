import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const AdminOrders = () => {
  const { token } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/orders', {
        headers: { 'x-auth-token': token }
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { 'x-auth-token': token } }
      );
      fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    }
    setUpdatingId(null);
  };

  return (
    <div className="admin-tab-content">
      
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Order Status</th>
              <th>Payment Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id}>
                <td><small style={{ color: '#64748b' }}>{o._id.substring(o._id.length - 8)}</small></td>
                <td>
                  <strong>{o.user?.name || 'Unknown'}</strong><br/>
                  <small style={{ color: '#64748b' }}>{o.user?.email || 'N/A'}</small>
                </td>
                <td>{o.items.length} items</td>
                <td><strong>₹{o.totalAmount}</strong></td>
                <td>
                  <select 
                    value={o.status}
                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    disabled={updatingId === o._id}
                    style={{
                      padding: '0.3rem 0.5rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: o.status === 'Delivered' ? '#dcfce7' : o.status === 'Pending' ? '#fef3c7' : '#f1f5f9',
                      color: o.status === 'Delivered' ? '#15803d' : o.status === 'Pending' ? '#b45309' : '#334155',
                      fontWeight: 700,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${o.paymentStatus === 'Completed' ? 'success' : 'pending'}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
