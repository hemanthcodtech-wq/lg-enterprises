require('dotenv').config();
const mongoose = require('mongoose');
const ReturnGiftCampaign = require('./models/ReturnGiftCampaign');

const seedReturnGift = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lg-ecommerce');
    console.log('MongoDB connected for seeding return gift campaign...');

    const existing = await ReturnGiftCampaign.findOne({ title: 'Festive Shopping Return Gift Bonanza' });
    if (!existing) {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
      const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0); // End of next month

      await ReturnGiftCampaign.create({
        title: 'Festive Shopping Return Gift Bonanza',
        subtitle: 'Shop & Unlock Premium Return Gift',
        description: 'Reach cumulative purchases of ₹25,000 or more between this festive period and receive a premium Noise Smartwatch directly dispatched to your doorstep!',
        targetAmount: 25000,
        startDate,
        endDate,
        giftTitle: 'Noise ColorFit Pulse 2 Max Smartwatch',
        giftDescription: '1.85" HD Display, Bluetooth Calling, 100+ Sports Modes, 10-day battery life & IP68 Water Resistance.',
        giftImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        giftValue: 4999,
        isActive: true,
        terms: [
          'All valid non-cancelled orders placed within the campaign period count towards your milestone.',
          'Cumulative order value of ₹25,000 or above automatically qualifies you for the gift.',
          'Admin dispatches the gift directly to your registered shipping address with live tracking.',
          'Tracking ID and courier partner info will be displayed live in your Return Gifts tracker.'
        ]
      });
      console.log('Successfully seeded default Return Gift Campaign!');
    } else {
      console.log('Return Gift Campaign already exists.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding return gift:', err);
    process.exit(1);
  }
};

seedReturnGift();
