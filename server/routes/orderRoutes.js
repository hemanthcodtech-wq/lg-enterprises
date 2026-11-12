const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Promo = require('../models/Promo');
const User = require('../models/User');
const Commission = require('../models/Commission');
const Product = require('../models/Product');
const { authUser } = require('../middleware/auth');
const Razorpay = require('razorpay');
const sendEmail = require('../utils/mailer');
const { processMaturedCommissions } = require('../utils/commissionHelper');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_TwSiFXPfioWrAO',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'ku96j7GVYCNRKLb4iT9O12aX',
});

// Reusable Helper to finalize an Order upon successful payment verification
async function finalizeOrder(order, userObj, details = {}) {
  if (order.paymentStatus === 'Completed') {
    return order;
  }

  order.paymentStatus = 'Completed';
  order.status = 'Pending';
  if (details.razorpayPaymentId) order.razorpayPaymentId = details.razorpayPaymentId;
  if (details.razorpaySignature) order.razorpaySignature = details.razorpaySignature;
  if (details.paymentMethod) order.paymentMethod = details.paymentMethod;
  await order.save();

  // Deduct stock for each item in the order
  for (const item of order.items) {
    const pId = item.product?._id || item.product;
    if (pId) {
      const updatedProd = await Product.findByIdAndUpdate(pId, {
        $inc: { stock: -item.quantity }
      }, { new: true });
      if (updatedProd && updatedProd.stock < 0) {
        updatedProd.stock = 0;
        await updatedProd.save();
      }
    }
  }

  // 5-Level Multi-Tier Referral Commission Distribution
  try {
    const TIER_RATES = [
      { level: 1, percent: 5.0, factor: 0.05 },
      { level: 2, percent: 2.5, factor: 0.025 },
      { level: 3, percent: 2.0, factor: 0.02 },
      { level: 4, percent: 1.5, factor: 0.015 },
      { level: 5, percent: 1.0, factor: 0.01 },
    ];

    let currentUplineId = userObj?.referredBy;
    let currentLevel = 1;
    const visitedUsers = new Set([userObj?._id?.toString()]);

    while (currentUplineId && currentLevel <= 5) {
      const uplineIdStr = currentUplineId.toString();
      if (visitedUsers.has(uplineIdStr)) break;
      visitedUsers.add(uplineIdStr);

      const uplineUser = await User.findById(currentUplineId);
      if (!uplineUser) break;

      const tier = TIER_RATES[currentLevel - 1];
      const commissionAmount = Math.round((order.totalAmount * tier.factor) * 100) / 100;

      if (commissionAmount > 0) {
        uplineUser.pendingWalletBalance = Math.round(((uplineUser.pendingWalletBalance || 0) + commissionAmount) * 100) / 100;
        await uplineUser.save();

        await Commission.create({
          recipient: uplineUser._id,
          buyer: userObj._id,
          order: order._id,
          level: tier.level,
          commissionPercent: tier.percent,
          commissionAmount,
          orderTotal: order.totalAmount
        });
      }

      currentUplineId = uplineUser.referredBy;
      currentLevel++;
    }
  } catch (commErr) {
    console.error('Error distributing commissions:', commErr);
  }

  // Auto-check qualification for active Return Gift Campaigns
  (async () => {
    try {
      const ReturnGiftCampaign = require('../models/ReturnGiftCampaign');
      const ReturnGiftClaim = require('../models/ReturnGiftClaim');
      const now = new Date();
      const activeCampaigns = await ReturnGiftCampaign.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      });

      for (const camp of activeCampaigns) {
        const userOrders = await Order.find({
          user: userObj._id,
          createdAt: { $gte: camp.startDate, $lte: camp.endDate },
          status: { $nin: ['Cancelled', 'Returned'] }
        });
        const userPurchased = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        if (userPurchased >= camp.targetAmount) {
          let claim = await ReturnGiftClaim.findOne({ campaign: camp._id, user: userObj._id });
          if (!claim) {
            claim = new ReturnGiftClaim({
              campaign: camp._id,
              user: userObj._id,
              totalPurchased: userPurchased,
              targetAmount: camp.targetAmount,
              qualifiedAt: new Date(),
              status: 'Pending Dispatch',
              shippingAddress: {
                name: userObj.name,
                phone: userObj.phone || '',
                email: userObj.email || '',
                address: order.shippingAddress || userObj.address || ''
              }
            });
            await claim.save();
          } else {
            claim.totalPurchased = userPurchased;
            await claim.save();
          }
        }
      }
    } catch (giftErr) {
      console.error('Error auto-checking return gift claim:', giftErr);
    }
  })();

  // Send Invoice Email
  try {
    const invoiceHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">SVR Mart - Order Confirmation</h2>
        <p>Dear ${userObj?.name || 'Valued Customer'},</p>
        <p>Thank you for your purchase! Your order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> has been successfully placed.</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Invoice Summary</h3>
          <p><strong>Total Paid:</strong> ₹${order.totalAmount}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Online'}</p>
          ${order.razorpayPaymentId ? `<p><strong>Razorpay Payment ID:</strong> ${order.razorpayPaymentId}</p>` : ''}
        </div>
        <p>You can track your order or download the full invoice PDF from your dashboard.</p>
        <br/>
        <p>Best regards,<br/>SVR Mart Team</p>
      </div>
    `;
    
    if (userObj?.email) {
      await sendEmail({
        email: userObj.email,
        subject: `Order Confirmation #${order._id.toString().slice(-8).toUpperCase()}`,
        html: invoiceHtml
      });
    }
  } catch (emailErr) {
    console.error('Failed to send invoice email:', emailErr);
  }

  return order;
}

