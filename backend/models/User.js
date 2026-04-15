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
  
  // ── Game Progression Fields ───────────────────────────────────────────
  totalPoints: {
    type: Number,
    default: 0
  },
  exp: {
    type: Number,
    default: 0
  },
  // ─────────────────────────────────────────────────────────────────────────

  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  badges: [{
    badgeId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Badge'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedLessons: [{
    type: mongoose.Schema.Types.Mixed
  }],
  completedTasks: [{
    type: mongoose.Schema.Types.Mixed,
    ref: 'Task'
  }],
  quizScores: [{
    quizId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Quiz'
    },
    score: Number,
    total: Number,
    percentage: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],

  // ── Game stats — one entry per game played ─────────────────────────────────
  gameStats: [{
    gameId: {
      type: String,
      required: true
    },
    opens: {
      type: Number,
      default: 0
    },
    plays: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    },
    bestScore: {
      type: Number,
      default: 0
    },
    lastPlayedAt: {
      type: Date,
      default: null
    }
  }]

}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user is approved
userSchema.methods.isApproved = function() {
  if (!this.status) return true;
  return this.status === 'approved';
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  if (!userObject.status) {
    userObject.status = 'approved';
  }
  return userObject;
};

const User = mongoose.model('User', userSchema);
export default User;