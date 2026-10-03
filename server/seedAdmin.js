require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lg-ecommerce');
    console.log('MongoDB connected for seeding...');

    const adminEmail = process.env.SUPERADMIN_EMAIL || 'admin@lg.com';
    const adminPassword = process.env.SUPERADMIN_PASSWORD || 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists!`);
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create the admin user
    const adminUser = new User({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user successfully seeded to the database!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin user:', err);
    process.exit(1);
  }
};

seedAdmin();
