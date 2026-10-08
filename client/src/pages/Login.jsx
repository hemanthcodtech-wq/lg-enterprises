import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiShoppingBag, FiTag, FiStar, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  // OTP Login Flow
  const [requireOtp, setRequireOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Forgot Password Flow
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data && data.requireOtp) {
        setRequireOtp(true);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
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
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setVerifying(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email: forgotEmail });
      setResetSent(true);
      setSuccess('Reset OTP sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, { 
        email: forgotEmail, 
        otp: resetOtp, 
        newPassword 
      });
      setSuccess('Password reset successfully! You can now log in.');
      setTimeout(() => {
        setShowForgot(false);
        setResetSent(false);
        setForgotEmail('');
        setResetOtp('');
        setNewPassword('');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-left">
          <img src="/logo.png" alt="LG Enterprises" style={{ maxWidth: '240px', height: 'auto', marginBottom: '2rem', display: 'block' }} />
          <h2>Welcome Back!</h2>
          <p>Sign in to explore thousands of products — Electronics, Furniture, Grocery & more at the best prices.</p>
          <div className="auth-feature"><FiShoppingBag /> 10,000+ Products across categories</div>
          <div className="auth-feature"><FiTag /> Exclusive member discounts every day</div>
          <div className="auth-feature"><FiCheckCircle /> 100% Secure & Genuine Products</div>
          <div className="auth-feature"><FiStar /> Free delivery on orders above ₹499</div>
        </div>

        <div className="auth-right">
          <h3>{showForgot ? 'Reset Password' : requireOtp ? 'Verify Account' : 'Sign In to Your Account'}</h3>
          
          {!showForgot && !requireOtp && (
            <p className="subtitle">Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Register here</Link></p>
          )}

          {error && <div className="auth-error"><FiAlertCircle /> {error}</div>}
          {success && <div className="auth-success"><FiCheckCircle /> {success}</div>}

          {showForgot ? (
            !resetSent ? (
              <form onSubmit={handleForgotSubmit}>
                <p style={{ marginBottom: '1rem', color: 'var(--text)' }}>Enter your email address and we'll send you an OTP to reset your password.</p>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="you@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
                <button type="button" onClick={() => setShowForgot(false)} className="btn-secondary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
                  Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label">Enter OTP sent to {forgotEmail}</label>
                  <input type="text" className="form-input" placeholder="123456" value={resetOtp} onChange={e => setResetOtp(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )
          ) : requireOtp ? (
            <form onSubmit={handleVerifyOtp}>
              <p style={{ marginBottom: '1rem', color: 'var(--text)' }}>
                We sent a 6-digit OTP to <b>{form.email}</b>. Please enter it below to verify your account.
              </p>
              <div className="form-group">
                <label className="form-label">Enter OTP</label>
                <input type="text" className="form-input" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} required />
              </div>
              <button type="submit" className="auth-submit" disabled={verifying}>
                {verifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Password</span>
                    <button type="button" onClick={() => { setShowForgot(true); setError(''); setSuccess(''); }} className="forgot-link" style={{ background:'none', border:'none', cursor:'pointer' }}>Forgot Password?</button>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" />
                    <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              
              <div className="auth-divider">or</div>
              
              <div className="social-login-btns" style={{ display: 'flex', flexDirection: 'column' }}>
                <button className="social-btn google-btn" style={{ width: '100%', padding: '0.85rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-pill)', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'white', color: 'var(--text-dark)', cursor: 'pointer' }}>
                  <img src="https://www.google.com/favicon.ico" width="18" alt="Google" /> Continue with Google
                </button>
              </div>

              <p className="auth-switch">
                New to LG Enterprises? <Link to="/register">Create a Free Account</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
