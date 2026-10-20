const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Product.updateOne(
      { slug: 'lg-oled-4k-smart-tv' },
      {
        $set: {
          images: [
            'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80',
            'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
            'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80',
            'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80'
          ]
        }
      }
    );

    await Product.updateOne(
      { slug: 'modern-ergonomic-office-chair' },
      {
        $set: {
          images: [
            'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80',
            'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
            'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=800&q=80',
            'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&q=80'
          ]
        }
      }
    );

    await Product.updateOne(
      { slug: 'classic-white-sneakers' },
      {
        $set: {
          images: [
            'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
            'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80'
          ]
        }
      }
    );

    console.log('Successfully updated 3 products with multi-image Amazon galleries!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating products:', err);
    process.exit(1);
  }
}

run();
