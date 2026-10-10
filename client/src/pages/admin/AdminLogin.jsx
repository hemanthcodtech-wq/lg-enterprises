import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Forgot Password Flow
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/login`, { email, password });
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminInfo', JSON.stringify(res.data.admin));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
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
    <div className="admin-login-page">
      <div className="admin-login-container">
        
        {/* Left Branding Side */}
        <div className="admin-login-left">
          <div className="admin-brand">
            <img src="/logo.png" alt="LG Enterprises" className="admin-logo-img" />
            <h1>Admin Control Panel</h1>
            <p>Secure access to the LG Enterprise dashboard. Manage products, view analytics, and control user access from one centralized location.</p>
          </div>
          <div className="admin-left-footer">
            <p>&copy; {new Date().getFullYear()} LG Enterprises. All rights reserved.</p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="admin-login-right">
          <div className="login-form-wrapper">
            <h2 className="login-heading">{showForgot ? 'Reset Password' : 'Welcome Back'}</h2>
            <p className="login-subheading">{showForgot ? 'Enter your details below to reset' : 'Please enter your credentials to continue'}</p>
            
            {error && <div className="auth-error-msg">{error}</div>}
            {success && <div className="auth-success-msg" style={{ padding: '0.8rem', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #a7f3d0' }}>{success}</div>}

            {showForgot ? (
              !resetSent ? (
                <form onSubmit={handleForgotSubmit} className="admin-form">
                  <div className="form-group">
                    <label>Admin Email</label>
                    <div className="input-icon-wrapper">
                      <input type="email" placeholder="Enter admin email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="login-btn" style={{ width: '100%', padding: '0.8rem', background: '#3b82f6', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }} disabled={loading}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                  <button type="button" onClick={() => setShowForgot(false)} className="login-btn" style={{ width: '100%', padding: '0.8rem', background: '#e2e8f0', color: '#1e293b', marginTop: '1rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    Back to Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="admin-form">
                  <div className="form-group">
                    <label>Enter OTP sent to {forgotEmail}</label>
                    <div className="input-icon-wrapper">
                      <input type="text" placeholder="123456" value={resetOtp} onChange={e => setResetOtp(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="input-icon-wrapper">
                      <input type="password" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="login-btn" style={{ width: '100%', padding: '0.8rem', background: '#3b82f6', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }} disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleLogin} className="admin-form">
                <div className="form-group">
                  <label>Admin Email</label>
                  <div className="input-icon-wrapper">
                    <input 
                      type="email" 
                      placeholder="Enter admin email"
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ marginBottom: 0 }}>Password</label>
                    <button type="button" onClick={() => { setShowForgot(true); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>Forgot Password?</button>
                  </div>
                  <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your password"
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                
                <button type="submit" className="login-btn btn-premium" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Secure Login'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .admin-login-page {
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
        }
        .admin-login-container {
          display: flex;
          width: 100%;
          max-width: 900px;
          min-height: 500px;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .admin-login-left {
          flex: 1;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          padding: 4rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .admin-login-left::before {
          content: '';
          position: absolute;
          top: -20%;
          left: -10%;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50%;
        }
        .admin-brand h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }
        .admin-brand p {
          color: rgba(255, 255, 255, 0.85);
          font-size: 1.05rem;
          line-height: 1.6;
        }
        .admin-logo-img {
          max-width: 220px;
          height: auto;
          margin-bottom: 2.5rem;
          display: block;
          background: white;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .admin-left-footer p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }
        .admin-login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem;
        }
        .login-form-wrapper {
          width: 100%;
          max-width: 360px;
        }
        .login-heading {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .login-subheading {
          color: #64748b;
          margin-bottom: 2.5rem;
        }
        .auth-error-msg {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #f87171;
          padding: 0.8rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.5rem;
        }
        .input-icon-wrapper input {
          width: 100%;
          padding: 0.9rem 1.2rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.2s;
          outline: none;
        }
        .input-icon-wrapper input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-alpha);
        }
        .btn-premium {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 700;
          margin-top: 1.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
          position: relative;
          overflow: hidden;
          letter-spacing: 0.5px;
        }
        .btn-premium::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: all 0.4s ease;
        }
        .btn-premium:hover::after {
          left: 100%;
        }
        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
        }
        .btn-premium:active {
          transform: translateY(1px);
          box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
        }
        .btn-premium:disabled {
          background: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
        }

        /* Responsive Design */
        @media (max-width: 850px) {
          .admin-login-page { padding: 2rem 1rem; }
          .admin-login-container {
            flex-direction: column;
            border-radius: 20px;
          }
          .admin-login-left {
            padding: 2.5rem 1.5rem;
            min-height: auto;
            text-align: center;
            align-items: center;
          }
          .admin-brand h1 { font-size: 2rem; }
          .admin-brand p { font-size: 0.95rem; margin-bottom: 0; }
          .admin-logo-img {
            max-width: 120px;
            margin: 0 auto 1.5rem auto;
            padding: 0.5rem;
          }
          .admin-left-footer {
            display: none;
          }
          .admin-login-right {
            padding: 2.5rem 1.5rem;
          }
          .login-heading { font-size: 1.6rem; text-align: center; }
          .login-subheading { text-align: center; margin-bottom: 2rem; font-size: 0.9rem; }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
