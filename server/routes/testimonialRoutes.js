const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const { authAdmin } = require('../middleware/auth');

// Get all active testimonials (Public)
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all testimonials
router.get('/admin', authAdmin, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create testimonial
router.post('/', authAdmin, async (req, res) => {
  try {
    const { name, role, message, rating, image, isActive } = req.body;
    const newTestimonial = new Testimonial({
      name,
      role,
      message,
      rating,
      image,
      isActive
    });
    await newTestimonial.save();
    res.status(201).json(newTestimonial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Update testimonial
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { name, role, message, rating, image, isActive } = req.body;
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { name, role, message, rating, image, isActive },
      { new: true }
    );
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    res.json(testimonial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Delete testimonial
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
