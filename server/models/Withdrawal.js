const mongoose = require('mongoose');
const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  method: { type: String, enum: ['UPI', 'Bank Transfer'], required: true },
  details: { type: String, required: true },
  adminNote: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Withdrawal', withdrawalSchema);
