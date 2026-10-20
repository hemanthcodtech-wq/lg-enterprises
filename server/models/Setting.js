const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  storeName: { type: String, default: 'LG Enterprises Store' },
  supportEmail: { type: String, default: 'support@lg-enterprises.com' },
  supportPhone: { type: String, default: '+91 98765 43210' },
  storeAddress: { type: String, default: 'Ground Floor, Tech Park, Mumbai, MH 400001' },
  locationCity: { type: String, default: 'Bhimavaram, Andhra Pradesh' },
  mapPinUrl: { type: String, default: 'https://maps.google.com/?q=Bhimavaram,+Andhra+Pradesh' },
  mapEmbedIframe: { type: String, default: '' },
  whatsappNumber: { type: String, default: '+91 98765 43210' },
  supportTiming: { type: String, default: 'Mon – Sat: 9:00 AM – 8:30 PM' },
  socialFacebook: { type: String, default: 'https://facebook.com' },
  socialTwitter: { type: String, default: 'https://twitter.com' },
  socialInstagram: { type: String, default: 'https://instagram.com' },
  socialYoutube: { type: String, default: 'https://youtube.com' },
  socialLinkedin: { type: String, default: '' },
  socialWhatsapp: { type: String, default: 'https://wa.me/919876543210' },
  currency: { type: String, default: 'INR' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  enablePromos: { type: Boolean, default: true },
  enableFreeShipping: { type: Boolean, default: true },
  freeShippingMin: { type: Number, default: 499 },
  taxRate: { type: Number, default: 18 },
  lowStockAlert: { type: Number, default: 5 },
  maintenanceMode: { type: Boolean, default: false },
  orderEmailAlerts: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
