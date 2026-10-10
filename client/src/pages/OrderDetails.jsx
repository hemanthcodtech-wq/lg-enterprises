import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiCheck, FiTruck, FiPackage, FiArrowLeft, FiDownload, FiPhoneCall, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const handleSubmitReview = async (productId) => {
    if (!reviewForm.comment.trim()) return toast.error('Please write a review comment');
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('lg_token');
      await axios.post(`${import.meta.env.VITE_API_URL}/products/${productId}/reviews`, 
        { ...reviewForm, name: user.name }, 
        { headers: { 'x-auth-token': token } }
      );
      toast.success('Review submitted successfully! Waiting for admin approval.');
      setReviewingProduct(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

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

  const handleUpdateStatus = async (action, providedRefundDetails = '') => {
    if (action !== 'update_refund' && !window.confirm(`Are you sure you want to ${action} this order?`)) return;

    let refundDetails = providedRefundDetails;
    if (action !== 'update_refund' && (order.paymentStatus === 'Completed' || (order.paymentMethod && order.paymentMethod.toLowerCase() !== 'cash on delivery' && order.paymentMethod.toLowerCase() !== 'cod'))) {
      refundDetails = window.prompt("Since this is a paid order, please enter your UPI ID or Bank Details to receive your refund:");
      if (refundDetails === null) return; // User cancelled prompt
      if (!refundDetails.trim()) {
        toast.error("Refund details are required to process the refund.");
        return;
      }
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('lg_token');
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/orders/${id}/status`, { action, refundDetails }, {
        headers: { 'x-auth-token': token }
      });
      setOrder(res.data);
      if (action === 'update_refund') {
        toast.success("Refund details saved successfully");
      } else {
        toast.success(`Order ${action === 'cancel' ? 'cancelled' : 'returned'} successfully`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body { font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; background-color: #f8fafc; }
            .invoice-box { max-width: 800px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); font-size: 16px; background: #fff; border-radius: 8px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 40px; }
            .header-left { display: flex; align-items: center; gap: 15px; }
            .logo-img { max-height: 70px; width: auto; object-fit: contain; }
            .company-info { display: flex; flex-direction: column; }
            .company-name { font-size: 26px; font-weight: 800; color: #1e3a8a; margin: 0; letter-spacing: -0.5px; }
            .company-tagline { font-size: 14px; color: #64748b; margin: 5px 0 0 0; }
            .header-right { text-align: right; }
            .invoice-title { font-size: 36px; font-weight: 800; color: #3b82f6; margin: 0 0 15px 0; letter-spacing: 2px; }
            .invoice-meta { font-size: 14px; color: #475569; }
            .details-container { display: flex; justify-content: space-between; margin-bottom: 40px; gap: 20px; }
            .details-section { width: 48%; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9; }
            .section-title { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
            .details-text { margin: 6px 0; font-size: 15px; color: #334155; }
            .details-strong { font-weight: bold; color: #0f172a; font-size: 16px; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .invoice-table th { background-color: #f1f5f9; color: #475569; font-weight: bold; text-align: left; padding: 14px 15px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #cbd5e1; }
            .invoice-table td { padding: 16px 15px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 15px; }
            .invoice-table td.qty { text-align: center; }
            .invoice-table td.amount, .invoice-table th.amount { text-align: right; }
            .totals-container { width: 50%; float: right; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9; }
            .totals-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; color: #475569; }
            .totals-row:last-child { border-bottom: none; }
            .totals-row.grand-total { font-weight: bold; font-size: 20px; color: #1e3a8a; border-bottom: none; border-top: 2px solid #1e3a8a; padding-top: 15px; margin-top: 5px; }
            .footer { clear: both; text-align: center; margin-top: 60px; padding-top: 25px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px; }
            .footer p { margin: 6px 0; }
            .thank-you { font-weight: bold; color: #1e3a8a; font-size: 16px; margin-bottom: 12px !important; }
            @page { margin: 0; }
            @media print {
              body { padding: 20mm; background-color: white; -webkit-print-color-adjust: exact; }
              .invoice-box { box-shadow: none; border: none; max-width: 100%; padding: 0; }
              .details-section, .totals-container { background: #f8fafc !important; }
              .invoice-table th { background-color: #f1f5f9 !important; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div class="header-left">
                <img src="${window.location.origin}/logo.png" alt="LG Enterprises Logo" class="logo-img" onerror="this.style.display='none'" />
                <div class="company-info">
                  <h2 class="company-name">LG Enterprises</h2>
                  <p class="company-tagline">Pan-India E-commerce Delivery</p>
                </div>
              </div>
              <div class="header-right">
                <h1 class="invoice-title">INVOICE</h1>
                <div class="invoice-meta">
                  <p style="margin: 0 0 5px 0;"><strong>Invoice No:</strong> INV-${order._id.substring(order._id.length - 8).toUpperCase()}</p>
                  <p style="margin: 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>

            <div class="details-container">
              <div class="details-section">
                <div class="section-title">Billed To</div>
                <p class="details-text details-strong">${user?.name || 'Customer'}</p>
                <p class="details-text">${user?.email || ''}</p>
                <p class="details-text">${user?.phone || ''}</p>
              </div>
              <div class="details-section">
                <div class="section-title">Shipping Address</div>
                <p class="details-text" style="line-height: 1.6;">${order.shippingAddress || user?.address || 'No address provided'}</p>
              </div>
            </div>

            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th class="qty">Qty</th>
                  <th>Unit Price</th>
                  <th class="amount">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td><strong>${item.product?.name || 'Product'}</strong></td>
                    <td class="qty">${item.quantity}</td>
                    <td>₹${item.price?.toLocaleString()}</td>
                    <td class="amount">₹${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals-container">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>₹${order.totalAmount?.toLocaleString()}</span>
              </div>
              <div class="totals-row">
                <span>Payment Method:</span>
                <span style="text-transform: capitalize;">${order.paymentMethod}</span>
              </div>
              <div class="totals-row grand-total">
                <span>Total Paid:</span>
                <span>₹${order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div class="footer">
              <p class="thank-you">Thank you for your business!</p>
              <p>This is a computer-generated document and does not require a physical signature.</p>
              <p>For support, contact support@lgenerprises.com | +91 98765 43210</p>
            </div>
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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(order.status === 'Pending' || order.status === 'Processing') && (
            <button disabled={updating} onClick={() => handleUpdateStatus('cancel')} className="btn-primary" style={{ background: '#ef4444' }}>
              {updating ? '...' : 'Cancel Order'}
            </button>
          )}
          {order.status === 'Delivered' && (
            ((new Date() - new Date(order.updatedAt)) / (1000 * 60 * 60 * 24) <= 7) ? (
              <button disabled={updating} onClick={() => handleUpdateStatus('return')} className="btn-primary" style={{ background: '#f59e0b' }}>
                {updating ? '...' : 'Return Order'}
              </button>
            ) : (
              <div style={{ background: '#fef3c7', color: '#b45309', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                Return window closed
              </div>
            )
          )}
          <button onClick={handleDownloadInvoice} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#334155' }}>
            <FiDownload /> Download Invoice
          </button>
        </div>
      </div>

      {(order.status === 'Cancelled' || order.status === 'Returned') && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontWeight: 'bold' }}>This order has been {order.status.toLowerCase()}.</div>
          
          {(order.paymentStatus === 'Completed' || (order.paymentMethod && order.paymentMethod.toLowerCase() !== 'cash on delivery' && order.paymentMethod.toLowerCase() !== 'cod')) && (
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#991b1b' }}>Refund Details</h4>
              {order.refundDetails ? (
                <p style={{ margin: 0, color: '#450a0a', fontWeight: '500' }}>Your provided details: {order.refundDetails}</p>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" id="refundInput" placeholder="Enter UPI ID or Bank Details for refund" style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #fca5a5', minWidth: '250px', outline: 'none' }} />
                  <button disabled={updating} onClick={() => {
                    const val = document.getElementById('refundInput').value;
                    if (!val) return toast.error('Please enter details');
                    handleUpdateStatus('update_refund', val);
                  }} className="btn-primary" style={{ background: '#ef4444', padding: '0.5rem 1rem' }}>Submit Details</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
              <div key={idx} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', flexWrap: 'wrap' }}>
                <img 
                  src={item.product?.images?.[0] || 'https://via.placeholder.com/80'} 
                  alt={item.product?.name} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
                />
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h4 style={{ fontSize: '1rem', margin: '0 0 0.3rem 0', color: '#334155' }}>{item.product?.name}</h4>
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', margin: '0 0 0.3rem 0' }}>Qty: {item.quantity}</p>
                  <p style={{ fontWeight: '800', color: 'var(--primary)', margin: 0 }}>₹{item.price}</p>
                </div>
                {order.status === 'Delivered' && !item.product?.reviews?.some(r => r.user === (user.id || user._id)) && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button 
                      onClick={() => setReviewingProduct(item.product?._id)} 
                      style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)', transition: '0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#4338ca'}
                      onMouseOut={e => e.currentTarget.style.background = '#4f46e5'}
                    >
                      <span style={{ color: '#fbbf24', fontSize: '1rem' }}>★</span> Rate & Review
                    </button>
                  </div>
                )}
                {order.status === 'Delivered' && item.product?.reviews?.some(r => r.user === (user.id || user._id)) && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ background: '#f1f5f9', color: '#64748b', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiCheck /> Reviewed
                    </div>
                  </div>
                )}
                {reviewingProduct === item.product?._id && (
                  <div style={{ width: '100%', marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Review {item.product?.name}</h5>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })} style={{ background: 'none', border: 'none', color: reviewForm.rating >= star ? '#fbbf24' : '#cbd5e1', fontSize: '1.5rem', cursor: 'pointer', padding: 0 }}>
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea 
                      placeholder="Write your review here..."
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '0.5rem', minHeight: '60px', resize: 'vertical' }}
                    ></textarea>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button disabled={submittingReview} onClick={() => handleSubmitReview(item.product?._id)} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>{submittingReview ? 'Submitting...' : 'Submit Review'}</button>
                      <button onClick={() => setReviewingProduct(null)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}>Cancel</button>
                    </div>
                  </div>
                )}
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
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontWeight: 'bold' }}>Shipping Address:</p>
              <p style={{ margin: 0, color: '#334155', lineHeight: 1.5 }}>
                {order.shippingAddress || user?.address || 'No address provided'}
              </p>
            </div>
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
