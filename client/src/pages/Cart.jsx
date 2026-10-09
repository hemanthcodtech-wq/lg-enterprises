import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag, FiLock } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
const Cart = () => {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDecrease = (item) => {
    if (item.qty > 1) {
      // Logic for decrease...
    }
  };

  // Helper to parse string prices like "34,999"
  const getPrice = (price) => Number(price.toString().replace(/,/g, ''));
  const totalAmount = cart.reduce((sum, item) => sum + (getPrice(item.price) * item.qty), 0);

  const [promoCode, setPromoCode] = React.useState('');
  const [discount, setDiscount] = React.useState(0);
  const [appliedPromo, setAppliedPromo] = React.useState(null);
  const [useWallet, setUseWallet] = React.useState(false);
  const [shippingAddress, setShippingAddress] = React.useState(user?.address || '');

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    try {
      const token = localStorage.getItem('lg_token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/orders/validate-promo`, {
        code: promoCode,
        cartTotal: totalAmount
      }, {
        headers: { 'x-auth-token': token }
      });
      setDiscount(res.data.discount);
      setAppliedPromo(res.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid promo code');
      setDiscount(0);
      setAppliedPromo(null);
    }
  };

  const subTotal = totalAmount;
  const finalTotal = subTotal - discount;
  
  const walletBalance = user?.walletBalance || 0;
  const walletUsed = useWallet ? Math.min(finalTotal, walletBalance) : 0;
  const amountToPay = finalTotal - walletUsed;

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      return toast.error('Please enter your shipping address before checkout.');
    }

    try {
      const token = localStorage.getItem('lg_token');
      
      const items = cart.map(item => ({
        product: item.id,
        quantity: item.qty,
        price: item.price
      }));

      const orderData = {
        items,
        totalAmount: finalTotal,
        paymentMethod: amountToPay === 0 ? 'Wallet' : 'Card',
        promoId: appliedPromo ? appliedPromo.promoId : undefined,
        walletUsed: walletUsed,
        shippingAddress
      };

      if (amountToPay === 0) {
        // Completely paid by wallet
        await axios.post(`${import.meta.env.VITE_API_URL}/orders`, orderData, {
          headers: { 'x-auth-token': token }
        });
        toast.success('Order placed successfully using wallet balance!');
        if (clearCart) clearCart();
        navigate('/');
        return;
      }
      
      // Partial or full payment with Razorpay
      const { data: order } = await axios.post(`${import.meta.env.VITE_API_URL}/orders/create-razorpay-order`, {
        amount: amountToPay
      }, {
        headers: { 'x-auth-token': token }
      });

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onerror = () => toast.error('Razorpay SDK failed to load. Are you online?');
      script.onload = async () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TfwrOlkqXf2RIf',
          amount: order.amount,
          currency: order.currency,
          name: 'LG Enterprises',
          description: 'Order Payment',
          order_id: order.id,
          handler: async function (response) {
            try {
              await axios.post(`${import.meta.env.VITE_API_URL}/orders`, orderData, {
                headers: { 'x-auth-token': token }
              });
              toast.success('Payment Successful & Order placed!');
              if (clearCart) clearCart();
              navigate('/');
            } catch (saveErr) {
              toast.error('Payment successful but order saving failed. Please contact support.');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: { color: '#2563eb' }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      toast.error('Failed to process checkout. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="section-pad" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '4rem', color: 'var(--border)', marginBottom: '1rem' }}><FiLock /></div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Login Required</h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Please log in to view and manage your cart.</p>
        <Link to="/login" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Sign In</Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="section-pad" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '4rem', color: 'var(--border)', marginBottom: '1rem' }}><FiShoppingBag /></div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="section-pad">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ color: 'var(--text-gray)', fontSize: '1.2rem' }}><FiArrowLeft /></Link>
        Your Shopping Cart
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }} className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <img src={item.image} alt={item.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '1rem' }}>Category: <span style={{ textTransform: 'capitalize' }}>{item.category}</span></p>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{item.price}</div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ padding: '0.4rem 1rem', borderRight: '1px solid var(--border)', fontWeight: 600 }}>Qty: {item.qty}</span>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', fontWeight: 600, background: 'none' }}>
                    <FiTrash2 /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary" style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', position: 'sticky', top: '100px' }}>
          
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Shipping Address</h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <textarea 
              placeholder="Enter your complete delivery address (Street, City, State, ZIP)..." 
              value={shippingAddress}
              onChange={e => setShippingAddress(e.target.value)}
              rows="3"
              style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
            ></textarea>
            <small style={{ color: 'var(--text-gray)', display: 'block', marginTop: '0.4rem' }}>This address will be saved to your profile for future orders.</small>
          </div>

          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>Order Summary</h3>
          
          {/* Promo Code Input */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Promo Code" 
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', outline: 'none' }}
            />
            <button onClick={handleApplyPromo} className="btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius)' }}>Apply</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-gray)' }}>
            <span>Subtotal ({cart.length} items)</span>
            <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>₹{subTotal}</span>
          </div>
          
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#10b981' }}>
              <span>Discount ({appliedPromo?.code})</span>
              <span style={{ fontWeight: 600 }}>-₹{discount}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-gray)' }}>
            <span>Shipping</span>
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>Free</span>
          </div>

          {walletBalance > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <input 
                type="checkbox" 
                id="useWallet" 
                checked={useWallet} 
                onChange={(e) => setUseWallet(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="useWallet" style={{ cursor: 'pointer', flex: 1, color: '#334155', fontWeight: 500 }}>
                Use Wallet Balance (Available: ₹{walletBalance.toFixed(2)})
              </label>
            </div>
          )}

          {useWallet && walletUsed > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#10b981' }}>
              <span>Paid from Wallet</span>
              <span style={{ fontWeight: 600 }}>-₹{walletUsed.toFixed(2)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 800 }}>
            <span>To Pay</span>
            <span style={{ color: 'var(--primary)' }}>₹{amountToPay.toFixed(2)}</span>
          </div>
          
          <button onClick={handleCheckout} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: 'var(--radius-pill)', marginBottom: '0.5rem' }}>
            {amountToPay === 0 ? 'Place Order' : 'Pay & Place Order'}
          </button>
        </div>
      </div>
      
      {/* Quick responsive css just for this page so it doesn't break */}
      <style>{`
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Cart;
