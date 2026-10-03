const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authAdmin } = require('../middleware/auth');

// Create a Product (Admin Only)
router.post('/', authAdmin, async (req, res) => {
  try {
    const { name, slug, description, price, originalPrice, stock, category, images, isFeatured } = req.body;
    let product = await Product.findOne({ slug });
    if (product) {
      return res.status(400).json({ error: 'Product with this slug already exists' });
    }
    product = new Product({ name, slug, description, price, originalPrice, stock, category, images, isFeatured });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get all Products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name slug');
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get Product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Delete a Product (Admin Only)
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
