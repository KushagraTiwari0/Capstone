import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    default: 50
  },
  icon: {
    type: String,
    default: '✅'
  },
  classLevel: {
    type: Number,
    required: [true, 'Class level is required for tasks'],
    min: [1, 'Class level must be at least 1'],
    max: [8, 'Class level cannot exceed 8']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
