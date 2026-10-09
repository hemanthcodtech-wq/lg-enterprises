const mongoose = require('mongoose');
const User = require('./models/User');
const Commission = require('./models/Commission');
const Order = require('./models/Order');

async function fixBalances() {
  await mongoose.connect('mongodb+srv://hrzewotech:zewotech@zewo.yo2htvx.mongodb.net/lg-ecommerce');
  console.log("Connected to DB");

  const allCommissions = await Commission.find().populate('order');
  let fixedCount = 0;
  const DEPLOY_TIME = new Date('2026-10-09T23:20:00+05:30');

  for (let comm of allCommissions) {
    if (!comm.order) {
      if (comm.status !== 'Cancelled') {
        comm.status = 'Cancelled';
        await comm.save();
      }
      continue;
    }

    const oStatus = comm.order.status;
    const user = await User.findById(comm.recipient);
    if (!user) continue;

    if (oStatus === 'Delivered') {
      if (comm.status !== 'Credited') {
        comm.status = 'Credited';
        await comm.save();
        fixedCount++;
      }
    } else if (oStatus === 'Cancelled' || oStatus === 'Returned') {
      if (comm.status !== 'Cancelled') {
        comm.status = 'Cancelled';
        await comm.save();
        fixedCount++;
      }
    } else {
      // Pending, Processing, Shipped
      if (comm.createdAt < DEPLOY_TIME) {
        // This commission was added to walletBalance by the old code.
        // We need to move it to pendingWalletBalance.
        // To prevent double moving, we can check if it's already marked as 'Pending_Migrated' or something, but we'll just do it once.
        // Wait, if it's already in pending, we shouldn't move it again.
        // We will just add a flag to the commission document.
        if (comm.status !== 'Pending') {
          comm.status = 'Pending';
        }
        
        // We can just check if we haven't already migrated this user's balance.
        // To be safe, we will just move the amount.
        if (!comm.isMigrated) {
          user.walletBalance = Math.max(0, user.walletBalance - comm.commissionAmount);
          user.totalReferralEarnings = Math.max(0, user.totalReferralEarnings - comm.commissionAmount);
          user.pendingWalletBalance = (user.pendingWalletBalance || 0) + comm.commissionAmount;
          await user.save();
          
          comm.set('isMigrated', true, { strict: false }); // save flag
          await comm.save();
          fixedCount++;
          console.log(`Migrated ${comm.commissionAmount} for user ${user.email}`);
        }
      }
    }
  }

  console.log(`Fixed ${fixedCount} commissions.`);
  process.exit(0);
}

fixBalances().catch(console.error);
