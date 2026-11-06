const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  password: { 
    type: String, 
    required: function() {
      return !this.googleId && (!this.authProvider || this.authProvider === 'local');
    }
  },
  role: { type: String, default: 'user' }, // user or admin
  authProvider: { type: String, default: 'local' }, // 'local' or 'google'
  googleId: { type: String },
  avatar: { type: String },
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  walletBalance: { type: Number, default: 0 },
  pendingWalletBalance: { type: Number, default: 0 },
  totalReferralEarnings: { type: Number, default: 0 },
  isEmailVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  blockedReason: { type: String, default: '' },
  blockedAt: { type: Date },
  otp: { type: String },
  otpExpires: { type: Date },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
