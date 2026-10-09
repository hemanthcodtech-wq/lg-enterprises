const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Order = require('../models/Order');
const Withdrawal = require('../models/Withdrawal');

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
    const user = await User.findById(req.params.id).select('-password').populate('referredBy', 'name');
    const userOrders = await Order.find({ user: req.params.id }).populate('items.product', 'name images price').sort({ createdAt: -1 });
    const referredUsers = await User.find({ referredBy: req.params.id }).select('name email createdAt walletBalance');
    const commissions = await Commission.find({ recipient: req.params.id }).populate('buyer', 'name email').populate('order', 'totalAmount _id').sort({ createdAt: -1 });
    const orderCommissions = await Commission.find({ buyer: req.params.id }).populate('recipient', 'name email').sort({ createdAt: -1 });
    
    res.json({
      user,
      orders: userOrders,
      referredUsers,
      commissions,
      orderCommissions
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
      .sort({ createdAt: -1 })
      .lean();

    const commissions = await Commission.aggregate([
      { $group: { _id: '$order', totalCommission: { $sum: '$commissionAmount' } } }
    ]);
    
    const commissionMap = {};
    commissions.forEach(c => commissionMap[c._id.toString()] = c.totalCommission);

    const enrichedOrders = orders.map(o => ({
      ...o,
      totalCommission: commissionMap[o._id.toString()] || 0
    }));

    res.json(enrichedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific Order Details (Admin Only)
router.get('/orders/:id/details', authAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('items.product', 'name images price');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const commissions = await Commission.find({ order: req.params.id }).populate('recipient', 'name email level');
    res.json({ order, commissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Order Status (Admin Only)
router.put('/orders/:id/status', authAdmin, async (req, res) => {
  try {
    const { status, paymentStatus, trackingNumber, courierDetails } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (courierDetails !== undefined) order.courierDetails = courierDetails;
    if (!order.shippingAddress) order.shippingAddress = 'Address not provided (legacy order)';

    await order.save();

    if (status === 'Delivered') {
      const Commission = require('../models/Commission');
      const commissions = await Commission.find({ order: order._id, status: 'Pending' });
      for (const comm of commissions) {
        const user = await User.findById(comm.recipient);
        if (user) {
          user.pendingWalletBalance = Math.max(0, (user.pendingWalletBalance || 0) - comm.commissionAmount);
          user.walletBalance = Math.round(((user.walletBalance || 0) + comm.commissionAmount) * 100) / 100;
          user.totalReferralEarnings = Math.round(((user.totalReferralEarnings || 0) + comm.commissionAmount) * 100) / 100;
          await user.save();
        }
        comm.status = 'Credited';
        await comm.save();
      }
    } else if (status === 'Cancelled' || status === 'Returned') {
      const Commission = require('../models/Commission');
      const commissions = await Commission.find({ order: order._id, status: { $ne: 'Cancelled' } });
      for (const comm of commissions) {
        const user = await User.findById(comm.recipient);
        if (user) {
          if (comm.status === 'Pending') {
            user.pendingWalletBalance = Math.max(0, (user.pendingWalletBalance || 0) - comm.commissionAmount);
          } else if (comm.status === 'Credited') {
            user.walletBalance = Math.max(0, (user.walletBalance || 0) - comm.commissionAmount);
            user.totalReferralEarnings = Math.max(0, (user.totalReferralEarnings || 0) - comm.commissionAmount);
          }
          await user.save();
        }
        comm.status = 'Cancelled';
        comm.commissionAmount = 0;
        await comm.save();
      }
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const Commission = require('../models/Commission');

// Get all Commissions & Income History (Admin Only)
router.get('/commissions', authAdmin, async (req, res) => {
  try {
    const commissions = await Commission.find()
      .populate('recipient', 'name email')
      .populate('buyer', 'name email')
      .populate('order', 'totalAmount createdAt')
      .sort({ createdAt: -1 });
    res.json(commissions);
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

// Get All Withdrawals (Admin)
router.get('/withdrawals', authAdmin, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

// Update Withdrawal Status (Admin)
router.put('/withdrawals/:id/status', authAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id);
    
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    if (withdrawal.status !== 'Pending') return res.status(400).json({ error: 'Withdrawal is already processed' });

    withdrawal.status = status;
    withdrawal.adminNote = adminNote;

    if (status === 'Completed') {
      // Deduct the wallet now that it is completed
      const user = await User.findById(withdrawal.user);
      if (user) {
        user.walletBalance = Math.max(0, (user.walletBalance || 0) - withdrawal.amount);
        await user.save();
      }
    }

    await withdrawal.save();
    res.json(withdrawal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update withdrawal' });
  }
});

module.exports = router;
