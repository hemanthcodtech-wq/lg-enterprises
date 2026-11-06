import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag, FiLock, FiChevronDown, FiChevronUp, FiGift, FiMapPin } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const Cart = () => {
  const { cart, addToCart, updateQty, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Helper to parse string prices like "34,999"
  const getPrice = (price) => Number(price.toString().replace(/,/g, ''));
  const totalAmount = cart.reduce((sum, item) => sum + (getPrice(item.price) * item.qty), 0);

  const [promoCode, setPromoCode] = React.useState('');
  const [discount, setDiscount] = React.useState(0);
  const [appliedPromo, setAppliedPromo] = React.useState(null);
  const [useWallet, setUseWallet] = React.useState(false);
  const [activePromos, setActivePromos] = React.useState([]);
  const [showPromos, setShowPromos] = React.useState(false);
  const [activeReturnGift, setActiveReturnGift] = React.useState(null);

  // Structured shipping address state
  const [addressForm, setAddressForm] = React.useState(() => {
    try {
      const saved = localStorage.getItem('svr_shipping_address');
      if (saved) {
        const p = JSON.parse(saved);
        if (p && typeof p === 'object') {
          return {
            fullName: p.fullName || user?.name || '',
            phone: p.phone || user?.phone || '',
            houseNo: p.houseNo || '',
            street: p.street || '',
            landmark: p.landmark || '',
            city: p.city || '',
            state: p.state || 'Andhra Pradesh',
            pincode: p.pincode || ''
          };
        }
      }
    } catch (e) { }

    const raw = (user?.address || '').trim();
    const isPinOnly = /^\d{6}$/.test(raw);
    const pinMatch = raw.match(/\b\d{6}\b/);
    return {
      fullName: user?.name || '',
      phone: user?.phone || '',
      houseNo: isPinOnly ? '' : raw,
      street: '',
      landmark: '',
      city: '',
      state: 'Andhra Pradesh',
      pincode: isPinOnly ? raw : (pinMatch ? pinMatch[0] : '')
    };
  });

  const [addressErrors, setAddressErrors] = React.useState({});
  const [saveToProfile, setSaveToProfile] = React.useState(true);
  const [isAddressOpen, setIsAddressOpen] = React.useState(true);

  // Sync with user profile once loaded
  React.useEffect(() => {
    if (user) {
      setAddressForm(prev => {
        const raw = (user.address || '').trim();
        const isPinOnly = /^\d{6}$/.test(raw);
        const pinMatch = raw.match(/\b\d{6}\b/);
        return {
          fullName: prev.fullName || user.name || '',
          phone: prev.phone || user.phone || '',
          houseNo: prev.houseNo || (isPinOnly ? '' : raw),
          street: prev.street || '',
          landmark: prev.landmark || '',
          city: prev.city || '',
          state: prev.state || 'Andhra Pradesh',
          pincode: prev.pincode || (isPinOnly ? raw : (pinMatch ? pinMatch[0] : ''))
        };
      });
    }
  }, [user]);

  const handleAddressChange = (field, value) => {
    setAddressForm(prev => {
      const next = { ...prev, [field]: value };
      try {
        localStorage.setItem('svr_shipping_address', JSON.stringify(next));
      } catch (e) { }
      return next;
    });
    if (addressErrors[field]) {
      setAddressErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateAddress = () => {
    const errors = {};
    if (!addressForm.fullName.trim()) errors.fullName = 'Full name is required';
    const cleanPhone = (addressForm.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) errors.phone = 'Valid 10-digit phone required';
    if (!addressForm.houseNo.trim()) errors.houseNo = 'House / Flat / Building is required';
    if (!addressForm.street.trim()) errors.street = 'Street / Area is required';
    if (!addressForm.city.trim()) errors.city = 'City / Town is required';
    if (!addressForm.state.trim()) errors.state = 'State is required';
    const cleanPin = (addressForm.pincode || '').replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) errors.pincode = 'Valid 6-digit PIN code required';

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(`Please complete shipping address: ${firstError}`);
      return false;
    }
    setAddressErrors({});
    return true;
  };

  const getFormattedShippingAddress = () => {
    const parts = [
      `${addressForm.fullName.trim()} (Ph: ${addressForm.phone.trim()})`,
      addressForm.houseNo.trim(),
      addressForm.street.trim(),
      addressForm.landmark.trim() ? `Landmark: ${addressForm.landmark.trim()}` : null,
      `${addressForm.city.trim()}, ${addressForm.state.trim()} - ${addressForm.pincode.trim()}`
    ].filter(Boolean);
    return parts.join(', ');
  };

  React.useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/active-promos`);
        setActivePromos(res.data);
      } catch (err) {
        console.error('Failed to load active promos');
      }
    };
    const fetchReturnGift = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/return-gifts/active`);
        if (res.data && res.data.length > 0) {
          setActiveReturnGift(res.data[0]);
        }
      } catch (err) {
        // silent fail
      }
    };
    fetchPromos();
    fetchReturnGift();
  }, []);

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
    if (!validateAddress()) {
      return;
    }

    const formattedShippingAddress = getFormattedShippingAddress();

    try {
      const token = localStorage.getItem('lg_token');

      // If saveToProfile is selected, sync to user profile immediately
      if (saveToProfile) {
        try {
          await axios.put(`${import.meta.env.VITE_API_URL}/auth/profile`, {
            address: formattedShippingAddress,
            name: addressForm.fullName.trim() || user?.name,
            phone: addressForm.phone.trim() || user?.phone
          }, {
            headers: { 'x-auth-token': token }
          });
        } catch (profileErr) {
          // Non-blocking
        }
      }

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
        shippingAddress: formattedShippingAddress
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
          key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TwSiFXPfioWrAO',
          amount: order.amount,
          currency: order.currency,
          name: 'SVR Mart',
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
            name: addressForm.fullName.trim() || user?.name,
            email: user?.email,
            contact: addressForm.phone.trim() || user?.phone
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
      <div className="section-pad" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '420px', width: '100%', background: 'white', borderRadius: '20px', padding: '2.5rem 1.5rem', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.25rem' }}>
            <FiLock />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem' }}>Login Required</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem', maxWidth: '320px' }}>
            Please log in to your account to view saved items and proceed with your order.
          </p>
          <Link 
            to="/login" 
            className="btn-primary" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '0.75rem 2.5rem', 
              borderRadius: '999px', 
              fontWeight: 700, 
              fontSize: '0.95rem',
              width: 'auto',
              minWidth: '160px',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              flex: 'none'
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="section-pad" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '420px', width: '100%', background: 'white', borderRadius: '20px', padding: '2.5rem 1.5rem', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#f8fafc', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.25rem' }}>
            <FiShoppingBag />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem' }}>Your Cart is Empty</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem', maxWidth: '320px' }}>
            Looks like you haven't added anything to your cart yet. Explore our latest arrivals and great deals!
          </p>
          <Link 
            to="/" 
            className="btn-primary" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '0.75rem 2.5rem', 
              borderRadius: '999px', 
              fontWeight: 700, 
              fontSize: '0.95rem',
              width: 'auto',
              minWidth: '160px',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              flex: 'none'
            }}
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-pad">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ color: 'var(--text-gray)', fontSize: '1.2rem' }}><FiArrowLeft /></Link>
        Your Shopping Cart
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }} className="cart-layout">
        <div className="cart-left-col">
          {/* Collapsible Shipping Address Section Above Ordered Items */}
          <div className="cart-shipping-card">
            <div 
              onClick={() => setIsAddressOpen(!isAddressOpen)}
              className="cart-addr-header"
              style={{
                cursor: 'pointer',
                background: isAddressOpen ? '#ffffff' : '#f8fafc',
                borderBottom: isAddressOpen ? '1px solid var(--border)' : 'none',
                userSelect: 'none',
                transition: 'background 0.2s'
              }}
            >
              <div className="cart-addr-left">
                <div className="cart-addr-pin">
                  <FiMapPin />
                </div>
                <div className="cart-addr-text">
                  <div className="cart-addr-title-row">
                    <h3 className="cart-addr-title">Delivery Address</h3>
                    <span className="cart-addr-badge">Step 1</span>
                  </div>
                  {!isAddressOpen && (
                    <p className="cart-addr-preview">
                      {addressForm.fullName ? (
                        <span>Deliver to: <strong>{addressForm.fullName}</strong> {addressForm.phone ? `(${addressForm.phone})` : ''} — {[addressForm.flat, addressForm.city, addressForm.pincode].filter(Boolean).join(', ')}</span>
                      ) : (
                        <span>Add delivery address to continue</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="cart-addr-toggle">
                <span>{isAddressOpen ? 'Close' : 'Change'}</span>
                {isAddressOpen ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </div>

            {isAddressOpen && (
              <div style={{ padding: '1.25rem 1.4rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Row 1: Full Name & Mobile Number (2 Columns) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }} className="addr-2col">
                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                        <span>Full Name <span style={{ color: '#ef4444' }}>*</span></span>
                        {addressErrors.fullName && <span style={{ color: '#ef4444', fontSize: '0.68rem' }}>Required</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Recipient full name"
                        value={addressForm.fullName}
                        onChange={e => handleAddressChange('fullName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          border: addressErrors.fullName ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          background: addressErrors.fullName ? '#fef2f2' : '#f8fafc',
                          color: '#0f172a',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                        <span>Mobile Number <span style={{ color: '#ef4444' }}>*</span></span>
                        {addressErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.68rem' }}>10 digits</span>}
                      </label>
                      <div style={{ display: 'flex' }}>
                        <span style={{ padding: '0.6rem 0.65rem', background: '#f1f5f9', border: addressErrors.phone ? '1.5px solid #ef4444' : '1px solid #cbd5e1', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: '0.82rem', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center' }}>+91</span>
                        <input
                          type="tel"
                          placeholder="10-digit mobile"
                          maxLength="10"
                          value={addressForm.phone}
                          onChange={e => handleAddressChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '0.6rem 0.8rem',
                            borderRadius: '0 8px 8px 0',
                            border: addressErrors.phone ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                            fontSize: '0.85rem',
                            background: addressErrors.phone ? '#fef2f2' : '#f8fafc',
                            color: '#0f172a',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Flat / House No / Building */}
                  <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                      <span>Flat, House No., Building Name <span style={{ color: '#ef4444' }}>*</span></span>
                      {addressErrors.houseNo && <span style={{ color: '#ef4444', fontSize: '0.68rem' }}>Required</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 301, Sri Sai Residency"
                      value={addressForm.houseNo}
                      onChange={e => handleAddressChange('houseNo', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        border: addressErrors.houseNo ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        background: addressErrors.houseNo ? '#fef2f2' : '#f8fafc',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Row 3: Street / Area & Landmark */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.8rem' }} className="addr-2col">
                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                        <span>Area, Street, Locality <span style={{ color: '#ef4444' }}>*</span></span>
                        {addressErrors.street && <span style={{ color: '#ef4444', fontSize: '0.68rem' }}>Required</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Gandhi Nagar, Main Road"
                        value={addressForm.street}
                        onChange={e => handleAddressChange('street', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          border: addressErrors.street ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          background: addressErrors.street ? '#fef2f2' : '#f8fafc',
                          color: '#0f172a',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '3px', display: 'block' }}>
                        Landmark <span style={{ fontSize: '0.72rem', fontWeight: 400 }}>(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near SBI Bank"
                        value={addressForm.landmark}
                        onChange={e => handleAddressChange('landmark', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          background: '#f8fafc',
                          color: '#0f172a',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 4: City, State & PIN (3 Columns) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr 0.9fr', gap: '0.8rem' }} className="addr-3col">
                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                        <span>City / Town <span style={{ color: '#ef4444' }}>*</span></span>
                        {addressErrors.city && <span style={{ color: '#ef4444', fontSize: '0.68rem' }}>Req.</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={e => handleAddressChange('city', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          border: addressErrors.city ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          background: addressErrors.city ? '#fef2f2' : '#f8fafc',
                          color: '#0f172a',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                        <span>State <span style={{ color: '#ef4444' }}>*</span></span>
                        {addressErrors.state && <span style={{ color: '#ef4444', fontSize: '0.68rem' }}>Req.</span>}
                      </label>
                      <select
                        value={addressForm.state}
                        onChange={e => handleAddressChange('state', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.7rem',
                          borderRadius: '8px',
                          border: addressErrors.state ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          background: '#f8fafc',
                          color: '#0f172a',
                          outline: 'none',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                        <span>PIN Code <span style={{ color: '#ef4444' }}>*</span></span>
                        {addressErrors.pincode && <span style={{ color: '#ef4444', fontSize: '0.68rem' }}>6 digits</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="6 digits"
                        maxLength="6"
                        value={addressForm.pincode}
                        onChange={e => handleAddressChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          border: addressErrors.pincode ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          background: addressErrors.pincode ? '#fef2f2' : '#f8fafc',
                          color: '#0f172a',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={saveToProfile}
                      onChange={e => setSaveToProfile(e.target.checked)}
                      style={{ width: '15px', height: '15px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    <span>Save this address to your profile for future orders</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateAddress()) {
                        setIsAddressOpen(false);
                        toast.success('Shipping address confirmed!');
                      }
                    }}
                    style={{
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.45rem 1rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Save &amp; Continue &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Ordered Items ({cart.length})
            </h2>
            <Link to="/" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>+ Add More Products</Link>
          </div>

          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '1.5rem', padding: '1.25rem', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                <img src={item.image} alt={item.title} style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem', color: '#0f172a' }}>{item.title}</h3>
                      <p style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '0.8rem' }}>Category: <span style={{ textTransform: 'capitalize' }}>{item.category}</span></p>
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>₹{item.price}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          style={{ padding: '0.3rem 0.7rem', background: 'var(--bg-page)', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                          title="Decrease quantity"
                        >-</button>
                        <span style={{ padding: '0.3rem 0.8rem', fontWeight: 600, fontSize: '0.9rem', minWidth: '32px', textAlign: 'center' }}>{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          disabled={item.stock !== undefined && item.qty >= item.stock}
                          style={{
                            padding: '0.3rem 0.7rem',
                            background: 'var(--bg-page)',
                            fontWeight: 700,
                            border: 'none',
                            cursor: (item.stock !== undefined && item.qty >= item.stock) ? 'not-allowed' : 'pointer',
                            opacity: (item.stock !== undefined && item.qty >= item.stock) ? 0.4 : 1
                          }}
                          title={item.stock !== undefined && item.qty >= item.stock ? `Only ${item.stock} in stock` : "Increase quantity"}
                        >+</button>
                      </div>
                      {item.stock !== undefined && item.stock <= 5 && (
                        <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
                          (Max {item.stock})
                        </span>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-summary" style={{ background: 'white', padding: '1.4rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', position: 'sticky', top: '90px' }}>
          {/* Quick Deliver To Box in Summary */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiMapPin style={{ color: 'var(--primary)' }} /> Deliver To
              </span>
              <button 
                type="button"
                onClick={() => {
                  setIsAddressOpen(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Change
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {addressForm.fullName || 'Address not entered'} {addressForm.phone ? `(${addressForm.phone})` : ''}
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {[addressForm.houseNo, addressForm.street, addressForm.city, addressForm.state, addressForm.pincode].filter(Boolean).join(', ') || 'Click Change to add address'}
            </p>
          </div>

          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>Order Summary</h3>

          {/* Live Gift Offer Motivation */}
          {activeReturnGift && (
            <div style={{ background: 'linear-gradient(135deg, #fefce8, #fef9c3)', border: '1px solid #fde047', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: '#854d0e', fontSize: '0.85rem', marginBottom: '3px' }}>
                <FiGift style={{ color: '#d97706' }} /> Live Gift Offer Active!
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#713f12', lineHeight: 1.4 }}>
                This order adds <strong>₹{totalAmount.toLocaleString('en-IN')}</strong> toward unlocking a free <strong>{activeReturnGift.giftTitle}</strong> (Target: ₹{activeReturnGift.targetAmount?.toLocaleString('en-IN')}).
              </p>
              <Link to="/gift-offers" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textDecoration: 'underline', display: 'inline-block', marginTop: '4px' }}>
                View Gift Offers & Live Progress &rarr;
              </Link>
            </div>
          )}

          {/* Promo Code Input */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              placeholder="Promo Code"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', outline: 'none' }}
            />
            <button onClick={handleApplyPromo} className="btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius)' }}>Apply</button>
          </div>

          {activePromos.length > 0 && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div
                onClick={() => setShowPromos(!showPromos)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '0.2rem 0', userSelect: 'none' }}
              >
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiShoppingBag color="#64748b" /> View Available Offers ({activePromos.length})
                </h4>
                {showPromos ? <FiChevronUp color="#64748b" /> : <FiChevronDown color="#64748b" />}
              </div>

              {showPromos && activePromos.map(promo => {
                const isEligible = !promo.minOrderAmount || totalAmount >= promo.minOrderAmount;
                const shortFall = promo.minOrderAmount ? Math.max(0, promo.minOrderAmount - totalAmount) : 0;
                return (
                  <div
                    key={promo._id}
                    onClick={() => {
                      setPromoCode(promo.code);
                      setShowPromos(false);
                      if (!isEligible) {
                        toast.error(`Cart total is ₹${totalAmount}. Add ₹${shortFall} more to unlock code ${promo.code} (Min order: ₹${promo.minOrderAmount})`);
                      } else {
                        toast.success(`Code ${promo.code} selected! Click Apply to calculate discount.`);
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: isEligible ? '#fafafa' : '#fff7ed',
                      border: `1px solid ${isEligible ? '#eaeaea' : '#fed7aa'}`,
                      padding: '0.8rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = '#4f46e5';
                      e.currentTarget.style.background = '#f5f7ff';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = isEligible ? '#eaeaea' : '#fed7aa';
                      e.currentTarget.style.background = isEligible ? '#fafafa' : '#fff7ed';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#111', fontSize: '0.95rem', letterSpacing: '0.5px' }}>{promo.code}</span>
                        {promo.minOrderAmount > 0 && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: isEligible ? '#e0e7ff' : '#ffedd5', color: isEligible ? '#4338ca' : '#c2410c' }}>
                            Min. ₹{promo.minOrderAmount}
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '3px' }}>
                        Save {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₹${promo.discountValue}`}
                        {!isEligible && (
                          <span style={{ color: '#ea580c', display: 'block', fontSize: '0.75rem', fontWeight: 600, marginTop: '2px' }}>
                            ⚠️ Add ₹{shortFall} more to qualify
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ color: isEligible ? '#4f46e5' : '#ea580c', fontSize: '0.85rem', fontWeight: 700 }}>
                      {isEligible ? 'Apply' : 'Unlock'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {activePromos.length === 0 && <div style={{ marginBottom: '1.5rem' }}></div>}

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
        @media (max-width: 900px) {
          .cart-layout { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
        }
        @media (max-width: 540px) {
          .cart-layout .cart-summary { padding: 1rem !important; }
          .cart-layout .addr-2col { grid-template-columns: 1fr !important; }
          .cart-layout .addr-3col { grid-template-columns: 1fr 1fr !important; }
          .cart-layout .addr-3col > div:last-child { grid-column: span 2; }
          .cart-items > div { padding: 1rem !important; gap: 1rem !important; }
          .cart-items img { width: 75px !important; height: 75px !important; }
        }
      `}</style>
    </div>
  );
};

export default Cart;
