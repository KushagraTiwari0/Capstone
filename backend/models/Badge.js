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
  points: {
    type: Number,
    default: 0
  },
  criteria: {
    type: mongoose.Schema.Types.Mixed, // Can store various criteria
    default: {}
  }
}, {
  timestamps: true
});

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;
