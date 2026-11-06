const jwt = require('jsonwebtoken');

const authAdmin = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }
    req.admin = decoded;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const authUser = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    if (!req.user.id && req.user.userId) {
      req.user.id = req.user.userId;
    }

    // Verify user is not blocked by admin
    const User = require('../models/User');
    const dbUser = await User.findById(req.user.id).select('isBlocked');
    if (dbUser && dbUser.isBlocked) {
      let contactNumber = '+91 98765 43210';
      try {
        const Setting = require('../models/Setting');
        const settings = await Setting.findOne();
        if (settings?.supportPhone) {
          contactNumber = settings.supportPhone;
        }
      } catch (e) {}
      return res.status(403).json({ 
        error: `Admin blocked your account. Please contact this number: ${contactNumber}`, 
        message: `Admin blocked your account. Please contact this number: ${contactNumber}`,
        isBlocked: true 
      });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = { authAdmin, authUser };
