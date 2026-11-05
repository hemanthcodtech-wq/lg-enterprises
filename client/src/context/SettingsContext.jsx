import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const defaultSettings = {
  storeName: 'SVR Mart',
  supportEmail: 'support@svrmart.com',
  supportPhone: '+91 98765 43210',
  whatsappNumber: '+91 98765 43210',
  storeAddress: 'SVR Mart Online Megastore',
  locationCity: '',
  mapPinUrl: '',
  mapEmbedIframe: '',
  supportTiming: 'Mon – Sat: 9:00 AM – 8:30 PM',
  socialFacebook: 'https://facebook.com',
  socialTwitter: 'https://twitter.com',
  socialInstagram: 'https://instagram.com',
  socialYoutube: 'https://youtube.com',
  socialLinkedin: '',
  socialWhatsapp: 'https://wa.me/919876543210',
  currency: 'INR',
  enableFreeShipping: true,
  freeShippingMin: 499
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/settings`);
      if (res.data && res.data.settings) {
        setSettings(prev => ({
          ...prev,
          ...res.data.settings
        }));
      }
    } catch (err) {
      console.warn('Could not load site settings from server, using defaults:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, reloadSettings: fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
