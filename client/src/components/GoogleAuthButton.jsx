import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleAuthButton = ({ usedReferralCode = '', text = 'continue_with', onSuccessCustom }) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isConfigured = clientId && !clientId.includes('your_google_client_id');

  const handleManualClick = () => {
    toast.error('Google OAuth Client ID is not configured yet. Please set VITE_GOOGLE_CLIENT_ID in your client/.env file.');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential token received from Google');
      }

      const data = await loginWithGoogle(credentialResponse.credential, usedReferralCode);
      toast.success(`Welcome back, ${data.user?.name || 'Customer'}!`);
      
      if (onSuccessCustom) {
        onSuccessCustom(data);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Google login error:', err);
      toast.error(err.message || 'Google Sign-In failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In was cancelled or failed to connect.');
  };

  if (!isConfigured) {
    return (
      <button 
        type="button" 
        onClick={handleManualClick}
        className="social-btn google-btn" 
        style={{ 
          width: '100%', 
          padding: '0.85rem', 
          border: '1.5px solid var(--border, #e2e8f0)', 
          borderRadius: 'var(--radius-pill, 9999px)', 
          fontWeight: 600, 
          fontSize: '0.95rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.65rem', 
          background: '#ffffff', 
          color: 'var(--text-dark, #0f172a)', 
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.59.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.347 2.825.957 4.039l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
        </svg>
        <span>Continue with Google</span>
      </button>
    );
  }

  return (
    <div 
      className="google-oauth-wrapper" 
      style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center',
        margin: '0.25rem 0'
      }}
    >
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap
        shape="pill"
        theme="outline"
        size="large"
        text={text}
        width="100%"
      />
    </div>
  );
};

export default GoogleAuthButton;

