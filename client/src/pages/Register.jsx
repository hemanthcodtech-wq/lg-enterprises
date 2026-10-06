import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiShoppingBag, FiTag, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
    if (!acceptedTerms) return setError('You must accept the Terms of Use and Privacy Policy');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name, form.email, form.phone, form.password, form.usedReferralCode);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
              <label className="form-label">Referral Code (Optional)</label>
              <input type="text" className="form-input" placeholder="e.g. A1B2C3D4" {...inp('usedReferralCode')} />
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

            <div className="form-terms" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', fontSize: '0.9rem', color: '#64748b' }}>
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: '0.2rem', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="terms" style={{ cursor: 'pointer' }}>
                By creating an account, you agree to our{' '}
                <Link to="/terms" style={{ color: 'var(--primary)' }}>Terms of Use</Link> and{' '}
                <Link to="/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>.
              </label>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
