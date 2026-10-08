const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // user or admin
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  walletBalance: { type: Number, default: 0 },
  totalReferralEarnings: { type: Number, default: 0 },
  isEmailVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
