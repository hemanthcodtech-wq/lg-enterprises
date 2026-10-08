require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Order.updateMany({ paymentStatus: 'Pending' }, { $set: { paymentStatus: 'Completed' } });
  console.log('Updated existing orders to Completed');
  process.exit(0);
}).catch(console.error);
