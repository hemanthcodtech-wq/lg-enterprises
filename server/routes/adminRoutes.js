const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Order = require('../models/Order');
const Withdrawal = require('../models/Withdrawal');
const { processMaturedCommissions } = require('../utils/commissionHelper');

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
    await processMaturedCommissions();
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

    const pendingWithdrawalsCount = await Withdrawal.countDocuments({ status: 'Pending' });

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
      recentOrders,
      pendingWithdrawalsCount
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
    processMaturedCommissions().catch(err => console.error('Admin orders auto-mature error:', err));

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

    if (status === 'Delivered') {
      order.status = 'Delivered';
      if (!order.deliveredAt) {
        order.deliveredAt = new Date();
      }
      // CRITICAL REQUIREMENT: Referral commissions remain PENDING for 7 days during return window!
      // Do not credit immediately. Set matureAt to 7 days from delivery date.
      const matureAt = new Date(order.deliveredAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      await Commission.updateMany(
        { order: order._id, status: 'Pending' },
        { $set: { matureAt } }
      );
    } else if (status === 'Returned') {
      // Admin marks return item as received:
      // 1. Stock added back to inventory
      // 2. Amount repaid/refunded to customer
      // 3. Referral commissions cancelled
      order.status = 'Returned';
      if (!order.returnedAt) order.returnedAt = new Date();

      // 1. Count add to inventory
      if (!order.isStockRestocked) {
        for (const item of order.items) {
          const pId = item.product?._id || item.product;
          if (pId) {
            await Product.findByIdAndUpdate(pId, { $inc: { stock: item.quantity } });
          }
        }
        order.isStockRestocked = true;
      }

      // 2. Amount is repaid to customer
      order.paymentStatus = 'Refunded';
      if (!order.refundedAt) order.refundedAt = new Date();
      if (!order.isAmountRepaid) {
        const customer = await User.findById(order.user);
        if (customer) {
          customer.walletBalance = Math.round(((customer.walletBalance || 0) + order.totalAmount) * 100) / 100;
          await customer.save();
        }
        order.isAmountRepaid = true;
      }

      // 3. Cancel commissions
      const commissions = await Commission.find({ order: order._id, status: { $ne: 'Cancelled' } });
      for (const comm of commissions) {
        const user = await User.findById(comm.recipient);
        if (user) {
          if (comm.status === 'Pending') {
            user.pendingWalletBalance = Math.max(0, Math.round(((user.pendingWalletBalance || 0) - comm.commissionAmount) * 100) / 100);
          } else if (comm.status === 'Credited') {
            user.walletBalance = Math.max(0, Math.round(((user.walletBalance || 0) - comm.commissionAmount) * 100) / 100);
            user.totalReferralEarnings = Math.max(0, Math.round(((user.totalReferralEarnings || 0) - comm.commissionAmount) * 100) / 100);
          }
          await user.save();
        }
        comm.status = 'Cancelled';
        comm.commissionAmount = 0;
        await comm.save();
      }
    } else if (status === 'Cancelled') {
      order.status = 'Cancelled';

      // Restore stock for items in the cancelled order
      if (!order.isStockRestocked) {
        for (const item of order.items) {
          const pId = item.product?._id || item.product;
          if (pId) {
            await Product.findByIdAndUpdate(pId, { $inc: { stock: item.quantity } });
          }
        }
        order.isStockRestocked = true;
      }

      // If customer had completed payment, refund amount to customer's wallet
      if (order.paymentStatus === 'Completed' && !order.isAmountRepaid) {
        order.paymentStatus = 'Refunded';
        order.refundedAt = new Date();
        const customer = await User.findById(order.user);
        if (customer) {
          customer.walletBalance = Math.round(((customer.walletBalance || 0) + order.totalAmount) * 100) / 100;
          await customer.save();
        }
        order.isAmountRepaid = true;
      }

      // Cancel commissions
      const commissions = await Commission.find({ order: order._id, status: { $ne: 'Cancelled' } });
      for (const comm of commissions) {
        const user = await User.findById(comm.recipient);
        if (user) {
          if (comm.status === 'Pending') {
            user.pendingWalletBalance = Math.max(0, Math.round(((user.pendingWalletBalance || 0) - comm.commissionAmount) * 100) / 100);
          } else if (comm.status === 'Credited') {
            user.walletBalance = Math.max(0, Math.round(((user.walletBalance || 0) - comm.commissionAmount) * 100) / 100);
            user.totalReferralEarnings = Math.max(0, Math.round(((user.totalReferralEarnings || 0) - comm.commissionAmount) * 100) / 100);
          }
          await user.save();
        }
        comm.status = 'Cancelled';
        comm.commissionAmount = 0;
        await comm.save();
      }
    }

    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Order Alerts for Sidebar & Top Bar (Admin Only)
router.get('/orders/alerts', authAdmin, async (req, res) => {
  try {
    const pendingCount = await Order.countDocuments({ status: 'Pending' });
    const totalOrders = await Order.countDocuments();
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const newOrdersToday = await Order.countDocuments({ createdAt: { $gte: startOfToday } });
    
    const recentAlerts = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(15)
      .select('_id totalAmount status createdAt user items');
    
    res.json({
      pendingCount,
      totalOrders,
      newOrdersToday,
      recentAlerts
    });
  } catch (err) {
    console.error('Error fetching order alerts:', err);
    res.status(500).json({ error: 'Failed to fetch order alerts' });
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
    const { code, discountType, discountValue, isActive, maxUses, minOrderAmount } = req.body;
    let promo = await Promo.findOne({ code: code.toUpperCase() });
    if (promo) return res.status(400).json({ error: 'Promo code already exists' });
    
    promo = new Promo({ 
      code, 
      discountType, 
      discountValue, 
      isActive, 
      maxUses,
      minOrderAmount: Number(minOrderAmount) || 0
    });
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

// Get New Referred / Registered Users Alerts (Admin)
router.get('/users/alerts', authAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalReferred = await User.countDocuments({ role: { $ne: 'admin' }, referredBy: { $exists: true, $ne: null } });

    // Recent 24h new users count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const newTodayCount = await User.countDocuments({ role: { $ne: 'admin' }, createdAt: { $gte: startOfToday } });

    // Last 15 enrolled users (prioritizing referred, or recent registrations)
    const recentAlerts = await User.find({ role: { $ne: 'admin' } })
      .populate('referredBy', 'name email referralCode')
      .select('name email phone referralCode referredBy createdAt isEmailVerified')
      .sort({ createdAt: -1 })
      .limit(15);

    res.json({
      totalUsers,
      totalReferred,
      newTodayCount,
      recentAlerts
    });
  } catch (err) {
    console.error('Error fetching user alerts:', err);
    res.status(500).json({ error: 'Failed to fetch user alerts' });
  }
});

// Get Withdrawal Alerts (Admin)
router.get('/withdrawals/alerts', authAdmin, async (req, res) => {
  try {
    const pendingCount = await Withdrawal.countDocuments({ status: 'Pending' });
    const totalWithdrawals = await Withdrawal.countDocuments();
    const recentAlerts = await Withdrawal.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(15);

    res.json({
      pendingCount,
      totalWithdrawals,
      recentAlerts
    });
  } catch (err) {
    console.error('Error fetching withdrawal alerts:', err);
    res.status(500).json({ error: 'Failed to fetch withdrawal alerts' });
  }
});

// Get All Withdrawals (Admin)
router.get('/withdrawals', authAdmin, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate('user', 'name email phone walletBalance').sort({ createdAt: -1 });
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

    // Mark as Paid, Approved or Completed
    withdrawal.status = status;
    withdrawal.adminNote = adminNote;

    if (status === 'Paid' || status === 'Completed' || status === 'Approved') {
      // Deduct the wallet now that it is completed/paid
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

const Setting = require('../models/Setting');

// Get Store Settings (Admin)
router.get('/settings', authAdmin, async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
      await settings.save();
    }
    const adminUser = await User.findById(req.user.id).select('name email');
    res.json({
      settings,
      admin: adminUser ? { name: adminUser.name, email: adminUser.email } : null
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update Store Settings (Admin)
router.put('/settings', authAdmin, async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }
    const allowedFields = [
      'storeName', 'supportEmail', 'supportPhone', 'storeAddress',
      'locationCity', 'mapPinUrl', 'mapEmbedIframe', 'whatsappNumber', 'supportTiming',
      'socialFacebook', 'socialTwitter', 'socialInstagram', 'socialYoutube', 'socialLinkedin', 'socialWhatsapp',
      'currency', 'timezone', 'enablePromos', 'enableFreeShipping', 
      'freeShippingMin', 'taxRate', 'lowStockAlert', 'maintenanceMode', 'orderEmailAlerts'
    ];
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) {
        settings[f] = req.body[f];
      }
    });
    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Change Admin Password / Profile (Admin)
router.put('/change-password', authAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword, adminName, adminEmail } = req.body;
    const admin = await User.findById(req.user.id);
    if (!admin) return res.status(404).json({ error: 'Admin account not found' });

    // Update profile info if provided
    if (adminName && adminName.trim()) admin.name = adminName.trim();
    if (adminEmail && adminEmail.trim() && adminEmail.toLowerCase() !== admin.email) {
      const existing = await User.findOne({ email: adminEmail.toLowerCase(), _id: { $ne: admin._id } });
      if (existing) return res.status(400).json({ error: 'Email address already in use by another account' });
      admin.email = adminEmail.toLowerCase();
    }

    // Update password if provided
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change your password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password does not match our records' });
      }
      if (newPassword.trim().length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword.trim(), salt);
    }

    await admin.save();
    res.json({ 
      message: 'Admin security settings updated successfully', 
      admin: { name: admin.name, email: admin.email, role: admin.role } 
    });
  } catch (err) {
    console.error('Error changing admin credentials:', err);
    res.status(500).json({ error: 'Failed to update admin security settings' });
  }
});

