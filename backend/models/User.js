import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  classLevel: {
    type: Number,
    min: [6, 'Class level must be at least 6'],
    max: [10, 'Class level cannot exceed 10'],
    // Required for students and teachers, but admin does not need it. Check handled in validation or route.
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  avatar: {
    type: String,
    default: '👤'
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  badges: [{
    badgeId: {
      type: mongoose.Schema.Types.Mixed, // Can be ObjectId or numeric ID from JSON
      ref: 'Badge'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedLessons: [{
    type: mongoose.Schema.Types.Mixed // Can be ObjectId or numeric ID from JSON
  }],
  completedTasks: [{
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or numeric ID from JSON
    ref: 'Task'
  }],
  quizScores: [{
    quizId: {
      type: mongoose.Schema.Types.Mixed, // Can be ObjectId or numeric ID from JSON
      ref: 'Quiz'
    },
    score: Number,
    total: Number,
    percentage: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is approved (handles legacy users without status)
userSchema.methods.isApproved = function() {
  // Legacy users without status field are treated as approved
  if (!this.status) {
    return true;
  }
  return this.status === 'approved';
};

// Method to remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  
  // For legacy users without status, set status to 'approved' in JSON output
  // This ensures backward compatibility
  if (!userObject.status) {
    userObject.status = 'approved';
  }
  
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
