# 🔧 MongoDB Connection Troubleshooting

## ✅ Code Review - Everything Looks Good!

I've reviewed your MongoDB setup and the code is **correct**. Here's what I found:

### ✅ What's Working:
1. **Database Connection** - Properly configured
2. **User Model** - Correct schema with password hashing
3. **Registration Route** - Properly saves users with `await user.save()`
4. **Error Handling** - Good error handling in place

---

## 🔍 How to Verify MongoDB Connection

### Step 1: Check if MONGODB_URI is Set

Run this command:
```bash
npm run test:db
```

This will:
- ✅ Check if MONGODB_URI is set
- ✅ Test MongoDB connection
- ✅ Show existing users
- ✅ Test user creation

### Step 2: Check Server Logs

When you start the server with `npm run server:dev`, you should see:

```
🔄 Attempting to connect to MongoDB...
📝 Database: geep-platform
✅ MongoDB Connected Successfully!
🌐 Host: cluster0.xxxxx.mongodb.net
📊 Database: geep-platform
🔗 Connection State: Connected
🚀 Server is running on port 5000
```

---

## 🐛 Common Issues & Solutions

### Issue 1: MONGODB_URI Not Set

**Symptoms:**
- Error: `MONGODB_URI is not defined in .env file`
- Server exits immediately

**Solution:**
1. Create/check `.env` file in root directory
2. Add: `MONGODB_URI=your-connection-string`

### Issue 2: Connection String Format

**Correct Format:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

**Common Mistakes:**
- ❌ Missing `mongodb+srv://` prefix
- ❌ Wrong password (with special characters - need URL encoding)
- ❌ Missing database name
- ❌ Extra spaces

### Issue 3: Users Not Saving

**Check These:**

1. **Server is running?**
   ```bash
   npm run server:dev
   ```

2. **MongoDB connection successful?**
   - Look for `✅ MongoDB Connected Successfully!` in logs

3. **Registration endpoint being called?**
   - Check server logs for: `💾 Saving user to MongoDB...`
   - Should see: `✅ User saved successfully!`

4. **Check MongoDB directly:**
   - Use MongoDB Compass
   - Or run: `npm run test:db`

---

## 🧪 Testing User Registration

### Test with curl:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "student",
    ...
  },
  "token": "...",
  "message": "Registration successful!"
}
```

---

## 📊 Verify Users in Database

### Option 1: Use Test Script
```bash
npm run test:db
```

### Option 2: Use MongoDB Compass
1. Connect using your MONGODB_URI
2. Navigate to `geep-platform` database
3. Check `users` collection

### Option 3: Check via API
```bash
# Login to get token first, then:
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Debugging Steps

1. **Check .env file exists and has MONGODB_URI**
2. **Start server and check connection logs**
3. **Try registering a user and watch server logs**
4. **Run test script: `npm run test:db`**
5. **Check MongoDB directly (Compass or Atlas dashboard)**

---

## ✅ What I Added for Better Debugging

1. **Enhanced logging in database connection**
2. **User save logging in registration route**
3. **User search logging in login route**
4. **Test connection script** (`npm run test:db`)

---

## 🚀 Quick Test

Run this to test everything:
```bash
# 1. Test MongoDB connection
npm run test:db

# 2. Start server (in another terminal)
npm run server:dev

# 3. Test registration (in another terminal)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

If all three work, your MongoDB is properly connected! 🎉
