import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/geep';

// Minimal User schema for migration
const userSchema = new mongoose.Schema({
  role: String,
  classLevel: Number,
}, { strict: false });

const User = mongoose.model('User', userSchema);

const migrateClassLevel = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected.');

    console.log('Finding users without classLevel...');
    const usersToUpdate = await User.find({
      role: { $in: ['student', 'teacher'] },
      classLevel: { $exists: false }
    });

    console.log(`Found ${usersToUpdate.length} users needing classLevel migration.`);

    let updatedCount = 0;
    for (const user of usersToUpdate) {
      user.classLevel = 6; // Default class level
      await user.save();
      updatedCount++;
    }

    console.log(`Migration complete. Successfully updated ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateClassLevel();
