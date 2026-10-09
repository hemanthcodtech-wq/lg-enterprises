const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Promo = require('../models/Promo');
const User = require('../models/User');
const Commission = require('../models/Commission');
const { authUser } = require('../middleware/auth');
const Razorpay = require('razorpay');
const sendEmail = require('../utils/mailer');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TfwrOlkqXf2RIf',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'QIJa5lCuJC87EJdLDrgKnLDF',
});

// Create Razorpay Order
router.post('/create-razorpay-order', authUser, async (req, res) => {
  try {
    const { amount } = req.body;
    
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };
    
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Razorpay Error:', err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// Place an Order (Customer)
router.post('/', authUser, async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, promoId, walletUsed, shippingAddress } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No order items' });
    }
    
    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    if (promoId) {
      const promo = await Promo.findById(promoId);
      if (promo) {
        promo.currentUses += 1;
        await promo.save();
      }
    }

    const userObj = await User.findById(req.user.id);
    if (!userObj) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user's default address if provided
    if (shippingAddress) {
      userObj.address = shippingAddress;
    }

    if (walletUsed && walletUsed > 0) {
      if (userObj.walletBalance < walletUsed) {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }
      userObj.walletBalance -= walletUsed;
    }
    await userObj.save();

    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'Card',
      paymentStatus: 'Completed',
      shippingAddress
    });

    await order.save(); // CRITICAL FIX: Save the order to the database

    // 5-Level Multi-Tier Referral Commission Distribution
    // Level 1: 5%, Level 2: 2.5%, Level 3: 2%, Level 4: 1.5%, Level 5: 1%
    const TIER_RATES = [
      { level: 1, percent: 5.0, factor: 0.05 },
      { level: 2, percent: 2.5, factor: 0.025 },
      { level: 3, percent: 2.0, factor: 0.02 },
      { level: 4, percent: 1.5, factor: 0.015 },
      { level: 5, percent: 1.0, factor: 0.01 },
    ];

    let currentUplineId = userObj.referredBy;
    let currentLevel = 1;
    const visitedUsers = new Set([userObj._id.toString()]);

    while (currentUplineId && currentLevel <= 5) {
      const uplineIdStr = currentUplineId.toString();
      if (visitedUsers.has(uplineIdStr)) break; // Prevent circular reference
      visitedUsers.add(uplineIdStr);

      const uplineUser = await User.findById(currentUplineId);
      if (!uplineUser) break;

      const tier = TIER_RATES[currentLevel - 1];
      const commissionAmount = Math.round((totalAmount * tier.factor) * 100) / 100;

      if (commissionAmount > 0) {
        uplineUser.walletBalance = Math.round(((uplineUser.walletBalance || 0) + commissionAmount) * 100) / 100;
        uplineUser.totalReferralEarnings = Math.round(((uplineUser.totalReferralEarnings || 0) + commissionAmount) * 100) / 100;
        await uplineUser.save();

        await Commission.create({
          recipient: uplineUser._id,
          buyer: userObj._id,
          order: order._id,
          level: tier.level,
          commissionPercent: tier.percent,
          commissionAmount,
          orderTotal: totalAmount
        });
      }

      currentUplineId = uplineUser.referredBy;
      currentLevel++;
    }

    // Send Invoice Email
    const invoiceHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">LG Enterprises - Order Confirmation</h2>
        <p>Dear ${userObj.name},</p>
        <p>Thank you for your purchase! Your order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> has been successfully placed.</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Invoice Summary</h3>
          <p><strong>Total Paid:</strong> ₹${totalAmount}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod || 'Card'}</p>
          ${walletUsed ? `<p><strong>Wallet Used:</strong> ₹${walletUsed}</p>` : ''}
        </div>
        <p>You can track your order or download the full invoice PDF from your dashboard.</p>
        <br/>
        <p>Best regards,<br/>LG Enterprises Team</p>
      </div>
    `;
    
    try {
      await sendEmail({
        email: userObj.email,
        subject: `Order Confirmation #${order._id.toString().slice(-8).toUpperCase()}`,
        html: invoiceHtml
      });
    } catch (emailErr) {
      console.error('Failed to send invoice email:', emailErr);
    }

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Validate Promo Code
router.post('/validate-promo', authUser, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const promo = await Promo.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!promo) {
      return res.status(404).json({ error: 'Invalid or inactive promo code' });
    }
    
    if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }

    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = (cartTotal * promo.discountValue) / 100;
    } else if (promo.discountType === 'fixed') {
      discount = promo.discountValue;
    }

    // Don't allow discount greater than cart total
    if (discount > cartTotal) {
      discount = cartTotal;
    }

    res.json({ 
      discount, 
      promoId: promo._id,
      code: promo.code,
      message: 'Promo code applied successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get User Orders
router.get('/myorders', authUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images slug')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get Single Order Details
router.get('/:id', authUser, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.product', 'name images price description');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
