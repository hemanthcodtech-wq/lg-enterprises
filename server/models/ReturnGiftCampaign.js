const mongoose = require('mongoose');

const ReturnGiftCampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true,
    default: 'Exclusive Milestone Reward'
  },
  description: {
    type: String,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  giftTitle: {
    type: String,
    required: true,
    trim: true
  },
  giftDescription: {
    type: String,
    trim: true
  },
  giftImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
  },
  giftValue: {
    type: Number,
    default: 0
  },
  giftProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  terms: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('ReturnGiftCampaign', ReturnGiftCampaignSchema);
