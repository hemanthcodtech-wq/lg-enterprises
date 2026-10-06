const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, usedReferralCode } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ message: 'An account with this email already exists' });

    let referredBy = null;
    if (usedReferralCode) {
      const referrer = await User.findOne({ referralCode: usedReferralCode });
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

    user = new User({ 
      name, 
      email: email.toLowerCase(), 
      phone, 
      password: hashedPassword,
      referralCode: myReferralCode,
      referredBy
    });
    await user.save();

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, referralCode: user.referralCode, walletBalance: user.walletBalance }
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

    // Generate referral code for old users if they don't have one
    if (!user.referralCode) {
      const crypto = require('crypto');
      user.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      await user.save();
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, referralCode: user.referralCode, walletBalance: user.walletBalance }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
