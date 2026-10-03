import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiShoppingBag, FiTag, FiStar, FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        {/* Left brand panel */}
        <div className="auth-left">
          <img src="/logo.png" alt="LG Enterprises" style={{ maxWidth: '240px', height: 'auto', marginBottom: '2rem', display: 'block' }} />
          <h2>Welcome Back!</h2>
          <p>Sign in to explore thousands of products — Electronics, Furniture, Grocery & more at the best prices.</p>
          <div className="auth-feature"><FiShoppingBag /> 10,000+ Products across categories</div>
          <div className="auth-feature"><FiTag /> Exclusive member discounts every day</div>
          <div className="auth-feature"><FiCheckCircle /> 100% Secure & Genuine Products</div>
          <div className="auth-feature"><FiStar /> Free delivery on orders above ₹499</div>
        </div>

        {/* Right form panel */}
        <div className="auth-right">
          <h3>Sign In to Your Account</h3>
          <p className="subtitle">Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Register here</Link></p>

          {error && (
            <div className="auth-error">
              <FiAlertCircle /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Password</span>
                <a href="#" className="forgot-link">Forgot Password?</a>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
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
        </div>
      </div>
    </div>
  );
};

export default Login;