// Comprehensive Inventory & Category Sales Analysis (Admin Only)
router.get('/inventory-analysis', authAdmin, async (req, res) => {
  try {
    const { timeRange } = req.query; // 'all', '7d', '30d', '90d'
    
    let dateFilter = { status: { $nin: ['Cancelled'] } };
    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      let days = 30;
      if (timeRange === '7d') days = 7;
      if (timeRange === '30d') days = 30;
      if (timeRange === '90d') days = 90;
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      dateFilter.createdAt = { $gte: startDate };
    }

    const [allProducts, allCategories, orders] = await Promise.all([
      Product.find().populate('category', 'name slug image bannerImage status'),
      Category.find(),
      Order.find(dateFilter)
    ]);

    // Aggregate sales by product ID
    const salesByProduct = {};
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          const prodId = item.product?._id ? item.product._id.toString() : (item.product ? item.product.toString() : null);
          if (prodId) {
            if (!salesByProduct[prodId]) {
              salesByProduct[prodId] = {
                unitsSold: 0,
                revenue: 0,
                orderCount: 0
              };
            }
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            salesByProduct[prodId].unitsSold += qty;
            salesByProduct[prodId].revenue += (qty * price);
            salesByProduct[prodId].orderCount += 1;
          }
        });
      }
    });

    let totalInventoryUnits = 0;
    let totalInventoryValue = 0; // Total capital tied in warehouse
    let totalUnitsSold = 0;
    let totalRevenue = 0;
    let totalDeadStockValue = 0; // Capital tied in products with 0 sales

    // Process all products
    const productStats = allProducts.map(p => {
      const pId = p._id.toString();
      const sales = salesByProduct[pId] || { unitsSold: 0, revenue: 0, orderCount: 0 };
      const currentStock = Number(p.stock) || 0;
      const price = Number(p.price) || 0;
      const originalPrice = Number(p.originalPrice) || Math.round(price * 1.2);
      const tiedCapital = currentStock * price;
      const views = Number(p.views) || 0;
      const rating = Number(p.rating) || 0;
      const numReviews = Number(p.numReviews) || (p.reviews ? p.reviews.length : 0);

      totalInventoryUnits += currentStock;
      totalInventoryValue += tiedCapital;
      totalUnitsSold += sales.unitsSold;
      totalRevenue += sales.revenue;

      if (sales.unitsSold === 0 && currentStock > 0) {
        totalDeadStockValue += tiedCapital;
      }

      // Stock status categorization
      let stockStatus = 'healthy';
      if (currentStock <= 0) {
        stockStatus = 'out_of_stock';
      } else if (currentStock <= 5) {
        stockStatus = 'low_stock';
      } else if (sales.unitsSold === 0) {
        stockStatus = 'dead_stock';
      }

      // Customer attraction score: combines real views, verified customer reviews, star rating, and unit sales
      const attractionScore = (views * 1) + (numReviews * 8) + (Math.round(rating * 10)) + (sales.unitsSold * 2);
      const conversionRate = views > 0 ? Number(((sales.unitsSold / views) * 100).toFixed(1)) : 0;

      const catName = p.category?.name || 'Uncategorized';
      const catId = p.category?._id ? p.category._id.toString() : 'uncategorized';
      const catSlug = p.category?.slug || 'uncategorized';

      return {
        id: p._id,
        name: p.name,
        slug: p.slug,
        image: p.images?.[0] || 'https://via.placeholder.com/150',
        price,
        originalPrice,
        stock: currentStock,
        tiedCapital,
        unitsSold: sales.unitsSold,
        revenue: sales.revenue,
        orderCount: sales.orderCount,
        views,
        rating,
        numReviews,
        attractionScore,
        conversionRate,
        stockStatus,
        createdAt: p.createdAt,
        category: {
          id: catId,
          name: catName,
          slug: catSlug
        }
      };
    });

    // Process category breakdowns
    const categoryStatsMap = {};
    allCategories.forEach(c => {
      const cId = c._id.toString();
      categoryStatsMap[cId] = {
        id: c._id,
        name: c.name,
        slug: c.slug,
        status: c.status || 'active',
        image: c.image || c.bannerImage || '',
        totalProducts: 0,
        totalStock: 0,
        totalSold: 0,
        totalRevenue: 0,
        tiedCapital: 0,
        views: 0,
        products: []
      };
    });

    categoryStatsMap['uncategorized'] = {
      id: 'uncategorized',
      name: 'Uncategorized',
      slug: 'uncategorized',
      status: 'active',
      image: '',
      totalProducts: 0,
      totalStock: 0,
      totalSold: 0,
      totalRevenue: 0,
      tiedCapital: 0,
      views: 0,
      products: []
    };

    productStats.forEach(p => {
      const cId = p.category.id;
      if (!categoryStatsMap[cId]) {
        categoryStatsMap[cId] = {
          id: cId,
          name: p.category.name,
          slug: p.category.slug,
          status: 'active',
          image: '',
          totalProducts: 0,
          totalStock: 0,
          totalSold: 0,
          totalRevenue: 0,
          tiedCapital: 0,
          views: 0,
          products: []
        };
      }
      const cat = categoryStatsMap[cId];
      cat.totalProducts += 1;
      cat.totalStock += p.stock;
      cat.totalSold += p.unitsSold;
      cat.totalRevenue += p.revenue;
      cat.tiedCapital += p.tiedCapital;
      cat.views += p.views;
      cat.products.push(p);
    });

    if (categoryStatsMap['uncategorized'].totalProducts === 0) {
      delete categoryStatsMap['uncategorized'];
    }

    const categoryList = Object.values(categoryStatsMap).map(c => {
      const sortedProds = [...c.products].sort((a, b) => b.unitsSold - a.unitsSold);
      const topProduct = sortedProds.length > 0 && sortedProds[0].unitsSold > 0 ? sortedProds[0] : null;
      const revenueShare = totalRevenue > 0 ? Number(((c.totalRevenue / totalRevenue) * 100).toFixed(1)) : 0;
      const deadStockCount = c.products.filter(p => p.unitsSold === 0 && p.stock > 0).length;

      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        status: c.status,
        image: c.image,
        totalProducts: c.totalProducts,
        totalStock: c.totalStock,
        totalSold: c.totalSold,
        totalRevenue: c.totalRevenue,
        revenueShare,
        tiedCapital: c.tiedCapital,
        views: c.views,
        deadStockCount,
        topProduct: topProduct ? {
          id: topProduct.id,
          name: topProduct.name,
          image: topProduct.image,
          unitsSold: topProduct.unitsSold,
          revenue: topProduct.revenue
        } : null
      };
    });

    // Categories sorted by revenue descending
    const topCategories = [...categoryList].sort((a, b) => b.totalRevenue - a.totalRevenue || b.totalSold - a.totalSold);

    // Bestseller Products (Ordered & High Velocity)
    const topSellingProducts = [...productStats]
      .filter(p => p.unitsSold > 0)
      .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
      .slice(0, 10);

    // Dead Stock: Products with 0 orders
    const neverOrderedProducts = [...productStats]
      .filter(p => p.unitsSold === 0)
      .sort((a, b) => b.tiedCapital - a.tiedCapital);

    // Products where customers are most attracted (Views + Rating + Reviews)
    const mostAttractedProducts = [...productStats]
      .sort((a, b) => b.attractionScore - a.attractionScore || b.views - a.views)
      .slice(0, 10);

    // High Interest but Low Conversion (Candidates for promos or price drops!)
    const highInterestLowConversion = [...productStats]
      .filter(p => (p.views >= 3 || p.numReviews > 0) && p.unitsSold <= 1)
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    // Urgent Restock Needed (Low Stock with existing demand)
    const lowStockAlerts = [...productStats]
      .filter(p => p.stock <= 5 && p.stock > 0)
      .sort((a, b) => b.unitsSold - a.unitsSold);

    // Completely Sold Out
    const outOfStockAlerts = [...productStats]
      .filter(p => p.stock <= 0)
      .sort((a, b) => b.unitsSold - a.unitsSold);

    res.json({
      summary: {
        totalProducts: allProducts.length,
        totalInventoryUnits,
        totalInventoryValue,
        totalUnitsSold,
        totalRevenue,
        totalOrders: orders.length,
        totalDeadStockValue,
        neverOrderedCount: neverOrderedProducts.length,
        outOfStockCount: outOfStockAlerts.length,
        lowStockCount: lowStockAlerts.length
      },
      topCategories,
      topSellingProducts,
      neverOrderedProducts,
      mostAttractedProducts,
      highInterestLowConversion,
      lowStockAlerts,
      outOfStockAlerts,
      allProducts: productStats
    });
  } catch (err) {
    console.error('Error computing inventory analysis:', err);
    res.status(500).json({ error: 'Failed to compute inventory analysis' });
  }
});

module.exports = router;
