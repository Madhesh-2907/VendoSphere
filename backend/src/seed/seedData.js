const bcrypt = require('bcryptjs');
const { initDb } = require('../config/db');
const { User, Category } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Synchronizing clean production database schema...');
    const sequelize = await initDb();

    // Wipe database tables cleanly for fresh production system state
    await sequelize.sync({ force: true });
    console.log('✅ Database schema reset to empty state.');

    // 1. Initialize Base Procurement Categories
    const categoriesData = [
      'Electronics',
      'Stationery',
      'Furniture',
      'Food & Grocery',
      'Hardware',
    ];
    for (const catName of categoriesData) {
      await Category.create({ category_name: catName });
    }
    console.log('✅ Base institutional procurement categories initialized.');

    // 2. Default System Admin Account (Required for portal administration)
    const hashedAdminPass = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'System Admin',
      email: 'admin@campusprocure.com',
      password: hashedAdminPass,
      role: 'admin',
    });
    console.log('✅ System Admin Account created: admin@campusprocure.com / admin123');

    console.log('🎉 Database is clean and ready for real user registration & procurement transactions!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

seedDatabase();
