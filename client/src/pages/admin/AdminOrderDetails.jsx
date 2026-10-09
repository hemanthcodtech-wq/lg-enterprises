import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiBox, FiTruck, FiPrinter, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useOutletContext();
  
  const [order, setOrder] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [trackingForm, setTrackingForm] = useState({ trackingNumber: '', courierDetails: '', status: '', paymentStatus: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/orders/${id}/details`, {
          headers: { 'x-auth-token': token }
        });
        setOrder(res.data.order);
        setCommissions(res.data.commissions);
        setTrackingForm({
          trackingNumber: res.data.order.trackingNumber || '',
          courierDetails: res.data.order.courierDetails || '',
          status: res.data.order.status || 'Pending',
          paymentStatus: res.data.order.paymentStatus || 'Pending'
        });
      } catch (err) {
        console.error('Failed to fetch order details', err);
        setError('Failed to load order data');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/orders/${id}/status`, trackingForm, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Order updated successfully!');
      // Update local state to reflect changes without full refetch
      setOrder(prev => ({
        ...prev,
        trackingNumber: trackingForm.trackingNumber,
        courierDetails: trackingForm.courierDetails,
        status: trackingForm.status,
        paymentStatus: trackingForm.paymentStatus
      }));
    } catch (err) {
      toast.error('Failed to update order details');
    } finally {
      setSaving(false);
    }
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #4f46e5; }
            h1 { margin: 0; color: #1e293b; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .box { padding: 15px; background: #f8fafc; border-radius: 8px; width: 45%; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 12px; }
            .total-row { font-weight: bold; font-size: 18px; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">LG Enterprises</div>
              <p>Pan-India E-commerce Delivery</p>
            </div>
            <div style="text-align: right;">
              <h1>INVOICE</h1>
              <p><strong>Order #:</strong> ${order._id.substring(order._id.length - 8).toUpperCase()}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="details">
            <div class="box">
              <h3>Billed To:</h3>
              <p><strong>${order.user?.name || 'Customer'}</strong></p>
              <p>${order.user?.email || 'N/A'}</p>
              <p>${order.user?.phone || 'No phone provided'}</p>
            </div>
            <div class="box">
              <h3>Shipping Address:</h3>
              <p>${order.user?.address || 'No address provided'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.product?.name || 'Product'}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td style="text-align: right;">₹${item.price * item.quantity}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" style="text-align: right; padding-top: 20px;">Total Paid (${order.paymentMethod}):</td>
                <td style="text-align: right; padding-top: 20px; color: #10b981;">₹${order.totalAmount}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated document. No signature is required.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading order details...</div>;
  if (error) return <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div className="admin-tab-content">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate('/admin/dashboard/orders')}
            style={{ 
              background: 'white', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', 
              borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontWeight: 700, color: '#334155', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <FiArrowLeft /> Back
          </button>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem', fontWeight: 800 }}>Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h2>
            <p style={{ margin: '0.3rem 0 0 0', color: '#64748b' }}>Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <button 
          onClick={handlePrintInvoice}
          style={{ 
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', padding: '0.8rem 1.5rem', 
            borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontWeight: 700, color: 'white', boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
          }}
        >
          <FiPrinter /> Print Invoice
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Items and Commissions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}><FiBox /> Items Ordered</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: idx < order.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><FiBox /></div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.product?.name || 'Unknown Product'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#334155', fontSize: '1.1rem' }}>
                    ₹{(item.quantity * item.price).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#64748b' }}>Total Amount</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {commissions.length > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>Commissions Distributed</h3>
              <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>The following uplines received commission from this order.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {commissions.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.recipient?.name || 'Unknown User'}</span>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                        {c.recipient?.email} • <span style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px', color: '#4f46e5', fontWeight: 600 }}>Level {c.level}</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1.2rem' }}>+ ₹{c.commissionAmount?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '2px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>Total Settled</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>
                  ₹{commissions.reduce((acc, curr) => acc + (curr.commissionAmount || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Settings and Tracking */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}><FiCheckCircle /> Customer Details</h3>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#1e293b' }}>{order.user?.name}</p>
            <p style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>{order.user?.email}</p>
            <p style={{ margin: '0 0 1.5rem 0', color: '#64748b' }}>{order.user?.phone || 'No phone'}</p>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
              <strong>Shipping Address:</strong><br/>
              {order.shippingAddress || order.user?.address || 'No address provided'}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}><FiTruck /> Tracking & Status</h3>
            <form onSubmit={handleUpdate}>
              
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Order Status</label>
                <select 
                  value={trackingForm.status}
                  onChange={e => setTrackingForm({ ...trackingForm, status: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, color: '#1e293b' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Payment Status</label>
                <select 
                  value={trackingForm.paymentStatus}
                  onChange={e => setTrackingForm({ ...trackingForm, paymentStatus: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, color: '#1e293b' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Courier Partner</label>
                <input 
                  type="text" 
                  value={trackingForm.courierDetails}
                  onChange={e => setTrackingForm({ ...trackingForm, courierDetails: e.target.value })}
                  placeholder="e.g., Delhivery, BlueDart"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Tracking Number</label>
                <input 
                  type="text" 
                  value={trackingForm.trackingNumber}
                  onChange={e => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                  placeholder="e.g., AWB1234567"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={saving}
                style={{ width: '100%', padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '1rem' }}
              >
                {saving ? 'Saving...' : 'Save Updates'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminOrderDetails;
