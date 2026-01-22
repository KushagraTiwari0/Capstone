import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * One-time migration script to approve all existing users
 * This script should be run ONCE after deploying the approval system
 * 
 * Usage: node backend/utils/migrateExistingUsers.js
 */
const migrateExistingUsers = async () => {
  try {
    console.log('🔄 Starting migration: Approving all existing users...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Find all users that need migration:
    // 1. Users without status field (legacy users)
    // 2. Users with status='pending' that were created before this migration
    // We'll approve ALL existing users regardless of their current status
    // (except rejected - we'll leave those as is for safety)
    
    const migrationDate = new Date();
    const systemApproverId = 'system'; // Special identifier for system migrations
    
    // First, find all users
    const allUsers = await User.find({});
    console.log(`📊 Found ${allUsers.length} total users`);

    // Count users by status
    const statusCounts = {
      approved: 0,
      pending: 0,
      rejected: 0,
      missing: 0
    };

    allUsers.forEach(user => {
      if (!user.status) {
        statusCounts.missing++;
      } else {
        statusCounts[user.status] = (statusCounts[user.status] || 0) + 1;
      }
    });

    console.log('📈 Current status distribution:');
    console.log(`   - Approved: ${statusCounts.approved}`);
    console.log(`   - Pending: ${statusCounts.pending}`);
    console.log(`   - Rejected: ${statusCounts.rejected}`);
    console.log(`   - Missing status: ${statusCounts.missing}`);

    // Users to update:
    // 1. Users without status field → set to approved
    // 2. Users with status='pending' → set to approved
    // 3. Users with status='rejected' → leave as rejected (safety)
    // 4. Users already approved → update approvedAt if missing
    
    let updatedCount = 0;
    let skippedCount = 0;
    let alreadyApprovedCount = 0;

    for (const user of allUsers) {
      let needsUpdate = false;
      const updates = {};

      // Case 1: User has no status field (legacy user)
      if (!user.status) {
        updates.status = 'approved';
        updates.approvedAt = migrationDate;
        updates.approvedBy = null; // System migration, no specific approver
        needsUpdate = true;
        console.log(`   ✓ Approving legacy user: ${user.email} (${user.role})`);
      }
      // Case 2: User is pending → approve them
      else if (user.status === 'pending') {
        updates.status = 'approved';
        updates.approvedAt = migrationDate;
        updates.approvedBy = null; // System migration
        needsUpdate = true;
        console.log(`   ✓ Approving pending user: ${user.email} (${user.role})`);
      }
      // Case 3: User is rejected → leave as is (safety)
      else if (user.status === 'rejected') {
        skippedCount++;
        console.log(`   ⊘ Skipping rejected user: ${user.email} (${user.role})`);
        continue;
      }
      // Case 4: User is already approved but missing approvedAt → add timestamp
      else if (user.status === 'approved' && !user.approvedAt) {
        updates.approvedAt = migrationDate;
        updates.approvedBy = null; // System migration
        needsUpdate = true;
        console.log(`   ✓ Adding approvedAt to approved user: ${user.email} (${user.role})`);
      }
      // Case 5: User is already approved with all fields → skip
      else if (user.status === 'approved' && user.approvedAt) {
        alreadyApprovedCount++;
        continue;
      }

      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, { $set: updates });
        updatedCount++;
      }
    }

    console.log('\n✅ Migration completed!');
    console.log(`   - Updated: ${updatedCount} users`);
    console.log(`   - Already approved: ${alreadyApprovedCount} users`);
    console.log(`   - Skipped (rejected): ${skippedCount} users`);
    console.log(`   - Total processed: ${allUsers.length} users`);

    // Verify migration
    const afterMigration = await User.find({});
    const approvedCount = afterMigration.filter(u => u.status === 'approved').length;
    const pendingCount = afterMigration.filter(u => u.status === 'pending').length;
    
    console.log('\n📊 After migration:');
    console.log(`   - Approved: ${approvedCount}`);
    console.log(`   - Pending: ${pendingCount}`);
    console.log(`   - Rejected: ${skippedCount}`);

    if (pendingCount > 0) {
      console.warn(`⚠️  Warning: ${pendingCount} users still have pending status`);
    }

    console.log('\n🎉 Migration successful! All existing users have been approved.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

// Run migration
migrateExistingUsers();
