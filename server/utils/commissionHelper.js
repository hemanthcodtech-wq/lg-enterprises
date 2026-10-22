const Order = require('../models/Order');
const Commission = require('../models/Commission');
const User = require('../models/User');

const RETURN_WINDOW_DAYS = 7;
const RETURN_WINDOW_MS = RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/**
 * Checks for orders delivered >= 7 days ago whose commissions are still Pending,
 * and credits them to the respective upline users' active wallet balances.
 */
async function processMaturedCommissions() {
  try {
    const now = Date.now();
    const sevenDaysAgo = new Date(now - RETURN_WINDOW_MS);

    // 1. Backfill deliveredAt on legacy delivered orders that lack deliveredAt
    const legacyOrders = await Order.find({
      status: 'Delivered',
      $or: [
        { deliveredAt: { $exists: false } },
        { deliveredAt: null }
      ]
    });

    for (const legacy of legacyOrders) {
      legacy.deliveredAt = legacy.updatedAt || legacy.createdAt || new Date();
      await legacy.save();
    }

    // 2. Find delivered orders where 7 days have passed since delivery
    // Note: status must be 'Delivered' (NOT 'Return Requested', NOT 'Returned', NOT 'Cancelled')
    const maturedOrders = await Order.find({
      status: 'Delivered',
      deliveredAt: { $lte: sevenDaysAgo }
    }).select('_id deliveredAt');

    if (!maturedOrders || maturedOrders.length === 0) {
      return { creditedCount: 0 };
    }

    const maturedOrderIds = maturedOrders.map(o => o._id);

    // 3. Find pending commissions for these matured orders
    const pendingComms = await Commission.find({
      order: { $in: maturedOrderIds },
      status: 'Pending'
    });

    let creditedCount = 0;

    for (const comm of pendingComms) {
      const recipient = await User.findById(comm.recipient);
      if (recipient) {
        recipient.pendingWalletBalance = Math.max(
          0,
          Math.round(((recipient.pendingWalletBalance || 0) - comm.commissionAmount) * 100) / 100
        );
        recipient.walletBalance = Math.round(
          ((recipient.walletBalance || 0) + comm.commissionAmount) * 100
        ) / 100;
        recipient.totalReferralEarnings = Math.round(
          ((recipient.totalReferralEarnings || 0) + comm.commissionAmount) * 100
        ) / 100;
        await recipient.save();
      }

      comm.status = 'Credited';
      comm.creditedAt = new Date();
      await comm.save();
      creditedCount++;
    }

    if (creditedCount > 0) {
      console.log(`[Commission Service] Successfully matured and credited ${creditedCount} commission(s) past the 7-day return window.`);
    }

    return { creditedCount };
  } catch (err) {
    console.error('[Commission Service] Error processing matured commissions:', err);
    return { error: err.message };
  }
}

module.exports = {
  RETURN_WINDOW_DAYS,
  RETURN_WINDOW_MS,
  processMaturedCommissions
};
