# User Approval System Migration Guide

## Overview

This guide explains how to migrate existing users to the new approval system. All existing users (students, teachers, and admins) will be automatically approved to maintain backward compatibility.

## Migration Steps

### Step 1: Run the Migration Script

Execute the one-time migration script to approve all existing users:

```bash
npm run migrate:approve-users
```

Or directly:

```bash
node backend/utils/migrateExistingUsers.js
```

### Step 2: Verify Migration

The script will:
- ✅ Approve all users without a status field (legacy users)
- ✅ Approve all users with status='pending'
- ✅ Add `approvedAt` timestamp to approved users missing it
- ⊘ Skip users with status='rejected' (for safety)
- ⊘ Skip users already approved with all fields

### Step 3: Check Migration Results

The script outputs:
- Number of users updated
- Number of users already approved
- Number of users skipped (rejected)
- Final status distribution

## What the Migration Does

1. **Legacy Users** (no status field):
   - Sets `status = 'approved'`
   - Sets `approvedAt = current timestamp`
   - Sets `approvedBy = null` (system migration)

2. **Pending Users**:
   - Changes `status = 'pending'` → `status = 'approved'`
   - Sets `approvedAt = current timestamp`
   - Sets `approvedBy = null` (system migration)

3. **Already Approved Users**:
   - Adds `approvedAt` timestamp if missing
   - Leaves other fields unchanged

4. **Rejected Users**:
   - Left unchanged (for safety)

## Backward Compatibility

The system includes backward compatibility logic:

- **Legacy users** (without status field) are treated as `approved`
- **Login logic** handles missing status gracefully
- **Route protection** allows legacy users to access the platform
- **Middleware** treats missing status as approved

## New User Registration

After migration:
- **New students**: `status = 'pending'` (require teacher approval)
- **New teachers**: `status = 'pending'` (require admin approval)
- **New admins**: `status = 'approved'` (immediate access)

## Important Notes

⚠️ **This migration should be run ONLY ONCE** after deploying the approval system.

⚠️ **Rejected users are NOT auto-approved** - they remain rejected for safety.

⚠️ **After migration**, new registrations will follow the approval workflow.

## Troubleshooting

### Migration fails to connect to database
- Check your `.env` file has `MONGODB_URI` set correctly
- Verify MongoDB is running and accessible

### Some users still show as pending
- Check the migration output for any errors
- Verify the migration completed successfully
- Manually approve any remaining pending users through the admin/teacher dashboards

### Legacy users can't log in
- Ensure the migration script ran successfully
- Check that backward compatibility logic is in place
- Verify user documents have `status` field set

## Post-Migration Cleanup

After successful migration, you can optionally:
1. Remove or disable the migration script
2. Keep it for reference or future migrations
3. Document the migration date in your deployment notes

## Support

If you encounter issues:
1. Check the migration script output
2. Verify database connection
3. Review user documents in MongoDB
4. Check server logs for errors
