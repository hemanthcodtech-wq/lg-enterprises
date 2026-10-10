const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: 'Customer' },
  message: { type: String, required: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  isActive: { type: Boolean, default: true },
  image: { type: String } // optional avatar image
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);
