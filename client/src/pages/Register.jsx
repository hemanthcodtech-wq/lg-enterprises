import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiShoppingBag, FiTag, FiStar, FiShield, FiX, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // OTP States
  const [requireOtp, setRequireOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  const location = window.location;
  const urlParams = new URLSearchParams(location.search);
  const refCode = urlParams.get('ref') || '';

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', usedReferralCode: refCode });

  const inp = (field) => ({
    value: form[field],
    onChange: e => setForm({ ...form, [field]: e.target.value }),
  });

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!acceptedTerms) return setError('You must accept the Terms and Conditions and Privacy Policy');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.phone, form.password, form.usedReferralCode);
      if (data.requireOtp) {
        setRequireOtp(true);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) return setError('Please enter the OTP');
    setVerifying(true);
    try {
      await verifyOtp(form.email, otp);
      setRequireOtp(false);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper" style={{ maxWidth: '1000px' }}>
        {/* Left */}
        <div className="auth-left">
          <img src="/logo.png" alt="LG Enterprises" style={{ maxWidth: '240px', height: 'auto', marginBottom: '2rem', display: 'block' }} />
          <h2>Join LG Enterprises Today!</h2>
          <p>Create a free account to unlock exclusive deals, track orders, and enjoy a seamless shopping experience.</p>
          <div className="auth-feature"><FiShoppingBag /> Access 10,000+ premium products</div>
          <div className="auth-feature"><FiTag /> Member-only discounts & early sales</div>
          <div className="auth-feature"><FiCheckCircle /> Fast & secure checkout</div>
          <div className="auth-feature"><FiStar /> 24/7 dedicated customer support</div>
        </div>

        {/* Right */}
        <div className="auth-right">
          <h3>Create Your Account</h3>
          <p className="subtitle">Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign In</Link></p>

          {error && (
            <div className="auth-error">
              <FiAlertCircle /> {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              <FiCheckCircle /> Account created! Redirecting...
            </div>
          )}

          {requireOtp ? (
            <form onSubmit={handleVerifyOtp}>
              <p style={{ marginBottom: '1rem', color: 'var(--text)' }}>
                We sent a 6-digit OTP to <b>{form.email}</b>. Please enter it below to verify your account.
              </p>
              
              <div className="form-group">
                <label className="form-label">Enter OTP</label>
                <input type="text" className="form-input" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={verifying}>
                {verifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-input" placeholder="John Doe" {...inp('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" placeholder="+91 9876543210" {...inp('phone')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-input" placeholder="you@example.com" {...inp('email')} required autoComplete="email" />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Referral Code (Optional)</label>
                {form.usedReferralCode && (
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiCheckCircle /> Code Applied
                  </span>
                )}
              </div>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. A1B2C3D4" 
                value={form.usedReferralCode}
                onChange={e => setForm({ ...form, usedReferralCode: e.target.value.toUpperCase() })}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Earn 5-tier passive commission on every purchase when your network shops!
              </span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters" {...inp('password')} required />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input type="password" className="form-input" placeholder="Repeat password" {...inp('confirmPassword')} required />
              </div>
            </div>

            <div className="form-terms" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', fontSize: '0.88rem', color: '#475569', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: '0.2rem', width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="terms" style={{ cursor: 'pointer', lineHeight: '1.5' }}>
                I confirm that I am registering voluntarily of my own free will and agree to the{' '}
                <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms and Conditions</Link> and{' '}
                <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</Link>.{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'underline', cursor: 'pointer', padding: 0, marginLeft: '4px' }}
                >
                  (Quick View 6 Clauses)
                </button>
              </label>
            </div>

            {/* Quick View Terms Modal */}
            {showTermsModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  maxWidth: '600px',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiShield style={{ color: '#4f46e5', fontSize: '1.3rem' }} />
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Terms and Conditions</h3>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Voluntary Participation & User Confirmation</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(false)}
                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      <FiX />
                    </button>
                  </div>

                  <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', borderLeft: '3px solid #10b981' }}>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem', marginBottom: '4px' }}>1. Voluntary Participation</strong>
                      <span style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.5' }}>By registering with or using this website, I confirm that I am doing so voluntarily, of my own free will, and without any force, pressure, or coercion from any person or organization.</span>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', borderLeft: '3px solid #f59e0b' }}>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem', marginBottom: '4px' }}>2. Acceptance of Risk</strong>
                      <span style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.5' }}>I understand that using this website is my personal choice and that I am responsible for my decision to participate. I acknowledge that there may be risks, uncertainties, or limitations associated with the website and its services.</span>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', borderLeft: '3px solid #6366f1' }}>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem', marginBottom: '4px' }}>3. No Guarantee of Continuity</strong>
                      <span style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.5' }}>I understand that the website and its services may be modified, suspended, interrupted, or discontinued at any time. I acknowledge that the website may not always be available or may cease operations entirely.</span>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', borderLeft: '3px solid #0ea5e9' }}>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem', marginBottom: '4px' }}>4. Acknowledgment and Consent</strong>
                      <span style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.5' }}>By proceeding, I confirm that I have read, understood, and voluntarily accepted these Terms and Conditions. I understand that my participation is subject to the applicable terms, policies, and laws.</span>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', borderLeft: '3px solid #ec4899' }}>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem', marginBottom: '4px' }}>5. Limitation of Liability</strong>
                      <span style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.5' }}>To the extent permitted by applicable law, the website shall not be liable for losses arising from service interruptions or discontinuation, except where liability cannot legally be excluded.</span>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', borderLeft: '3px solid #8b5cf6' }}>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem', marginBottom: '4px' }}>6. User Confirmation</strong>
                      <span style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.5' }}>By creating an account or using the website, I confirm that I have made an independent and informed decision to participate and that I have not been forced or misled into doing so.</span>
                    </div>
                  </div>

                  <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 600 }}>
                      Read Full Page & Policies →
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setAcceptedTerms(true);
                        setShowTermsModal(false);
                      }}
                      style={{
                        background: '#4f46e5',
                        color: '#ffffff',
                        padding: '0.6rem 1.25rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <FiCheck /> I Accept & Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          )}

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
