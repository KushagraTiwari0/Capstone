# 🚀 Backend Setup Guide

This guide explains how to set up and run the MongoDB backend for GEEP Platform.

---

## 📋 Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (Local installation or MongoDB Atlas account)
3. **.env file** with `MONGODB_URI`

---

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/geep-platform
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/geep-platform?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (Change this to a random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Origin (Frontend URL)
CORS_ORIGIN=http://localhost:5173
```

---

## 📦 Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

---

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/geep-platform`

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Replace `<password>` with your database password
5. Use connection string in `.env` file

---

## 🚀 Running the Server

### Development Mode (with auto-reload):
```bash
npm run server:dev
```

### Production Mode:
```bash
npm run server
```

The server will start on `http://localhost:5000` (or the PORT specified in .env)

---

## 📡 API Endpoints

### Health Check
```
GET http://localhost:5000/api/health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/check-email?email=user@example.com
```

### User Management
```
GET /api/users/me (requires auth)
PUT /api/users/me (requires auth)
GET /api/users/me/progress (requires auth)
```

---

## 🗂️ Database Models

The following models are created:

1. **User** - User accounts and profiles
2. **Lesson** - Learning content
3. **Quiz** - Quiz questions and answers
4. **Task** - Eco tasks
5. **TaskSubmission** - User task submissions
6. **Badge** - Achievement badges

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

- Tokens are returned on login/register
- Include token in requests: `Authorization: Bearer <token>`
- Token expires in 7 days (configurable)

---

## 📝 Next Steps

1. Make sure your `.env` file has `MONGODB_URI`
2. Start the server: `npm run server:dev`
3. Test the API: `GET http://localhost:5000/api/health`
4. Update frontend to use the API endpoints

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env` is correct
- Check network/firewall settings

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop the process using port 5000

### JWT Secret Error
- Make sure `JWT_SECRET` is set in `.env`
- Use a strong random string in production

---

## 📚 File Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js              # User model
│   ├── Lesson.js            # Lesson model
│   ├── Quiz.js              # Quiz model
│   ├── Task.js              # Task model
│   ├── TaskSubmission.js   # Task submission model
│   └── Badge.js             # Badge model
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   └── userRoutes.js        # User routes
└── middleware/
    └── authMiddleware.js    # JWT authentication middleware

server.js                     # Main server file
```

---

For more information, see `BACKEND_REQUIREMENTS.md`
