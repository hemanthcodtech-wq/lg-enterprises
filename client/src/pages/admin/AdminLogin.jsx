import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminInfo', JSON.stringify(res.data.admin));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
            <h2 className="login-heading">Welcome Back</h2>
            <p className="login-subheading">Please enter your credentials to continue</p>
            
            {error && <div className="auth-error-msg">{error}</div>}

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
                <label>Password</label>
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
              <button type="submit" className="btn-admin-login">
                Sign In to Dashboard
              </button>
            </form>
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
        .btn-admin-login {
          background: var(--primary);
          color: white;
          padding: 1rem;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 700;
          margin-top: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-admin-login:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--primary-alpha);
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
