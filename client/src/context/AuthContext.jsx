import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('lg_token');
      if (!token) return null;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) return null;
      const freshUser = await res.json();
      localStorage.setItem('lg_user', JSON.stringify(freshUser));
      setUser(freshUser);
      return freshUser;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('lg_token');
    const savedUser = localStorage.getItem('lg_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Background refresh for fresh wallet balance
      refreshUser();
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.requireOtp) return data; // Return it so component can show OTP screen
      throw new Error(data.message || 'Login failed');
    }
    localStorage.setItem('lg_token', data.token);
    localStorage.setItem('lg_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, phone, password, usedReferralCode) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, usedReferralCode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    if (data.requireOtp) return data;
    
    localStorage.setItem('lg_token', data.token);
    localStorage.setItem('lg_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'OTP verification failed');
    
    localStorage.setItem('lg_token', data.token);
    localStorage.setItem('lg_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('lg_token');
    localStorage.removeItem('lg_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, logout, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
