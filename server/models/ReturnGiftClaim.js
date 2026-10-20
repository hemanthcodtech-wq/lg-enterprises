const mongoose = require('mongoose');

const ReturnGiftClaimSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReturnGiftCampaign',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalPurchased: {
    type: Number,
    required: true,
    default: 0
  },
  targetAmount: {
    type: Number,
    required: true
  },
  qualifiedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending Dispatch', 'Dispatched', 'Delivered', 'Cancelled'],
    default: 'Pending Dispatch'
  },
  dispatchDetails: {
    courierName: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    trackingUrl: { type: String, trim: true },
    dispatchedAt: { type: Date },
    deliveredAt: { type: Date },
    adminNotes: { type: String, trim: true }
  },
  shippingAddress: {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String }
  }
}, { timestamps: true });

// Prevent duplicate claims for the same user and campaign
ReturnGiftClaimSchema.index({ campaign: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ReturnGiftClaim', ReturnGiftClaimSchema);
