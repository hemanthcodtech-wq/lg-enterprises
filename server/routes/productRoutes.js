const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authAdmin, authUser } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Create a Product (Admin Only)
router.post('/', authAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, slug, description, price, originalPrice, stock, category, isFeatured } = req.body;
    let tags = [];
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
      }
    }
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }
    
    let product = await Product.findOne({ slug });
    if (product) {
      return res.status(400).json({ error: 'Product with this slug already exists' });
    }
    product = new Product({ name, slug, description, price, originalPrice, stock, category, images, isFeatured, tags });
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

// Submit a Review
router.post('/:id/reviews', authUser, async (req, res) => {
  try {
    const { rating, comment, name } = req.body;
    const productId = req.params.id;
    const userId = req.user.id || req.user.userId;

    // Check if user has bought and it is delivered
    const hasBought = await Order.findOne({
      user: userId,
      status: 'Delivered',
      'items.product': productId
    });

    if (!hasBought) {
      return res.status(400).json({ error: 'You can only review products you have purchased and received.' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Check if already reviewed
    const alreadyReviewed = product.reviews.find(r => r.user.toString() === userId.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const review = {
      user: userId,
      name,
      rating: Number(rating),
      comment,
      isApproved: false // Admin must approve
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    // Note: rating average will only be calculated based on approved reviews in real time, or we can recalculate here
    // Let's just calculate based on all reviews for now, or recalculate on approval.
    
    await product.save();
    res.status(201).json({ message: 'Review submitted successfully. Waiting for admin approval.' });

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
    let tags;
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
      }
    }
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
    if (tags !== undefined) product.tags = tags;

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
