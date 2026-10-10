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

const Commission = require('../models/Commission');

// Dashboard Real Stats Route (Admin Only)
router.get('/dashboard-stats', authAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      dateFilter = {
        createdAt: {
          $gte: start,
          $lte: end
        }
      };
    }

    const usersCount = await User.countDocuments({ role: { $ne: 'admin' }, ...dateFilter });
    const ordersCount = await Order.countDocuments({ ...dateFilter });
    const productsCount = await Product.countDocuments();
    const categoriesCount = await Category.countDocuments();

    // Total Revenue (excluding Failed or Returned)
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: { $ne: 'Failed' }, status: { $ne: 'Returned' }, ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Total Returned Amount
    const returnedAgg = await Order.aggregate([
      { $match: { status: 'Returned', ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const returnedAmount = returnedAgg.length > 0 ? returnedAgg[0].total : 0;

    // Total Commissions
    const commissionAgg = await Commission.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ]);
    const totalCommissions = commissionAgg.length > 0 ? commissionAgg[0].total : 0;

    // Net Revenue
    const netRevenue = revenue - totalCommissions;

    // Daily Sales Data for the last 30 days (or based on filter)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let startFilterDate = thirtyDaysAgo;
    let endFilterDate = new Date();
    
    if (startDate && endDate) {
      startFilterDate = new Date(startDate);
      startFilterDate.setHours(0, 0, 0, 0);
      
      endFilterDate = new Date(endDate);
      endFilterDate.setHours(23, 59, 59, 999);
    }

    const dailyDataAgg = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startFilterDate, $lte: endFilterDate },
          paymentStatus: { $ne: 'Failed' }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailyRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Daily Commission Data
    const dailyCommAgg = await Commission.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startFilterDate, $lte: endFilterDate },
          status: { $ne: 'Cancelled' }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailyCommission: { $sum: '$commissionAmount' }
        }
      }
    ]);

    // Merge Daily Data
    const salesDataMap = {};
    dailyDataAgg.forEach(item => {
      salesDataMap[item._id] = {
        date: item._id,
        revenue: item.dailyRevenue,
        commission: 0,
        orders: item.orderCount
      };
    });

    dailyCommAgg.forEach(item => {
      if (!salesDataMap[item._id]) {
        salesDataMap[item._id] = { date: item._id, revenue: 0, commission: 0, orders: 0 };
      }
      salesDataMap[item._id].commission = item.dailyCommission;
    });

    const salesData = Object.values(salesDataMap).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate daily Net Revenue
    salesData.forEach(item => {
      item.netRevenue = item.revenue - item.commission;
    });

    // Monthly Data
    const monthlyDataMap = {};
    salesData.forEach(item => {
      const month = item.date.substring(0, 7); // YYYY-MM
      if (!monthlyDataMap[month]) {
        monthlyDataMap[month] = { date: month, revenue: 0, commission: 0, netRevenue: 0, orders: 0 };
      }
      monthlyDataMap[month].revenue += item.revenue;
      monthlyDataMap[month].commission += item.commission;
      monthlyDataMap[month].netRevenue += item.netRevenue;
      monthlyDataMap[month].orders += item.orders;
    });
    const monthlySalesData = Object.values(monthlyDataMap).sort((a, b) => a.date.localeCompare(b.date));

    // Low Stock Information (5 or below)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select('name stock price')
      .sort({ stock: 1 })
      .limit(5);

    const recentOrdersQuery = dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {};
    const recentOrders = await Order.find(recentOrdersQuery)
      .populate('user', 'name email')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .limit(startDate ? 0 : 6); // fetch all if filtered, else 6

    res.json({
      usersCount,
      ordersCount,
      productsCount,
      categoriesCount,
      revenue,
      returnedAmount,
      totalCommissions,
      netRevenue,
      salesData,
      monthlySalesData,
      lowStockProducts,
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

// Get all product reviews across all products (Admin)
router.get('/reviews', authAdmin, async (req, res) => {
  try {
    const products = await Product.find({ 'reviews.0': { $exists: true } }).select('name reviews');
    let allReviews = [];
    products.forEach(p => {
      p.reviews.forEach(r => {
        allReviews.push({ ...r.toObject(), product: { _id: p._id, name: p.name } });
      });
    });
    
    // Sort by newest first
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allReviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve or reject a review (Admin)
router.put('/reviews/:productId/:reviewId/approve', authAdmin, async (req, res) => {
  try {
    const { isApproved } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    review.isApproved = isApproved;
    
    // Calculate new average rating based on approved reviews only
    const approvedReviews = product.reviews.filter(r => r.isApproved);
    if (approvedReviews.length > 0) {
      const avg = approvedReviews.reduce((acc, item) => item.rating + acc, 0) / approvedReviews.length;
      product.rating = Math.round(avg * 10) / 10;
    } else {
      product.rating = 0;
    }

    await product.save();
    res.json({ message: 'Review status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