// Create Razorpay Order & Pre-create Pending Order in MongoDB (Guarantees no lost orders)
router.post('/create-razorpay-order', authUser, async (req, res) => {
  try {
    const { amount, items, totalAmount, promoId, walletUsed, shippingAddress } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const userObj = await User.findById(req.user.id);
    if (!userObj) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify stock availability if items provided
    if (items && items.length > 0) {
      for (const item of items) {
        const pId = item.product?._id || item.product;
        if (pId) {
          const prod = await Product.findById(pId);
          if (prod && prod.stock < item.quantity) {
            return res.status(400).json({
              error: `Insufficient stock for "${prod.name}". Only ${prod.stock} unit(s) remaining.`
            });
          }
        }
      }
    }

    // Check promo requirements if any
    if (promoId) {
      const promo = await Promo.findById(promoId);
      if (promo && promo.minOrderAmount && promo.minOrderAmount > 0 && (totalAmount || amount) < promo.minOrderAmount) {
        return res.status(400).json({
          error: `Minimum order amount of ₹${promo.minOrderAmount} required for this promo code`
        });
      }
    }

    // Pre-create the order in MongoDB with status 'Pending Payment'
    let localOrder = null;
    if (items && items.length > 0 && shippingAddress) {
      localOrder = new Order({
        user: req.user.id,
        items,
        totalAmount: totalAmount || amount,
        paymentMethod: 'UPI / Online',
        paymentStatus: 'Pending',
        status: 'Pending Payment',
        shippingAddress,
        customerEmail: userObj.email,
        customerPhone: userObj.phone
      });
      await localOrder.save();
    }

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: `rcpt_${localOrder ? localOrder._id.toString().slice(-8) : Date.now()}`,
      notes: {
        userId: req.user.id,
        localOrderId: localOrder ? localOrder._id.toString() : ''
      }
    };
    
    const order = await razorpayInstance.orders.create(options);

    if (localOrder) {
      localOrder.razorpayOrderId = order.id;
      await localOrder.save();
    }

    res.json({
      ...order,
      localOrderId: localOrder ? localOrder._id : null,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_TwSiFXPfioWrAO'
    });
  } catch (err) {
    console.error('Razorpay Error:', err);
    res.status(500).json({ error: err.message || 'Failed to create Razorpay order' });
  }
});

