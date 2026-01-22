# Setup Instructions - MongoDB Migration

## ✅ What Has Been Changed

### 1. **Frontend Services** (`src/services/authService.js`)
- ✅ Removed all localStorage operations
- ✅ Now makes API calls to `http://localhost:5000/api`
- ✅ Stores JWT tokens in localStorage for authentication
- ✅ All functions updated to use backend API

### 2. **User Context** (`src/context/UserContext.jsx`)
- ✅ Removed localStorage for user progress
- ✅ Loads user data from MongoDB on mount
- ✅ Syncs with backend API

### 3. **Authentication Pages**
- ✅ `Register.jsx` - Updated to use async API calls
- ✅ `Login.jsx` - Stores JWT token after login

### 4. **Backend Routes**
- ✅ Improved error handling in registration route
- ✅ Added password change route
- ✅ All routes properly handle MongoDB operations

### 5. **Package Dependencies**
- ✅ Added backend dependencies to `package.json`:
  - `express`
  - `cors`
  - `mongoose`
  - `bcryptjs`
  - `jsonwebtoken`

## 🚀 Setup Steps

### Step 1: Install Dependencies
```bash
npm install
```

This will install all dependencies including the new backend packages.

### Step 2: Create .env File
Create a `.env` file in the root directory:

```env
# MongoDB Connection String
# Replace with your actual MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/geep-database

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** 
- Replace `MONGODB_URI` with your actual MongoDB connection string
- For MongoDB Atlas: Get your connection string from Atlas dashboard
- For local MongoDB: Use `mongodb://localhost:27017/geep-database`
- Change `JWT_SECRET` to a secure random string in production

### Step 3: Start Backend Server
Open a terminal and run:
```bash
npm run server
# or
node server.js
```

You should see:
- ✅ MongoDB Connected Successfully!
- 🚀 Server is running on port 5000

### Step 4: Start Frontend Server
Open another terminal and run:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🧪 Testing Registration

1. Navigate to `http://localhost:5173/register`
2. Fill in the registration form:
   - Name: Your name
   - Email: your.email@example.com
   - Role: Student or Teacher
   - Password: (at least 6 characters)
3. Click "Create Account"
4. Check the backend terminal for:
   - `💾 Saving user to MongoDB...`
   - `✅ User saved successfully!`
5. You should be automatically logged in and redirected to `/lessons`

## 🧪 Testing Login

1. Navigate to `http://localhost:5173/login`
2. Enter the email and password you registered with
3. Click "Login"
4. Check the backend terminal for:
   - `🔍 Searching for user in MongoDB...`
   - `✅ User found in database`
5. You should be redirected to `/lessons`

## 🐛 Troubleshooting

### Issue: "MONGODB_URI is not defined"
**Solution:** Make sure `.env` file exists in the root directory and contains `MONGODB_URI`

### Issue: "MongoDB connection error"
**Solutions:**
1. Check your MongoDB URI is correct
2. If using MongoDB Atlas:
   - Make sure your IP is whitelisted
   - Check your username and password are correct
   - Verify the database name is correct
3. If using local MongoDB:
   - Make sure MongoDB is running: `mongod`
   - Check the connection string format

### Issue: "Users not getting registered"
**Solutions:**
1. Check backend server is running on port 5000
2. Check MongoDB connection is successful
3. Check browser console for API errors
4. Check backend terminal for error messages
5. Verify `.env` file has correct `MONGODB_URI`

### Issue: "CORS error"
**Solution:** Make sure `CORS_ORIGIN` in `.env` matches your frontend URL (default: `http://localhost:5173`)

### Issue: "Network error" or "Failed to fetch"
**Solutions:**
1. Make sure backend server is running
2. Check if backend is accessible at `http://localhost:5000/api/health`
3. Verify API URL in `authService.js` (default: `http://localhost:5000/api`)

## 📝 Important Notes

1. **No Data Migration Needed**: Users will need to register new accounts. Old localStorage data is not migrated.

2. **JWT Tokens**: Tokens are stored in browser localStorage. In production, consider using httpOnly cookies for better security.

3. **Password Security**: Passwords are automatically hashed using bcrypt before saving to MongoDB.

4. **Environment Variables**: Never commit `.env` file to version control. Add it to `.gitignore`.

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with correct MongoDB URI
- [ ] Backend server starts without errors
- [ ] MongoDB connection successful
- [ ] Frontend server starts on port 5173
- [ ] Registration works and user is saved to MongoDB
- [ ] Login works with registered user
- [ ] JWT token is stored in localStorage
- [ ] User profile loads from API

## 🔗 API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/check-email?email=...` - Check if email exists
- `GET /api/users/me` - Get current user (requires auth)
- `PUT /api/users/me` - Update user profile (requires auth)
- `PUT /api/users/me/password` - Change password (requires auth)
- `GET /api/users/me/progress` - Get user progress (requires auth)
- `GET /api/health` - Health check endpoint
