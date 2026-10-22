import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FiCheck, FiTruck, FiPackage, FiArrowLeft, FiDownload, 
  FiPhoneCall, FiMail, FiClock, FiAlertCircle, FiX, FiRotateCcw 
} from 'react-icons/fi';
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

  // Return Request Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Defective or damaged product');
  const [returnNotes, setReturnNotes] = useState('');
  const [refundMethod, setRefundMethod] = useState('wallet'); // 'wallet' or 'custom'
  const [customRefundDetails, setCustomRefundDetails] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);


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

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (refundMethod === 'custom' && !customRefundDetails.trim()) {
      return toast.error('Please enter your UPI ID or Bank Account Details for the refund.');
    }
    
    setSubmittingReturn(true);
    try {
      const token = localStorage.getItem('lg_token');
      const refundInfo = refundMethod === 'wallet' 
        ? 'Instant Refund to LG Wallet' 
        : customRefundDetails.trim();
      
      const fullReason = returnNotes.trim() 
        ? `${returnReason} - ${returnNotes.trim()}`
        : returnReason;

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/orders/${id}/status`, {
        action: 'return',
        returnReason: fullReason,
        refundDetails: refundInfo
      }, {
        headers: { 'x-auth-token': token }
      });
      setOrder(res.data);
      setShowReturnModal(false);
      toast.success('Return request submitted! Our admin team will inspect the item upon receipt and process your refund.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to request return');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleUpdateStatus = async (action, providedRefundDetails = '') => {
    if (action !== 'update_refund' && !window.confirm(`Are you sure you want to ${action} this order?`)) return;

    let refundDetails = providedRefundDetails;
    if (action === 'cancel' && (order.paymentStatus === 'Completed' || (order.paymentMethod && order.paymentMethod.toLowerCase() !== 'cash on delivery' && order.paymentMethod.toLowerCase() !== 'cod'))) {
      refundDetails = window.prompt("Since this is a paid order, please enter your UPI ID or Bank Details to receive your refund:");
      if (refundDetails === null) return;
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
        toast.success(`Order ${action === 'cancel' ? 'cancelled' : 'updated'} successfully`);
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

  const deliveryDate = order?.deliveredAt 
    ? new Date(order.deliveredAt) 
    : (order?.updatedAt ? new Date(order.updatedAt) : new Date(order?.createdAt || Date.now()));
  const returnDeadline = new Date(deliveryDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const msRemaining = returnDeadline.getTime() - Date.now();
  const daysRemaining = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const isReturnEligible = order?.status === 'Delivered' && msRemaining > 0;

  return (
    <div className="section-pad" style={{ maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-gray)', marginBottom: '2rem', fontWeight: 600 }}>
        <FiArrowLeft /> Back to Orders
      </Link>

      {/* Top Header & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Order #{order._id.slice(-8).toUpperCase()}</h2>
            <span style={{ 
              fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '50px',
              background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Return Requested' ? '#ffedd5' : order.status === 'Returned' ? '#ede9fe' : order.status === 'Cancelled' ? '#fee2e2' : '#eff6ff',
              color: order.status === 'Delivered' ? '#15803d' : order.status === 'Return Requested' ? '#c2410c' : order.status === 'Returned' ? '#6d28d9' : order.status === 'Cancelled' ? '#b91c1c' : '#1d4ed8'
            }}>
              {order.status}
            </span>
          </div>
          <p style={{ color: 'var(--text-gray)', marginTop: '0.5rem' }}>Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {(order.status === 'Pending' || order.status === 'Processing') && (
            <button disabled={updating} onClick={() => handleUpdateStatus('cancel')} className="btn-primary" style={{ background: '#ef4444', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
              {updating ? '...' : 'Cancel Order'}
            </button>
          )}

          {order.status === 'Delivered' && isReturnEligible && (
            <button onClick={() => setShowReturnModal(true)} className="btn-primary" style={{ background: '#f59e0b', padding: '0.6rem 1.4rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiRotateCcw /> Request Return ({daysRemaining}d left)
            </button>
          )}

          <button onClick={handleDownloadInvoice} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#334155', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
            <FiDownload /> Download Invoice
          </button>
        </div>
      </div>

      {/* ─── 7-Day Return Notification Banner for Delivered Orders ─── */}
      {order.status === 'Delivered' && (
        isReturnEligible ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                <FiClock />
              </div>
              <div>
                <h4 style={{ margin: 0, color: '#166534', fontSize: '1rem', fontWeight: 800 }}>7-Day Return Window Active</h4>
                <p style={{ margin: '0.25rem 0 0', color: '#15803d', fontSize: '0.875rem' }}>
                  Delivered on <strong>{deliveryDate.toLocaleDateString()}</strong>. You have <strong>{daysRemaining} day(s) and {hoursRemaining} hour(s) left</strong> to request a return if unsatisfied with your items.
                </p>
              </div>
            </div>
            <button onClick={() => setShowReturnModal(true)} className="btn-primary" style={{ background: '#f59e0b', padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Return Item(s)
            </button>
          </div>
        ) : (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#64748b', fontSize: '0.875rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🔒</span>
            <span>
              Delivered on {deliveryDate.toLocaleDateString()}. The standard <strong>7-day return window expired</strong> on {returnDeadline.toLocaleDateString()}. Returns are no longer accepted for this order.
            </span>
          </div>
        )
      )}

      {/* ─── Return Requested Banner ─── */}
      {order.status === 'Return Requested' && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FiRotateCcw />
            </div>
            <h4 style={{ margin: 0, color: '#92400e', fontSize: '1.1rem', fontWeight: 800 }}>Return Requested (Awaiting Item Receipt at Warehouse)</h4>
          </div>
          <p style={{ color: '#b45309', margin: '0 0 1rem 0', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Your return request has been submitted. Please keep the item securely packaged for pickup.
            Once our admin team receives and inspects the physical item at our warehouse, <strong>the item count will be added back to inventory</strong> and <strong>your refund of ₹{order.totalAmount?.toLocaleString('en-IN')} will be repaid</strong>.
          </p>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '10px', border: '1px solid #fef3c7', fontSize: '0.85rem', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div><strong>Reason for Return:</strong> {order.returnReason || 'Product return'}</div>
            <div><strong>Refund Destination:</strong> {order.refundDetails || 'LG Wallet Balance'}</div>
            <div><strong>Requested On:</strong> {new Date(order.returnRequestedAt || order.updatedAt).toLocaleDateString()} at {new Date(order.returnRequestedAt || order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      )}

      {/* ─── Returned Banner ─── */}
      {order.status === 'Returned' && (
        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FiCheck />
            </div>
            <h4 style={{ margin: 0, color: '#5b21b6', fontSize: '1.1rem', fontWeight: 800 }}>Return Received & Full Amount Repaid</h4>
          </div>
          <p style={{ color: '#6d28d9', margin: '0 0 0.6rem 0', fontSize: '0.9rem', lineHeight: 1.5 }}>
            The returned item has been received and verified by our warehouse team. The product stock has been restored to inventory, and the full order amount of <strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong> has been repaid to your account.
          </p>
          <div style={{ fontSize: '0.825rem', color: '#7c3aed', fontWeight: 600 }}>
            Payment Status: <span style={{ color: '#059669', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>Refunded</span>
            {order.refundedAt && ` on ${new Date(order.refundedAt).toLocaleDateString()} at ${new Date(order.refundedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </div>
        </div>
      )}

      {/* ─── Cancelled Banner ─── */}
      {order.status === 'Cancelled' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.35rem' }}>This order has been cancelled.</div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#991b1b' }}>
            Stock has been restored to inventory. {order.paymentStatus === 'Refunded' ? `Refund of ₹${order.totalAmount} has been processed.` : ''}
          </p>
        </div>
      )}

      {/* ─── Tracking Status Stepper ─── */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.75rem', color: '#1e293b', fontWeight: 700 }}>Tracking Lifecycle</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', maxWidth: '800px', margin: '0 auto 1rem' }}>
          {/* Progress Bar Background */}
          <div style={{ position: 'absolute', top: '22px', left: '10%', right: '10%', height: '4px', background: '#e2e8f0', zIndex: 0 }}>
            <div style={{ 
              height: '100%', 
              background: order.status === 'Returned' ? '#7c3aed' : order.status === 'Return Requested' ? '#f59e0b' : 'var(--primary)', 
              width: (order.status === 'Returned' || order.status === 'Return Requested') ? '100%' : order.status === 'Delivered' ? '100%' : order.status === 'Shipped' ? '50%' : '15%',
              transition: 'all 0.4s ease'
            }}></div>
          </div>
          
          {/* Step 1: Processing */}
          <div style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontSize: '1.2rem', border: '4px solid white', boxShadow: '0 0 0 2px var(--primary)' }}>
              <FiPackage />
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Processing</p>
          </div>

          {/* Step 2: Shipped */}
          <div style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: ['Shipped', 'Delivered', 'Return Requested', 'Returned'].includes(order.status) ? 'var(--primary)' : '#e2e8f0', 
              color: ['Shipped', 'Delivered', 'Return Requested', 'Returned'].includes(order.status) ? 'white' : '#94a3b8', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontSize: '1.2rem', border: '4px solid white' 
            }}>
              <FiTruck />
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: ['Shipped', 'Delivered', 'Return Requested', 'Returned'].includes(order.status) ? '#1e293b' : '#94a3b8', margin: 0 }}>Shipped</p>
          </div>

          {/* Step 3: Delivered */}
          <div style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: ['Delivered', 'Return Requested', 'Returned'].includes(order.status) ? 'var(--green)' : '#e2e8f0', 
              color: ['Delivered', 'Return Requested', 'Returned'].includes(order.status) ? 'white' : '#94a3b8', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontSize: '1.2rem', border: '4px solid white' 
            }}>
              <FiCheck />
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: ['Delivered', 'Return Requested', 'Returned'].includes(order.status) ? 'var(--green)' : '#94a3b8', margin: 0 }}>Delivered</p>
          </div>

          {/* Step 4: Return Status (if requested or returned) */}
          {(order.status === 'Return Requested' || order.status === 'Returned') && (
            <div style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
              <div style={{ 
                width: '44px', height: '44px', borderRadius: '50%', 
                background: order.status === 'Returned' ? '#7c3aed' : '#f59e0b', 
                color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontSize: '1.2rem', border: '4px solid white' 
              }}>
                {order.status === 'Returned' ? <FiCheck /> : <FiRotateCcw />}
              </div>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: order.status === 'Returned' ? '#7c3aed' : '#f59e0b', margin: 0 }}>
                {order.status === 'Returned' ? 'Returned & Repaid' : 'Return Requested'}
              </p>
            </div>
          )}
        </div>

        {order.trackingNumber && (
          <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.85rem', color: '#64748b' }}>
            Courier Partner: <strong style={{ color: '#1e293b' }}>{order.courierDetails || 'Delhivery / BlueDart'}</strong> | AWB Tracking: <strong style={{ color: '#4f46e5' }}>{order.trackingNumber}</strong>
          </div>
        )}
      </div>

      {/* ─── RETURN REQUEST MODAL ─── */}
      {showReturnModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', maxWidth: '540px', width: '100%',
            padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button 
              onClick={() => setShowReturnModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <FiX size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <FiRotateCcw />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>Request Order Return</h3>
            </div>
            
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1.5rem 0' }}>
              Eligible under the <strong>7-Day Return Policy</strong> ({daysRemaining} days left). Total refund amount: <strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>.
            </p>

            <form onSubmit={handleConfirmReturn}>
              {/* Reason Selector */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Reason for Return *
                </label>
                <select 
                  value={returnReason} 
                  onChange={e => setReturnReason(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="Defective or damaged product">Defective or damaged product</option>
                  <option value="Wrong item received">Wrong item received</option>
                  <option value="Item does not match description">Item does not match description</option>
                  <option value="Quality not satisfactory">Quality not satisfactory</option>
                  <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              {/* Detailed Notes */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Additional Remarks (Optional)
                </label>
                <textarea 
                  rows={2}
                  placeholder="Provide any details about the issue..."
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Refund Method Preference */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.6rem' }}>
                  Refund Repayment Method *
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.8rem 1rem',
                    borderRadius: '10px', border: `1.5px solid ${refundMethod === 'wallet' ? '#4f46e5' : '#e2e8f0'}`,
                    background: refundMethod === 'wallet' ? '#f5f3ff' : '#f8fafc', cursor: 'pointer'
                  }}>
                    <input 
                      type="radio" 
                      name="refundMethod" 
                      checked={refundMethod === 'wallet'} 
                      onChange={() => setRefundMethod('wallet')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>Instant LG Wallet Credit (Recommended)</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                        ₹{order.totalAmount?.toLocaleString('en-IN')} added immediately to your wallet once return is received. 100% usable on orders or withdrawable to bank anytime.
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.8rem 1rem',
                    borderRadius: '10px', border: `1.5px solid ${refundMethod === 'custom' ? '#4f46e5' : '#e2e8f0'}`,
                    background: refundMethod === 'custom' ? '#f5f3ff' : '#f8fafc', cursor: 'pointer'
                  }}>
                    <input 
                      type="radio" 
                      name="refundMethod" 
                      checked={refundMethod === 'custom'} 
                      onChange={() => setRefundMethod('custom')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>Direct Bank / UPI Transfer</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                        Provide your UPI ID or Bank details for direct payout.
                      </div>
                    </div>
                  </label>
                </div>

                {refundMethod === 'custom' && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <input 
                      type="text" 
                      placeholder="e.g., yourname@okhdfcbank OR Account No, IFSC, Name"
                      value={customRefundDetails}
                      onChange={e => setCustomRefundDetails(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Policy Explainer Note */}
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, borderLeft: '3px solid #f59e0b' }}>
                <strong>Warehouse Return Inspection:</strong> After pickup, once our admin marks the return item as received at our facility, the stock count is added back to inventory and ₹{order.totalAmount} is repaid to your selected destination.
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowReturnModal(false)}
                  style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingReturn}
                  className="btn-primary"
                  style={{ background: '#f59e0b', padding: '0.75rem 1.75rem', fontWeight: 700, fontSize: '0.9rem', borderRadius: '8px', border: 'none', cursor: submittingReturn ? 'not-allowed' : 'pointer' }}
                >
                  {submittingReturn ? 'Submitting...' : 'Confirm Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


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
