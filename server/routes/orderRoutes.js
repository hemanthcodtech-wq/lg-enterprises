const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Promo = require('../models/Promo');
const User = require('../models/User');
const { authUser } = require('../middleware/auth');
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_12345',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_12345',
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
    const { items, totalAmount, paymentMethod, promoId } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No order items' });
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

    if (paymentMethod === 'Wallet') {
      if (userObj.walletBalance < totalAmount) {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }
      userObj.walletBalance -= totalAmount;
      await userObj.save();
    }

    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'Card'
    });

    await order.save();

    // Give referral commission (e.g. 5%)
    if (userObj.referredBy) {
      const referrer = await User.findById(userObj.referredBy);
      if (referrer) {
        const commission = totalAmount * 0.05; // 5% commission
        referrer.walletBalance += commission;
        await referrer.save();
      }
    }

    await order.save();
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
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
