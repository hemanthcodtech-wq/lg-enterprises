import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiCheck, FiTruck, FiPackage, FiArrowLeft, FiDownload, FiPhoneCall, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('lg_token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setOrder(res.data);
      } catch (err) {
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleDownloadInvoice = () => {
    toast.success('Invoice downloaded successfully!');
    // In a real app, this would trigger a PDF download or open a new window
  };

  if (loading) return <div className="section-pad"><p>Loading order details...</p></div>;
  if (!order) return <div className="section-pad"><p>Order not found.</p><Link to="/orders">Go back</Link></div>;

  return (
    <div className="section-pad" style={{ maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-gray)', marginBottom: '2rem', fontWeight: 600 }}>
        <FiArrowLeft /> Back to Orders
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Order #{order._id.slice(-8).toUpperCase()}</h2>
          <p style={{ color: 'var(--text-gray)', marginTop: '0.5rem' }}>Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <button onClick={handleDownloadInvoice} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#334155' }}>
          <FiDownload /> Download Invoice
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#1e293b' }}>Tracking Status</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginBottom: '2rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
          <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '4px', background: '#e2e8f0', zIndex: 0 }}>
            <div style={{ height: '100%', background: 'var(--primary)', width: order.status === 'Delivered' ? '100%' : order.status === 'Shipped' ? '50%' : '10%' }}></div>
          </div>
          
          <div style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontSize: '1.2rem', border: '4px solid white', boxShadow: '0 0 0 2px var(--primary)' }}>
              <FiPackage />
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>Processing</p>
          </div>
          <div style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: order.status === 'Shipped' || order.status === 'Delivered' ? 'var(--primary)' : '#e2e8f0', color: order.status === 'Shipped' || order.status === 'Delivered' ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontSize: '1.2rem', border: '4px solid white' }}>
              <FiTruck />
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: order.status === 'Shipped' || order.status === 'Delivered' ? '#1e293b' : '#94a3b8', margin: 0 }}>Shipped</p>
          </div>
          <div style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: order.status === 'Delivered' ? 'var(--green)' : '#e2e8f0', color: order.status === 'Delivered' ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontSize: '1.2rem', border: '4px solid white' }}>
              <FiCheck />
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: order.status === 'Delivered' ? 'var(--green)' : '#94a3b8', margin: 0 }}>Delivered</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#1e293b' }}>Order Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <img 
                  src={item.product?.images?.[0] || 'https://via.placeholder.com/80'} 
                  alt={item.product?.name} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', margin: '0 0 0.3rem 0', color: '#334155' }}>{item.product?.name}</h4>
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', margin: '0 0 0.3rem 0' }}>Qty: {item.quantity}</p>
                  <p style={{ fontWeight: '800', color: 'var(--primary)', margin: 0 }}>₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px dashed #e2e8f0' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#64748b' }}>Total Paid:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-dark)' }}>₹{order.totalAmount}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1e293b' }}>Payment Information</h3>
            <p style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>Method: <strong style={{ color: '#334155' }}>{order.paymentMethod}</strong></p>
            {order.walletUsed > 0 && <p style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>Wallet Used: <strong style={{ color: '#334155' }}>₹{order.walletUsed}</strong></p>}
            <p style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>Transaction Status: <strong style={{ color: 'var(--green)' }}>Successful</strong></p>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1e293b' }}>Need Help with this Order?</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>If you have any issues with delivery, missing items, or defective products, please contact our support team immediately.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <a href="tel:+919876543210" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '600' }}><FiPhoneCall /> +91 98765 43210</a>
              <a href="mailto:support@lgenerprises.com" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '600' }}><FiMail /> support@lgenerprises.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
