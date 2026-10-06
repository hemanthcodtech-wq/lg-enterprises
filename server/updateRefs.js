const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const allUsers = await User.find({});
    let count = 0;
    for (let u of allUsers) {
      if (!u.referralCode) {
        u.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        await u.save();
        count++;
      }
    }
    console.log('Updated ' + count + ' users.');
    process.exit(0);
  })
  .catch(console.error);
