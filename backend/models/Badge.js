import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Badge name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  icon: {
    type: String,
    required: true
  },
  // Points awarded to user when they earn this badge
  points: {
    type: Number,
    default: 0
  },
  // What the student needs to achieve to earn this badge
  criteria: {
    pointsRequired:   { type: Number, default: 0 }, // min total points
    lessonsRequired:  { type: Number, default: 0 }, // min lessons completed
    tasksRequired:    { type: Number, default: 0 }, // min tasks completed
  },
  // Display order in the badges page
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;