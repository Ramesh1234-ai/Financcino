import mongoose from 'mongoose';
import { User } from './models/User.models.js';
import { Category } from './models/Category.models.js';
import { Expense } from './models/expense.models.js';
import { Budget } from './models/Budget.models.js';
import bcrypt from 'bcrypt';
import { config } from './config/config.js';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Expense.deleteMany({});
    await Budget.deleteMany({});
    console.log('Cleared existing data');

    // Create test users
    const users = [];
    const userData = [
      {
        fullName: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'Password123',
      },
      {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        username: 'janesmith',
        password: 'Password123',
      },
    ];

    for (const data of userData) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await User.create({
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        password: hashedPassword,
      });
      users.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create categories for first user
    const categories = [];
    const categoryData = [
      { name: 'Food', color: '#FF6B6B', icon: 'utensils' },
      { name: 'Transportation', color: '#4ECDC4', icon: 'car' },
      { name: 'Entertainment', color: '#95E1D3', icon: 'film' },
      { name: 'Shopping', color: '#F9B4AB', icon: 'shopping-bag' },
      { name: 'Utilities', color: '#87CEEB', icon: 'bolt' },
      { name: 'Health', color: '#DDA0DD', icon: 'heart' },
      { name: 'Education', color: '#FFD700', icon: 'book' },
      { name: 'Other', color: '#A9A9A9', icon: 'tag' },
    ];

    for (const catData of categoryData) {
      const category = await Category.create({
        userId: users[0]._id,
        name: catData.name,
        color: catData.color,
        icon: catData.icon,
      });
      categories.push(category);
      console.log(`Created category: ${category.name}`);
    }

    // Create sample expenses
    const expenses = [];
    const expenseData = [
      {
        description: 'Breakfast at cafe',
        amount: 8.5,
        categoryId: categories[0]._id,
        paymentMethod: 'card',
      },
      {
        description: 'Grocery shopping',
        amount: 45.2,
        categoryId: categories[0]._id,
        paymentMethod: 'cash',
      },
      {
        description: 'Uber ride',
        amount: 12.5,
        categoryId: categories[1]._id,
        paymentMethod: 'card',
      },
      {
        description: 'Movie tickets',
        amount: 25,
        categoryId: categories[2]._id,
        paymentMethod: 'card',
      },
      {
        description: 'New shoes',
        amount: 89.99,
        categoryId: categories[3]._id,
        paymentMethod: 'card',
      },
      {
        description: 'Electricity bill',
        amount: 120,
        categoryId: categories[4]._id,
        paymentMethod: 'bank_transfer',
      },
      {
        description: 'Doctor visit',
        amount: 75,
        categoryId: categories[5]._id,
        paymentMethod: 'card',
      },
    ];

    for (const expData of expenseData) {
      const expense = await Expense.create({
        userId: users[0]._id,
        description: expData.description,
        amount: expData.amount,
        categoryId: expData.categoryId,
        paymentMethod: expData.paymentMethod,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        tags: ['sample'],
      });
      expenses.push(expense);
      console.log(`Created expense: ${expense.description} - $${expense.amount}`);
    }

    // Create budgets
    const budgets = [];
    const budgetData = [
      { categoryId: categories[0]._id, budgetLimit: 300, period: 'monthly' },
      { categoryId: categories[1]._id, budgetLimit: 200, period: 'monthly' },
      { categoryId: categories[2]._id, budgetLimit: 150, period: 'monthly' },
    ];

    for (const budData of budgetData) {
      const budget = await Budget.create({
        userId: users[0]._id,
        categoryId: budData.categoryId,
        budgetLimit: budData.budgetLimit,
        period: budData.period,
      });
      budgets.push(budget);
      console.log(
        `Created budget: ${budData.budgetLimit} for category ${budData.categoryId}`
      );
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`- Created ${users.length} users`);
    console.log(`- Created ${categories.length} categories`);
    console.log(`- Created ${expenses.length} expenses`);
    console.log(`- Created ${budgets.length} budgets`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
