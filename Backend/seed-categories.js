/**
 * Seed script to initialize default categories for all users
 * Run: node seed-categories.js
 */

import mongoose from 'mongoose';
import { Category } from './models/Category.models.js';
import { config } from './config/config.js';
import logger from './utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', color: '#FF6B6B', icon: 'utensils', description: 'Restaurants, cafes, groceries' },
  { name: 'Transportation', color: '#4ECDC4', icon: 'car', description: 'Taxi, bus, gas, parking' },
  { name: 'Shopping', color: '#95E1D3', icon: 'shopping-bag', description: 'Clothes, electronics, gifts' },
  { name: 'Entertainment', color: '#F9B4AB', icon: 'film', description: 'Movies, games, hobbies' },
  { name: 'Bills & Utilities', color: '#87CEEB', icon: 'bolt', description: 'Electricity, water, internet' },
  { name: 'Health & Fitness', color: '#DDA0DD', icon: 'heart', description: 'Doctor, gym, medicine' },
  { name: 'Education', color: '#FFD700', icon: 'book', description: 'Courses, books, tuition' },
  { name: 'Other', color: '#A9A9A9', icon: 'tag', description: 'Miscellaneous expenses' },
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('✅ Connected to MongoDB');

    // Clear existing default categories (optional)
    // await Category.deleteMany({ isDefault: true });

    // Create default categories (each category should ideally be per-user)
    // For now, we're creating global defaults
    const created = [];
    
    for (const cat of DEFAULT_CATEGORIES) {
      // Check if already exists
      const exists = await Category.findOne({ name: cat.name, isDefault: true });
      
      if (!exists) {
        const category = await Category.create({
          ...cat,
          isDefault: true,
        });
        created.push(category);
        logger.info(`📂 Created default category: ${cat.name}`);
      } else {
        logger.info(`⏭️  Category already exists: ${cat.name}`);
      }
    }
    logger.info(`✅ Seed complete! Created ${created.length} categories`);
    // List all default categories
    const allCategories = await Category.find({ isDefault: true }).lean();
    console.log('\n📋 Default Categories:');
    allCategories.forEach((cat, idx) => {
      console.log(`  ${idx + 1}. ${cat.name} (${cat.icon})`);
    });
    await mongoose.connection.close();
    logger.info('✅ Database connection closed');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}
seedCategories();
