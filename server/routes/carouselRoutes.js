const express = require('express');
const router = express.Router();
const Carousel = require('../models/Carousel');
const { authAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Get all slides
router.get('/', async (req, res) => {
  try {
    const slides = await Carousel.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all slides (including inactive)
router.get('/admin', authAdmin, async (req, res) => {
  try {
    const slides = await Carousel.find().sort({ createdAt: -1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create slide
router.post('/', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, badgeText, buttonText, buttonLink } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const slide = new Carousel({
      title,
      subtitle,
      badgeText,
      buttonText,
      buttonLink,
      imageUrl: req.file.path
    });
    
    await slide.save();
    res.status(201).json(slide);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: Delete slide
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const slide = await Carousel.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ error: 'Slide not found' });
    res.json({ message: 'Slide deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
