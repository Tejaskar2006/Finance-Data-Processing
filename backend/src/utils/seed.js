/**
 * Database Seeder
 * Creates sample users and financial records for testing.
 * Run with: npm run seed
 *
 * Users created:
 *  - admin@finance.com / Admin123!    (Admin)
 *  - analyst@finance.com / Analyst123! (Analyst)
 *  - viewer@finance.com / Viewer123!  (Viewer)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const FinancialRecord = require('../models/FinancialRecord');

const categories = [
  'Salary', 'Freelance', 'Investment', 'Food', 'Transport',
  'Healthcare', 'Education', 'Entertainment', 'Utilities', 'Shopping', 'Other',
];

const randomBetween = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

const generateRecords = (userId, count = 60) => {
  const records = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysBack = Math.floor(Math.random() * 365);
    const date = new Date(now);
    date.setDate(date.getDate() - daysBack);

    const type = Math.random() > 0.4 ? 'expense' : 'income';
    const category = type === 'income'
      ? ['Salary', 'Freelance', 'Investment'][Math.floor(Math.random() * 3)]
      : categories[Math.floor(Math.random() * categories.length)];

    records.push({
      amount: type === 'income' ? randomBetween(1000, 15000) : randomBetween(50, 3000),
      type,
      category,
      date,
      notes: `Sample ${type} transaction #${i + 1}`,
      createdBy: userId,
    });
  }
  return records;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await FinancialRecord.deleteMany({});
    console.log('🗑  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@finance.com',
      password: 'Admin123!',
      role: 'Admin',
      status: 'active',
    });

    const analyst = await User.create({
      name: 'Sarah Analyst',
      email: 'analyst@finance.com',
      password: 'Analyst123!',
      role: 'Analyst',
      status: 'active',
    });

    const viewer = await User.create({
      name: 'Tom Viewer',
      email: 'viewer@finance.com',
      password: 'Viewer123!',
      role: 'Viewer',
      status: 'active',
    });

    console.log('👤 Created 3 users');

    // Create financial records
    const records = [
      ...generateRecords(admin._id, 40),
      ...generateRecords(analyst._id, 20),
    ];

    await FinancialRecord.insertMany(records);
    console.log(`📊 Created ${records.length} financial records`);

    console.log('\n🎉 Seed complete! Login credentials:');
    console.log('   Admin:   admin@finance.com   / Admin123!');
    console.log('   Analyst: analyst@finance.com / Analyst123!');
    console.log('   Viewer:  viewer@finance.com  / Viewer123!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
