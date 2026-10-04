import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRouter from './routes/AppRouter';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <img src="/logo.png" alt="LG Enterprises" className="splash-logo" />
          <h2 className="splash-title">LG Enterprises</h2>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
