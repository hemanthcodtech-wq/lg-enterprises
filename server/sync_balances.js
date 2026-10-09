require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Commission = require('./models/Commission');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const users = await User.find();
    for (const user of users) {
      // Find all commissions for this user
      const pendingComms = await Commission.aggregate([
        { $match: { recipient: user._id, status: 'Pending' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]);
      const creditedComms = await Commission.aggregate([
        { $match: { recipient: user._id, status: 'Credited' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]);
      
      const pendingSum = pendingComms.length > 0 ? pendingComms[0].total : 0;
      const creditedSum = creditedComms.length > 0 ? creditedComms[0].total : 0;

      let changed = false;
      if (Math.abs((user.pendingWalletBalance || 0) - pendingSum) > 0.01) {
        user.pendingWalletBalance = pendingSum;
        changed = true;
      }
      if (Math.abs((user.totalReferralEarnings || 0) - (creditedSum + pendingSum)) > 0.01) {
        user.totalReferralEarnings = creditedSum + pendingSum;
        changed = true;
      }
      
      if (changed) {
        await user.save();
        console.log(`Updated user ${user.email}: pending = ${pendingSum}, total = ${creditedSum + pendingSum}`);
      }
    }
    console.log('Done syncing balances.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
