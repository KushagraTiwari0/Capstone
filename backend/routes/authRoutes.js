import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        error: {
          message: 'Database connection not available. Please check MongoDB connection.'
        }
      });
    }

    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please fill in all required fields'
        }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 6 characters'
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User with this email already exists. Please login instead.'
        }
      });
    }

    // Auto-detect role from email if not provided
    let finalRole = role || 'student';
    if (email.includes('admin')) {
      finalRole = 'admin';
    } else if (email.includes('teacher')) {
      finalRole = 'teacher';
    }

    // Set status: admins are auto-approved, others are pending
    const status = finalRole === 'admin' ? 'approved' : 'pending';

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: finalRole,
      status: status,
      avatar: finalRole === 'admin' ? '👑' : finalRole === 'teacher' ? '👨‍🏫' : '👤'
    });

    console.log('💾 Saving user to MongoDB...', { email: user.email, role: user.role, status: user.status });
    await user.save();
    console.log('✅ User saved successfully!', { userId: user._id, email: user.email, status: user.status });

    // Determine registration message based on role and status
    let registrationMessage = 'Registration successful!';
    if (user.status === 'pending') {
      if (user.role === 'student') {
        registrationMessage = 'Registration successful. Waiting for teacher approval';
      } else if (user.role === 'teacher') {
        registrationMessage = 'Registration successful. Waiting for admin approval';
      }
    }

    // Only generate token and allow login if status is approved
    let token = null;
    if (user.status === 'approved') {
      token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
    }

    // Send welcome email (don't wait for it to complete)
    sendEmail(user.email, 'registration', user.toJSON()).catch(err => {
      console.error('Failed to send registration email:', err);
      // Don't fail registration if email fails
    });

    res.status(201).json({
      success: true,
      user: user.toJSON(),
      token, // null if pending
      message: registrationMessage,
      requiresApproval: user.status === 'pending'
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User with this email already exists. Please login instead.'
        }
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        error: {
          message: messages || 'Validation error'
        }
      });
    }
    
    // Handle MongoDB connection errors
    if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Database connection error. Please check MongoDB connection.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred during registration',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please fill in all fields'
        }
      });
    }

    // Find user
    console.log('🔍 Searching for user in MongoDB...', { email: email.toLowerCase() });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found. Please register first.',
          shouldRegister: true
        }
      });
    }
    console.log('✅ User found in database', { userId: user._id, email: user.email });

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password'
        }
      });
    }

    // Check user status - only approved users can log in
    // Handle legacy users (those without status field) as approved
    const userStatus = user.status || 'approved'; // Legacy users are treated as approved
    
    if (userStatus === 'pending') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Your account is awaiting approval'
        }
      });
    }

    if (userStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Your registration has been rejected'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: user.toJSON(),
      token,
      message: 'Login successful!'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred during login'
      }
    });
  }
});

// Check if email exists
router.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email is required'
        }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    res.json({
      success: true,
      exists: !!user
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred'
      }
    });
  }
});

export default router;
