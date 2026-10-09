const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');
const { generateOtpTemplate } = require('../utils/emailTemplates');
const crypto = require('crypto');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, usedReferralCode } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ message: 'An account with this email already exists' });

    let referredBy = null;
    if (usedReferralCode && usedReferralCode.trim()) {
      const cleanCode = usedReferralCode.trim().toUpperCase();
      const referrer = await User.findOne({ referralCode: cleanCode });
      if (referrer) {
        referredBy = referrer._id;
      } else {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const crypto = require('crypto');
    const myReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    user = new User({ 
      name, 
      email: email.toLowerCase(), 
      phone, 
      password: hashedPassword,
      referralCode: myReferralCode,
      referredBy,
      otp,
      otpExpires
    });
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your LG Enterprise account',
        message: `Your OTP for registration is ${otp}. It expires in 10 minutes.`,
        html: generateOtpTemplate('Welcome to LG Enterprises!', 'Please use the following OTP to complete your registration and verify your email address.', otp)
      });
    } catch(err) {
      console.log('Error sending OTP', err);
    }

    return res.status(201).json({
      message: 'OTP sent to email',
      requireOtp: true,
      email: user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    if (!user.isEmailVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000;
      await user.save();
      try {
        await sendEmail({
          email: user.email,
          subject: 'Verify your LG Enterprise account',
          message: `Your OTP for login verification is ${otp}. It expires in 10 minutes.`,
          html: generateOtpTemplate('Login Verification', 'We noticed you are trying to log in but your email is not verified. Please use the following OTP to verify your account.', otp)
        });
      } catch(err) {
        console.log('Error sending OTP', err);
      }
      return res.status(403).json({ message: 'Please verify your email', requireOtp: true, email: user.email });
    }

    // Generate referral code for old users if they don't have one
    if (!user.referralCode) {
      const crypto = require('crypto');
      user.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      await user.save();
    }

    const payload = { userId: user.id, id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode: user.referralCode,
        address: user.address,
        walletBalance: user.walletBalance || 0,
        totalReferralEarnings: user.totalReferralEarnings || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

const { authUser } = require('../middleware/auth');
const Commission = require('../models/Commission');
const Withdrawal = require('../models/Withdrawal');

// Get Current User Profile (Fresh wallet & details)
router.get('/me', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Auto-assign referralCode if missing
    if (!user.referralCode) {
      const crypto = require('crypto');
      user.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      await user.save();
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      referralCode: user.referralCode,
      address: user.address,
      walletBalance: user.walletBalance || 0,
      totalReferralEarnings: user.totalReferralEarnings || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request Withdrawal
router.post('/withdraw', authUser, async (req, res) => {
  try {
    const { amount, method, details } = req.body;
    
    if (!amount || amount <= 0 || !method || !details) {
      return res.status(400).json({ message: 'Invalid withdrawal details' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pendingWithdrawals = await Withdrawal.find({ user: user._id, status: 'Pending' });
    const pendingSum = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    if (user.walletBalance - pendingSum < amount) {
      return res.status(400).json({ message: 'Insufficient available wallet balance due to pending withdrawals' });
    }

    const withdrawal = await Withdrawal.create({
      user: user._id,
      amount,
      method,
      details,
      status: 'Pending'
    });

    res.status(201).json(withdrawal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error processing withdrawal' });
  }
});

// Get My Withdrawals
router.get('/withdrawals', authUser, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get 5-Tier Referral Statistics
router.get('/referral-stats', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Ensure referralCode exists
    if (!user.referralCode) {
      const crypto = require('crypto');
      user.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      await user.save();
    }

    // 1. Traverse 5 levels of downline users
    // Level 1: Users referred directly by this user
    const l1Users = await User.find({ referredBy: user._id }).select('name email createdAt');
    const l1Ids = l1Users.map(u => u._id);

    // Level 2: Users referred by L1
    const l2Users = l1Ids.length > 0 ? await User.find({ referredBy: { $in: l1Ids } }).select('name email createdAt') : [];
    const l2Ids = l2Users.map(u => u._id);

    // Level 3: Users referred by L2
    const l3Users = l2Ids.length > 0 ? await User.find({ referredBy: { $in: l2Ids } }).select('name email createdAt') : [];
    const l3Ids = l3Users.map(u => u._id);

    // Level 4: Users referred by L3
    const l4Users = l3Ids.length > 0 ? await User.find({ referredBy: { $in: l3Ids } }).select('name email createdAt') : [];
    const l4Ids = l4Users.map(u => u._id);

    // Level 5: Users referred by L4
    const l5Users = l4Ids.length > 0 ? await User.find({ referredBy: { $in: l4Ids } }).select('name email createdAt') : [];
    const l5Ids = l5Users.map(u => u._id);

    const levelCounts = {
      level1: l1Users.length,
      level2: l2Users.length,
      level3: l3Users.length,
      level4: l4Users.length,
      level5: l5Users.length,
      totalDownline: l1Users.length + l2Users.length + l3Users.length + l4Users.length + l5Users.length
    };

    // 2. Fetch all commissions earned by this user
    const commissions = await Commission.find({ recipient: user._id })
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .limit(30);

    // 3. Compute earnings breakdown per level
    const earningsAgg = await Commission.aggregate([
      { $match: { recipient: user._id } },
      { $group: { _id: '$level', total: { $sum: '$commissionAmount' }, count: { $sum: 1 } } }
    ]);

    const levelEarnings = {
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      level5: 0
    };

    let totalCommissionEarned = 0;
    earningsAgg.forEach(item => {
      if (item._id >= 1 && item._id <= 5) {
        levelEarnings[`level${item._id}`] = Math.round(item.total * 100) / 100;
      }
      totalCommissionEarned += item.total;
    });

    res.json({
      referralCode: user.referralCode,
      walletBalance: user.walletBalance || 0,
      totalCommissionEarned: Math.round(totalCommissionEarned * 100) / 100,
      levelCounts,
      levelEarnings,
      directReferrals: l1Users,
      tiers: [
        { level: 1, rate: 5.0, count: levelCounts.level1, earned: levelEarnings.level1, description: 'Direct Referrals' },
        { level: 2, rate: 2.5, count: levelCounts.level2, earned: levelEarnings.level2, description: '2nd-Gen Referrals' },
        { level: 3, rate: 2.0, count: levelCounts.level3, earned: levelEarnings.level3, description: '3rd-Gen Referrals' },
        { level: 4, rate: 1.5, count: levelCounts.level4, earned: levelEarnings.level4, description: '4th-Gen Referrals' },
        { level: 5, rate: 1.0, count: levelCounts.level5, earned: levelEarnings.level5, description: '5th-Gen Referrals' },
      ],
      recentCommissions: commissions.map(c => ({
        id: c._id,
        level: c.level,
        percent: c.commissionPercent,
        amount: c.commissionAmount,
        orderTotal: c.orderTotal,
        orderId: c.order,
        buyerName: c.buyer?.name ? c.buyer.name : 'Unknown',
        date: c.createdAt
      })),
      directReferrals: l1Users.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    console.error('Referral stats error:', err);
    res.status(500).json({ message: 'Failed to fetch referral statistics' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const payload = { userId: user.id, id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode: user.referralCode,
        walletBalance: user.walletBalance || 0,
        totalReferralEarnings: user.totalReferralEarnings || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset Password OTP',
        message: `Your OTP to reset password is ${otp}. It expires in 10 minutes.`,
        html: generateOtpTemplate('Password Reset Request', 'We received a request to reset your password. Please use the following OTP to proceed.', otp)
      });
    } catch (e) {
      console.log('Error sending Reset OTP', e);
    }

    res.json({ message: 'Reset OTP sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile
router.put('/profile', authUser, async (req, res) => {
  try {
    const { address, name, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (address !== undefined) user.address = address;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    
    await user.save();
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      referralCode: user.referralCode,
      address: user.address,
      walletBalance: user.walletBalance || 0,
      totalReferralEarnings: user.totalReferralEarnings || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
