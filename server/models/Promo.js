const mongoose = require('mongoose');

const PromoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  maxUses: { type: Number, default: null }, // Null means unlimited
  currentUses: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Promo', PromoSchema);
