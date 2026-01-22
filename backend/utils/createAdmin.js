import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'password123';
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminEmail);
      console.log('   Updating password and role...');
      
      // Update existing admin
      existingAdmin.password = adminPassword; // Will be hashed by pre-save hook
      existingAdmin.role = 'admin';
      existingAdmin.name = adminName;
      existingAdmin.avatar = '👑';
      await existingAdmin.save();
      
      console.log('✅ Admin user updated successfully!');
      console.log('   Email:', adminEmail);
      console.log('   Password:', adminPassword);
      console.log('   Role: admin');
    } else {
      // Create new admin user
      const admin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword, // Will be hashed by pre-save hook
        role: 'admin',
        avatar: '👑',
        points: 0,
        level: 'Beginner'
      });

      await admin.save();
      
      console.log('✅ Admin user created successfully!');
      console.log('   Email:', adminEmail);
      console.log('   Password:', adminPassword);
      console.log('   Role: admin');
    }

    // Close database connection
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdmin();
