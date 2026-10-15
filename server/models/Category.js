const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  status: { type: String, enum: ['active', 'coming_soon'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
