import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env file');
    console.log('💡 Please add MONGODB_URI to your .env file');
    process.exit(1);
  }

  console.log('📝 MONGODB_URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
  
  try {
    // Connect to MongoDB (removed deprecated options for Mongoose v7+)
    console.log('\n🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // Test User model
    console.log('\n🧪 Testing User Model...');
    const userCount = await User.countDocuments();
    console.log(`📈 Total users in database: ${userCount}`);
    
    // List all users (without passwords)
    if (userCount > 0) {
      console.log('\n👥 Existing Users:');
      const users = await User.find().select('-password').limit(5);
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    } else {
      console.log('📭 No users found in database');
    }
    
    // Test creating a user
    console.log('\n🧪 Testing User Creation...');
    const testEmail = `test-${Date.now()}@test.com`;
    const testUser = new User({
      name: 'Test User',
      email: testEmail,
      password: 'test123456',
      role: 'student'
    });
    
    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log(`   Email: ${testEmail}`);
    
    // Clean up test user
    await User.deleteOne({ email: testEmail });
    console.log('🧹 Test user cleaned up');
    
    console.log('\n✅ All tests passed! MongoDB is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.name === 'MongoServerError') {
      console.error('   This is a MongoDB server error. Check your connection string.');
    } else if (error.name === 'MongooseError') {
      console.error('   This is a Mongoose error. Check your MongoDB URI format.');
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection();
