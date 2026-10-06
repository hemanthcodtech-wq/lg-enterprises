const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Order = require('../models/Order');

// Admin Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ email });
    if (!admin || admin.role !== 'admin') {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role, email: admin.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const { authAdmin } = require('../middleware/auth');

const Product = require('../models/Product');
const Category = require('../models/Category');

// Dashboard Real Stats Route (Admin Only)
router.get('/dashboard-stats', authAdmin, async (req, res) => {
  try {
    const usersCount = await User.countDocuments({ role: { $ne: 'admin' } });
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const categoriesCount = await Category.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: { $ne: 'Failed' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      usersCount,
      ordersCount,
      productsCount,
      categoriesCount,
      revenue,
      recentOrders
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all Users (Admin Only)
router.get('/users', authAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .populate('referredBy', 'name referralCode')
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific User details (orders & referred users)
router.get('/users/:id/details', authAdmin, async (req, res) => {
  try {
    const userOrders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
    const referredUsers = await User.find({ referredBy: req.params.id }).select('name email createdAt walletBalance');
    res.json({
      orders: userOrders,
      referredUsers: referredUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all Orders (Admin Only)
router.get('/orders', authAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Order Status (Admin Only)
router.put('/orders/:id/status', authAdmin, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const Promo = require('../models/Promo');

// Add Promo Code (Admin Only)
router.post('/promos', authAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, isActive, maxUses } = req.body;
    let promo = await Promo.findOne({ code: code.toUpperCase() });
    if (promo) return res.status(400).json({ error: 'Promo code already exists' });
    
    promo = new Promo({ code, discountType, discountValue, isActive, maxUses });
    await promo.save();
    res.status(201).json(promo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all Promos (Admin Only)
router.get('/promos', authAdmin, async (req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Promo
router.delete('/promos/:id', authAdmin, async (req, res) => {
  try {
    await Promo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promo deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
