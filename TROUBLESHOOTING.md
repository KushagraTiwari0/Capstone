# Troubleshooting Guide - 500 Internal Server Error

## Common Causes of 500 Error During Registration

### 1. **MongoDB Connection Not Established**

**Symptoms:**
- 500 error on registration
- Backend terminal shows "MongoDB not connected"

**Solution:**
1. Check if `.env` file exists and has `MONGODB_URI`
2. Verify MongoDB connection string is correct
3. Check backend terminal for MongoDB connection messages
4. Restart backend server after fixing `.env`

**Check MongoDB Connection:**
```bash
# Test MongoDB connection
npm run test:db
```

### 2. **Missing Dependencies**

**Symptoms:**
- Error messages about missing modules
- `Cannot find module 'bcryptjs'` or similar

**Solution:**
```bash
npm install
```

This will install all required dependencies:
- `express`
- `cors`
- `mongoose`
- `bcryptjs`
- `jsonwebtoken`

### 3. **Incorrect MongoDB URI Format**

**Symptoms:**
- Connection errors in backend terminal
- "MongoServerError" or "MongooseError"

**Correct Formats:**
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/database-name
```

**Common Mistakes:**
- ❌ Missing `mongodb+srv://` prefix
- ❌ Incorrect password encoding (use URL encoding for special characters)
- ❌ Missing database name
- ❌ Wrong cluster URL

### 4. **MongoDB Atlas IP Whitelist**

**Symptoms:**
- Connection timeout
- "IP not whitelisted" error

**Solution:**
1. Go to MongoDB Atlas Dashboard
2. Network Access → Add IP Address
3. Add `0.0.0.0/0` for development (allows all IPs)
4. Or add your specific IP address

### 5. **Password Hashing Error**

**Symptoms:**
- Error during user.save()
- bcrypt-related errors

**Solution:**
- Ensure `bcryptjs` is installed: `npm install bcryptjs`
- Check User model pre-save hook is working

## Debugging Steps

### Step 1: Check Backend Terminal
Look for error messages in the terminal running `node server.js`:
- MongoDB connection status
- Registration error details
- Stack traces

### Step 2: Test MongoDB Connection
```bash
npm run test:db
```

### Step 3: Check .env File
Verify `.env` file exists and contains:
```env
MONGODB_URI=your-connection-string
PORT=5000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Step 4: Test Health Endpoint
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "success": true,
  "message": "GEEP Platform API is running"
}
```

### Step 5: Check Browser Console
Look for detailed error messages in:
- Network tab → Registration request → Response
- Console tab for error details

## Quick Fix Checklist

- [ ] `.env` file exists in root directory
- [ ] `MONGODB_URI` is set correctly
- [ ] MongoDB is running (local) or accessible (Atlas)
- [ ] All dependencies installed (`npm install`)
- [ ] Backend server is running (`npm run server`)
- [ ] MongoDB connection successful (check terminal)
- [ ] No firewall blocking MongoDB port (27017 or Atlas)

## Getting More Detailed Errors

The updated code now logs detailed error information:
- Check backend terminal for full error stack
- Error details are included in API response (development mode)
- Check browser Network tab → Response for error details

## Still Having Issues?

1. **Check backend terminal output** - Most errors are logged there
2. **Verify MongoDB connection** - Run `npm run test:db`
3. **Check .env file** - Ensure all variables are set
4. **Restart backend server** - After making changes
5. **Check MongoDB status** - Ensure MongoDB is running/accessible
