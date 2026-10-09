const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const { authAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Get all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all brands (including inactive)
router.get('/admin', authAdmin, async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create brand
router.post('/', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const brand = new Brand({
      name,
      imageUrl: req.file.path
    });
    
    await brand.save();
    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: Toggle active status
router.put('/:id/toggle', authAdmin, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    
    brand.isActive = !brand.isActive;
    await brand.save();
    
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete brand
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json({ message: 'Brand deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
