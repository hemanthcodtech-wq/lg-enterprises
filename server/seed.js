const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');
const Product = require('./models/Product');
const Carousel = require('./models/Carousel');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await Category.deleteMany();
    await Product.deleteMany();
    await Carousel.deleteMany();
    console.log('Cleared existing Categories, Products, and Carousels.');

    // Seed Categories
    const categoriesData = [
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Fashion', slug: 'fashion' },
      { name: 'Home & Kitchen', slug: 'home-kitchen' },
      { name: 'Sports', slug: 'sports' }
    ];
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`Seeded ${createdCategories.length} Categories.`);

    // Seed Products
    const productsData = [
      {
        name: 'Smartphone X Pro',
        slug: 'smartphone-x-pro',
        description: 'Latest high-end smartphone with an amazing camera and battery life.',
        price: 69999,
        originalPrice: 79999,
        stock: 50,
        category: createdCategories[0]._id, // Electronics
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'],
        isFeatured: true
      },
      {
        name: 'Wireless Noise Cancelling Headphones',
        slug: 'wireless-headphones',
        description: 'Premium over-ear headphones with active noise cancellation.',
        price: 12999,
        originalPrice: 15999,
        stock: 120,
        category: createdCategories[0]._id, // Electronics
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'],
        isFeatured: true
      },
      {
        name: 'Men\'s Casual Sneakers',
        slug: 'mens-casual-sneakers',
        description: 'Comfortable and stylish sneakers for everyday wear.',
        price: 2499,
        originalPrice: 3499,
        stock: 200,
        category: createdCategories[1]._id, // Fashion
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop'],
        isFeatured: false
      },
      {
        name: 'Women\'s Summer Dress',
        slug: 'womens-summer-dress',
        description: 'Light and breezy dress perfect for warm days.',
        price: 1899,
        originalPrice: 2499,
        stock: 80,
        category: createdCategories[1]._id, // Fashion
        images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop'],
        isFeatured: true
      },
      {
        name: 'Non-Stick Cookware Set',
        slug: 'cookware-set',
        description: '10-piece non-stick cookware set including pots, pans, and utensils.',
        price: 4999,
        originalPrice: 6599,
        stock: 30,
        category: createdCategories[2]._id, // Home & Kitchen
        images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800&auto=format&fit=crop'],
        isFeatured: false
      },
      {
        name: 'Yoga Mat with Alignment Lines',
        slug: 'yoga-mat',
        description: 'Eco-friendly TPE yoga mat with alignment lines for perfect posture.',
        price: 999,
        originalPrice: 1499,
        stock: 150,
        category: createdCategories[3]._id, // Sports
        images: ['https://images.unsplash.com/photo-1599447332304-44b41b9d4fdf?q=80&w=800&auto=format&fit=crop'],
        isFeatured: false
      }
    ];
    const createdProducts = await Product.insertMany(productsData);
    console.log(`Seeded ${createdProducts.length} Products.`);

    // Seed Carousel
    const carouselData = [
      {
        title: 'Huge Summer Sale',
        subtitle: 'Up to 50% Off on Fashion',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
        link: '/products',
        isActive: true,
        order: 1
      },
      {
        title: 'New Tech Arrivals',
        subtitle: 'Upgrade your lifestyle with our latest gadgets',
        imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200&auto=format&fit=crop',
        link: '/products',
        isActive: true,
        order: 2
      }
    ];
    
    // Some models might not have all these fields, let's insert gracefully
    try {
      await Carousel.insertMany(carouselData);
      console.log('Seeded Carousel items.');
    } catch (err) {
      console.log('Carousel seed failed (might have different schema):', err.message);
    }

    console.log('Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedDB();
