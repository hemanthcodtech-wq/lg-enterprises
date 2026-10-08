const mongoose = require('mongoose');

const CommissionSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  level: { type: Number, required: true, min: 1, max: 5 },
  commissionPercent: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  orderTotal: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Commission', CommissionSchema);
