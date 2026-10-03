import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPackage, FiClock, FiCheckCircle } from 'react-icons/fi';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('lg_token');
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await axios.get('http://localhost:5000/api/orders/myorders', {
          headers: { 'x-auth-token': token }
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="section-pad" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Login Required</h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Please log in to view your orders.</p>
        <Link to="/login" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Sign In</Link>
      </div>
    );
  }

  return (
    <div className="section-pad" style={{ maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
      <h2 className="section-title">My Orders</h2>
      
      {loading ? (
        <p>Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <FiPackage style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1rem' }} />
          <h3>No Orders Yet</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Looks like you haven't placed any orders.</p>
          <Link to="/" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order._id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.3rem 0' }}>Order ID: {order._id}</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', margin: '0 0 0.3rem 0' }}>₹{order.totalAmount}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dcfce7', color: '#16a34a', padding: '0.3rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700' }}>
                    <FiCheckCircle /> {order.status || 'Processing'}
                  </span>
                </div>
              </div>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '0.8rem', color: '#334155' }}>Items ({order.items?.length || 0}):</p>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', minWidth: '150px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: '0 0 0.3rem 0', color: '#334155' }}>Product ID: {item.product}</p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.2rem 0' }}>Qty: {item.quantity}</p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>₹{item.price} each</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
