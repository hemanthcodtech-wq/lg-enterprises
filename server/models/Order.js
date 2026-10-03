const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
  paymentStatus: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Failed', 'Refunded'] },
  paymentMethod: { type: String, default: 'Card' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
