const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@therapease.com' });
    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@therapease.com');
      console.log('Current role:', existingAdmin.role);
      
      // Update role to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated user role to admin');
      }
      
      console.log('You can login with:');
      console.log('Email: admin@therapease.com');
      console.log('Password: admin123456 (if this was the original password)');
      return;
    }
    
    console.log('Creating new admin user...');
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123456', salt);
    
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@therapease.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
      isBanned: false
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Email: admin@therapease.com');
    console.log('Password: admin123456');
    console.log('');
    console.log('You can now:');
    console.log('1. Login to the frontend with these credentials');
    console.log('2. Click the "Admin" button in the navigation');
    console.log('3. Access the admin dashboard');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    console.log('Disconnecting from MongoDB...');
    mongoose.disconnect();
  }
};

console.log('🚀 Creating admin user for Therapease...');
createAdmin();