// Verify Razorpay Payment (Client Callback with HMAC-SHA256 Signature Verification)
router.post('/verify-payment', authUser, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, localOrderId, orderData } = req.body;
    const crypto = require('crypto');

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'ku96j7GVYCNRKLb4iT9O12aX')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
    }

    let order = null;
    if (localOrderId) {
      order = await Order.findById(localOrderId);
    }
    if (!order && razorpay_order_id) {
      order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    }

    const userObj = await User.findById(req.user.id);

    // If pre-created order wasn't found (fallback), create now
    if (!order && orderData) {
      order = new Order({
        user: req.user.id,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        paymentMethod: 'UPI / Online',
        paymentStatus: 'Pending',
        status: 'Pending Payment',
        shippingAddress: orderData.shippingAddress,
        customerEmail: userObj?.email,
        customerPhone: userObj?.phone
      });
      await order.save();
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found for verification' });
    }

    // Deduct wallet if used
    if (orderData?.walletUsed && orderData.walletUsed > 0 && userObj) {
      if (userObj.walletBalance >= orderData.walletUsed) {
        userObj.walletBalance -= orderData.walletUsed;
        await userObj.save();
      }
    }

    // Increment promo uses
    if (orderData?.promoId) {
      const promo = await Promo.findById(orderData.promoId);
      if (promo) {
        promo.currentUses += 1;
        await promo.save();
      }
    }

    const completedOrder = await finalizeOrder(order, userObj, {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentMethod: 'UPI / Online'
    });

    res.json({ success: true, order: completedOrder });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Razorpay Server-to-Server Webhook (Handles background UPI Intent completions reliably)
