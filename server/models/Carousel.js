const mongoose = require('mongoose');

const CarouselSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  badgeText: { type: String, default: 'Trending' },
  buttonText: { type: String, default: 'Shop Now' },
  buttonLink: { type: String, default: '/#products' },
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Carousel', CarouselSchema);
