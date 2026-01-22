import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    // Extract database name from URI for logging
    const dbNameMatch = MONGODB_URI.match(/\/([^/?]+)(\?|$)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'default';
    console.log(`📝 Database: ${dbName}`);
    
    // Connect to MongoDB (removed deprecated options for Mongoose v7+)
    const conn = await mongoose.connect(MONGODB_URI);

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    if (error.name === 'MongoServerError') {
      console.error('💡 Check your MongoDB connection string and credentials');
      console.error('💡 Make sure your IP is whitelisted in MongoDB Atlas (if using Atlas)');
    } else if (error.name === 'MongooseError') {
      console.error('💡 Check your MONGODB_URI format in .env file');
      console.error('💡 Format should be: mongodb+srv://username:password@cluster.mongodb.net/database-name');
    }
    console.error('\n📋 Full error details:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err}`);
});

export default connectDB;
