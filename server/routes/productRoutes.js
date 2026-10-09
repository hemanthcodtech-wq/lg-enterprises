const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Create a Product (Admin Only)
router.post('/', authAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, slug, description, price, originalPrice, stock, category, isFeatured } = req.body;
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }
    
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

// Update a Product (Admin Only)
router.put('/:id', authAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, slug, description, price, originalPrice, stock, category, isFeatured } = req.body;
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Handle slug uniqueness check if slug is being changed
    if (slug && slug !== product.slug) {
      const existing = await Product.findOne({ slug });
      if (existing) {
        return res.status(400).json({ error: 'Product with this slug already exists' });
      }
    }

    product.name = name || product.name;
    product.slug = slug || product.slug;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
    product.stock = stock !== undefined ? stock : product.stock;
    product.category = category || product.category;
    product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;

    // Optional: If new images are uploaded, replace the old ones (or append them based on requirements)
    // Here we'll replace them
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(file => file.path);
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