router.post('/razorpay-webhook', async (req, res) => {
  try {
    const crypto = require('crypto');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      if (expectedSig !== signature) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id || req.body.payload?.order?.entity?.id;
      const rzpPaymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || req.body.payload?.order?.entity?.notes || {};

      let order = null;
      if (notes.localOrderId) {
        order = await Order.findById(notes.localOrderId);
      }
      if (!order && rzpOrderId) {
        order = await Order.findOne({ razorpayOrderId: rzpOrderId });
      }

      if (order && order.paymentStatus !== 'Completed') {
        const userObj = await User.findById(order.user);
        await finalizeOrder(order, userObj, {
          razorpayPaymentId: rzpPaymentId,
          paymentMethod: paymentEntity?.method === 'upi' ? 'UPI / Razorpay' : 'Card / Razorpay'
        });
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
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

    // Verify product stock availability first before placing order
    for (const item of items) {
      const pId = item.product?._id || item.product;
      if (pId) {
        const prod = await Product.findById(pId);
        if (!prod) {
          return res.status(404).json({ error: 'One or more products were not found in the catalog' });
        }
        if (prod.stock < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for "${prod.name}". Only ${prod.stock} unit(s) remaining.`
          });
        }
      }
    }

    if (promoId) {
      const promo = await Promo.findById(promoId);
      if (promo) {
        if (promo.minOrderAmount && promo.minOrderAmount > 0 && totalAmount < promo.minOrderAmount) {
          return res.status(400).json({
            error: `Minimum order amount of ₹${promo.minOrderAmount} required for this promo code`
          });
        }
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

    // Auto-check qualification for active Return Gift Campaigns
    (async () => {
      try {
        const ReturnGiftCampaign = require('../models/ReturnGiftCampaign');
        const ReturnGiftClaim = require('../models/ReturnGiftClaim');
        const now = new Date();
        const activeCampaigns = await ReturnGiftCampaign.find({
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gte: now }
        });

        for (const camp of activeCampaigns) {
          const userOrders = await Order.find({
            user: req.user.id,
            createdAt: { $gte: camp.startDate, $lte: camp.endDate },
            status: { $nin: ['Cancelled', 'Returned'] }
          });
          const userPurchased = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          if (userPurchased >= camp.targetAmount) {
            let claim = await ReturnGiftClaim.findOne({ campaign: camp._id, user: req.user.id });
            if (!claim) {
              claim = new ReturnGiftClaim({
                campaign: camp._id,
                user: req.user.id,
                totalPurchased: userPurchased,
                targetAmount: camp.targetAmount,
                qualifiedAt: new Date(),
                status: 'Pending Dispatch',
                shippingAddress: {
                  name: userObj.name,
                  phone: userObj.phone || '',
                  email: userObj.email || '',
                  address: shippingAddress || userObj.address || ''
                }
              });
              await claim.save();
            } else {
              claim.totalPurchased = userPurchased;
              await claim.save();
            }
          }
        }
      } catch (giftErr) {
        console.error('Error auto-checking return gift claim:', giftErr);
      }
    })();

    // Deduct stock for each item in the order
    for (const item of items) {
      const pId = item.product?._id || item.product;
      if (pId) {
        const updatedProd = await Product.findByIdAndUpdate(pId, {
          $inc: { stock: -item.quantity }
        }, { new: true });
        if (updatedProd && updatedProd.stock < 0) {
          updatedProd.stock = 0;
          await updatedProd.save();
        }
      }
    }

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
        uplineUser.pendingWalletBalance = Math.round(((uplineUser.pendingWalletBalance || 0) + commissionAmount) * 100) / 100;
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
        <h2 style="color: #2563eb;">SVR Mart - Order Confirmation</h2>
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
        <p>Best regards,<br/>SVR Mart Team</p>
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

// Get Active Promos (for customers to see)
router.get('/active-promos', async (req, res) => {
  try {
    const promos = await Promo.find({ 
      isActive: true,
      $expr: {
        $or: [
          { $eq: ["$maxUses", null] },
          { $lt: ["$currentUses", "$maxUses"] }
        ]
      }
    });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch promos' });
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

    if (promo.minOrderAmount && promo.minOrderAmount > 0 && Number(cartTotal) < promo.minOrderAmount) {
      return res.status(400).json({ 
        error: `Minimum order amount of ₹${promo.minOrderAmount} required for code ${promo.code}. (Your current total is ₹${cartTotal})` 
      });
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
      minOrderAmount: promo.minOrderAmount || 0,
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
    // Auto-check and process matured commissions in background
    processMaturedCommissions().catch(err => console.error('Error auto-maturing commissions in myorders:', err));

    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images slug')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Cancel or Return Order (Customer)
router.put('/:id/status', authUser, async (req, res) => {
  try {
    const { action, refundDetails, returnReason } = req.body; // 'cancel', 'return', 'request_return', or 'update_refund'
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (action === 'update_refund') {
      if (!refundDetails) return res.status(400).json({ error: 'Refund details are required' });
      order.refundDetails = refundDetails;
      await order.save();
      return res.json(order);
    }

    if (action === 'cancel') {
      if (order.status !== 'Pending' && order.status !== 'Processing') {
        return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
      }
      order.status = 'Cancelled';

      // Restore stock when order is cancelled (prevent double increment)
      if (!order.isStockRestocked) {
        for (const item of order.items) {
          const pId = item.product?._id || item.product;
          if (pId) {
            await Product.findByIdAndUpdate(pId, { $inc: { stock: item.quantity } });
          }
        }
        order.isStockRestocked = true;
      }

      // Repay amount to customer's wallet if payment was already completed
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

      // Reverse pending referral commissions if cancelled
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

    } else if (action === 'return' || action === 'request_return') {
      if (order.status !== 'Delivered') {
        return res.status(400).json({ error: 'Only delivered orders can be returned' });
      }

      // Verify 7-day return policy
      const deliveryDate = order.deliveredAt || order.updatedAt || order.createdAt;
      const daysSinceDelivery = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery > 7) {
        return res.status(400).json({ 
          error: 'Return window expired. Returns are only allowed within 7 days of delivery.' 
        });
      }

      // Customer requests return -> status transitions to 'Return Requested'
      // Note: Admin must physically receive the returned item to mark it 'Returned',
      // which restocks inventory and repays the customer amount.
      order.status = 'Return Requested';
      order.returnRequestedAt = new Date();
      if (returnReason) order.returnReason = returnReason;
      if (refundDetails) order.refundDetails = refundDetails;

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    if (refundDetails && action !== 'cancel') {
      order.refundDetails = refundDetails;
    }

    if (!order.shippingAddress) order.shippingAddress = 'Address not provided (legacy order)';
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});


// Get Single Order Details
router.get('/:id', authUser, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.product', 'name images price description reviews');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
