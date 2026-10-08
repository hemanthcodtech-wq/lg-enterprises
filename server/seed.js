require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Seed Categories
    const catElectronics = await Category.create({ name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80' });
    const catFurniture = await Category.create({ name: 'Furniture', slug: 'furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80' });
    const catGrocery = await Category.create({ name: 'Grocery', slug: 'grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80' });
    const catClothing = await Category.create({ name: 'Clothing', slug: 'clothing', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&q=80' });

    console.log('Categories created');

    // Seed Products
    const products = [
      {
        name: 'LG OLED 4K Smart TV',
        slug: 'lg-oled-4k-smart-tv',
        description: 'Experience pure colors with LG OLED technology. Features a slim design, webOS, and Dolby Vision.',
        price: 85999,
        originalPrice: 99999,
        stock: 50,
        category: catElectronics._id,
        images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80'],
        isFeatured: true
      },
      {
        name: 'LG French Door Refrigerator',
        slug: 'lg-french-door-refrigerator',
        description: 'InstaView Door-in-Door refrigerator with Craft Ice. Keep food fresh longer.',
        price: 65000,
        originalPrice: 75000,
        stock: 20,
        category: catElectronics._id,
        images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&q=80'],
        isFeatured: true
      },
      {
        name: 'Modern Ergonomic Office Chair',
        slug: 'modern-ergonomic-office-chair',
        description: 'Adjustable height, lumbar support, and breathable mesh for all-day comfort.',
        price: 4999,
        originalPrice: 6500,
        stock: 100,
        category: catFurniture._id,
        images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80'],
        isFeatured: false
      },
      {
        name: 'Minimalist Dining Table Set',
        slug: 'minimalist-dining-table-set',
        description: 'Solid wood dining table with 4 upholstered chairs.',
        price: 18500,
        originalPrice: 22000,
        stock: 15,
        category: catFurniture._id,
        images: ['https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=500&q=80'],
        isFeatured: true
      },
      {
        name: 'Premium Organic Coffee Beans',
        slug: 'premium-organic-coffee-beans',
        description: '100% Arabica, dark roast coffee beans sourced from Colombia.',
        price: 450,
        originalPrice: 600,
        stock: 200,
        category: catGrocery._id,
        images: ['https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80'],
        isFeatured: true
      },
      {
        name: 'Pure Himalayan Pink Salt',
        slug: 'pure-himalayan-pink-salt',
        description: 'Unrefined pink salt rich in minerals for healthy cooking.',
        price: 250,
        originalPrice: 300,
        stock: 300,
        category: catGrocery._id,
        images: ['https://images.unsplash.com/photo-1627485937980-221c88ce04ea?w=500&q=80'],
        isFeatured: false
      },
      {
        name: 'Classic White Sneakers',
        slug: 'classic-white-sneakers',
        description: 'Comfortable and stylish sneakers for everyday wear.',
        price: 1299,
        originalPrice: 1999,
        stock: 80,
        category: catClothing._id,
        images: ['https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&q=80'],
        isFeatured: false
      },
      {
        name: 'Men\'s Winter Jacket',
        slug: 'mens-winter-jacket',
        description: 'Warm, waterproof jacket perfect for harsh winters.',
        price: 3499,
        originalPrice: 4500,
        stock: 45,
        category: catClothing._id,
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80'],
        isFeatured: true
      },
      {
        name: 'LG Front Load Washing Machine',
        slug: 'lg-front-load-washing-machine',
        description: 'AI DD technology, Steam+ feature, and ThinQ Wi-Fi connectivity.',
        price: 34500,
        originalPrice: 42000,
        stock: 30,
        category: catElectronics._id,
        images: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&q=80'],
        isFeatured: false
      },
      {
        name: 'LG UltraGear Gaming Monitor',
        slug: 'lg-ultragear-gaming-monitor',
        description: '27 inch 144Hz IPS display with 1ms response time.',
        price: 22000,
        originalPrice: 28000,
        stock: 40,
        category: catElectronics._id,
        images: ['https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=500&q=80'],
        isFeatured: true
      }
    ];

    await Product.insertMany(products);
    console.log('Products created successfully');
    
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
