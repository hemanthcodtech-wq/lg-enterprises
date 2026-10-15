const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Create a Category (Admin Only)
router.post('/', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, slug, description, status } = req.body;
    let category = await Category.findOne({ slug });
    if (category) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path;
    }

    category = new Category({ 
      name, 
      slug, 
      description, 
      image: imageUrl,
      status: status || 'active'
    });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Update Category Status (Admin Only)
router.put('/:id/status', authAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'coming_soon'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get all Categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Delete a Category (Admin Only)
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
